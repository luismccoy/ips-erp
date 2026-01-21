# 🎨 FRONTEND CONTEXT - What Kiro Must Understand

**Critical: Read this to understand what the frontend needs from your backend**

---

## 📋 Frontend Status: 100% Complete

The React frontend is **production-ready** and working with **mock data**. Your job is to build a backend that matches what the frontend expects.

---

## 🏗️ Frontend Architecture

### Technology Stack
```
React 18.3.1
├── TypeScript 5.6.2
├── Vite 7.3.1 (build tool)
├── Vanilla CSS + CSS Modules
├── Lucide React (icons)
└── AWS Amplify (auth client - already configured)
```

**Key Point:** Frontend is already set up to work with AWS Amplify. It just needs you to build the backend.

---

## 📁 Frontend File Structure (What Exists)

```
src/
├── App.tsx                        # Main app with routing logic
├── main.tsx                       # Entry point
│
├── components/                    # All UI components
│   ├── LandingPage.tsx           # Public landing page
│   ├── DemoSelection.tsx         # Tenant selector (multi-tenant UI)
│   │
│   ├── AdminDashboard.tsx        # Admin container with navigation
│   ├── AdminRoster.tsx           # Nurse scheduling interface
│   ├── InventoryDashboard.tsx   # Stock management
│   ├── ReportingDashboard.tsx   # Analytics & reports
│   ├── RipsValidator.tsx        # RIPS billing validation UI
│   ├── StaffManagement.tsx      # Nurse/staff directory
│   ├── EvidenceGenerator.tsx    # Document generation
│   │
│   ├── NurseDashboard.tsx       # Nurse portal (field view)
│   ├── ShiftAction.tsx          # Individual shift details
│   │
│   ├── FamilyPortal.tsx         # Family member view
│   ├── PatientDashboard.tsx     # Patient details & vitals
│   │
│   └── ui/                      # Reusable components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Badge.tsx
│       ├── LoadingSpinner.tsx
│       └── ErrorAlert.tsx
│
├── services/
│   └── integration-layer.ts     # 🔴 THIS IS WHERE YOU INTEGRATE
│
├── hooks/
│   ├── useAuth.ts               # Authentication hook (uses Amplify)
│   ├── useApiCall.ts            # API request wrapper
│   └── useForm.ts               # Form state management
│
├── types/
│   ├── types.ts                 # Data type definitions
│   └── components.ts            # Component prop types
│
├── data/
│   └── mock-data.ts             # 🔴 TEMPORARY - Replace with your backend
│
└── config/
    └── env.ts                   # Environment configuration
```

---

## 🎯 Critical Integration Point: `integration-layer.ts`

**This is THE ONLY file that will change when you build the backend.**

### Current State (Mock Data):
```typescript
// src/services/integration-layer.ts - CURRENT
import { PATIENTS, SHIFTS, INVENTORY, VITALS_HISTORY } from '../data/mock-data';

export async function getPatients(tenantId: string) {
  // Returns mock data
  return PATIENTS.filter(p => p.tenantId === tenantId);
}

export async function getShifts(tenantId: string) {
  return SHIFTS.filter(s => s.tenantId === tenantId);
}

export async function getInventory(tenantId: string) {
  return INVENTORY.filter(i => i.tenantId === tenantId);
}

// ... more mock functions
```

### Future State (Your Backend):
```typescript
// src/services/integration-layer.ts - AFTER YOU BUILD BACKEND
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export async function getPatients(tenantId: string) {
  const { data } = await client.models.Patient.list({
    filter: { tenantId: { eq: tenantId } }
  });
  return data;
}

export async function getShifts(tenantId: string) {
  const { data } = await client.models.Shift.list({
    filter: { tenantId: { eq: tenantId } }
  });
  return data;
}

// ... real GraphQL queries
```

**Your backend GraphQL schema must match what these functions expect.**

---

## 📊 Data Types the Frontend Expects

### Located in: `src/types/types.ts`

```typescript
export interface Tenant {
  id: string;
  name: string;
  nit: string;  // Colombian tax ID
}

export interface Patient {
  id: string;
  name: string;
  address: string;
  diagnosis: string;  // ICD-10 code + description
  eps: string;        // Health insurance provider
  riskLevel: 'High' | 'Medium' | 'Low';
}

export interface Shift {
  id: string;
  patientId: string;
  nurseId: string;
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:MM
  status: 'Pending' | 'InProgress' | 'Completed' | 'Cancelled';
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  reorderThreshold: number;
  unit: string;
}

export interface VitalSigns {
  patientId: string;
  date: string;
  sys: number;        // Systolic BP
  dia: number;        // Diastolic BP
  spo2: number;       // Oxygen saturation
  hr: number;         // Heart rate
  note: string;
}
```

**Your GraphQL schema MUST include these exact fields (can add more, but these are required).**

---

## 🔌 How Frontend Uses Data

### Admin Roster (`AdminRoster.tsx`)

**What it needs from backend:**
```typescript
// Get all shifts for a date range
const shifts = await getShifts(tenantId);

// Get all nurses
const nurses = await getNurses(tenantId);

// Get all patients
const patients = await getPatients(tenantId);

// Create new shift assignment
await createShift({
  patientId: 'p1',
  nurseId: 'n1',
  date: '2026-01-21',
  startTime: '09:00'
});

// Update shift status
await updateShift(shiftId, { status: 'Completed' });
```

**Your backend needs:**
- `listShifts` query (filtered by tenantId)
- `listNurses` query
- `listPatients` query
- `createShift` mutation
- `updateShift` mutation

---

### Inventory Dashboard (`InventoryDashboard.tsx`)

**What it needs:**
```typescript
// Get all inventory items
const items = await getInventory(tenantId);

// Update quantity
await updateInventoryItem(itemId, { quantity: newQuantity });

// Add new item
await createInventoryItem({
  name: 'Jeringa 5cc',
  quantity: 100,
  reorderThreshold: 20,
  unit: 'Unidad'
});
```

**Your backend needs:**
- `listInventoryItems` query
- `updateInventoryItem` mutation
- `createInventoryItem` mutation

---

### Nurse Dashboard (`NurseDashboard.tsx`)

**What it needs:**
```typescript
// Get today's shifts for logged-in nurse
const myShifts = await getShiftsByNurse(nurseId, today);

// Get patient details
const patient = await getPatient(patientId);

// Record vital signs
await createVitalSigns({
  patientId: 'p1',
  shiftId: 's1',
  sys: 145,
  dia: 90,
  spo2: 95,
  hr: 78,
  note: 'Paciente estable'
});

// Update shift status
await updateShift(shiftId, { status: 'Completed' });
```

**Your backend needs:**
- `listShifts` query with nurse filter
- `getPatient` query
- `createVitalSigns` mutation
- `updateShift` mutation

---

### RIPS Validator (`RipsValidator.tsx`)

**What it needs:**
```typescript
// Validate billing record
const result = await validateRIPS({
  billingRecordId: 'b1',
  procedures: [{ code: '890201', description: 'Signos vitales' }],
  diagnosis: 'I10'
});

// Generate glosa defense if rejected
const defense = await generateGlosaDefense({
  billingRecordId: 'b1',
  rejectionReason: 'Código CUPS no válido'
});
```

**Your backend needs:**
- Lambda function: `billing-validator`
- Input: Billing record data
- Output: Validation results + AI-generated defense

---

## 🔐 Authentication Flow (Frontend Perspective)

### How Frontend Handles Auth:

```typescript
// src/hooks/useAuth.ts
import { signIn, signOut, getCurrentUser } from 'aws-amplify/auth';

export function useAuth() {
  async function login(email: string, password: string) {
    // Calls Cognito
    const { isSignedIn } = await signIn({ username: email, password });
    
    // Gets user details including custom:tenantId
    const user = await getCurrentUser();
    
    // Stores tenantId in app state
    return user;
  }
  
  // ... logout, check session, etc.
}
```

**What your Cognito setup must provide:**
1. User can sign in with email/password
2. JWT token includes `custom:tenantId` claim
3. JWT includes user groups (Admin, Nurse, Family)
4. Frontend can call `getCurrentUser()` to get this info

**Frontend expects this shape:**
```typescript
{
  username: "maria@vida.com",
  userId: "uuid-123",
  signInDetails: {
    loginId: "maria@vida.com"
  },
  // Custom attributes
  attributes: {
    "custom:tenantId": "ips-vida",
    "email": "maria@vida.com"
  }
}
```

---

## 🎨 UI Components Using Backend Data

### 1. Admin Roster Calendar View
**Component:** `AdminRoster.tsx`

**What it displays:**
- Weekly calendar grid
- Nurse assignments per day
- Color-coded by status (Pending/Completed)
- Click to edit assignments

**Data it needs:**
```typescript
{
  shifts: Array<{
    id: string;
    nurseId: string;
    nurseName: string;  // ← Needs nurse data joined
    patientId: string;
    patientName: string;  // ← Needs patient data joined
    patientAddress: string;
    date: string;
    startTime: string;
    status: string;
  }>
}
```

**GraphQL query you need to support:**
```graphql
query ListShiftsWithDetails($tenantId: String!) {
  listShifts(filter: {tenantId: {eq: $tenantId}}) {
    items {
      id
      date
      startTime
      status
      nurse {
        id
        name
      }
      patient {
        id
        name
        address
      }
    }
  }
}
```

**Key: Frontend expects relationships (nurse, patient) to be loaded.**

---

### 2. Inventory Dashboard
**Component:** `InventoryDashboard.tsx`

**What it displays:**
- List of all items
- Current quantity vs. threshold
- Red badge if quantity < threshold
- Form to update quantity

**Data it needs:**
```typescript
{
  inventory: Array<{
    id: string;
    name: string;
    quantity: number;
    reorderThreshold: number;
    unit: string;
    category?: string;
    lastRestocked?: string;
  }>
}
```

**Simple - no relationships needed.**

---

### 3. Nurse Shift View
**Component:** `NurseDashboard.tsx`

**What it displays:**
- Today's shifts for logged-in nurse
- Patient details per shift
- Button to record vitals
- Navigation to next patient

**Data it needs:**
```typescript
{
  shifts: Array<{
    id: string;
    patient: {
      id: string;
      name: string;
      address: string;
      diagnosis: string;
      riskLevel: string;
    };
    startTime: string;
    status: string;
  }>
}
```

**Must filter by:** 
- `nurseId` (from authenticated user)
- `date` (today)

---

### 4. Family Portal
**Component:** `FamilyPortal.tsx` + `PatientDashboard.tsx`

**What it displays:**
- Recent nurse visits
- Vital signs trends (chart)
- Nurse notes from shifts
- Medications administered

**Data it needs:**
```typescript
{
  patient: {
    id: string;
    name: string;
    diagnosis: string;
  },
  recentShifts: Array<{
    date: string;
    nurse: { name: string };
    status: string;
    notes?: string;
  }>,
  vitalSigns: Array<{
    date: string;
    sys: number;
    dia: number;
    spo2: number;
    hr: number;
    note: string;
  }>
}
```

**Authorization:** Family users should only see ONE patient (their family member).

---

## 🔄 Real-time Updates (Subscriptions)

### Frontend Expects Subscriptions For:

**1. Shift Status Updates**
```typescript
// When a nurse marks shift as completed
// Admin dashboard should update in real-time

subscription OnShiftUpdated($tenantId: String!) {
  onUpdateShift(filter: {tenantId: {eq: $tenantId}}) {
    id
    status
    completedAt
  }
}
```

**2. Inventory Alerts**
```typescript
// When quantity falls below threshold
// Admin should get notification

subscription OnInventoryLowStock($tenantId: String!) {
  onUpdateInventoryItem(
    filter: {
      tenantId: {eq: $tenantId}
      quantity: {lt: reorderThreshold}  // Logic needs work
    }
  ) {
    id
    name
    quantity
  }
}
```

**3. New Vital Signs**
```typescript
// When nurse records vitals
// Family portal updates chart in real-time

subscription OnVitalSignsCreated($patientId: String!) {
  onCreateVitalSigns(filter: {patientId: {eq: $patientId}}) {
    date
    sys
    dia
    spo2
    hr
  }
}
```

---

## 🎯 Backend Requirements Summary

### What Your GraphQL Schema Must Support:

#### Queries (Read Operations)
- [x] `listTenants` - Get all IPS organizations
- [x] `getPatient(id)` - Get single patient
- [x] `listPatients(filter: {tenantId})` - Get all patients for tenant
- [x] `getNurse(id)` - Get single nurse
- [x] `listNurses(filter: {tenantId})` - Get all nurses
- [x] `getShift(id)` - Get single shift
- [x] `listShifts(filter: {tenantId, nurseId?, date?})` - Get shifts with filters
- [x] `listInventoryItems(filter: {tenantId})` - Get inventory
- [x] `listVitalSigns(filter: {patientId})` - Get vital signs history
- [x] `listBillingRecords(filter: {tenantId})` - Get billing data

#### Mutations (Write Operations)
- [x] `createPatient(input)` - Add new patient
- [x] `updatePatient(id, input)` - Update patient details
- [x] `createNurse(input)` - Add new nurse
- [x] `updateNurse(id, input)` - Update nurse details
- [x] `createShift(input)` - Assign nurse to patient
- [x] `updateShift(id, input)` - Update shift (especially status)
- [x] `deleteShift(id)` - Remove assignment
- [x] `createInventoryItem(input)` - Add new supply
- [x] `updateInventoryItem(id, input)` - Update quantity
- [x] `createVitalSigns(input)` - Record vitals during shift
- [x] `createBillingRecord(input)` - Create billing entry

#### Subscriptions (Real-time)
- [x] `onUpdateShift(filter: {tenantId})` - Shift status changes
- [x] `onCreateVitalSigns(filter: {patientId})` - New vitals recorded
- [x] `onUpdateInventoryItem(filter: {tenantId})` - Stock changes

#### Custom Operations (Lambda Functions)
- [x] `invokeRosterArchitect(input)` - Generate optimal schedule
- [x] `validateRIPS(input)` - Validate billing data
- [x] `generateGlosaDefense(input)` - AI defense for rejections
- [x] `generateRIPSFile(input)` - Create RIPS XML/CSV

---

## 🔗 Relationships Frontend Expects

### Shift ↔ Nurse ↔ Patient

When frontend queries shifts, it expects to access related data:

```typescript
// Frontend code
shifts.map(shift => (
  <div>
    <p>Nurse: {shift.nurse.name}</p>
    <p>Patient: {shift.patient.name} - {shift.patient.address}</p>
  </div>
))
```

**Your GraphQL schema needs:**
```graphql
type Shift {
  id: ID!
  nurseId: ID!
  nurse: Nurse @belongsTo  # ← Relationship
  patientId: ID!
  patient: Patient @belongsTo  # ← Relationship
  date: AWSDate!
  status: ShiftStatus!
}
```

### Patient ↔ VitalSigns

```typescript
// Frontend code
const vitals = await getVitalSignsByPatient(patientId);
```

**Your GraphQL schema needs:**
```graphql
type Patient {
  id: ID!
  name: String!
  vitalSigns: [VitalSigns] @hasMany  # ← One-to-many
}

type VitalSigns {
  id: ID!
  patientId: ID!
  patient: Patient @belongsTo
  sys: Int!
  dia: Int!
}
```

---

## 🚨 Common Integration Mistakes to Avoid

### ❌ Mistake 1: Field Name Mismatch
```typescript
// Frontend expects:
patient.riskLevel  // camelCase

// Backend returns:
patient.risk_level  // snake_case

// ❌ This breaks the UI
```

**Solution:** Use exact same field names as `src/types/types.ts`

---

### ❌ Mistake 2: Missing Tenant Filter
```typescript
// Frontend sends:
getPatients(tenantId: "ips-vida")

// Backend returns ALL patients (no filter)
// ❌ Data leak! User sees other tenants' data
```

**Solution:** Every query must filter by tenantId automatically (use authorization rules)

---

### ❌ Mistake 3: No Relationships
```graphql
# Bad: Frontend has to make 3 queries
query GetShift { shift { id nurseId patientId } }
query GetNurse { nurse(id: $nurseId) { name } }
query GetPatient { patient(id: $patientId) { name } }

# Good: Frontend gets everything in 1 query
query GetShift {
  shift {
    id
    nurse { id name }
    patient { id name address }
  }
}
```

**Solution:** Define @belongsTo/@hasMany relationships

---

### ❌ Mistake 4: Date Format Mismatch
```typescript
// Frontend expects:
shift.date = "2026-01-21"  // YYYY-MM-DD
shift.startTime = "09:00"   // HH:MM

// Backend returns:
shift.date = "2026-01-21T00:00:00Z"  // ISO with time
shift.startTime = "09:00:00"  // HH:MM:SS

// ⚠️ Might work but inconsistent
```

**Solution:** Use `AWSDate` type (YYYY-MM-DD) and `AWSTime` type (HH:MM:SS)

---

## ✅ Testing Your Backend with Frontend

### Step 1: Keep Mock Data Working
```typescript
// integration-layer.ts
export const USE_MOCK_DATA = import.meta.env.VITE_ENABLE_MOCK_DATA;

export async function getPatients(tenantId: string) {
  if (USE_MOCK_DATA) {
    return MOCK_PATIENTS.filter(p => p.tenantId === tenantId);
  }
  
  // Real backend call
  const { data } = await client.models.Patient.list({
    filter: { tenantId: { eq: tenantId } }
  });
  return data;
}
```

**Frontend can toggle between mock and real backend.**

### Step 2: Test One Endpoint at a Time
1. Implement `listPatients` in backend
2. Update `getPatients()` in integration-layer.ts
3. Test in Admin Dashboard
4. Verify data displays correctly
5. Move to next endpoint

### Step 3: Verify Authorization
1. Create two test users (different tenants)
2. Sign in as User A, check they only see their data
3. Sign in as User B, check they only see their data
4. Verify User A cannot access User B's data

---

## 📝 Action Items for Kiro

When building your GraphQL schema:

1. **Reference `src/types/types.ts`** - Match field names exactly
2. **Add relationships** - @belongsTo, @hasMany for joined queries
3. **Include tenantId** on every model (except Tenant itself)
4. **Use proper authorization** - Filter by custom:tenantId claim
5. **Support filters** - tenantId, nurseId, patientId, date ranges
6. **Test with frontend types** - Ensure compatibility

**Before saying "Phase 2 complete", verify:**
- [ ] All TypeScript types from frontend have matching GraphQL types
- [ ] Relationships work (can query shift.nurse.name)
- [ ] Authorization filters by tenantId automatically
- [ ] Date/time formats match frontend expectations
- [ ] Can query with filters (by nurse, by date, etc.)

---

## 🎯 Success Criteria

**Your backend is ready for frontend integration when:**

1. ✅ All queries in `integration-layer.ts` can be replaced with real GraphQL calls
2. ✅ TypeScript types match between frontend and backend
3. ✅ Relationships load data in single queries (no N+1 problems)
4. ✅ Authorization prevents cross-tenant access
5. ✅ Subscriptions work for real-time updates
6. ✅ Lambda functions return expected shapes
7. ✅ Frontend team can replace `USE_MOCK_DATA = false` and app works

**When all ✅, Phase 2 is truly complete.**

---

**Remember: Your backend exists to serve this frontend. Build what it needs, not what's theoretically perfect.**
---
inclusion: always
---
<!------------------------------------------------------------------------------------
   Add rules to this file or a short description and have Kiro refine them for you.
   
   Learn about inclusion modes: https://kiro.dev/docs/steering/#inclusion-modes
-------------------------------------------------------------------------------------> 