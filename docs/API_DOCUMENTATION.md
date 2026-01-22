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


---

## Phase 4: Frontend Integration

**Status:** ✅ Complete  
**Last Updated:** 2026-01-21

### Overview

Phase 4 connects the React frontend to the real AWS Amplify backend, enabling seamless data flow between the UI and GraphQL API. The integration supports both **mock mode** (for development) and **real backend mode** (for production).

---

### Environment Configuration

#### Backend Toggle
Control whether the app uses real AWS backend or mock data:

```bash
# .env.development or .env.production
VITE_USE_REAL_BACKEND=false  # Mock mode (default)
VITE_USE_REAL_BACKEND=true   # Real AWS backend
```

**Mock Mode (VITE_USE_REAL_BACKEND=false):**
- Uses `src/mock-client.ts` for data
- No AWS credentials required
- Instant responses for development
- Demo mode with sample data

**Real Backend Mode (VITE_USE_REAL_BACKEND=true):**
- Connects to AWS AppSync GraphQL endpoint
- Requires Cognito authentication
- Real-time data from DynamoDB
- Multi-tenant data isolation

---

### Core Integration Files

#### 1. `src/amplify-utils.ts`
**Purpose:** Central Amplify client configuration

**Features:**
- Environment-based backend selection
- Typed GraphQL client with Schema
- Automatic Amplify configuration
- Helper function to check backend mode

**Usage:**
```typescript
import { client, isUsingRealBackend } from './amplify-utils';

// Check which backend is active
if (isUsingRealBackend()) {
  console.log('Using real AWS backend');
}

// Use typed client for queries
const patients = await client.models.Patient.list();
```

---

#### 2. `src/hooks/useAuth.ts`
**Purpose:** Authentication state management

**Features:**
- Real Cognito authentication support
- Mock authentication for development
- Automatic user attribute extraction
- Role and tenant context management

**Real Backend Flow:**
```typescript
const { user, role, tenant, login, logout } = useAuth();

// Login with Cognito
await login({ username: 'admin@ips.com', password: 'password' });

// User attributes from JWT
// - custom:role → 'admin' | 'nurse' | 'family'
// - custom:tenantId → 'tenant-bogota-01'
```

**Mock Mode Flow:**
```typescript
// Automatically uses demo state
setDemoState('admin', TENANTS[0]);
```

---

#### 3. `src/hooks/useApiCall.ts`
**Purpose:** Generic API call wrapper with loading/error states

**Features:**
- Works with GraphQL queries and mutations
- Works with custom Lambda functions
- Automatic loading state management
- Error handling and retry support

**Usage Examples:**

**GraphQL Query:**
```typescript
import { useApiCall, client } from '../hooks/useApiCall';

const { data, loading, error, execute } = useApiCall();

// List all patients for current tenant
await execute(client.models.Patient.list());
```

**GraphQL Mutation:**
```typescript
// Create new patient
await execute(
  client.models.Patient.create({
    name: 'Juan Pérez',
    documentId: '12345678',
    tenantId: 'tenant-bogota-01',
    age: 65,
    diagnosis: 'Hipertensión'
  })
);
```

**Custom Lambda Query:**
```typescript
// Call roster-architect Lambda
await execute(
  client.queries.generateRoster({
    nurses: [...],
    unassignedShifts: [...]
  })
);
```

---

### GraphQL Operations

#### Queries (Read Data)

**List all records:**
```typescript
// List patients
const patients = await client.models.Patient.list();

// List with filters
const activeShifts = await client.models.Shift.list({
  filter: { status: { eq: 'IN_PROGRESS' } }
});

// List with relationships
const shifts = await client.models.Shift.list();
// Access: shifts.data[0].nurse.name
```

**Get single record:**
```typescript
const patient = await client.models.Patient.get({ id: 'patient-123' });
```

---

#### Mutations (Write Data)

**Create:**
```typescript
const newNurse = await client.models.Nurse.create({
  name: 'María López',
  email: 'maria@ips.com',
  tenantId: 'tenant-bogota-01',
  role: 'NURSE',
  skills: ['Enfermería General', 'Toma de Signos Vitales']
});
```

**Update:**
```typescript
await client.models.Shift.update({
  id: 'shift-123',
  status: 'COMPLETED',
  completedAt: new Date().toISOString(),
  clinicalNote: 'Paciente estable, signos vitales normales'
});
```

**Delete:**
```typescript
await client.models.InventoryItem.delete({ id: 'item-123' });
```

---

#### Subscriptions (Real-Time Updates)

**Listen for new records:**
```typescript
const subscription = client.models.Shift.onCreate().subscribe({
  next: (shift) => {
    console.log('New shift created:', shift);
    // Update UI automatically
  },
  error: (error) => console.error('Subscription error:', error)
});

// Cleanup
subscription.unsubscribe();
```

**Listen for updates:**
```typescript
client.models.Shift.onUpdate().subscribe({
  next: (shift) => {
    console.log('Shift updated:', shift);
  }
});
```

---

### Component Integration Examples

#### Admin Roster Component
**File:** `src/components/AdminRoster.tsx`

**Integration:**
```typescript
import { useApiCall, client } from '../hooks/useApiCall';

function AdminRoster() {
  const { data, loading, execute } = useApiCall();

  const generateRoster = async () => {
    // Fetch nurses and unassigned shifts
    const nurses = await client.models.Nurse.list();
    const shifts = await client.models.Shift.list({
      filter: { status: { eq: 'PENDING' } }
    });

    // Call AI roster generation
    const result = await execute(
      client.queries.generateRoster({
        nurses: nurses.data,
        unassignedShifts: shifts.data
      })
    );

    // Apply assignments
    for (const assignment of result.assignments) {
      await client.models.Shift.update({
        id: assignment.shiftId,
        nurseId: assignment.nurseId,
        status: 'PENDING'
      });
    }
  };

  return (
    <button onClick={generateRoster} disabled={loading}>
      {loading ? 'Generating...' : 'Generate Roster'}
    </button>
  );
}
```

---

#### RIPS Validator Component
**File:** `src/components/RipsValidator.tsx`

**Integration:**
```typescript
import { useApiCall, client } from '../hooks/useApiCall';

function RipsValidator() {
  const { data, loading, execute } = useApiCall();

  const validateBilling = async (billingRecord) => {
    const result = await execute(
      client.queries.validateRIPS({
        billingRecord: JSON.stringify(billingRecord)
      })
    );

    if (result.isValid) {
      // Save to DynamoDB
      await client.models.BillingRecord.create({
        ...billingRecord,
        ripsGenerated: true,
        status: 'PENDING'
      });
    } else {
      // Show validation errors
      console.error('Validation errors:', result.errors);
    }
  };

  return (/* UI */);
}
```

---

#### Inventory Dashboard Component
**File:** `src/components/InventoryDashboard.tsx`

**Integration:**
```typescript
import { useApiCall, client } from '../hooks/useApiCall';
import { useEffect, useState } from 'react';

function InventoryDashboard() {
  const [items, setItems] = useState([]);
  const { loading, execute } = useApiCall();

  useEffect(() => {
    loadInventory();

    // Real-time updates
    const subscription = client.models.InventoryItem.onUpdate().subscribe({
      next: (item) => {
        setItems(prev => 
          prev.map(i => i.id === item.id ? item : i)
        );
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadInventory = async () => {
    const result = await execute(client.models.InventoryItem.list());
    setItems(result.data);
  };

  const updateStock = async (itemId, newQuantity) => {
    await client.models.InventoryItem.update({
      id: itemId,
      quantity: newQuantity,
      status: newQuantity < 10 ? 'LOW_STOCK' : 'IN_STOCK'
    });
  };

  return (/* UI */);
}
```

---

### Multi-Tenant Data Isolation

**Automatic Filtering:**
All queries automatically filter by `custom:tenantId` from the JWT token. No manual filtering required.

```typescript
// This query only returns patients for the current user's tenant
const patients = await client.models.Patient.list();

// AppSync automatically adds:
// filter: { tenantId: { eq: 'tenant-from-jwt' } }
```

**Authorization Rules:**
- `Tenant` model: Authenticated users only
- All other models: Owner-based via `custom:tenantId`
- Users can only access data from their own IPS organization

---

### Testing Frontend Integration

#### 1. Mock Mode Testing
```bash
# Set environment variable
echo "VITE_USE_REAL_BACKEND=false" > .env.development

# Run dev server
npm run dev

# Test with mock data
# - No AWS credentials needed
# - Instant responses
# - Demo mode works
```

#### 2. Real Backend Testing
```bash
# Set environment variable
echo "VITE_USE_REAL_BACKEND=true" > .env.development

# Ensure backend is deployed
npx ampx sandbox --once

# Run dev server
npm run dev

# Test with real AWS
# - Requires Cognito login
# - Real data from DynamoDB
# - Lambda functions work
```

---

### Troubleshooting

#### Issue: "Amplify is not configured"
**Solution:** Ensure `amplify_outputs.json` exists and `VITE_USE_REAL_BACKEND=true`

#### Issue: "Unauthorized" errors
**Solution:** Check JWT token has `custom:tenantId` claim

#### Issue: Lambda timeout
**Solution:** Check CloudWatch Logs for function errors

#### Issue: No data returned
**Solution:** Verify tenant isolation - user's tenantId must match data tenantId

---

### Next Steps (Phase 5)

1. **Production Deployment**
   - Deploy to AWS Amplify Hosting
   - Configure custom domain
   - Set up CI/CD pipeline

2. **Advanced Features**
   - File uploads (S3 integration)
   - Push notifications
   - Offline sync with DataStore

3. **Performance Optimization**
   - Implement pagination
   - Add caching layer
   - Optimize GraphQL queries

---

### Summary

✅ **Phase 4 Complete:**
- Frontend connected to real AWS backend
- Environment-based backend selection
- Real Cognito authentication support
- GraphQL queries, mutations, and subscriptions
- Lambda function integration
- Multi-tenant data isolation
- Real-time updates via AppSync

**Files Modified:**
- `src/amplify-utils.ts` - Amplify client configuration
- `src/hooks/useAuth.ts` - Authentication with Cognito
- `src/hooks/useApiCall.ts` - GraphQL wrapper
- `.env.example` - Environment variable template
- `.env.development` - Development configuration
- `docs/API_DOCUMENTATION.md` - This documentation

**Backend Status:**
- 9 TypeScript files in `amplify/`
- 3 Lambda functions deployed
- GraphQL endpoint active
- Multi-tenant authorization configured
