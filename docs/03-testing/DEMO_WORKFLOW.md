# IPS ERP Demo Workflow Documentation

> **Purpose**: This document defines the complete demo flow and backend expectations for Kiro (Backend/CDK) and Antigravity (Frontend).
> 
> **Last Updated**: 2026-01-26 by Clawd
> **Demo URL**: https://main.d2wwgecog8smmr.amplifyapp.com

---

## Table of Contents
1. [Demo Entry Points](#1-demo-entry-points)
2. [Guided Tour Flow](#2-guided-tour-flow)
3. [Module Specifications](#3-module-specifications)
4. [Backend API Contracts](#4-backend-api-contracts)
5. [Data Models Required](#5-data-models-required)
6. [AI Features Specification](#6-ai-features-specification)

---

## 1. Demo Entry Points

### Landing Page → Demo Selection
```
User clicks "Ver Demo" or "Ver Demo en Español"
    ↓
DemoSelection.tsx shows 3 cards:
    - Portal Administrativo (Admin)
    - App de Enfermería (Nurse)
    - Portal Familiar (Family)
    ↓
enableDemoMode() called → sets sessionStorage['ips-demo-mode'] = 'true'
    ↓
User redirected to selected portal with mock data
```

### Demo Mode Detection
```typescript
// src/amplify-utils.ts
export function isDemoMode(): boolean {
    return sessionStorage.getItem('ips-demo-mode') === 'true';
}

// When isDemoMode() is true:
// - Uses generateMockClient() instead of real Amplify client
// - All data comes from src/mock-client.ts
// - No real AWS calls are made
```

---

## 2. Guided Tour Flow

### Welcome Modal (Auto-shows on first Admin demo entry)
```
┌─────────────────────────────────────────┐
│     🏥 ¡Bienvenido a IPS ERP!          │
│                                         │
│  Le guiaremos por las funciones        │
│  principales en menos de 2 minutos.    │
│                                         │
│  [🚀 Comenzar Tour Guiado]             │
│  [Explorar por mi cuenta]              │
└─────────────────────────────────────────┘
```

### Tour Steps (10 total)

| Step | Target | Action | What User Sees |
|------|--------|--------|----------------|
| 0 | `[data-tour="dashboard-stats"]` | None | Stats: 8 patients, 12 shifts, inventory alerts |
| 1 | `[data-tour="nav-roster"]` | Click → Roster | Navigate to Programación de Turnos |
| 2 | `[data-tour="ai-optimizer"]` | Click button | AI assigns 3 unassigned shifts |
| 3 | `[data-tour="nav-billing"]` | Click → Billing | Navigate to Facturación y RIPS |
| 4 | `[data-tour="ai-glosa"]` | Click button | AI generates defense letter |
| 5 | `[data-tour="nav-pending"]` | Click → Reviews | Navigate to Revisiones Pendientes |
| 6 | `[data-tour="pending-list"]` | None | Shows 2 SUBMITTED visits |
| 7 | `[data-tour="nav-inventory"]` | Click → Inventory | Shows 4 low stock, 2 out of stock |
| 8 | `[data-tour="nav-patients"]` | Click → Patients | Shows 8 patient profiles |
| 9 | `[data-tour="dashboard-stats"]` | None | Tour completion summary |

### Session Storage
```typescript
// Tour only shows once per session
sessionStorage.setItem('ips-demo-tour-completed', 'true');

// To restart tour:
sessionStorage.removeItem('ips-demo-tour-completed');
```

---

## 3. Module Specifications

### 3.1 Dashboard (Panel Principal)
**View**: `dashboard`
**Component**: `DashboardView` in AdminDashboard.tsx

**Data Requirements**:
- Patient count (active)
- Shift count (total)
- Inventory alerts (low-stock + out-of-stock count)

**API Calls**:
```typescript
client.models.Patient.list()      // → count
client.models.Shift.list()        // → count
client.models.InventoryItem.list() // → filter for alerts
```

---

### 3.2 Roster (Programación de Turnos)
**View**: `roster`
**Component**: `RosterDashboard.tsx`

**Features**:
- List all shifts with patient/nurse info
- Create new shift modal
- **AI Optimizer button** ⭐

**Data Requirements**:
- Shifts with: id, patientId, patientName, nurseId, nurseName, scheduledTime, status, location, requiredSkill
- Patients list (for dropdown)
- Nurses list (for dropdown + AI matching)

**Shift Statuses**: `PENDING` | `IN_PROGRESS` | `COMPLETED` | `CANCELLED`

**AI Feature - generateRoster**:
```typescript
// Input
{
  nurses: JSON.stringify(Nurse[]),
  unassignedShifts: JSON.stringify(Shift[]) // where nurseId === 'UNASSIGNED'
}

// Output
{
  assignments: [
    { shiftId: string, nurseId: string, nurseName: string, reason: string }
  ],
  optimizationScore: number,  // 0-1
  totalTravelTime: string,    // e.g., "2h 15min"
  generatedAt: string         // ISO timestamp
}
```

---

### 3.3 Billing (Facturación y RIPS)
**View**: `billing`
**Component**: `BillingDashboard.tsx`

**Features**:
- Billing records list with status badges
- KPI cards (total billed, pending glosas, RIPS compliance)
- **AI Glosa Defender** ⭐
- **RIPS Validator** ⭐

**Data Requirements**:
- BillingRecords with: id, patientId, invoiceNumber, totalValue, status, radicationDate

**Billing Statuses**: `PENDING` | `PAID` | `CANCELED` | `GLOSED`

**AI Feature - generateGlosaDefense**:
```typescript
// Input
{
  billingRecord: JSON.stringify({
    id, invoiceNumber, totalValue, status, eps, diagnosis, procedures
  }),
  patientHistory: JSON.stringify({
    name, age, diagnosis, vitalSigns: VitalSign[]
  }),
  clinicalNotes: JSON.stringify({ notes: string })
}

// Output
{
  success: boolean,
  defenseLetter: string,  // Full markdown letter with legal citations
  generatedAt: string,
  model: string,          // e.g., "claude-3-5-sonnet-20241022"
  confidence: number,     // 0-1
  citedRegulations: string[]  // e.g., ["Resolución 3100", "Ley 100"]
}
```

**AI Feature - validateRIPS**:
```typescript
// Input
{ billingRecordId: string }

// Output
{
  isValid: boolean,
  errors: [{ field: string, message: string }],
  warnings: string[],
  validatedAt: string,
  resolution: string  // e.g., "Resolución 2275 de 2023"
}
```

---

### 3.4 Pending Reviews (Revisiones Pendientes)
**View**: `pending-reviews`
**Component**: `PendingReviewsPanel.tsx`

**Features**:
- List SUBMITTED visits awaiting approval
- Click to view full KARDEX documentation
- Approve / Reject with reason
- Notifications to nurses

**Data Requirements**:
- Visits with status === 'SUBMITTED'
- KARDEX data embedded
- Vitals, medications, tasks

**Visit Statuses**: `DRAFT` | `SUBMITTED` | `REJECTED` | `APPROVED`

**Mutations Required**:
```typescript
approveVisit({ shiftId: string })
  → Sets status to APPROVED
  → Creates notification for nurse

rejectVisit({ shiftId: string, reason: string })
  → Sets status to REJECTED
  → Stores rejectionReason
  → Creates notification for nurse
```

---

### 3.5 Inventory (Gestión de Inventario)
**View**: `inventory`
**Component**: `InventoryDashboard.tsx`

**Features**:
- List all inventory items
- Status badges (in-stock, low-stock, out-of-stock)
- Add/Edit item modals (currently disabled - needs backend auth fix)

**Data Requirements**:
- InventoryItems with: id, name, sku, quantity, unit, reorderLevel, expiryDate, status

**Status Transformation**:
```typescript
// Backend (GraphQL): IN_STOCK, LOW_STOCK, OUT_OF_STOCK
// Frontend (Display): in-stock, low-stock, out-of-stock

// Use src/utils/inventory-transforms.ts:
graphqlToFrontend('IN_STOCK') → 'in-stock'
frontendToGraphQL('in-stock') → 'IN_STOCK'
```

---

### 3.6 Audit Log (Auditoría Clínica)
**View**: `audit`
**Component**: `AuditLogViewer.tsx`

**Data Requirements**:
- AuditLogs with: id, action, entityType, entityId, userId, details (JSON), createdAt

**Action Types**:
- `VISIT_SUBMITTED`
- `VISIT_APPROVED`
- `VISIT_REJECTED`
- `SHIFT_CREATED`
- `INVENTORY_LOW_STOCK`
- `PATIENT_UPDATED`
- `BILLING_GENERATED`
- `NURSE_ASSIGNED`

---

### 3.7 Patient Manager (Gestión de Pacientes)
**View**: `patients`
**Component**: `PatientManager.tsx`

**Features**:
- List all patients with search
- Create/Edit patient modal
- View patient details

**Data Requirements**:
- Patients with: id, name, documentId, age, address, eps, diagnosis

---

### 3.8 Staff Manager (Gestión de Personal)
**View**: `staff`
**Component**: `StaffManager.tsx`

**Features**:
- List all nurses/staff
- Create/Edit staff modal
- Skills management

**Data Requirements**:
- Nurses with: id, name, email, role, skills[], locationLat, locationLng, isActive

**Roles**: `ADMIN` | `NURSE` | `COORDINATOR`

---

## 4. Backend API Contracts

### GraphQL Queries (Lambda Handlers)

| Query | Input | Output | Lambda |
|-------|-------|--------|--------|
| `generateRoster` | nurses, unassignedShifts (JSON) | assignments JSON | Bedrock Claude |
| `validateRIPS` | billingRecordId | validation result JSON | Custom logic |
| `generateGlosaDefense` | billingRecord, patientHistory, clinicalNotes (JSON) | defense letter JSON | Bedrock Claude |
| `listApprovedVisitSummariesForFamily` | patientId | visits JSON | DynamoDB query |

### GraphQL Mutations

| Mutation | Input | Effect |
|----------|-------|--------|
| `createVisitDraftFromShift` | shiftId | Creates Visit with status=DRAFT |
| `submitVisit` | shiftId | Updates Visit status to SUBMITTED |
| `approveVisit` | shiftId | Updates Visit status to APPROVED |
| `rejectVisit` | shiftId, reason | Updates Visit status to REJECTED |

---

## 5. Data Models Required

### Core Models (DynamoDB Tables)

```typescript
// Patient
{
  id: string (PK)
  tenantId: string (GSI)
  name: string
  documentId: string
  age: number
  address: string
  eps: string
  diagnosis: string
  createdAt: string
  updatedAt: string
}

// Nurse
{
  id: string (PK)
  tenantId: string (GSI)
  name: string
  email: string
  role: 'ADMIN' | 'NURSE' | 'COORDINATOR'
  skills: string[]
  locationLat: number
  locationLng: number
  isActive: boolean
}

// Shift
{
  id: string (PK)
  tenantId: string (GSI)
  patientId: string
  patientName: string
  nurseId: string
  nurseName: string
  location: string
  requiredSkill: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  scheduledTime: string
  startedAt: string
  completedAt: string
  clinicalNote: string
  createdAt: string
  updatedAt: string
}

// Visit
{
  id: string (PK, same as shiftId for 1:1)
  tenantId: string (GSI)
  shiftId: string
  patientId: string
  nurseId: string
  status: 'DRAFT' | 'SUBMITTED' | 'REJECTED' | 'APPROVED'
  kardex: KardexData (JSON)
  vitalsRecorded: VitalsData (JSON)
  medicationsAdministered: MedicationAdminData[] (JSON)
  tasksCompleted: TaskCompletionData[] (JSON)
  submittedAt: string
  rejectionReason: string
  approvedAt: string
  reviewedBy: string
  createdAt: string
  updatedAt: string
}

// InventoryItem
{
  id: string (PK)
  tenantId: string (GSI)
  name: string
  sku: string
  quantity: number
  unit: string
  reorderLevel: number
  expiryDate: string
  status: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'
  createdAt: string
  updatedAt: string
}

// BillingRecord
{
  id: string (PK)
  tenantId: string (GSI)
  patientId: string
  shiftId: string
  invoiceNumber: string
  totalValue: number
  status: 'PENDING' | 'PAID' | 'CANCELED' | 'GLOSED'
  radicationDate: string
  createdAt: string
  updatedAt: string
}

// AuditLog
{
  id: string (PK)
  tenantId: string (GSI)
  userId: string
  action: string
  entityType: string
  entityId: string
  details: string (JSON)
  createdAt: string
  updatedAt: string
}

// Notification
{
  id: string (PK)
  userId: string (GSI)
  type: 'VISIT_APPROVED' | 'VISIT_REJECTED' | 'VISIT_PENDING_REVIEW'
  message: string
  entityId: string
  entityType: string
  read: boolean
  createdAt: string
}
```

---

## 6. AI Features Specification

### 6.1 AI Roster Optimizer

**Purpose**: Automatically assign nurses to unassigned shifts based on skills and proximity.

**Trigger**: Click "Optimizar Rutas (IA)" button in Roster module.

**Algorithm (Bedrock Claude)**:
1. Receive list of nurses with skills and location
2. Receive list of unassigned shifts with required skills
3. Match nurses to shifts where skills overlap
4. Optimize for minimal travel time
5. Return assignments with confidence score

**Expected UX**:
```
User clicks button
  ↓
Loading state (2-3 seconds)
  ↓
Alert: "🤖 IA Completada!
        ✅ 3 turnos asignados automáticamente
        📊 Score de optimización: 87%
        🚗 Tiempo total de viaje: 2h 15min"
  ↓
Shift list updates with new nurse assignments
```

### 6.2 AI Glosa Defender

**Purpose**: Generate technical defense letters for insurance claim denials (glosas).

**Trigger**: Click "Generar Respuesta AI" in Billing module.

**Algorithm (Bedrock Claude)**:
1. Receive billing record with procedure codes
2. Receive patient history with vitals and diagnosis
3. Receive clinical notes from visits
4. Generate formal defense letter citing:
   - Resolución 3100 de 2019
   - Ley 100 de 1993
   - Resolución 2275 de 2023
5. Include specific clinical evidence from patient data

**Expected UX**:
```
User clicks button
  ↓
Loading state (3-4 seconds)
  ↓
Modal opens with:
  - Full defense letter (editable textarea)
  - "Copiar al Portapapeles" button
  - Close button
```

### 6.3 RIPS Validator

**Purpose**: Validate billing files comply with Colombian RIPS regulations.

**Trigger**: Click "Validación de Archivos RIPS" in Billing module.

**Algorithm**:
1. Check required fields per Resolución 2275
2. Validate procedure codes
3. Validate patient IDs
4. Return errors and warnings

**Expected UX**:
```
User clicks button
  ↓
Loading state (1-2 seconds)
  ↓
Modal shows:
  - Validation status (✓ Valid or ✗ Invalid)
  - Files processed: AC0001.txt, AF0001.txt, etc.
  - Error log (if any)
  - Warnings (optional)
```

---

## Demo Data Summary

| Model | Count | Key Items for Demo |
|-------|-------|-------------------|
| Patients | 8 | Roberto Gómez (Hipertensión), Ana María (Diabetes) |
| Nurses | 4 | María Rodríguez, Carlos Mejía, Laura Torres, Andrés Gómez |
| Shifts | 12 | 3 COMPLETED, 1 IN_PROGRESS, 5 PENDING, 3 UNASSIGNED |
| Inventory | 15 | 4 low-stock, 2 out-of-stock (Insulina, O2 Tank) |
| Billing | 6 | 2 PAID, 2 PENDING, 2 GLOSED (for AI demo) |
| Visits | 3 | 2 SUBMITTED (for approval demo), 1 APPROVED |
| AuditLogs | 8 | Various actions for audit trail demo |
| Notifications | 3 | Pending review alerts |

---

## File References

| Purpose | File |
|---------|------|
| Mock Data | `src/mock-client.ts` |
| Types | `src/types.ts`, `src/types/workflow.ts` |
| Demo Detection | `src/amplify-utils.ts` |
| Guided Tour | `src/components/GuidedTour.tsx` |
| Admin Dashboard | `src/components/AdminDashboard.tsx` |
| Backend Tasks | `docs/KIRO_BACKEND_TASKS.md` |

---

*Document maintained by Clawd. For questions, ping the #ips-erp channel.*
