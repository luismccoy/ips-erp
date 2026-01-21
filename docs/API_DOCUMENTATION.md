# IPS ERP API Documentation

**Last Updated:** 2026-01-21  
**Backend Status:** ✅ Phase 2 Complete - All Models Deployed  
**GraphQL Endpoint:** https://ga4dwdcapvg5ziixpgipcvmfbe.appsync-api.us-east-1.amazonaws.com/graphql

---

## Overview

The IPS ERP backend is built on AWS Amplify Gen 2 with:
- **GraphQL API** via AWS AppSync
- **Multi-tenant architecture** with strict data isolation
- **7 core data models** for home care operations
- **Automated testing** via scripts/test-phase2.sh

---

## Authentication

### Sandbox Mode (Development)
- Uses IAM authentication
- No user tokens required
- Automatic AWS credential signing

### Production Mode
- AWS Cognito User Pools
- JWT tokens with `custom:tenantId` claim
- Multi-tenant isolation enforced

---

## Data Models

### 1. Tenant
**Purpose:** Base organization model (IPS agencies)

**Fields:**
- `id`: ID (auto-generated)
- `name`: String (required) - Agency name
- `nit`: String (required) - Colombian tax ID

**Relationships:**
- `nurses`: hasMany Nurse
- `patients`: hasMany Patient
- `shifts`: hasMany Shift
- `inventory`: hasMany InventoryItem
- `vitalSigns`: hasMany VitalSigns
- `billingRecords`: hasMany BillingRecord

**Authorization:** Authenticated users only

---

### 2. Patient
**Purpose:** Home care patients with medical history

**Fields:**
- `id`: ID
- `tenantId`: ID (required) - Links to Tenant
- `name`: String (required)
- `documentId`: String (required)
- `age`: Int
- `address`: String
- `diagnosis`: String
- `medications`: [Medication] - Nested array
- `tasks`: [Task] - Nested array

**Nested Types:**
- **Medication:** { id, name, dosage, frequency, prescribedBy, status }
- **Task:** { id, patientId, description, completed, dueDate }

**Relationships:**
- `tenant`: belongsTo Tenant
- `shifts`: hasMany Shift
- `vitalSigns`: hasMany VitalSigns

**Authorization:** Owner-based via `custom:tenantId`

---

### 3. Nurse
**Purpose:** Home care nurses with skills and location

**Fields:**
- `id`: ID
- `tenantId`: ID (required)
- `name`: String (required)
- `email`: String
- `role`: Enum (ADMIN, NURSE, COORDINATOR)
- `skills`: [String] - Array of skills
- `locationLat`: Float
- `locationLng`: Float

**Relationships:**
- `tenant`: belongsTo Tenant
- `shifts`: hasMany Shift

**Authorization:** Owner-based via `custom:tenantId`

---

### 4. Shift
**Purpose:** Nurse assignments to patients with GPS tracking

**Fields:**
- `id`: ID
- `tenantId`: ID (required)
- `nurseId`: ID (required)
- `patientId`: ID (required)
- `scheduledTime`: String (ISO datetime)
- `status`: ShiftStatus enum
- `clinicalNote`: String
- `startedAt`: AWSDateTime
- `completedAt`: AWSDateTime
- `startLat`: Float
- `startLng`: Float

**Relationships:**
- `tenant`: belongsTo Tenant
- `nurse`: belongsTo Nurse
- `patient`: belongsTo Patient

**Authorization:** Owner-based via `custom:tenantId`

---

### 5. InventoryItem
**Purpose:** Medical supplies tracking

**Fields:**
- `id`: ID
- `tenantId`: ID (required)
- `name`: String (required)
- `sku`: String
- `quantity`: Int (required, default: 0)
- `unit`: String
- `reorderLevel`: Int (required, default: 10)
- `status`: InventoryStatus enum
- `expiryDate`: String (ISO date)

**Relationships:**
- `tenant`: belongsTo Tenant

**Authorization:** Owner-based via `custom:tenantId`

---

### 6. VitalSigns
**Purpose:** Patient health metrics

**Fields:**
- `id`: ID
- `tenantId`: ID (required)
- `patientId`: ID (required)
- `date`: String (ISO date, required)
- `sys`: Int (required) - Systolic BP
- `dia`: Int (required) - Diastolic BP
- `spo2`: Int (required) - Oxygen saturation
- `hr`: Int (required) - Heart rate
- `temperature`: Float
- `weight`: Float
- `note`: String

**Relationships:**
- `tenant`: belongsTo Tenant
- `patient`: belongsTo Patient

**Authorization:** Owner-based via `custom:tenantId`

---

### 7. BillingRecord
**Purpose:** RIPS billing data for Colombian health system

**Fields:**
- `id`: ID
- `tenantId`: ID (required)
- `patientId`: ID (required)
- `shiftId`: ID
- `date`: String (ISO date, required)
- `procedures`: [String] - CUPS codes
- `diagnosis`: String (required) - ICD-10 code
- `eps`: String (required) - Health insurance provider
- `totalAmount`: Float (required)
- `ripsGenerated`: Boolean (required, default: false)
- `status`: BillingStatus enum
- `submittedAt`: AWSDateTime
- `approvedAt`: AWSDateTime
- `rejectionReason`: String
- `glosaDefense`: String - AI-generated defense

**Relationships:**
- `tenant`: belongsTo Tenant

**Authorization:** Owner-based via `custom:tenantId`

---

## Enums

### ShiftStatus
- PENDING
- IN_PROGRESS
- COMPLETED
- CANCELLED

### InventoryStatus
- IN_STOCK
- LOW_STOCK
- OUT_OF_STOCK

### BillingStatus
- PENDING
- SUBMITTED
- APPROVED
- REJECTED
- PAID

### NurseRole
- ADMIN
- NURSE
- COORDINATOR

---

## Testing

### Automated Tests
Run all schema validation tests:
```bash
./scripts/test-phase2.sh
```

**Test Coverage:**
- ✅ All 7 models exist
- ✅ Nested types (Medication, Task)
- ✅ Relationships (Shift → Nurse, Patient)
- ✅ Multi-tenant authorization
- ✅ All enum types
- ✅ Custom types

**Test Results (2026-01-21):**
- Total: 10 tests
- Passed: 10
- Failed: 0

---

## Deployment

### Sandbox (Development)
```bash
export AWS_REGION=us-east-1
npx ampx sandbox --once
```

### Production
```bash
npx ampx deploy --branch main
```

---

## Next Steps (Phase 3)

1. **Lambda Functions**
   - Roster Architect (AI-powered scheduling)
   - RIPS Validator
   - Glosa Defender

2. **Frontend Integration**
   - Replace mock data with real API calls
   - Implement Cognito authentication
   - Add real-time subscriptions

3. **Advanced Features**
   - File uploads (S3)
   - Real-time notifications
   - Offline sync

---

## Support

**Issues:** Check CloudWatch Logs  
**Schema Changes:** Edit `amplify/data/resource.ts`  
**Redeploy:** `npx ampx sandbox --once`


---

## Lambda Functions (Custom Queries)

### 1. generateRoster
**Purpose:** AI-powered nurse shift assignment optimization

**Handler:** `amplify/functions/roster-architect/handler.ts`  
**Model:** Claude 3.5 Sonnet (AWS Bedrock)  
**Timeout:** 60 seconds

**Input:**
```typescript
{
  nurses: Array<{
    id: string;
    name: string;
    skills: string[];
    locationLat: number;
    locationLng: number;
  }>;
  unassignedShifts: Array<{
    id: string;
    patientId: string;
    scheduledTime: string;
    requiredSkills?: string[];
    locationLat: number;
    locationLng: number;
  }>;
}
```

**Output:**
```typescript
{
  assignments: Array<{
    shiftId: string;
    nurseId: string;
  }>;
}
```

**Algorithm:**
- Matches nurse skills to shift requirements
- Minimizes travel distance using GPS coordinates
- Optimizes for continuity of care
- Falls back to empty assignments on error

**Usage:**
```graphql
query GenerateRoster($nurses: AWSJSON!, $shifts: AWSJSON!) {
  generateRoster(nurses: $nurses, unassignedShifts: $shifts)
}
```

---

### 2. validateRIPS
**Purpose:** Colombian health ministry compliance validation (Resolución 2275)

**Handler:** `amplify/functions/rips-validator/handler.ts`  
**Timeout:** 30 seconds

**Input:**
```typescript
{
  billingRecord: {
    date: string;           // ISO 8601 format (YYYY-MM-DD)
    procedures: string[];   // CUPS codes (6 digits)
    diagnosis: string;      // ICD-10 code (e.g., A00.0)
    eps: string;           // Health insurance provider
    totalAmount?: number;
    patientId?: string;
    shiftId?: string;
  }
}
```

**Output:**
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
1. **Required fields:** date, procedures, diagnosis, eps
2. **Date format:** ISO 8601 (YYYY-MM-DD), not in future
3. **CUPS codes:** 6-digit format (Colombian procedure codes)
4. **ICD-10 codes:** Letter + 2 digits + optional decimal (e.g., A00, A00.0)
5. **EPS validation:** Minimum 3 characters, warns if not in common list
6. **Amount validation:** Cannot be negative, warns if zero

**Usage:**
```graphql
query ValidateRIPS($record: AWSJSON!) {
  validateRIPS(billingRecord: $record)
}
```

**Example:**
```json
{
  "billingRecord": {
    "date": "2026-01-21",
    "procedures": ["890201", "890301"],
    "diagnosis": "I10.0",
    "eps": "SURA",
    "totalAmount": 150000,
    "patientId": "patient-123",
    "shiftId": "shift-456"
  }
}
```

---

### 3. generateGlosaDefense
**Purpose:** AI-powered billing dispute defense letter generation

**Handler:** `amplify/functions/glosa-defender/handler.ts`  
**Model:** Claude 3.5 Sonnet (AWS Bedrock)  
**Timeout:** 60 seconds

**Input:**
```typescript
{
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
```

**Output:**
```typescript
{
  success: boolean;
  defenseLetter: string;      // Professional letter in Spanish
  generatedAt: string;        // ISO timestamp
  model?: string;             // AI model used
  error?: string;             // Error message if failed
}
```

**Features:**
- Generates professional defense letters in Spanish
- Cites Colombian health regulations (Resolución 3100, Ley 100)
- Provides clinical justification using patient vital signs
- References shift clinical notes
- Argues against rejection reason
- Formal letter structure (date, recipient, subject, body, closing)
- Fallback template if AI fails

**Usage:**
```graphql
query GenerateGlosaDefense(
  $record: AWSJSON!
  $history: AWSJSON!
  $notes: AWSJSON!
) {
  generateGlosaDefense(
    billingRecord: $record
    patientHistory: $history
    clinicalNotes: $notes
  )
}
```

**Example:**
```json
{
  "billingRecord": {
    "id": "bill-123",
    "date": "2026-01-15",
    "procedures": ["890201"],
    "diagnosis": "I10.0",
    "eps": "SURA",
    "totalAmount": 150000,
    "rejectionReason": "Procedimiento no autorizado previamente"
  },
  "patientHistory": {
    "name": "María González",
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
```

---

## Phase 3 Status

✅ **Completed:**
1. RIPS Validator Lambda function
2. Glosa Defender Lambda function  
3. Custom queries added to GraphQL schema
4. Backend configuration updated
5. File count: 10/10 (target achieved)

**Lambda Functions Summary:**
- `roster-architect` - AI-powered shift assignment (60s timeout)
- `rips-validator` - Colombian compliance validation (30s timeout)
- `glosa-defender` - AI billing defense letters (60s timeout)

**Next Steps:**
- Deploy Phase 3 functions to AWS
- Test Lambda functions in AWS console
- Verify AI model access (Bedrock permissions)
- Test end-to-end workflows
