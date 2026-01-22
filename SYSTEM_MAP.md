# IPS ERP System Map - Deployed Architecture

**Generated:** January 21, 2026  
**Purpose:** Complete mapping of UI → Backend → Data flows for validation testing

---

## 1. Deployed Infrastructure Overview

### GraphQL API
- **Endpoint:** `https://ga4dwdcapvg5ziixpgipcvmfbe.appsync-api.us-east-1.amazonaws.com/graphql`
- **Auth:** Amazon Cognito User Pools (us-east-1_q9ZtCLtQr)
- **Authorization:** Multi-tenant via `custom:tenantId` claim

### Lambda Functions (3 Total)

| Function | Handler Path | Timeout | Model | Purpose |
|----------|-------------|---------|-------|---------|
| **roster-architect** | `amplify/functions/roster-architect/handler.ts` | 60s | Claude 3.5 Sonnet | AI-assisted shift assignment |
| **glosa-defender** | `amplify/functions/glosa-defender/handler.ts` | 60s | Claude 3.5 Sonnet | AI billing defense letters |
| **rips-validator** | `amplify/functions/rips-validator/handler.ts` | 30s | N/A (deterministic) | Colombian compliance validation |

### DynamoDB Tables (14 Total)
All tables use single-table design with `tenantId` partition key for multi-tenant isolation:
- Tenant
- Patient
- Nurse
- Shift
- InventoryItem
- VitalSigns
- BillingRecord
- (+ 7 AppSync system tables)

---

## 2. UI Module → Backend → Data Mapping

### 2.1 Admin Dashboard (`src/components/AdminDashboard.tsx`)

| UI Feature | API Call | Backend Entry | DynamoDB Tables | Lambda Invoked |
|------------|----------|---------------|-----------------|----------------|
| **Dashboard View** | `client.models.Patient.list()` | GraphQL Query | Patient, Shift, VitalSigns | None |
| | `client.models.Shift.list()` | GraphQL Query | Shift | None |
| | `client.models.InventoryItem.list()` | GraphQL Query | InventoryItem | None |
| **Audit Log** | `client.models.Shift.list()` | GraphQL Query | Shift, Patient, Nurse | None |
| **Inventory Management** | `client.models.InventoryItem.list()` | GraphQL Query | InventoryItem | None |
| | `client.models.InventoryItem.update()` | GraphQL Mutation | InventoryItem | None |
| **Roster Generation** | `client.queries.generateRoster()` | Custom Query → Lambda | Nurse, Shift | **roster-architect** |

**Roster Architect Lambda Details:**
- **Input:** `{ nurses: Nurse[], unassignedShifts: Shift[] }`
- **Output:** `{ assignments: [{ shiftId: string, nurseId: string }] }`
- **AI Logic:** Minimizes travel time, matches skills, considers continuity of care
- **Env Vars:** `MODEL_ID` (Claude 3.5 Sonnet model ID)

---

### 2.2 Admin Roster (`src/components/AdminRoster.tsx`)

| UI Feature | API Call | Backend Entry | DynamoDB Tables | Lambda Invoked |
|------------|----------|---------------|-----------------|----------------|
| **Load Nurses** | `client.models.Nurse.list()` | GraphQL Query | Nurse | None |
| **Load Shifts** | `client.models.Shift.list()` | GraphQL Query | Shift, Patient | None |
| **Generate Roster** | `client.queries.generateRoster()` | Custom Query → Lambda | Nurse, Shift | **roster-architect** |
| **Save Assignments** | `client.models.Shift.update()` | GraphQL Mutation | Shift | None |

---

### 2.3 RIPS Validator (`src/components/RipsValidator.tsx`)

| UI Feature | API Call | Backend Entry | DynamoDB Tables | Lambda Invoked |
|------------|----------|---------------|-----------------|----------------|
| **Validate Billing** | `client.queries.validateRIPS()` | Custom Query → Lambda | None (stateless) | **rips-validator** |
| **Load Billing Records** | `client.models.BillingRecord.list()` | GraphQL Query | BillingRecord | None |
| **Submit to EPS** | `client.models.BillingRecord.update()` | GraphQL Mutation | BillingRecord | None |

**RIPS Validator Lambda Details:**
- **Input:** `{ billingRecord: BillingRecord }`
- **Output:** `{ isValid: boolean, errors: ValidationError[], warnings: string[] }`
- **Validation Rules:**
  - Date format: ISO 8601 (YYYY-MM-DD)
  - CUPS codes: 6-digit format (Colombian procedure codes)
  - ICD-10 diagnosis: Letter + 2 digits + optional decimal
  - EPS: Valid Colombian health insurance provider
  - Amount: Non-negative
- **Env Vars:** None (deterministic logic)

---

### 2.4 Evidence Generator (`src/components/EvidenceGenerator.tsx`)

| UI Feature | API Call | Backend Entry | DynamoDB Tables | Lambda Invoked |
|------------|----------|---------------|-----------------|----------------|
| **Load Shifts** | `client.models.Shift.list()` | GraphQL Query | Shift, Patient, Nurse | None |
| **Generate Defense** | `client.queries.generateGlosaDefense()` | Custom Query → Lambda | BillingRecord, VitalSigns | **glosa-defender** |

**Glosa Defender Lambda Details:**
- **Input:**
  ```typescript
  {
    billingRecord: {
      id, date, procedures, diagnosis, eps, 
      totalAmount, rejectionReason
    },
    patientHistory: {
      name, age, diagnosis,
      vitalSigns: [{ date, sys, dia, spo2, hr, note }]
    },
    clinicalNotes: string[]
  }
  ```
- **Output:**
  ```typescript
  {
    success: boolean,
    defenseLetter: string,  // Spanish formal letter
    generatedAt: string,
    model: string
  }
  ```
- **AI Logic:** 
  - Cites Colombian regulations (Resolución 3100, Ley 100)
  - Clinical justification based on vital signs
  - Professional Spanish letter format
  - Fallback template if AI fails
- **Env Vars:** `MODEL_ID` (Claude 3.5 Sonnet model ID)

---

### 2.5 Nurse Dashboard (`src/components/NurseDashboard.tsx`)

| UI Feature | API Call | Backend Entry | DynamoDB Tables | Lambda Invoked |
|------------|----------|---------------|-----------------|----------------|
| **Load Assigned Shifts** | `client.models.Shift.list()` | GraphQL Query | Shift, Patient | None |
| **Start Shift** | `client.models.Shift.update()` | GraphQL Mutation | Shift | None |
| **Complete Shift** | `client.models.Shift.update()` | GraphQL Mutation | Shift | None |
| **Record Vitals** | `client.models.VitalSigns.create()` | GraphQL Mutation | VitalSigns | None |

---

### 2.6 Inventory Dashboard (`src/components/InventoryDashboard.tsx`)

| UI Feature | API Call | Backend Entry | DynamoDB Tables | Lambda Invoked |
|------------|----------|---------------|-----------------|----------------|
| **Load Inventory** | `client.models.InventoryItem.list()` | GraphQL Query | InventoryItem | None |
| **Subscribe to Updates** | `client.models.InventoryItem.observeQuery()` | GraphQL Subscription | InventoryItem | None |
| **Update Stock** | `client.models.InventoryItem.update()` | GraphQL Mutation | InventoryItem | None |
| **Add Item** | `client.models.InventoryItem.create()` | GraphQL Mutation | InventoryItem | None |

---

### 2.7 Family Portal (`src/components/FamilyPortal.tsx`)

| UI Feature | API Call | Backend Entry | DynamoDB Tables | Lambda Invoked |
|------------|----------|---------------|-----------------|----------------|
| **Load Patients** | `client.models.Patient.list()` | GraphQL Query | Patient | None |
| **Load Vitals** | `client.models.VitalSigns.list()` | GraphQL Query | VitalSigns | None |
| **View Shift Status** | `client.models.Shift.list()` | GraphQL Query | Shift, Nurse | None |

---

## 3. Lambda Function Specifications

### 3.1 roster-architect

**File:** `amplify/functions/roster-architect/handler.ts`

**Dependencies:**
```json
{
  "@aws-sdk/client-bedrock-runtime": "^3.x"
}
```

**Environment Variables:**
- `MODEL_ID`: Bedrock model identifier (e.g., `anthropic.claude-3-5-sonnet-20241022-v2:0`)

**Input Schema:**
```typescript
{
  nurses: Array<{
    id: string;
    name: string;
    skills: string[];
    locationLat?: number;
    locationLng?: number;
  }>;
  unassignedShifts: Array<{
    id: string;
    patientId: string;
    scheduledTime: string;
    requiredSkills?: string[];
  }>;
}
```

**Output Schema:**
```typescript
{
  assignments: Array<{
    shiftId: string;
    nurseId: string;
  }>;
}
```

**AI Prompt Strategy:**
- Minimize travel time between nurse location and patient location
- Match nurse skills with shift requirements
- Consider continuity of care (same nurse for same patient)
- Output JSON only (no explanations)

**Error Handling:**
- Fallback: Returns empty assignments array
- Logs error to CloudWatch

---

### 3.2 glosa-defender

**File:** `amplify/functions/glosa-defender/handler.ts`

**Dependencies:**
```json
{
  "@aws-sdk/client-bedrock-runtime": "^3.x"
}
```

**Environment Variables:**
- `MODEL_ID`: Bedrock model identifier

**Input Schema:**
```typescript
{
  billingRecord: {
    id: string;
    date: string;
    procedures: string[];  // CUPS codes
    diagnosis: string;     // ICD-10 code
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
```

**Output Schema:**
```typescript
{
  success: boolean;
  defenseLetter: string;  // Spanish formal letter
  generatedAt: string;
  model?: string;
  error?: string;
}
```

**AI Prompt Strategy:**
- Generate professional Spanish letter
- Cite Colombian regulations (Resolución 3100, Ley 100)
- Clinical justification based on vital signs
- Formal structure: date, recipient, subject, body, closing
- Request formal acceptance of invoice

**Error Handling:**
- Fallback: Returns template-based defense letter
- Includes error message in response

---

### 3.3 rips-validator

**File:** `amplify/functions/rips-validator/handler.ts`

**Dependencies:** None (pure TypeScript logic)

**Environment Variables:** None

**Input Schema:**
```typescript
{
  billingRecord: {
    date: string;
    procedures: string[];  // CUPS codes
    diagnosis: string;     // ICD-10 code
    eps: string;
    totalAmount?: number;
    patientId?: string;
    shiftId?: string;
  };
}
```

**Output Schema:**
```typescript
{
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
  warnings: string[];
}
```

**Validation Rules:**

| Field | Rule | Error/Warning |
|-------|------|---------------|
| `date` | Required, ISO 8601 format (YYYY-MM-DD) | Error if missing/invalid |
| `date` | Not in future | Warning if future date |
| `procedures` | Required, array of 6-digit CUPS codes | Error if missing/invalid format |
| `diagnosis` | Required, ICD-10 format (Letter + 2 digits + optional decimal) | Error if missing/invalid |
| `eps` | Required, min 3 characters | Error if missing/too short |
| `eps` | In common provider list | Warning if not in list |
| `totalAmount` | Non-negative | Error if negative |
| `totalAmount` | Non-zero | Warning if zero |
| `patientId` | Recommended | Warning if missing |
| `shiftId` | Recommended | Warning if missing |

**Error Handling:**
- No fallback needed (deterministic logic)
- Returns validation result with all errors and warnings

---

## 4. Multi-Tenant Data Isolation

**Strategy:** Logical isolation via `tenantId` custom attribute in Cognito

**Implementation:**
1. User signs in → Cognito returns JWT with `custom:tenantId` claim
2. AppSync authorization rules filter all queries by `tenantId`
3. GraphQL schema enforces `tenantId` on all models
4. Lambda functions receive `tenantId` from context (if needed)

**Example Authorization Rule:**
```typescript
.authorization((allow) => [
  allow.owner().identityClaim('custom:tenantId')
])
```

**Test Users:**
- `admin@ips.com` → `custom:tenantId = tenant-bogota-01`
- `nurse@ips.com` → `custom:tenantId = tenant-bogota-01`
- `family@ips.com` → `custom:tenantId = tenant-bogota-01`

---

## 5. Real-Time Subscriptions

**Supported Models:**
- InventoryItem (real-time stock updates)
- Shift (real-time status changes)
- VitalSigns (real-time patient monitoring)

**Usage Pattern:**
```typescript
const subscription = client.models.InventoryItem.observeQuery({
  filter: { tenantId: { eq: userTenantId } }
}).subscribe({
  next: ({ items }) => {
    // Update UI with real-time data
  }
});
```

---

## 6. Offline Support (AppSync)

**Capabilities:**
- Local caching of GraphQL queries
- Automatic conflict resolution
- Queue mutations when offline
- Sync when connection restored

**Configuration:**
- Enabled by default in Amplify Gen 2
- Uses IndexedDB for browser storage
- Configurable sync interval

---

## 7. CloudWatch Monitoring

**Dashboard:** `IPS-ERP-Production-Dashboard`

**Metrics Tracked:**
- Lambda invocations, errors, duration (all 3 functions)
- DynamoDB read/write capacity units
- AppSync request count and latency

**Alarms (9 Total):**
- 3x Lambda error rate > 5%
- 3x Lambda throttle rate > 1%
- 3x DynamoDB throttle rate > 1%

**SNS Topic:** `arn:aws:sns:us-east-1:747680064475:IPS-ERP-Alerts`

---

## 8. Cost Estimates

**Monthly Costs (Production):**
- Lambda: ~$5 (3 functions, moderate usage)
- DynamoDB: ~$10 (14 tables, on-demand pricing)
- AppSync: ~$5 (GraphQL requests)
- Bedrock: ~$25 (Claude 3.5 Sonnet, mostly RECORDED mode)
- CloudWatch: ~$5 (logs, metrics, alarms)
- **Total:** ~$50/month

**Cost Optimization:**
- Use RECORDED mode for AI calls (dev/CI)
- LIVE mode only for nightly regression tests
- DynamoDB on-demand pricing (no reserved capacity)

---

## 9. Security & Compliance

**Authentication:**
- Cognito User Pools with MFA support
- Password policy: min 8 chars, uppercase, lowercase, numbers, symbols

**Authorization:**
- Multi-tenant isolation via `custom:tenantId`
- Row-level security in DynamoDB
- IAM roles for Lambda execution

**Encryption:**
- DynamoDB encryption at rest (AWS managed keys)
- HTTPS for all API calls
- Secrets in AWS Secrets Manager (if needed)

**Compliance:**
- Colombian health regulations (Resolución 3100, 2275)
- RIPS validation for billing
- Audit trail via CloudWatch logs

---

## 10. Next Steps for Testing

**Phase 1: System Map Validation** ✅ COMPLETE
- Document all UI → Backend → Data flows
- Identify Lambda entry points
- Map DynamoDB tables

**Phase 2: Test Harness Implementation** (Next)
- Create `.local-tests/test-harness/` directory
- Implement AI client wrapper with VCR recording
- Create synthetic Colombian test fixtures
- Write unit tests for RIPS validator
- Write integration tests for all 3 Lambdas
- Implement performance tests

**Phase 3: CI/CD Integration**
- Add test scripts to GitHub Actions
- Configure LIVE vs RECORDED modes
- Set up nightly regression tests

---

## Appendix A: GraphQL Custom Queries

### generateRoster
```graphql
query GenerateRoster($nurses: AWSJSON, $unassignedShifts: AWSJSON) {
  generateRoster(nurses: $nurses, unassignedShifts: $unassignedShifts)
}
```

### validateRIPS
```graphql
query ValidateRIPS($billingRecord: AWSJSON) {
  validateRIPS(billingRecord: $billingRecord)
}
```

### generateGlosaDefense
```graphql
query GenerateGlosaDefense(
  $billingRecord: AWSJSON
  $patientHistory: AWSJSON
  $clinicalNotes: AWSJSON
) {
  generateGlosaDefense(
    billingRecord: $billingRecord
    patientHistory: $patientHistory
    clinicalNotes: $clinicalNotes
  )
}
```

---

**End of System Map**
