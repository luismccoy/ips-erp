import { type Schema } from '../../data/resource';
import { AIClient } from './ai-client';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const ddbClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(ddbClient);

const BILLING_RECORD_TABLE = process.env.BILLING_RECORD_TABLE_NAME!;

/**
 * Glosa Defender - AI-Powered Billing Defense
 * Generates legal/clinical justification letters for billing disputes (Glosas)
 * 
 * Uses AWS Bedrock (Claude 3.5 Sonnet) to analyze:
 * - Patient vital signs history
 * - Clinical notes from shifts
 * - Billing rejection reason
 * - Colombian health regulations
 * 
 * Outputs: Professional defense letter in Spanish for EPS submission
 * 
 * Environment Variables:
 * - MODEL_ID: Bedrock model identifier (required)
 * - AI_TEST_MODE: 'LIVE' | 'RECORDED' (default: 'LIVE')
 * - AI_RECORDINGS_S3_BUCKET: S3 bucket for AI recordings (required for RECORDED mode)
 */

const aiClient = new AIClient();

interface DefenseInput {
    billingRecord: {
        id: string;
        date: string;
        procedures: string[];
        diagnosis: string;
        eps: string;
        totalAmount: number;
        rejectionReason: string;
    };
    patientHistory: {
        name: string;
        age?: number;
        diagnosis: string;
        vitalSigns: Array<{
            date: string;
            sys: number;
            dia: number;
            spo2: number;
            hr: number;
            note?: string;
        }>;
    };
    clinicalNotes: string[];
}

export const handler: Schema["generateGlosaDefense"]["functionHandler"] = async (event) => {
    const input = event.arguments as DefenseInput;
    
    // Validate required environment variables
    if (!process.env.MODEL_ID) {
        throw new Error('MODEL_ID environment variable is required');
    }
    
    if (process.env.AI_TEST_MODE === 'RECORDED' && !process.env.AI_RECORDINGS_S3_BUCKET) {
        throw new Error('AI_RECORDINGS_S3_BUCKET environment variable is required for RECORDED mode');
    }
    
    // 1. Construct comprehensive prompt for AI
    const prompt = `
Eres un experto en auditoría médica y defensa de glosas para IPS en Colombia.

CONTEXTO DEL CASO:
- Paciente: ${input.patientHistory.name}, ${input.patientHistory.age || 'edad no especificada'} años
- Diagnóstico: ${input.patientHistory.diagnosis}
- EPS: ${input.billingRecord.eps}
- Fecha del servicio: ${input.billingRecord.date}
- Procedimientos facturados (CUPS): ${input.billingRecord.procedures.join(', ')}
- Diagnóstico facturado (CIE-10): ${input.billingRecord.diagnosis}
- Valor facturado: $${input.billingRecord.totalAmount.toLocaleString('es-CO')} COP

MOTIVO DE RECHAZO (GLOSA):
${input.billingRecord.rejectionReason}

HISTORIA CLÍNICA RECIENTE:
${input.patientHistory.vitalSigns.map(vs => 
    `- ${vs.date}: PA ${vs.sys}/${vs.dia}, SpO2 ${vs.spo2}%, FC ${vs.hr} lpm${vs.note ? ` - ${vs.note}` : ''}`
).join('\n')}

NOTAS CLÍNICAS DEL SERVICIO:
${input.clinicalNotes.map((note, i) => `${i + 1}. ${note}`).join('\n')}

TAREA:
Genera una carta de defensa profesional y técnica para responder a esta glosa. La carta debe:

1. Estar dirigida al área de auditoría de la EPS
2. Citar normatividad colombiana relevante (Resolución 3100, Ley 100, etc.)
3. Justificar clínicamente la necesidad de los procedimientos realizados
4. Referenciar los signos vitales y evolución del paciente
5. Argumentar por qué el rechazo es improcedente
6. Solicitar formalmente la aceptación de la factura
7. Estar escrita en español formal y profesional
8. Tener estructura de carta oficial (fecha, destinatario, asunto, cuerpo, despedida)

FORMATO DE SALIDA:
Devuelve ÚNICAMENTE el texto de la carta, sin comentarios adicionales.
`;

    try {
        // 2. Call AI model via AIClient wrapper (supports LIVE/RECORDED modes)
        const responseBody = await aiClient.invokeModel({
            modelId: process.env.MODEL_ID!,
            prompt: prompt,
            maxTokens: 2000,
            temperature: 0.7
        });

        // 3. Extract defense letter
        const defenseLetter = responseBody.content[0].text;
        const generatedAt = new Date().toISOString();

        // Phase 12: Persist defense text to BillingRecord
        if (input.billingRecord.id) {
            try {
                await docClient.send(new UpdateCommand({
                    TableName: BILLING_RECORD_TABLE,
                    Key: { id: input.billingRecord.id },
                    UpdateExpression: 'SET glosaDefenseText = :text, glosaDefenseGeneratedAt = :timestamp, updatedAt = :updatedAt',
                    ExpressionAttributeValues: {
                        ':text': defenseLetter,
                        ':timestamp': generatedAt,
                        ':updatedAt': generatedAt
                    }
                }));
            } catch (error) {
                console.error('Failed to persist defense text:', error);
                // Don't fail the generation if persistence fails
            }
        }

        return {
            success: true,
            defenseLetter,
            generatedAt,
            model: process.env.MODEL_ID
        };

    } catch (error) {
        console.error("Glosa defense generation failed:", error);
        
        // Fallback: Return template-based defense
        const fallbackLetter = `
[CARTA GENERADA AUTOMÁTICAMENTE - ERROR EN IA]

Fecha: ${new Date().toLocaleDateString('es-CO')}

Señores
${input.billingRecord.eps}
Área de Auditoría Médica

Asunto: Respuesta a Glosa - Factura ${input.billingRecord.id}

Cordial saludo,

Por medio de la presente, nos permitimos responder a la glosa presentada sobre la factura del servicio prestado el ${input.billingRecord.date} al paciente ${input.patientHistory.name}.

Motivo de rechazo: ${input.billingRecord.rejectionReason}

Justificación clínica:
El paciente presenta diagnóstico de ${input.billingRecord.diagnosis}, requiriendo los procedimientos facturados (CUPS: ${input.billingRecord.procedures.join(', ')}) según protocolo de atención domiciliaria.

Solicitamos comedidamente la revisión y aceptación de esta factura.

Atentamente,
[Coordinación Médica - IPS]
`;

        return {
            success: false,
            defenseLetter: fallbackLetter,
            error: error instanceof Error ? error.message : 'Unknown error',
            generatedAt: new Date().toISOString()
        };
    }
};
