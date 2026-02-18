import type { Schema } from '../../data/resource';
import { AIClient } from './ai-client';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

const PATIENT_TABLE = process.env.PATIENT_TABLE_NAME!;
const PATIENT_ASSESSMENT_TABLE = process.env.PATIENT_ASSESSMENT_TABLE_NAME!;
const VITAL_SIGNS_TABLE = process.env.VITAL_SIGNS_TABLE_NAME!;
const NOTIFICATION_TABLE = process.env.NOTIFICATION_TABLE_NAME!;
const NURSE_TABLE = process.env.NURSE_TABLE_NAME!;

const aiClient = new AIClient();

/**
 * Deterioration Detector - AI-Powered Predictive Patient Deterioration Alerts
 *
 * Analyzes patient vitals and assessment trends via Bedrock Claude to detect
 * early clinical deterioration (sepsis, dehydration, respiratory decline, etc.)
 * BEFORE scores reach critical thresholds.
 *
 * Trigger: On-demand GraphQL custom query (analyzeDeteriorationRisk)
 * Scope: Per-patient analysis (single patient per invocation)
 */

interface TrendPoint {
    date: string;
    value: number;
}

interface ScaleTrend {
    scale: string;
    points: TrendPoint[];
    direction: 'improving' | 'stable' | 'worsening';
    latestValue: number;
    delta: number; // Change from first to last point
}

function computeTrends(assessments: any[]): ScaleTrend[] {
    const trends: ScaleTrend[] = [];

    // Sort assessments by date (oldest first for trend calculation)
    const sorted = [...assessments].sort(
        (a, b) => new Date(a.assessedAt).getTime() - new Date(b.assessedAt).getTime()
    );

    const scaleExtractors: Array<{
        name: string;
        extract: (a: any) => number | null;
        lowerIsWorse: boolean;
    }> = [
        { name: 'Glasgow (GCS)', extract: a => a.glasgowScore?.total ?? null, lowerIsWorse: true },
        { name: 'Dolor (EVA)', extract: a => a.painScore ?? null, lowerIsWorse: false },
        { name: 'Braden', extract: a => a.bradenScore?.total ?? null, lowerIsWorse: true },
        { name: 'Morse', extract: a => a.morseScore?.total ?? null, lowerIsWorse: false },
        { name: 'NEWS', extract: a => a.newsScore?.total ?? null, lowerIsWorse: false },
        { name: 'Barthel', extract: a => a.barthelScore?.total ?? null, lowerIsWorse: true },
        { name: 'Norton', extract: a => a.nortonScore?.total ?? null, lowerIsWorse: true },
        { name: 'RASS', extract: a => a.rassScore ?? null, lowerIsWorse: false },
    ];

    for (const { name, extract, lowerIsWorse } of scaleExtractors) {
        const points: TrendPoint[] = [];
        for (const assessment of sorted) {
            const value = extract(assessment);
            if (value !== null) {
                points.push({ date: assessment.assessedAt, value });
            }
        }

        if (points.length >= 2) {
            const first = points[0].value;
            const last = points[points.length - 1].value;
            const delta = last - first;
            const threshold = Math.max(Math.abs(first) * 0.1, 1); // 10% or minimum 1

            let direction: 'improving' | 'stable' | 'worsening';
            if (Math.abs(delta) <= threshold) {
                direction = 'stable';
            } else if (lowerIsWorse) {
                // Lower is worse (Glasgow, Braden, Barthel, Norton): decreasing = worsening
                direction = delta < 0 ? 'worsening' : 'improving';
            } else {
                // Higher is worse (Pain, Morse, NEWS, RASS): increasing = worsening
                direction = delta > 0 ? 'worsening' : 'improving';
            }

            trends.push({ scale: name, points, direction, latestValue: last, delta });
        }
    }

    return trends;
}

export const handler: Schema['analyzeDeteriorationRisk']['functionHandler'] = async (event) => {
    const { patientId, tenantId: requestedTenantId } = event.arguments;

    // Extract identity and validate role
    const identity = event.identity as { sub?: string; claims?: Record<string, unknown> } | undefined;
    const userId = identity?.sub;
    const tenantId = identity?.claims?.['custom:tenantId'] as string | undefined;
    const userGroups = identity?.claims?.['cognito:groups'] as string[] || [];

    if (!userGroups.includes('Admin') && !userGroups.includes('ADMIN') &&
        !userGroups.includes('Nurse') && !userGroups.includes('NURSE')) {
        console.error(`[SECURITY] Unauthorized AI function access: userId=${userId}, groups=${userGroups}`);
        throw new Error('Unauthorized: Admin or Nurse role required');
    }

    if (!tenantId) {
        throw new Error('Unauthorized: Missing tenant ID');
    }

    if (!process.env.MODEL_ID) {
        throw new Error('MODEL_ID environment variable is required');
    }

    try {
        // 1. Query patient data
        const patientResult = await docClient.send(new GetCommand({
            TableName: PATIENT_TABLE,
            Key: { id: patientId },
        }));

        const patient = patientResult.Item;
        if (!patient || patient.tenantId !== tenantId) {
            throw new Error('Patient not found or unauthorized');
        }

        // 2. Query PatientAssessment via byPatient GSI (last 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const assessmentResult = await docClient.send(new QueryCommand({
            TableName: PATIENT_ASSESSMENT_TABLE,
            IndexName: 'byPatient',
            KeyConditionExpression: 'patientId = :pid AND assessedAt >= :since',
            ExpressionAttributeValues: {
                ':pid': patientId,
                ':since': sevenDaysAgo,
            },
            ScanIndexForward: true, // oldest first
        }));

        const assessments = assessmentResult.Items || [];

        if (assessments.length < 2) {
            return {
                hasRisk: false,
                overallRiskLevel: 'NONE',
                confidence: 0,
                message: 'Se requieren al menos 2 evaluaciones en los últimos 7 días para análisis de tendencias.',
                risks: [],
                correlations: [],
                summary: 'Datos insuficientes para análisis predictivo.',
                assessmentCount: assessments.length,
            };
        }

        // 3. Query VitalSigns for same patient/period
        const vitalsResult = await docClient.send(new QueryCommand({
            TableName: VITAL_SIGNS_TABLE,
            IndexName: 'gsi-Patient.vitalSigns',
            KeyConditionExpression: 'patientId = :pid',
            ExpressionAttributeValues: {
                ':pid': patientId,
            },
        }));

        const vitals = (vitalsResult.Items || []).filter(
            (v: any) => v.date >= sevenDaysAgo.split('T')[0]
        );

        // 4. Compute trends in TypeScript
        const trends = computeTrends(assessments);

        // 5. Build vitals summary
        const vitalsSummary = vitals
            .sort((a: any, b: any) => a.date.localeCompare(b.date))
            .map((v: any) => `${v.date}: PA ${v.sys}/${v.dia}, SpO2 ${v.spo2}%, FC ${v.hr}${v.temperature ? `, T° ${v.temperature}°C` : ''}${v.note ? ` - ${v.note}` : ''}`)
            .join('\n');

        // 6. Build trends summary for prompt
        const trendsSummary = trends.map(t =>
            `- ${t.scale}: ${t.points.map(p => `${p.value} (${new Date(p.date).toLocaleDateString('es-CO')})`).join(' → ')} | Dirección: ${t.direction} | Delta: ${t.delta > 0 ? '+' : ''}${t.delta}`
        ).join('\n');

        // 7. Construct Spanish-language prompt
        const prompt = `Eres un sistema experto de alerta temprana clínica para una IPS de atención domiciliaria en Colombia.

PACIENTE:
- Nombre: ${patient.name}
- Edad: ${patient.age || 'No especificada'}
- Diagnóstico: ${patient.diagnosis || 'No especificado'}

HISTORIAL DE EVALUACIONES CLÍNICAS (últimos 7 días, ${assessments.length} evaluaciones):
${trendsSummary || 'Sin tendencias calculables'}

SIGNOS VITALES RECIENTES:
${vitalsSummary || 'Sin signos vitales registrados'}

UMBRALES DE REFERENCIA:
- Glasgow (GCS): ≤8 CRÍTICO, 9-12 MODERADO, 13-15 Normal
- Dolor (EVA): ≥7 SEVERO, 4-6 MODERADO, 0-3 LEVE
- Braden: ≤9 MUY ALTO riesgo UPP, 10-12 ALTO, 13-14 MODERADO
- Morse: ≥45 ALTO riesgo caídas, 25-44 MODERADO, 0-24 BAJO
- NEWS: ≥7 ALTO (escalar inmediato), 5-6 MEDIO, 0-4 BAJO
- Barthel: ≤20 Dependencia total, 21-60 Severa, 61-90 Moderada
- Norton: ≤14 ALTO riesgo escaras, 15-16 MEDIO
- RASS: ≥+3 o ≤-4 CRÍTICO

REGLA CRÍTICA DE FALSOS POSITIVOS:
Si los puntajes están elevados PERO estables (sin tendencia de empeoramiento), NO generes alerta de deterioro.
Solo alerta cuando hay una TENDENCIA clara de empeoramiento progresivo o correlaciones entre múltiples escalas que sugieran deterioro inminente.

TAREA:
Analiza las tendencias y correlaciones entre escalas para detectar signos tempranos de:
- Sepsis (NEWS creciente + signos vitales alterados)
- Deshidratación (cambios en PA, FC, estado de consciencia)
- Deterioro respiratorio (SpO2, frecuencia respiratoria)
- Riesgo de caídas aumentando (Morse + Barthel empeorando)
- Deterioro neurológico (Glasgow bajando + RASS alterado)
- Riesgo de úlceras (Braden/Norton bajando + Barthel bajando)

Responde ÚNICAMENTE con JSON válido, sin texto adicional:
{
  "hasRisk": boolean,
  "overallRiskLevel": "NONE" | "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
  "confidence": 0.0-1.0,
  "predictedTimeToThreshold": "string en español o null",
  "risks": [
    {
      "type": "string (tipo de deterioro)",
      "severity": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
      "description": "string en español",
      "affectedScales": ["nombres de escalas"],
      "recommendedActions": ["acciones en español"]
    }
  ],
  "correlations": [
    {
      "scales": ["nombres de escalas correlacionadas"],
      "pattern": "descripción del patrón en español"
    }
  ],
  "summary": "resumen ejecutivo en español de máximo 3 oraciones"
}`;

        // 8. Call AI model
        const responseBody = await aiClient.invokeModel({
            modelId: process.env.MODEL_ID!,
            prompt,
            maxTokens: 2000,
            temperature: 0.3,
        });

        // 9. Parse JSON from response
        const textOutput = responseBody.content[0].text;
        const jsonMatch = textOutput.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in AI response');
        }

        const analysis = JSON.parse(jsonMatch[0]);

        // 10. If risk detected, create notifications
        if (analysis.hasRisk && (analysis.overallRiskLevel === 'HIGH' || analysis.overallRiskLevel === 'CRITICAL')) {
            const now = new Date().toISOString();
            const notificationType = analysis.overallRiskLevel === 'CRITICAL'
                ? 'DETERIORATION_CRITICAL'
                : 'DETERIORATION_WARNING';
            const message = `Alerta de deterioro ${analysis.overallRiskLevel === 'CRITICAL' ? 'CRÍTICO' : 'detectado'}: ${patient.name} - ${analysis.summary?.substring(0, 120) || 'Revise análisis predictivo'}`;

            const recipientUserIds: string[] = [];

            // Notify primary nurse
            if (patient.primaryNurseId) {
                const primaryNurseResult = await docClient.send(new GetCommand({
                    TableName: NURSE_TABLE,
                    Key: { id: patient.primaryNurseId },
                }));
                const primaryNurse = primaryNurseResult.Item;
                if (primaryNurse?.cognitoSub) {
                    recipientUserIds.push(primaryNurse.cognitoSub);
                }
            }

            // Notify tenant admins
            const adminResult = await docClient.send(new QueryCommand({
                TableName: NURSE_TABLE,
                IndexName: 'gsi-Tenant.nurses',
                KeyConditionExpression: 'tenantId = :tenantId',
                FilterExpression: '#role = :adminRole',
                ExpressionAttributeNames: { '#role': 'role' },
                ExpressionAttributeValues: {
                    ':tenantId': tenantId,
                    ':adminRole': 'ADMIN',
                },
            }));

            for (const admin of adminResult.Items || []) {
                if (admin.cognitoSub && !recipientUserIds.includes(admin.cognitoSub)) {
                    recipientUserIds.push(admin.cognitoSub);
                }
            }

            // Create notification for each recipient
            for (const recipientId of recipientUserIds) {
                const notifId = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
                await docClient.send(new PutCommand({
                    TableName: NOTIFICATION_TABLE,
                    Item: {
                        id: notifId,
                        tenantId,
                        userId: recipientId,
                        type: notificationType,
                        message,
                        entityType: 'Patient',
                        entityId: patientId,
                        read: false,
                        createdAt: now,
                        updatedAt: now,
                    },
                }));
            }
        }

        // 11. Return full analysis
        return {
            ...analysis,
            patientId,
            patientName: patient.name,
            assessmentCount: assessments.length,
            vitalsCount: vitals.length,
            analyzedAt: new Date().toISOString(),
            trends: trends.map(t => ({
                scale: t.scale,
                direction: t.direction,
                latestValue: t.latestValue,
                delta: t.delta,
                pointCount: t.points.length,
            })),
        };

    } catch (error) {
        console.error('Deterioration analysis failed:', error);

        if (error instanceof Error && error.message.includes('Unauthorized')) {
            throw error;
        }

        return {
            hasRisk: false,
            overallRiskLevel: 'NONE',
            confidence: 0,
            error: error instanceof Error ? error.message : 'Unknown error',
            summary: 'Error en el análisis predictivo. Intente nuevamente.',
            risks: [],
            correlations: [],
        };
    }
};
