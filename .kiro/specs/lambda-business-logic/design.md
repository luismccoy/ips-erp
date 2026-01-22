# Lambda Business Logic Testing - Design

**Feature:** Real-Integration Test Harness  
**Created:** 2026-01-21  
**Status:** Draft

---

## 1. Architecture Overview

### 1.1 Two-Lane Testing Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    TEST HARNESS                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  LANE 1: Deterministic Tests (Fast, No AI)                  │
│  ┌────────────────────────────────────────────────┐         │
│  │ Unit Tests                                     │         │
│  │ - RIPS validation rules                        │         │
│  │ - ICD-10 format checks                         │         │
│  │ - CUPS code validation                         │         │
│  │ - Input sanitization                           │         │
│  │ - Edge case handling                           │         │
│  │                                                 │         │
│  │ Target: 80%+ coverage, <1s execution           │         │
│  └────────────────────────────────────────────────┘         │
│                                                              │
│  LANE 2: AI-in-the-Loop Tests (Real Model Calls)            │
│  ┌────────────────────────────────────────────────┐         │
│  │ Integration Tests                              │         │
│  │ - Real Lambda invocations                      │         │
│  │ - Real DynamoDB operations                     │         │
│  │ - Real Bedrock AI calls                        │         │
│  │                                                 │         │
│  │ Modes:                                          │         │
│  │ - LIVE: Call real AI, record response          │         │
│  │ - RECORDED: Replay recorded response           │         │
│  │                                                 │         │
│  │ Target: All acceptance criteria validated      │         │
│  └────────────────────────────────────────────────┘         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. AI Client Wrapper (VCR Pattern)

### 2.1 Design

The AI client wrapper intercepts Bedrock calls and implements record/replay:

```typescript
// amplify/functions/roster-architect/ai-client.ts
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from 'crypto';

interface AIRecording {
  requestHash: string;
  modelId: string;
  timestamp: string;
  request: any;
  response: any;
  latencyMs: number;
  tokenUsage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export class AIClient {
  private bedrock: BedrockRuntimeClient;
  private s3: S3Client;
  private mode: 'LIVE' | 'RECORDED';
  private bucket: string;
  private prefix: string;

  constructor() {
    this.bedrock = new BedrockRuntimeClient({ region: "us-east-1" });
    this.s3 = new S3Client({ region: "us-east-1" });
    this.mode = (process.env.AI_TEST_MODE as 'LIVE' | 'RECORDED') || 'LIVE';
    this.bucket = process.env.AI_RECORDINGS_S3_BUCKET || '';
    this.prefix = process.env.AI_RECORDINGS_PREFIX || 'ai-recordings';
  }

  async invokeModel(params: {
    modelId: string;
    prompt: string;
    maxTokens: number;
    temperature?: number;
  }): Promise<any> {
    const requestHash = this.computeHash(params);
    const recordingKey = `${this.prefix}/${params.modelId}/${requestHash}.json`;

    if (this.mode === 'RECORDED') {
      return await this.loadRecording(recordingKey);
    }

    // LIVE mode: call real API and record
    const startTime = Date.now();
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

    // Save recording
    await this.saveRecording(recordingKey, {
      requestHash,
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

    return responseBody;
  }

  private computeHash(params: any): string {
    // Stable canonical JSON for consistent hashing
    const canonical = JSON.stringify(params, Object.keys(params).sort());
    return crypto.createHash('sha256').update(canonical).digest('hex').substring(0, 16);
  }

  private async loadRecording(key: string): Promise<any> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      const response = await this.s3.send(command);
      const body = await response.Body?.transformToString();
      const recording: AIRecording = JSON.parse(body || '{}');
      
      console.log(`[AI_CLIENT] Loaded recording: ${key} (${recording.latencyMs}ms)`);
      return recording.response;
    } catch (error) {
      throw new Error(
        `Recording not found: ${key}\n` +
        `Run tests in LIVE mode first to create recordings:\n` +
        `AI_TEST_MODE=LIVE npm run test:ai:live`
      );
    }
  }

  private async saveRecording(key: string, recording: AIRecording): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: JSON.stringify(recording, null, 2),
      ContentType: 'application/json',
    });
    await this.s3.send(command);
    console.log(`[AI_CLIENT] Saved recording: ${key} (${recording.latencyMs}ms, ${recording.tokenUsage?.inputTokens}/${recording.tokenUsage?.outputTokens} tokens)`);
  }
}
```

### 2.2 Integration into Lambda Handlers

**Before (direct Bedrock call):**
```typescript
const bedrock = new BedrockRuntimeClient({ region: "us-east-1" });
const command = new InvokeModelCommand({ ... });
const response = await bedrock.send(command);
```

**After (with AI client wrapper):**
```typescript
import { AIClient } from './ai-client';

const aiClient = new AIClient();
const response = await aiClient.invokeModel({
  modelId: process.env.MODEL_ID,
  prompt: constructedPrompt,
  maxTokens: 1000,
  temperature: 0.7
});
```

---

## 3. Test Fixtures (Synthetic Colombian Data)

### 3.1 Nurses Fixture

```json
// .local-tests/test-harness/fixtures/nurses.json
[
  {
    "id": "nurse-001",
    "name": "María González",
    "skills": ["Enfermería General", "Toma de Signos Vitales", "Administración de Medicamentos"],
    "locationLat": 4.6097,
    "locationLng": -74.0817
  },
  {
    "id": "nurse-002",
    "name": "Carlos Rodríguez",
    "skills": ["Enfermería General", "Cuidados Paliativos"],
    "locationLat": 4.6500,
    "locationLng": -74.1000
  },
  {
    "id": "nurse-003",
    "name": "Ana Martínez",
    "skills": ["Toma de Signos Vitales"],
    "locationLat": 4.5800,
    "locationLng": -74.0500
  }
]
```

### 3.2 Shifts Fixture

```json
// .local-tests/test-harness/fixtures/shifts.json
[
  {
    "id": "shift-001",
    "patientId": "patient-001",
    "scheduledTime": "2026-01-22T09:00:00Z",
    "requiredSkills": ["Toma de Signos Vitales"],
    "locationLat": 4.6150,
    "locationLng": -74.0850
  },
  {
    "id": "shift-002",
    "patientId": "patient-002",
    "scheduledTime": "2026-01-22T10:00:00Z",
    "requiredSkills": ["Cuidados Paliativos"],
    "locationLat": 4.6550,
    "locationLng": -74.1050
  }
]
```

### 3.3 RIPS Records Fixture

```json
// .local-tests/test-harness/fixtures/rips-records.json
{
  "valid": {
    "date": "2026-01-21",
    "procedures": ["890201", "890301"],
    "diagnosis": "I10.0",
    "eps": "SURA",
    "totalAmount": 150000,
    "patientId": "patient-001",
    "shiftId": "shift-001"
  },
  "invalid_date_format": {
    "date": "21/01/2026",
    "procedures": ["890201"],
    "diagnosis": "I10.0",
    "eps": "SURA",
    "totalAmount": 150000
  },
  "invalid_cups_code": {
    "date": "2026-01-21",
    "procedures": ["89020"],
    "diagnosis": "I10.0",
    "eps": "SURA",
    "totalAmount": 150000
  },
  "invalid_icd10": {
    "date": "2026-01-21",
    "procedures": ["890201"],
    "diagnosis": "I10",
    "eps": "SURA",
    "totalAmount": 150000
  }
}
```

### 3.4 Glosa Scenarios Fixture

```json
// .local-tests/test-harness/fixtures/glosa-scenarios.json
{
  "scenario_1": {
    "billingRecord": {
      "id": "bill-001",
      "date": "2026-01-15",
      "procedures": ["890201"],
      "diagnosis": "I10.0",
      "eps": "SURA",
      "totalAmount": 150000,
      "rejectionReason": "Procedimiento no autorizado previamente"
    },
    "patientHistory": {
      "name": "Juan Pérez",
      "age": 68,
      "diagnosis": "Hipertensión arterial",
      "vitalSigns": [
        {
          "date": "2026-01-15",
          "sys": 160,
          "dia": 95,
          "spo2": 96,
          "hr": 88,
          "note": "Paciente con cefalea intensa"
        }
      ]
    },
    "clinicalNotes": [
      "Control de signos vitales por hipertensión descompensada",
      "Administración de medicación antihipertensiva"
    ]
  }
}
```

---

## 4. Unit Tests (Deterministic, No AI)

### 4.1 RIPS Validator Tests

```typescript
// .local-tests/test-harness/unit/rips-validator.test.ts
import { describe, it, expect } from '@jest/globals';
import { handler } from '../../../amplify/functions/rips-validator/handler';
import fixtures from '../fixtures/rips-records.json';

describe('RIPS Validator - Deterministic Rules', () => {
  describe('Required Fields Validation', () => {
    it('should pass with all required fields', async () => {
      const result = await handler({
        arguments: { billingRecord: fixtures.valid }
      });
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when date is missing', async () => {
      const record = { ...fixtures.valid };
      delete record.date;
      
      const result = await handler({
        arguments: { billingRecord: record }
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'date',
        message: 'Date is required'
      });
    });

    it('should fail when procedures array is empty', async () => {
      const record = { ...fixtures.valid, procedures: [] };
      
      const result = await handler({
        arguments: { billingRecord: record }
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'procedures',
        message: 'At least one procedure (CUPS code) is required'
      });
    });
  });

  describe('Date Format Validation', () => {
    it('should fail with non-ISO date format', async () => {
      const result = await handler({
        arguments: { billingRecord: fixtures.invalid_date_format }
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'date',
        message: 'Date must be in ISO 8601 format (YYYY-MM-DD)'
      });
    });

    it('should warn when date is in the future', async () => {
      const record = {
        ...fixtures.valid,
        date: '2027-12-31'
      };
      
      const result = await handler({
        arguments: { billingRecord: record }
      });
      
      expect(result.warnings).toContain('Date is in the future');
    });
  });

  describe('CUPS Code Validation', () => {
    it('should fail with invalid CUPS code length', async () => {
      const result = await handler({
        arguments: { billingRecord: fixtures.invalid_cups_code }
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'procedures[0]',
        message: 'Invalid CUPS code format: 89020. Expected 6 digits.'
      });
    });

    it('should fail with non-numeric CUPS code', async () => {
      const record = {
        ...fixtures.valid,
        procedures: ['ABC123']
      };
      
      const result = await handler({
        arguments: { billingRecord: record }
      });
      
      expect(result.isValid).toBe(false);
    });
  });

  describe('ICD-10 Code Validation', () => {
    it('should fail with invalid ICD-10 format', async () => {
      const result = await handler({
        arguments: { billingRecord: fixtures.invalid_icd10 }
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'diagnosis',
        message: 'Invalid ICD-10 code format: I10'
      });
    });

    it('should pass with valid ICD-10 codes', async () => {
      const validCodes = ['A00', 'A00.0', 'A00.01', 'I10.0', 'J45.9'];
      
      for (const code of validCodes) {
        const record = { ...fixtures.valid, diagnosis: code };
        const result = await handler({
          arguments: { billingRecord: record }
        });
        
        expect(result.isValid).toBe(true);
      }
    });
  });

  describe('Amount Validation', () => {
    it('should fail with negative amount', async () => {
      const record = { ...fixtures.valid, totalAmount: -100 };
      
      const result = await handler({
        arguments: { billingRecord: record }
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'totalAmount',
        message: 'Amount cannot be negative'
      });
    });

    it('should warn with zero amount', async () => {
      const record = { ...fixtures.valid, totalAmount: 0 };
      
      const result = await handler({
        arguments: { billingRecord: record }
      });
      
      expect(result.warnings).toContain('Amount is zero');
    });
  });
});
```

**Target Coverage:** 80%+ for all deterministic validation logic

---

## 5. Integration Tests (Real Lambda + AI)

### 5.1 Roster Architect Integration Test

```typescript
// .local-tests/test-harness/integration/roster-architect.test.ts
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { describe, it, expect, beforeAll } from '@jest/globals';
import nurses from '../fixtures/nurses.json';
import shifts from '../fixtures/shifts.json';

describe('Roster Architect - Integration Tests', () => {
  let lambda: LambdaClient;
  const functionName = 'roster-architect-test'; // Test stage function

  beforeAll(() => {
    lambda = new LambdaClient({ region: 'us-east-1' });
  });

  it('should assign nurses to shifts based on skills and distance', async () => {
    const payload = {
      arguments: {
        nurses: nurses,
        unassignedShifts: shifts
      }
    };

    const command = new InvokeCommand({
      FunctionName: functionName,
      Payload: JSON.stringify(payload),
    });

    const response = await lambda.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.Payload));

    // Validate response structure
    expect(result).toHaveProperty('assignments');
    expect(Array.isArray(result.assignments)).toBe(true);

    // Validate skill matching
    for (const assignment of result.assignments) {
      const shift = shifts.find(s => s.id === assignment.shiftId);
      const nurse = nurses.find(n => n.id === assignment.nurseId);
      
      expect(shift).toBeDefined();
      expect(nurse).toBeDefined();
      
      // Check nurse has required skills
      if (shift.requiredSkills && shift.requiredSkills.length > 0) {
        const hasRequiredSkills = shift.requiredSkills.every(
          skill => nurse.skills.includes(skill)
        );
        expect(hasRequiredSkills).toBe(true);
      }
    }
  });

  it('should handle empty nurses array gracefully', async () => {
    const payload = {
      arguments: {
        nurses: [],
        unassignedShifts: shifts
      }
    };

    const command = new InvokeCommand({
      FunctionName: functionName,
      Payload: JSON.stringify(payload),
    });

    const response = await lambda.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.Payload));

    expect(result.assignments).toHaveLength(0);
  });

  it('should complete within 5 seconds', async () => {
    const startTime = Date.now();
    
    const payload = {
      arguments: {
        nurses: nurses,
        unassignedShifts: shifts
      }
    };

    const command = new InvokeCommand({
      FunctionName: functionName,
      Payload: JSON.stringify(payload),
    });

    await lambda.send(command);
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5000);
  });
});
```

### 5.2 Glosa Defender Integration Test

```typescript
// .local-tests/test-harness/integration/glosa-defender.test.ts
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { describe, it, expect, beforeAll } from '@jest/globals';
import glosaScenarios from '../fixtures/glosa-scenarios.json';

describe('Glosa Defender - Integration Tests', () => {
  let lambda: LambdaClient;
  const functionName = 'glosa-defender-test';

  beforeAll(() => {
    lambda = new LambdaClient({ region: 'us-east-1' });
  });

  it('should generate defense letter in Spanish', async () => {
    const scenario = glosaScenarios.scenario_1;
    
    const payload = {
      arguments: scenario
    };

    const command = new InvokeCommand({
      FunctionName: functionName,
      Payload: JSON.stringify(payload),
    });

    const response = await lambda.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.Payload));

    expect(result.success).toBe(true);
    expect(result.defenseLetter).toBeDefined();
    
    // Validate Spanish content
    const letter = result.defenseLetter;
    expect(letter).toMatch(/Señores|Cordial saludo|Atentamente/);
    
    // Validate structure
    expect(letter).toMatch(/Asunto:/);
    expect(letter).toMatch(/Fecha:/);
    
    // Validate clinical references
    expect(letter).toContain(scenario.patientHistory.name);
    expect(letter).toMatch(/signos vitales|PA|SpO2/i);
    
    // Validate regulation citations
    expect(letter).toMatch(/Resolución|Ley 100/i);
  });

  it('should complete within 10 seconds', async () => {
    const startTime = Date.now();
    
    const payload = {
      arguments: glosaScenarios.scenario_1
    };

    const command = new InvokeCommand({
      FunctionName: functionName,
      Payload: JSON.stringify(payload),
    });

    await lambda.send(command);
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(10000);
  });
});
```

---

## 6. Performance Tests

### 6.1 Load Test Script

```typescript
// .local-tests/test-harness/performance/load-test.ts
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import nurses from '../fixtures/nurses.json';
import shifts from '../fixtures/shifts.json';

interface PerformanceMetrics {
  p50: number;
  p90: number;
  p99: number;
  min: number;
  max: number;
  avg: number;
  errorRate: number;
}

async function runLoadTest(
  functionName: string,
  payload: any,
  concurrency: number,
  iterations: number
): Promise<PerformanceMetrics> {
  const lambda = new LambdaClient({ region: 'us-east-1' });
  const latencies: number[] = [];
  let errors = 0;

  console.log(`Running load test: ${concurrency} concurrent, ${iterations} iterations`);

  for (let i = 0; i < iterations; i++) {
    const batch = Array(concurrency).fill(null).map(async () => {
      const startTime = Date.now();
      try {
        const command = new InvokeCommand({
          FunctionName: functionName,
          Payload: JSON.stringify(payload),
        });
        await lambda.send(command);
        return Date.now() - startTime;
      } catch (error) {
        errors++;
        return -1;
      }
    });

    const results = await Promise.all(batch);
    latencies.push(...results.filter(l => l > 0));
  }

  latencies.sort((a, b) => a - b);

  return {
    p50: latencies[Math.floor(latencies.length * 0.5)],
    p90: latencies[Math.floor(latencies.length * 0.9)],
    p99: latencies[Math.floor(latencies.length * 0.99)],
    min: latencies[0],
    max: latencies[latencies.length - 1],
    avg: latencies.reduce((a, b) => a + b, 0) / latencies.length,
    errorRate: errors / (concurrency * iterations)
  };
}

async function main() {
  // Test Roster Architect
  console.log('\n=== Roster Architect Performance ===');
  const rosterMetrics = await runLoadTest(
    'roster-architect-test',
    {
      arguments: {
        nurses: nurses,
        unassignedShifts: shifts
      }
    },
    10, // 10 concurrent
    10  // 10 iterations = 100 total invocations
  );

  console.log(`P50: ${rosterMetrics.p50}ms`);
  console.log(`P90: ${rosterMetrics.p90}ms`);
  console.log(`P99: ${rosterMetrics.p99}ms`);
  console.log(`Error Rate: ${(rosterMetrics.errorRate * 100).toFixed(2)}%`);

  // Validate against targets
  if (rosterMetrics.p90 > 5000) {
    console.error(`❌ FAILED: P90 latency ${rosterMetrics.p90}ms exceeds 5s target`);
    process.exit(1);
  }

  if (rosterMetrics.errorRate > 0.001) {
    console.error(`❌ FAILED: Error rate ${rosterMetrics.errorRate} exceeds 0.1% target`);
    process.exit(1);
  }

  console.log('✅ Performance targets met');
}

main();
```

---

## 7. Test Execution Workflow

### 7.1 Developer Workflow

```bash
# 1. First time setup
cd .local-tests/test-harness
npm install

# 2. Create S3 bucket for recordings
aws s3 mb s3://ips-erp-test-recordings

# 3. Run unit tests (fast, no AWS calls)
npm run test:unit

# 4. Run integration tests with LIVE AI calls (creates recordings)
AI_TEST_MODE=LIVE npm run test:ai:live

# 5. Run integration tests with RECORDED AI (fast dev loop)
AI_TEST_MODE=RECORDED npm run test:ai:recorded

# 6. Run performance tests
npm run test:perf

# 7. Refresh recordings (weekly or when model changes)
npm run test:recordings:refresh
```

### 7.2 CI/CD Workflow

```yaml
# .github/workflows/test.yml
name: Test Lambda Business Logic

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Run unit tests
        run: |
          cd .local-tests/test-harness
          npm install
          npm run test:unit
      
      - name: Run integration tests (RECORDED mode)
        run: |
          cd .local-tests/test-harness
          AI_TEST_MODE=RECORDED npm run test:ai:recorded
      
      - name: Run performance tests
        run: |
          cd .local-tests/test-harness
          npm run test:perf

  nightly:
    runs-on: ubuntu-latest
    if: github.event_name == 'schedule'
    steps:
      - uses: actions/checkout@v2
      
      - name: Run LIVE AI tests (refresh recordings)
        run: |
          cd .local-tests/test-harness
          npm install
          AI_TEST_MODE=LIVE npm run test:ai:live
```

---

## 8. Cost Analysis

### 8.1 Estimated Costs

**LIVE Mode (Real AI Calls):**
- Roster Architect: ~500 tokens/call × $0.003/1K tokens = $0.0015/call
- Glosa Defender: ~2000 tokens/call × $0.003/1K tokens = $0.006/call
- 100 test runs/day = ~$0.75/day = $22.50/month

**RECORDED Mode:**
- S3 storage: ~1MB recordings × $0.023/GB = negligible
- S3 requests: ~1000 GET requests/day × $0.0004/1K = $0.012/month

**Total Monthly Cost:** ~$25 (mostly from nightly LIVE tests)

### 8.2 Cost Optimization

1. Use RECORDED mode for dev/CI (99% of tests)
2. Run LIVE mode only for nightly regression
3. Refresh recordings weekly, not daily
4. Set S3 lifecycle policy to delete recordings >90 days

---

## 9. Security Considerations

### 9.1 Data Privacy

- All test fixtures are synthetic (no real PHI)
- Automated PHI detection in CI (fail if real data detected)
- Recordings stored in private S3 bucket (no public access)
- IAM policies restrict access to test resources only

### 9.2 Secrets Management

- No secrets in code or fixtures
- AWS credentials via IAM roles (not hardcoded)
- Bedrock model ID from environment variables
- S3 bucket name from environment variables

---

## 10. Success Metrics

**Test execution metrics:**
- Unit test coverage: >80% for deterministic modules
- Integration test pass rate: 100%
- Performance test pass rate: 100%
- CI/CD pipeline duration: <5 minutes

**Quality metrics:**
- All acceptance criteria validated
- All edge cases covered
- All regulatory requirements verified
- Zero false positives in validation

**Cost metrics:**
- Monthly testing cost: <$50
- LIVE test runs: <100/month
- RECORDED test runs: unlimited

---

**Next Steps:**
1. Review and approve design
2. Create tasks document with implementation checklist
3. Begin implementation (Phase 1: Setup)
