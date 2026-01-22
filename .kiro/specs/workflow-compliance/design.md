# IPS ERP Workflow Compliance - Phase 2: Domain & State Modeling

## Document Purpose
This document defines the **domain model, state machines, authorization rules, and data visibility constraints** required to implement the workflow described in "KIRO MASTER WORKFLOW PROMPT — Home Care ERP". This is a **design phase only** - no code changes are made yet.

---

## 1. DOMAIN MODEL

### 1.1 New Entities Required

#### Visit (Core Workflow Entity)
The Visit entity represents a completed nurse visit that requires admin approval before becoming visible to family members.

**1:1 Relationship Enforcement:** visitId = shiftId (primary key enforces strict 1:1 relationship with Shift)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| visitId | ID | Yes | Primary key (MUST equal shiftId) |
| tenantId | ID | Yes | Multi-tenant isolation |
| shiftId | ID | Yes | Link to scheduled shift (MUST equal visitId) |
| patientId | ID | Yes | Patient visited |
| nurseId | ID | Yes | Nurse who performed visit |
| status | VisitStatus | Yes | DRAFT, SUBMITTED, REJECTED, APPROVED |
| kardex | KARDEX | Yes | Clinical nursing record (Colombian standard) |
| vitalsRecorded | VitalSigns[] | No | Vitals taken during visit |
| medicationsAdministered | MedicationAdmin[] | No | Medications given |
| tasksCompleted | TaskCompletion[] | No | Tasks performed |
| submittedAt | DateTime | No | When nurse submitted |
| reviewedAt | DateTime | No | When admin reviewed |
| reviewedBy | ID | No | Admin who reviewed |
| rejectionReason | String | No | Why rejected (if REJECTED) |
| approvedAt | DateTime | No | When approved |
| approvedBy | ID | No | Admin who approved |
| createdAt | DateTime | Yes | Auto-generated |
| updatedAt | DateTime | Yes | Auto-generated |

#### KARDEX (Nested Type)
Clinical nursing record that consolidates patient evolution, nursing observations, administered care, medications, vitals, and incidents. This is the nurse's primary clinical documentation artifact for each visit.

**Cultural Context:** In Colombian home care, KARDEX is the standard clinical documentation format used by nurses.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| generalObservations | String | Yes | Overall patient condition and evolution |
| skinCondition | String | No | Skin integrity assessment |
| mobilityStatus | String | No | Patient mobility level |
| nutritionIntake | String | No | Food/fluid intake |
| painLevel | Integer | No | 0-10 scale |
| mentalStatus | String | No | Cognitive/emotional state |
| environmentalSafety | String | No | Home safety assessment |
| caregiverSupport | String | No | Family/caregiver notes |
| internalNotes | String | No | Nurse-only notes (hidden from family) |

**UI Labels:**
- Nurse/Admin UI: "KARDEX"
- Family UI: "Resumen de atención" / "Visit Summary" (never show raw KARDEX)


#### MedicationAdmin (Nested Type)
Snapshot of medications administered during visit (no foreign key references).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| medicationName | String | Yes | Name of medication |
| intendedDosage | String | Yes | Prescribed dosage |
| dosageGiven | String | Yes | Actual dosage administered |
| time | DateTime | Yes | When administered |
| route | String | No | Oral, IV, topical, etc. |
| notes | String | No | Any observations |

**Note:** This is a snapshot captured at visit submission time. It does NOT reference Patient.medications[].id because that array may change over time. We store the medication state as it existed during the visit.

#### TaskCompletion (Nested Type)
Snapshot of tasks completed during visit (no foreign key references).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| taskDescription | String | Yes | What task was performed |
| completedAt | DateTime | Yes | When completed |
| notes | String | No | Any observations |

**Note:** This is a snapshot captured at visit submission time. It does NOT reference Patient.tasks[].id because that array may change over time. We store the task state as it existed during the visit.

#### VisitSummary (Computed Type)
High-level summary for family members (generated from Visit).

| Field | Type | Description |
|-------|------|-------------|
| visitDate | Date | Date of visit |
| nurseName | String | Who visited |
| duration | Integer | Minutes spent |
| overallStatus | String | "Stable", "Improved", "Declined" |
| keyActivities | String[] | ["Vitals checked", "Medications given"] |
| nextVisitDate | Date | Scheduled next visit |

**Note:** VisitSummary is NOT stored - it is computed from Visit when family requests data.

#### AuditLog (Immutable Event Log)
Every significant action generates an audit log entry.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| logId | ID | Yes | Primary key |
| tenantId | ID | Yes | Multi-tenant isolation |
| userId | ID | Yes | Who performed action |
| userRole | String | Yes | Admin, Nurse, Family, SuperAdmin |
| action | AuditAction | Yes | VISIT_SUBMITTED, VISIT_APPROVED, etc. |
| entityType | String | Yes | Visit, Patient, Shift, etc. |
| entityId | ID | Yes | Which entity was affected |
| timestamp | DateTime | Yes | When action occurred |
| details | JSON | No | Additional context |
| ipAddress | String | No | User IP address |

**Immutability:** AuditLog entries can NEVER be updated or deleted. Append-only.


#### Notification (User Notifications)
Event-driven notifications for workflow state changes.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| notificationId | ID | Yes | Primary key |
| tenantId | ID | Yes | Multi-tenant isolation |
| userId | ID | Yes | Recipient |
| type | NotificationType | Yes | VISIT_APPROVED, VISIT_REJECTED, etc. |
| message | String | Yes | Human-readable message |
| entityType | String | Yes | Visit, Shift, etc. |
| entityId | ID | Yes | Related entity |
| read | Boolean | Yes | Has user seen it? |
| createdAt | DateTime | Yes | When notification created |

### 1.2 Enums Required

#### VisitStatus
```
DRAFT          - Nurse is editing (not submitted)
SUBMITTED      - Pending admin review
REJECTED       - Admin rejected, returned to nurse
APPROVED       - Admin approved, immutable & visible to family
```

#### AuditAction
```
VISIT_CREATED
VISIT_SUBMITTED
VISIT_APPROVED
VISIT_REJECTED
VISIT_EDITED
PATIENT_VIEWED_BY_FAMILY
USER_LOGIN
USER_LOGOUT
DATA_EXPORT
```

#### NotificationType
```
VISIT_APPROVED
VISIT_REJECTED
VISIT_PENDING_REVIEW
VISIT_AVAILABLE_FOR_FAMILY
SHIFT_ASSIGNED
SHIFT_CANCELLED
```

### 1.3 Modifications to Existing Models

#### Shift Model (Add Fields)
| Field | Type | Description |
|-------|------|-------------|
| visitId | ID | Link to Visit (null until visit created) |

**Note:** Shift ALREADY has `nurseId` in deployed schema (VERIFIED in amplify/data/resource.ts). Shift.patientId: VERIFY in amplify/data/resource.ts; if missing, add as required in Phase 3.

**Rationale:** Shift represents scheduling. Visit represents documentation. They are separate concerns. The Visit references `shiftId`, and at Visit creation time, `Visit.patientId` and `Visit.nurseId` MUST match the values from the referenced Shift.

#### Patient Model (Add Fields)
| Field | Type | Description |
|-------|------|-------------|
| familyMembers | ID[] | Array of Cognito user IDs with read access |

**Rationale:** Family members need explicit association with patients.

#### Nurse Model (Add Fields)
| Field | Type | Description |
|-------|------|-------------|
| isActive | Boolean | Can nurse be assigned shifts? |

**Rationale:** Deactivated nurses should not receive new assignments.


---

## 2. VISIT STATE MACHINE

### 2.1 States

| State | Description | Who Can Transition From Here |
|-------|-------------|------------------------------|
| DRAFT | Nurse is editing visit documentation | Nurse (assigned) |
| SUBMITTED | Pending admin review | Admin only |
| REJECTED | Admin rejected, returned to nurse | Nurse (assigned) |
| APPROVED | Final, immutable, visible to family | Nobody (terminal state) |

### 2.2 State Transitions

| From State | To State | Trigger | Actor | Validation |
|------------|----------|---------|-------|------------|
| (none) | DRAFT | Nurse completes shift | Nurse | Shift status = COMPLETED, Nurse is assigned |
| DRAFT | SUBMITTED | Nurse submits visit | Nurse | All required KARDEX fields filled, Nurse is assigned |
| SUBMITTED | APPROVED | Admin approves | Admin | Admin role verified, Visit is SUBMITTED |
| SUBMITTED | REJECTED | Admin rejects | Admin | Admin role verified, Rejection reason provided |
| REJECTED | DRAFT | Nurse edits | Nurse | Nurse is assigned, Visit is REJECTED |
| REJECTED | SUBMITTED | Nurse resubmits | Nurse | All required KARDEX fields filled, Nurse is assigned |

### 2.3 State Transition Rules

#### DRAFT State
- **Who can edit:** Assigned nurse only
- **What can be edited:** All KARDEX fields, vitals, medications, tasks
- **Visibility:** Nurse only (not visible to admin or family)
- **Duration:** No time limit

#### SUBMITTED State
- **Who can edit:** Nobody (read-only)
- **What can be done:** Admin can approve or reject
- **Visibility:** Admin and assigned nurse (not visible to family)
- **Duration:** No time limit (but should be reviewed within 24-48 hours)

#### REJECTED State
- **Who can edit:** Assigned nurse only
- **What can be edited:** All KARDEX fields, vitals, medications, tasks
- **Visibility:** Admin and assigned nurse (not visible to family)
- **Duration:** No time limit
- **Special:** Rejection reason is displayed to nurse

#### APPROVED State
- **Who can edit:** Nobody (immutable forever)
- **What can be done:** Read-only access
- **Visibility:** Admin, assigned nurse, and family members
- **Duration:** Permanent
- **Special:** Becomes eligible for billing, visible to family

### 2.4 Immutability Enforcement

Once a visit reaches APPROVED state:
1. All fields become read-only (enforced server-side)
2. No updates allowed via GraphQL mutations
3. No updates allowed via Lambda functions
4. DynamoDB item is locked (conditional writes fail)
5. Audit log records any attempted modifications


---

## 3. AUTHORIZATION MATRIX

### 3.1 Role Definitions

| Role | Cognito Group | Custom Attribute | Scope |
|------|---------------|------------------|-------|
| Super Admin | SuperAdmin | (none) | Global (all tenants) |
| Tenant Admin | Admin | custom:tenantId | Single tenant |
| Nurse | Nurse | custom:tenantId | Single tenant |
| Family | Family | custom:tenantId | Single tenant |

### 3.2 Visit Entity Authorization

| Action | Super Admin | Tenant Admin | Nurse (Assigned) | Nurse (Other) | Family |
|--------|-------------|--------------|------------------|---------------|--------|
| Create Visit | ❌ | ❌ | ✅ (DRAFT) | ❌ | ❌ |
| Read DRAFT | ✅ | ❌ | ✅ | ❌ | ❌ |
| Read SUBMITTED | ✅ | ✅ | ✅ | ❌ | ❌ |
| Read REJECTED | ✅ | ✅ | ✅ | ❌ | ❌ |
| Read APPROVED | ✅ | ✅ | ✅ | ❌ | ✅ (summary only) |
| Update DRAFT | ❌ | ❌ | ✅ | ❌ | ❌ |
| Update REJECTED | ❌ | ❌ | ✅ | ❌ | ❌ |
| Submit (DRAFT→SUBMITTED) | ❌ | ❌ | ✅ | ❌ | ❌ |
| Approve (SUBMITTED→APPROVED) | ❌ | ✅ | ❌ | ❌ | ❌ |
| Reject (SUBMITTED→REJECTED) | ❌ | ✅ | ❌ | ❌ | ❌ |
| Delete Visit | ❌ | ❌ | ❌ | ❌ | ❌ |

**Key Rules:**
- Only assigned nurse can create/edit visits
- Only admin can approve/reject
- Family can only read approved visits (summary view)
- Nobody can delete visits (audit trail preservation)

### 3.3 Patient Entity Authorization

| Action | Super Admin | Tenant Admin | Nurse (Assigned) | Nurse (Other) | Family (Linked) | Family (Other) |
|--------|-------------|--------------|------------------|---------------|-----------------|----------------|
| Create Patient | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Read Patient | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Update Patient | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete Patient | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Link Family Member | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |

**Key Rules:**
- Only admin can manage patients
- **Nurses can ONLY read patients they are assigned to** (determined via Shift.patientId + Shift.nurseId)
- Family can only read patients they are linked to (via patient.familyMembers)

### 3.4 Shift Entity Authorization

| Action | Super Admin | Tenant Admin | Nurse (Assigned) | Nurse (Other) | Family |
|--------|-------------|--------------|------------------|---------------|--------|
| Create Shift | ❌ | ✅ | ❌ | ❌ | ❌ |
| Read Shift | ✅ | ✅ | ✅ | ❌ | ❌ |
| Update Shift Status | ❌ | ✅ | ✅ | ❌ | ❌ |
| Delete Shift | ❌ | ✅ | ❌ | ❌ | ❌ |

**Key Rules:**
- Only admin can create/delete shifts
- Assigned nurse can update shift status (PENDING→IN_PROGRESS→COMPLETED)
- **Nurses only see shifts where they are assigned** (Shift.nurseId matches their userId)


### 3.5 AuditLog Entity Authorization

| Action | Super Admin | Tenant Admin | Nurse | Family |
|--------|-------------|--------------|-------|--------|
| Create Log | ✅ (system) | ✅ (system) | ✅ (system) | ✅ (system) |
| Read Global Logs | ✅ | ❌ | ❌ | ❌ |
| Read Tenant Logs | ✅ | ✅ | ❌ | ❌ |
| Update Log | ❌ | ❌ | ❌ | ❌ |
| Delete Log | ❌ | ❌ | ❌ | ❌ |

**Key Rules:**
- Logs are created automatically by system (Lambda triggers)
- Only Super Admin can view logs across all tenants
- Tenant Admin can view logs for their tenant only
- Logs are immutable (no updates, no deletes)

### 3.6 Notification Entity Authorization

| Action | Super Admin | Tenant Admin | Nurse | Family |
|--------|-------------|--------------|-------|--------|
| Create Notification | ✅ (system) | ✅ (system) | ✅ (system) | ✅ (system) |
| Read Own Notifications | ✅ | ✅ | ✅ | ✅ |
| Read Other's Notifications | ✅ | ❌ | ❌ | ❌ |
| Mark as Read | ✅ | ✅ | ✅ | ✅ |
| Delete Notification | ❌ | ❌ | ❌ | ❌ |

**Key Rules:**
- Notifications are created automatically by system
- Users can only read their own notifications
- Users can mark notifications as read
- Notifications are never deleted (soft delete via read flag)

---

## 4. DATA VISIBILITY RULES

### 4.1 Visit Visibility by State

| Visit State | Super Admin | Tenant Admin | Nurse (Assigned) | Nurse (Other) | Family (Linked) |
|-------------|-------------|--------------|------------------|---------------|-----------------|
| DRAFT | Full | ❌ | Full | ❌ | ❌ |
| SUBMITTED | Full | Full | Full | ❌ | ❌ |
| REJECTED | Full | Full | Full | ❌ | ❌ |
| APPROVED | Full | Full | Full | ❌ | Summary Only |

**Full Access:** All KARDEX fields, vitals, medications, tasks, internal notes
**Summary Only:** VisitSummary computed type (no raw data, no internal KARDEX notes)

### 4.2 Family Data Visibility Rules

**CRITICAL:** Family members MUST NEVER query the Visit model directly. All family access to visit data goes through a dedicated resolver/Lambda.

When family members request visit data, they receive:

#### Allowed Data (via dedicated query)
- ✅ Patient basic info (name, age, diagnosis)
- ✅ Approved visits only (as VisitSummary)
- ✅ Historical timeline of approved visits
- ✅ Next scheduled visit date
- ✅ General observations (high-level)

#### Forbidden Data
- ❌ Raw Visit model access (structural enforcement, not best effort)
- ❌ Raw vitals (sys, dia, spo2, hr)
- ❌ Internal nurse notes (KARDEX.internalNotes)
- ❌ Medication dosages (only "medications managed")
- ❌ Task details (only "tasks completed")
- ❌ Unapproved visits (DRAFT, SUBMITTED, REJECTED)
- ❌ Shift scheduling details
- ❌ Nurse contact information

**Implementation:** Family queries use `listApprovedVisitSummariesForFamily(patientId)` custom query that:
1. Verifies family member is linked to patient (patient.familyMembers contains userId)
2. Filters visits by status=APPROVED only
3. Computes VisitSummary from Visit
4. Strips all sensitive fields
5. Returns sanitized summary array

Family members have NO access to Visit model queries/subscriptions.


### 4.3 Query Scopes by Persona

#### Super Admin Queries
```graphql
# Can read global AuditLog only (no clinical entities across tenants in Phase 3)
listAuditLogs(filter: { action: { eq: VISIT_APPROVED } })
```

**Note:** SuperAdmin CANNOT read/write clinical entities (Visit/Patient/Shift/etc.) across tenants in Phase 3. If SuperAdmin needs tenant context for support/debugging, require explicit "tenantContext" parameter and log the access in AuditLog.

#### Tenant Admin Queries
```graphql
# Automatically filtered by custom:tenantId
listVisits(filter: { 
  tenantId: { eq: $tenantId },
  status: { in: [SUBMITTED, APPROVED, REJECTED] }
})
listAuditLogs(filter: { tenantId: { eq: $tenantId } })
```

#### Nurse Queries
```graphql
# Automatically filtered by custom:tenantId AND nurseId (assignment-scoped)
listVisits(filter: { 
  tenantId: { eq: $tenantId },
  nurseId: { eq: $userId }
})
listShifts(filter: { 
  tenantId: { eq: $tenantId },
  nurseId: { eq: $userId }
})
listPatients(filter: {
  tenantId: { eq: $tenantId },
  # Only patients nurse is assigned to via Shift.patientId
})
```

**Note:** Nurse access to patients is determined by active/completed shifts. If Shift.nurseId = userId AND Shift.patientId = X, then nurse can read Patient X.

#### Family Queries
```graphql
# Automatically filtered by custom:tenantId AND patient.familyMembers
listPatients(filter: { 
  tenantId: { eq: $tenantId },
  familyMembers: { contains: $userId }
})

# DEDICATED QUERY - Family CANNOT use listVisits
listApprovedVisitSummariesForFamily(patientId: ID!): [VisitSummary]
# This custom query/resolver:
# 1. Verifies family member is linked to patient
# 2. Filters visits by status=APPROVED only
# 3. Computes VisitSummary from Visit
# 4. Strips sensitive fields
# 5. Returns sanitized summary array
```

**CRITICAL:** Family members have NO access to Visit model queries. All visit data comes through `listApprovedVisitSummariesForFamily` custom query.

### 4.4 Field-Level Visibility

#### Visit Entity - Field Access by Role

| Field | Super Admin | Tenant Admin | Nurse (Assigned) | Family |
|-------|-------------|--------------|------------------|--------|
| visitId | ✅ | ✅ | ✅ | ✅ |
| patientId | ✅ | ✅ | ✅ | ✅ |
| nurseId | ✅ | ✅ | ✅ | ❌ |
| status | ✅ | ✅ | ✅ | ❌ |
| kardex.generalObservations | ✅ | ✅ | ✅ | ✅ (simplified) |
| kardex.internalNotes | ✅ | ✅ | ✅ | ❌ |
| vitalsRecorded | ✅ | ✅ | ✅ | ❌ |
| medicationsAdministered | ✅ | ✅ | ✅ | ❌ |
| tasksCompleted | ✅ | ✅ | ✅ | ❌ |
| rejectionReason | ✅ | ✅ | ✅ | ❌ |

**Implementation:** Family queries return VisitSummary (computed type), not raw Visit entity.


---

## 5. INVARIANTS (Must Never Happen)

These are absolute rules that must be enforced at the backend layer. If any of these occur, the system is in an invalid state.

### 5.1 Visit State Invariants

| Invariant | Description | Enforcement |
|-----------|-------------|-------------|
| INV-V1 | A visit in APPROVED state can NEVER be updated | DynamoDB conditional write, Lambda validation |
| INV-V2 | A visit can NEVER transition from APPROVED to any other state | Lambda validation, state machine check |
| INV-V3 | Only assigned nurse can create/edit a visit | Lambda validation, JWT claim check |
| INV-V4 | Only admin can approve/reject a visit | Lambda validation, Cognito group check |
| INV-V5 | A visit can NEVER be deleted | No delete mutation, DynamoDB deletion protection |
| INV-V6 | A visit in SUBMITTED state can NEVER be edited | Lambda validation, state check |
| INV-V7 | Rejection reason is REQUIRED when rejecting | Lambda validation, field check |
| INV-V8 | A visit can NEVER skip states (e.g., DRAFT→APPROVED) | Lambda validation, state machine check |
| INV-V9 | A shift can have at most 1 visit | Visit PK = shiftId (strict 1:1 enforcement) |
| INV-V10 | Visit.patientId and Visit.nurseId MUST match Shift at creation | Lambda validation at Visit creation time |

### 5.2 Family Visibility Invariants

| Invariant | Description | Enforcement |
|-----------|-------------|-------------|
| INV-F1 | Family can NEVER see visits in DRAFT state | GraphQL resolver filter, Lambda check |
| INV-F2 | Family can NEVER see visits in SUBMITTED state | GraphQL resolver filter, Lambda check |
| INV-F3 | Family can NEVER see visits in REJECTED state | GraphQL resolver filter, Lambda check |
| INV-F4 | Family can NEVER see raw vitals data | GraphQL resolver, return VisitSummary only |
| INV-F5 | Family can NEVER see internal nurse notes | GraphQL resolver, field exclusion |
| INV-F6 | Family can NEVER see patients they are not linked to | GraphQL resolver filter, patient.familyMembers check |

### 5.3 Audit Log Invariants

| Invariant | Description | Enforcement |
|-----------|-------------|-------------|
| INV-A1 | Audit logs can NEVER be updated | No update mutation, DynamoDB table config |
| INV-A2 | Audit logs can NEVER be deleted | No delete mutation, DynamoDB deletion protection |
| INV-A3 | Every visit state transition MUST generate an audit log | Lambda trigger, DynamoDB Streams |
| INV-A4 | Every admin approval/rejection MUST generate an audit log | Lambda function, explicit log creation |

### 5.4 Multi-Tenant Invariants

| Invariant | Description | Enforcement |
|-----------|-------------|-------------|
| INV-T1 | Users can NEVER access data from other tenants (except SuperAdmin for AuditLog) | AppSync authorization, JWT claim filter |
| INV-T2 | Super Admin can ONLY read global AuditLog (no clinical entities across tenants in Phase 3) | Cognito group check, custom authorization |
| INV-T3 | Every entity (except Tenant) MUST have a tenantId | Schema validation, required field |
| INV-T4 | If SuperAdmin needs tenant context, require explicit "tenantContext" parameter and log access | Lambda validation, AuditLog entry |

### 5.5 Workflow Invariants

| Invariant | Description | Enforcement |
|-----------|-------------|-------------|
| INV-W1 | A shift can have at most 1 visit | Visit PK = shiftId (strict 1:1 enforcement) |
| INV-W2 | A visit can NEVER exist without a completed shift | Lambda validation, shift status check |
| INV-W3 | Bulk approvals are NEVER allowed | Lambda validation, single visit per request |
| INV-W4 | Approved visits are NEVER editable | Conditional writes that block updates when status=APPROVED |


---

## 6. ALIGNMENT NOTES TO EXISTING SCHEMA

### 6.1 Entities to Add

| Entity | Purpose | Relationships |
|--------|---------|---------------|
| Visit | Core workflow entity | belongsTo Shift, Patient, Nurse |
| AuditLog | Immutable event log | belongsTo Tenant, User |
| Notification | User notifications | belongsTo User, Tenant |

### 6.2 Entities to Modify

#### Shift Model
**Current:**
```typescript
Shift: a.model({
    tenantId: a.id().required(),
    nurseId: a.id().required(), // ALREADY EXISTS - no rename needed
    patientId: a.id().required(), // ALREADY EXISTS
    scheduledTime: a.string().required(),
    status: a.ref('ShiftStatus'), // PENDING, IN_PROGRESS, COMPLETED, CANCELLED
    clinicalNote: a.string(),
    // ...
})
```

**Required Changes:**
```typescript
Shift: a.model({
    tenantId: a.id().required(),
    nurseId: a.id().required(), // KEEP AS IS - no rename
    patientId: a.id().required(), // KEEP AS IS - already exists
    scheduledTime: a.string().required(),
    status: a.ref('ShiftStatus'),
    visitId: a.id(), // ADD: Link to Visit (null until visit created)
    // REMOVE clinicalNote (moves to Visit.kardex)
    // ...
})
```

**Rationale:**
- Shift = scheduling concern (ALREADY has patientId and nurseId)
- Visit = documentation concern (references shiftId, inherits patientId/nurseId from Shift)
- At Visit creation: Visit.patientId and Visit.nurseId MUST match Shift.patientId and Shift.nurseId
- Separation of concerns

#### Patient Model
**Current:**
```typescript
Patient: a.model({
    tenantId: a.id().required(),
    name: a.string().required(),
    documentId: a.string().required(),
    // ...
})
```

**Required Changes:**
```typescript
Patient: a.model({
    tenantId: a.id().required(),
    name: a.string().required(),
    documentId: a.string().required(),
    familyMembers: a.id().array(), // ADD: Array of Cognito user IDs
    // ...
})
```

**Rationale:**
- Explicit family member linking
- Enables family visibility filtering

#### Nurse Model
**Current:**
```typescript
Nurse: a.model({
    tenantId: a.id().required(),
    name: a.string().required(),
    email: a.string(),
    role: a.enum(['ADMIN', 'NURSE', 'COORDINATOR']),
    // ...
})
```

**Required Changes:**
```typescript
Nurse: a.model({
    tenantId: a.id().required(),
    name: a.string().required(),
    email: a.string(),
    role: a.enum(['ADMIN', 'NURSE', 'COORDINATOR']),
    isActive: a.boolean().required().default(true), // ADD: Activation flag
    // ...
})
```

**Rationale:**
- Deactivated nurses should not receive new assignments
- Soft delete instead of hard delete


### 6.3 Authorization Changes Required

#### Current Authorization (All Models)
```typescript
.authorization(allow => [
    allow.ownerDefinedIn('tenantId').identityClaim('custom:tenantId')
])
```

**Status:** ✅ Tenant isolation works
**Gap:** No role-based or state-based authorization

#### Required Authorization (Visit Model)
```typescript
Visit: a.model({
    // ... fields
}).authorization(allow => [
    // Tenant isolation
    allow.ownerDefinedIn('tenantId').identityClaim('custom:tenantId'),
    
    // Nurse can create/edit DRAFT and REJECTED visits (assigned only)
    allow.custom((ctx) => {
        const isNurse = ctx.identity.groups.includes('Nurse');
        const isAssigned = ctx.source.nurseId === ctx.identity.sub;
        const isDraftOrRejected = ['DRAFT', 'REJECTED'].includes(ctx.source.status);
        return isNurse && isAssigned && isDraftOrRejected;
    }),
    
    // Admin can read SUBMITTED/REJECTED/APPROVED, approve/reject
    allow.groups(['Admin']).to(['read', 'update']),
    
    // Family can read APPROVED only (via custom resolver)
    allow.groups(['Family']).to(['read'])
])
```

**Note:** Custom authorization logic will be implemented in Lambda resolvers for complex state-based rules.

### 6.4 New Cognito Groups Required

#### Current Groups
```typescript
groups: ['Admin', 'Nurse', 'Family']
```

#### Required Groups
```typescript
groups: ['SuperAdmin', 'Admin', 'Nurse', 'Family']
```

**SuperAdmin Group:**
- Can view audit logs across all tenants
- Cannot modify tenant clinical data
- Used for platform monitoring and compliance

### 6.5 Lambda Functions Required

| Function | Purpose | Trigger | Input | Output |
|----------|---------|---------|-------|--------|
| submitVisit | Transition DRAFT→SUBMITTED | GraphQL mutation | visitId, nurseId | Success/error |
| approveVisit | Transition SUBMITTED→APPROVED | GraphQL mutation | visitId, adminId | Success/error |
| rejectVisit | Transition SUBMITTED→REJECTED | GraphQL mutation | visitId, adminId, reason | Success/error |
| editVisit | Update DRAFT or REJECTED visit | GraphQL mutation | visitId, nurseId, updates | Success/error |
| auditLogger | Write immutable audit log | DynamoDB Streams | event data | logId |
| notificationSender | Send notifications | EventBridge | event data | notificationId |
| generateVisitSummary | Compute family-safe summary | GraphQL query | visitId | VisitSummary |


### 6.6 GraphQL Schema Changes Summary

#### New Models to Add
1. **Visit** - Core workflow entity with KARDEX (visitId = shiftId for 1:1 enforcement)
2. **AuditLog** - Immutable event log
3. **Notification** - User notifications

#### Existing Models to Modify
1. **Shift** - Add `visitId`, rename `nurseId` to `assignedNurseId`, remove `clinicalNote`
2. **Patient** - Add `familyMembers` array
3. **Nurse** - Add `isActive` boolean

#### New Enums to Add
1. **VisitStatus** - DRAFT, SUBMITTED, REJECTED, APPROVED
2. **AuditAction** - VISIT_CREATED, VISIT_SUBMITTED, etc.
3. **NotificationType** - VISIT_APPROVED, VISIT_REJECTED, etc.

#### New Custom Types to Add
1. **KARDEX** - Clinical nursing record (nested in Visit)
2. **MedicationAdmin** - Medications administered (nested in Visit)
3. **TaskCompletion** - Tasks completed (nested in Visit)
4. **VisitSummary** - Computed type for family (not stored)

#### New Custom Queries/Mutations to Add
1. `submitVisit(visitId: ID!): Visit` - Nurse submits visit
2. `approveVisit(visitId: ID!): Visit` - Admin approves visit
3. `rejectVisit(visitId: ID!, reason: String!): Visit` - Admin rejects visit
4. `editVisit(visitId: ID!, updates: VisitInput!): Visit` - Nurse edits visit
5. `listApprovedVisitSummariesForFamily(patientId: ID!): [VisitSummary]` - **DEDICATED family query** (Family CANNOT use listVisits)
6. `listPendingVisitsForAdmin: [Visit]` - Admin approval queue

**CRITICAL:** Family members have NO access to Visit model queries. All visit data comes through `listApprovedVisitSummariesForFamily` custom query/resolver that:
- Verifies family member is linked to patient
- Filters visits by status=APPROVED only
- Computes VisitSummary from Visit
- Strips all sensitive fields
- Returns sanitized summary array

---

## 7. IMPLEMENTATION NOTES

### 7.1 Backend-First Enforcement

All workflow rules MUST be enforced server-side:

1. **State Transitions:** Lambda functions validate state machine rules
2. **Authorization:** Custom resolvers check role + state + assignment
3. **Immutability:** DynamoDB conditional writes prevent updates to APPROVED visits
4. **Audit Logging:** DynamoDB Streams trigger audit log creation
5. **Notifications:** EventBridge rules trigger notification Lambda

**UI Cannot Bypass:** Frontend is untrusted. All validation happens in backend.

### 7.2 Family Data Transformation

Family members NEVER receive raw Visit entities. Instead:

1. Family queries `listApprovedVisitsForFamily(patientId)`
2. Lambda resolver filters visits by:
   - `status = APPROVED`
   - `patient.familyMembers contains userId`
3. Lambda computes VisitSummary from Visit
4. Returns sanitized summary (no raw KARDEX, no vitals, no internal notes)

### 7.3 Audit Log Automation

Every significant action generates an audit log:

1. DynamoDB Streams enabled on Visit, Patient, Shift tables
2. Stream events trigger `auditLogger` Lambda
3. Lambda writes to AuditLog table (append-only)
4. CloudWatch Logs backup for compliance

### 7.4 Notification Automation

State transitions trigger notifications:

1. Visit SUBMITTED → Notify admin (pending review)
2. Visit APPROVED → Notify nurse + family (visit available)
3. Visit REJECTED → Notify nurse (corrections needed)
4. EventBridge rules route events to `notificationSender` Lambda
5. Lambda creates Notification records + sends email/SMS (future)


---

## 8. PHASE 2 COMPLETION CHECKLIST

This design document is complete when all sections are reviewed and approved:

- [x] 1. Domain Model - All entities, fields, and types defined
- [x] 2. Visit State Machine - States, transitions, and rules documented
- [x] 3. Authorization Matrix - Role-based permissions mapped
- [x] 4. Data Visibility Rules - Query scopes and field-level access defined
- [x] 5. Invariants - Must-never-happen rules documented
- [x] 6. Alignment Notes - Changes to existing schema identified
- [x] 7. Implementation Notes - Backend-first enforcement strategy
- [x] 8. KARDEX Terminology - Correct clinical terminology applied

**Next Phase:** Phase 3 - Backend Implementation (Lambda functions, GraphQL resolvers, state machine logic)

**Approval Required:** User must review and approve this design before proceeding to Phase 3.

---

## 9. OPEN QUESTIONS (If Any)

None at this time. All design decisions are based on the authoritative workflow document and actual deployed schema.

**Key Decisions Confirmed:**
1. ✅ Shift includes patientId (YES - already in deployed schema)
2. ✅ Shift includes nurseId (YES - already in deployed schema, no rename needed)
3. ✅ Visit ties to Shift via shiftId (YES - Visit references shiftId)
4. ✅ Visit.patientId and Visit.nurseId must match Shift at creation (YES - enforced by Lambda validation)
5. ✅ Nurse access is assignment-scoped (YES - nurses only see patients/shifts they are assigned to)
6. ✅ Family sees VisitSummary only after approval (YES - via dedicated query, no direct Visit model access)
7. ✅ Medication/task references are snapshots (YES - no foreign keys, snapshot fields at submission time)
8. ✅ 1:1 Shift-Visit relationship enforced by data modeling (YES - Visit PK = shiftId, strict enforcement)
9. ✅ SuperAdmin can read global AuditLog only (YES - no clinical entities across tenants in Phase 3)
10. ✅ Approved visits locked via conditional writes (YES - not "DynamoDB locked", but conditional write checks)

If ambiguities arise during implementation, STOP and ask before proceeding.

---

**Document Status:** ✅ COMPLETE - Ready for Review

**Created:** January 22, 2026
**Last Updated:** January 22, 2026
**Phase:** 2 - Domain & State Modeling
**Next Phase:** 3 - Backend Implementation (awaiting approval)

