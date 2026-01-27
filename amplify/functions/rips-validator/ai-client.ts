import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { createHash } from 'crypto';

/**
 * AI Recording structure for VCR-style testing
 * Stores complete request/response data with metadata
 */
interface AIRecording {
  requestHash: string;
  modelId: string;
  timestamp: string;
  request: {
    modelId: string;
    prompt: string;
    maxTokens: number;
    temperature?: number;
  };
  response: any;
  latencyMs: number;
  tokenUsage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

/**
 * AI Client Wrapper with VCR-style recording/replay
 * 
 * Supports two modes:
 * - LIVE: Calls real Bedrock API and saves recordings to S3
 * - RECORDED: Replays previously recorded responses from S3
 * 
 * Environment Variables:
 * - AI_TEST_MODE: 'LIVE' | 'RECORDED' (default: 'LIVE')
 * - AI_RECORDINGS_S3_BUCKET: S3 bucket for recordings (required)
 * - AI_RECORDINGS_PREFIX: S3 prefix for recordings (default: 'ai-recordings')
 */
export class AIClient {
  private bedrock: BedrockRuntimeClient;
  private s3: S3Client;
  private mode: 'LIVE' | 'RECORDED';
  private bucket: string;
  private prefix: string;

  constructor() {
    this.bedrock = new BedrockRuntimeClient({ region: "us-east-1" });
    this.s3 = new S3Client({ region: "us-east-1" });
    
    // Determine mode from environment variable
    const envMode = process.env.AI_TEST_MODE?.toUpperCase();
    this.mode = (envMode === 'LIVE' || envMode === 'RECORDED') ? envMode : 'LIVE';
    
    // S3 configuration
    this.bucket = process.env.AI_RECORDINGS_S3_BUCKET || '';
    this.prefix = process.env.AI_RECORDINGS_PREFIX || 'ai-recordings';

    // Log initialization
    console.log(`[AI_CLIENT] Initialized in ${this.mode} mode`);
    if (this.mode === 'RECORDED' && !this.bucket) {
      console.warn('[AI_CLIENT] WARNING: RECORDED mode requires AI_RECORDINGS_S3_BUCKET environment variable');
    }
  }

  /**
   * Invoke AI model with recording/replay support
   * 
   * @param params - Model invocation parameters
   * @returns AI model response
   */
  async invokeModel(params: {
    modelId: string;
    prompt: string;
    maxTokens: number;
    temperature?: number;
  }): Promise<any> {
    // Compute stable hash for recording lookup
    const requestHash = this.computeHash(params);
    const functionName = this.extractFunctionName();
    const recordingKey = `${this.prefix}/${functionName}/${requestHash}.json`;

    console.log(`[AI_CLIENT] Request hash: ${requestHash}`);

    // RECORDED mode: Load from S3
    if (this.mode === 'RECORDED') {
      return await this.loadRecording(recordingKey);
    }

    // LIVE mode: Call real API and record
    return await this.invokeLive(params, recordingKey);
  }

  /**
   * Invoke real Bedrock API and save recording
   */
  private async invokeLive(
    params: {
      modelId: string;
      prompt: string;
      maxTokens: number;
      temperature?: number;
    },
    recordingKey: string
  ): Promise<any> {
    console.log(`[AI_CLIENT] Calling Bedrock API (LIVE mode)`);
    const startTime = Date.now();

    try {
      const command = new InvokeModelCommand({
        modelId: params.modelId,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify({
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: params.maxTokens,
          temperature: params.temperature || 0.7,
          messages: [
            {
              role: "user",
              content: [{ type: "text", text: params.prompt }]
            }
          ]
        }),
      });

      const response = await this.bedrock.send(command);
      const latencyMs = Date.now() - startTime;
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      console.log(`[AI_CLIENT] Bedrock API call completed in ${latencyMs}ms`);

      // Save recording to S3 (if bucket configured)
      if (this.bucket) {
        await this.saveRecording(recordingKey, {
          requestHash: this.computeHash(params),
          modelId: params.modelId,
          timestamp: new Date().toISOString(),
          request: params,
          response: responseBody,
          latencyMs,
          tokenUsage: {
            inputTokens: responseBody.usage?.input_tokens || 0,
            outputTokens: responseBody.usage?.output_tokens || 0,
          }
        });
      } else {
        console.warn('[AI_CLIENT] Skipping recording save: AI_RECORDINGS_S3_BUCKET not configured');
      }

      return responseBody;

    } catch (error) {
      console.error('[AI_CLIENT] Bedrock API call failed:', error);
      throw error;
    }
  }

  /**
   * Compute stable SHA-256 hash for request
   * Uses canonical JSON to ensure deterministic hashing
   */
  private computeHash(params: any): string {
    // Sort keys for canonical JSON representation
    const canonical = JSON.stringify(params, Object.keys(params).sort());
    const hash = createHash('sha256').update(canonical).digest('hex');
    
    // Return first 16 characters for shorter filenames
    return hash.substring(0, 16);
  }

  /**
   * Load recording from S3
   * Fails with clear error message if recording not found
   */
  private async loadRecording(key: string): Promise<any> {
    if (!this.bucket) {
      throw new Error(
        `[AI_CLIENT] Cannot load recording: AI_RECORDINGS_S3_BUCKET not configured\n` +
        `Set environment variable: AI_RECORDINGS_S3_BUCKET=ips-erp-test-recordings`
      );
    }

    try {
      console.log(`[AI_CLIENT] Loading recording from S3: ${key}`);
      
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      
      const response = await this.s3.send(command);
      const body = await response.Body?.transformToString();
      
      if (!body) {
        throw new Error('Empty response body from S3');
      }

      const recording: AIRecording = JSON.parse(body);
      
      console.log(
        `[AI_CLIENT] ✅ Loaded recording: ${key}\n` +
        `  - Latency: ${recording.latencyMs}ms\n` +
        `  - Tokens: ${recording.tokenUsage?.inputTokens}/${recording.tokenUsage?.outputTokens}\n` +
        `  - Timestamp: ${recording.timestamp}`
      );
      
      return recording.response;

    } catch (error: any) {
      // Provide helpful error message for missing recordings
      if (error.name === 'NoSuchKey' || error.Code === 'NoSuchKey') {
        throw new Error(
          `[AI_CLIENT] ❌ Recording not found: ${key}\n\n` +
          `This recording does not exist in S3. To create it:\n` +
          `1. Run tests in LIVE mode first:\n` +
          `   AI_TEST_MODE=LIVE npm run test:ai:live\n\n` +
          `2. Or refresh recordings:\n` +
          `   npm run test:recordings:refresh\n\n` +
          `Bucket: ${this.bucket}\n` +
          `Key: ${key}`
        );
      }

      // Re-throw other errors
      console.error('[AI_CLIENT] Failed to load recording:', error);
      throw new Error(
        `[AI_CLIENT] Failed to load recording from S3: ${error.message}\n` +
        `Bucket: ${this.bucket}\n` +
        `Key: ${key}`
      );
    }
  }

  /**
   * Save recording to S3
   */
  private async saveRecording(key: string, recording: AIRecording): Promise<void> {
    try {
      console.log(`[AI_CLIENT] Saving recording to S3: ${key}`);
      
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: JSON.stringify(recording, null, 2),
        ContentType: 'application/json',
        Metadata: {
          'request-hash': recording.requestHash,
          'model-id': recording.modelId,
          'latency-ms': recording.latencyMs.toString(),
          'input-tokens': recording.tokenUsage?.inputTokens.toString() || '0',
          'output-tokens': recording.tokenUsage?.outputTokens.toString() || '0',
        }
      });
      
      await this.s3.send(command);
      
      console.log(
        `[AI_CLIENT] ✅ Saved recording: ${key}\n` +
        `  - Latency: ${recording.latencyMs}ms\n` +
        `  - Tokens: ${recording.tokenUsage?.inputTokens}/${recording.tokenUsage?.outputTokens}\n` +
        `  - Size: ${JSON.stringify(recording).length} bytes`
      );

    } catch (error: any) {
      console.error('[AI_CLIENT] Failed to save recording:', error);
      // Don't throw - recording save failure shouldn't break the Lambda
      console.warn('[AI_CLIENT] Continuing without recording save');
    }
  }

  /**
   * Extract function name from Lambda context or environment
   * Used for organizing recordings by function
   */
  private extractFunctionName(): string {
    // Try to get from Lambda context (AWS_LAMBDA_FUNCTION_NAME)
    const functionName = process.env.AWS_LAMBDA_FUNCTION_NAME;
    
    if (functionName) {
      // Extract base name (remove stage suffix if present)
      // e.g., "roster-architect-test" -> "roster-architect"
      return functionName.replace(/-test$|-prod$|-dev$/, '');
    }

    // Fallback: use 'unknown' (shouldn't happen in Lambda)
    return 'unknown';
  }
}

/**
 * Validate RIPS billing data against Colombian regulations using AI
 * 
 * @param billingData - Billing record data to validate
 * @returns Validation result with compliance status, issues, and suggestions
 */
export async function validateRIPSWithAI(billingData: any): Promise<{
  isCompliant: boolean;
  issues: string[];
  suggestions: string[];
  confidence: number;
}> {
  const aiClient = new AIClient();
  
  // Validate required environment variables
  if (!process.env.MODEL_ID) {
    throw new Error('MODEL_ID environment variable is required');
  }

  // Construct comprehensive prompt for Colombian RIPS validation
  const prompt = `Eres un experto en facturación RIPS (Registro Individual de Prestación de Servicios de Salud) de Colombia, con conocimiento profundo de la Resolución 3100 de 2019 del Ministerio de Salud y Protección Social.

DATOS DE FACTURACIÓN A VALIDAR:
${JSON.stringify(billingData, null, 2)}

TU TAREA:
Analiza estos datos de facturación y valida su cumplimiento con los requisitos RIPS colombianos. Específicamente, evalúa:

1. **Códigos CUPS (Procedimientos)**:
   - ¿Son códigos CUPS válidos y vigentes en Colombia?
   - ¿Corresponden al tipo de servicio de una IPS domiciliaria?
   - ¿Están correctamente formateados (6 dígitos)?

2. **Códigos CIE-10 (Diagnósticos)**:
   - ¿Es un código CIE-10 válido?
   - ¿Es coherente con los procedimientos facturados?
   - ¿Corresponde a patologías típicas de atención domiciliaria?

3. **Datos de la EPS**:
   - ¿Es una EPS reconocida en Colombia?
   - ¿El formato del código es apropiado?

4. **Coherencia Clínica**:
   - ¿Los procedimientos son coherentes con el diagnóstico?
   - ¿El monto facturado es razonable para los servicios prestados?
   - ¿Existen inconsistencias que podrían generar glosas?

5. **Completitud de Datos**:
   - ¿Faltan datos obligatorios según Resolución 3100?
   - ¿Los datos opcionales están presentes cuando son recomendables?

6. **Riesgos de Glosa**:
   - ¿Qué elementos podrían ser rechazados por la EPS?
   - ¿Existen banderas rojas en la facturación?

FORMATO DE RESPUESTA (ESTRICTAMENTE JSON):
Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, con esta estructura exacta:

{
  "isCompliant": true o false,
  "confidence": número entre 0 y 100 (confianza de tu evaluación),
  "issues": [
    "Issue 1: descripción del problema encontrado",
    "Issue 2: otro problema..."
  ],
  "suggestions": [
    "Suggestion 1: recomendación para mejorar la factura",
    "Suggestion 2: otra sugerencia..."
  ],
  "clinicalCoherence": "análisis breve de coherencia clínica",
  "glosaRisk": "bajo" | "medio" | "alto",
  "regulatoryNotes": "notas sobre cumplimiento normativo"
}

IMPORTANTE:
- Si isCompliant es false, DEBES incluir al menos un issue.
- Si encuentras problemas menores pero la factura es aceptable, isCompliant puede ser true con suggestions.
- Sé específico y técnico en tus observaciones.
- Cita normatividad colombiana relevante cuando sea pertinente.
- Responde SOLO con el JSON, sin explicaciones adicionales.`;

  try {
    console.log('[RIPS_AI_VALIDATOR] Calling AI model for RIPS validation');
    
    const responseBody = await aiClient.invokeModel({
      modelId: process.env.MODEL_ID!,
      prompt: prompt,
      maxTokens: 1500,
      temperature: 0.3 // Lower temperature for more consistent, factual analysis
    });

    // Extract AI response
    const aiResponse = responseBody.content[0].text;
    console.log('[RIPS_AI_VALIDATOR] Raw AI response:', aiResponse);

    // Parse JSON response (remove markdown code blocks if present)
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI response did not contain valid JSON');
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);

    // Validate response structure
    if (typeof parsedResponse.isCompliant !== 'boolean') {
      throw new Error('Invalid AI response: missing isCompliant boolean');
    }

    if (!Array.isArray(parsedResponse.issues)) {
      parsedResponse.issues = [];
    }

    if (!Array.isArray(parsedResponse.suggestions)) {
      parsedResponse.suggestions = [];
    }

    // Extract confidence (default to 75 if not provided)
    const confidence = typeof parsedResponse.confidence === 'number' 
      ? parsedResponse.confidence 
      : 75;

    console.log('[RIPS_AI_VALIDATOR] ✅ AI validation completed', {
      isCompliant: parsedResponse.isCompliant,
      issuesCount: parsedResponse.issues.length,
      suggestionsCount: parsedResponse.suggestions.length,
      confidence,
      glosaRisk: parsedResponse.glosaRisk
    });

    return {
      isCompliant: parsedResponse.isCompliant,
      issues: parsedResponse.issues,
      suggestions: parsedResponse.suggestions,
      confidence
    };

  } catch (error) {
    console.error('[RIPS_AI_VALIDATOR] AI validation failed:', error);
    
    // Return fallback result on error
    return {
      isCompliant: false,
      issues: [
        'Error de validación AI: No se pudo completar la validación inteligente',
        error instanceof Error ? error.message : 'Error desconocido'
      ],
      suggestions: [
        'Revisar manualmente los códigos CUPS y CIE-10',
        'Verificar completitud de datos según Resolución 3100'
      ],
      confidence: 0
    };
  }
}
