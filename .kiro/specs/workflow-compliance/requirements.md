# IPS ERP Workflow Compliance - Gap Analysis

## Document Purpose
This document identifies gaps between the current IPS ERP implementation and the authoritative workflow document ("KIRO MASTER WORKFLOW PROMPT — Home Care ERP"). This is a **diagnostic phase only** - no solutions are proposed yet.

---

## Executive Summary

The current implementation has achieved:
- ✅ Multi-tenant architecture with proper data isolation
- ✅ Role-based authentication (Admin, Nurse, Family groups)
- ✅ Basic data models for core entities
- ✅ Three Lambda functions for business logic

However, **critical workflow violations exist**:
- ❌ **No Visit State Machine** - The core workflow entity (Visit) doesn't exist
- ❌ **No Approval Gates** - Admin approval workflow is completely missing
- ❌ **No Audit Trail System** - Immutable audit logging is absent
- ❌ **Roles are Disconnected** - UI components operate independently
- ❌ **UI-Only Enforcement** - No server-side workflow validation
- ❌ **Family Visibility Violations** - No filtering of unapproved data

---

## Section-by-Section Gap Analysis

### 1. MULTI-TENANT ARCHITECTURE

**Workflow Requirement:**
> Each Home Care Agency (IPS) is a Tenant. Tenants are fully isolated using tenantId. All users belong to exactly one tenant.

**Current Implementation:**
```typescript
// amplify/data/resource.ts
Tenant: a.model({
    name: a.string().required(),
    nit: a.string().required(),
    // Relationships defined
})

// Authorization on all models:
.authorization(allow => [
    allow.ownerDefinedIn('tenantId').identityClaim('custom:tenantId')
])
```

**Status:** ✅ **COMPLIANT**
- Tenant model exists
- All models filter by `custom:tenantId` JWT claim
- Data isolation is enforced at the AppSync layer

---

### 2. PERSONA: PLATFORM OWNER (SUPER ADMIN)

**Workflow Requirement:**
> Platform Owner manages the SaaS platform itself. Can view global audit logs across tenants. Cannot modify or delete tenant clinical data.

**Current Implementation:**
- ❌ No Super Admin role defined in Cognito groups
- ❌ No global audit log system exists
- ❌ No cross-tenant read-only access mechanism

**Status:** ❌ **VIOLATION**

**Gap Details:**
1. Only three groups exist: `Admin`, `Nurse`, `Family`
2. No `SuperAdmin` or `PlatformOwner` group
3. No audit log table in schema
4. No mechanism to view data across tenants

---

### 3. PERSONA: TENANT ADMIN

**Workflow Requirement:**
> Tenant Admin controls nurses, patients, assignments, and **visit approvals**. Must review each nurse visit individually. No bulk approvals allowed. Can approve or reject visits with objections.

**Current Implementation:**

#### 3.1 Nurse Management
```typescript
Nurse: a.model({
    tenantId: a.id().required(),
    name: a.string().required(),
    email: a.string(),
    role: a.enum(['ADMIN', 'NURSE', 'COORDINATOR']),
    // ...
})
```
**Status:** ✅ **COMPLIANT** - Nurse CRUD exists

#### 3.2 Patient Management
```typescript
Patient: a.model({
    tenantId: a.id().required(),
    name: a.string().required(),
    documentId: a.string().required(),
    // ...
})
```
**Status:** ✅ **COMPLIANT** - Patient CRUD exists

#### 3.3 Visit Oversight & Approval
**Status:** ❌ **CRITICAL VIOLATION**

**Missing Entities:**
- ❌ No `Visit` model exists in schema
- ❌ No visit state machine (DRAFT, SUBMITTED, REJECTED, APPROVED)
- ❌ No approval workflow mutations
- ❌ No rejection reason field
- ❌ No approval timestamp tracking

**Current Shift Model:**
```typescript
Shift: a.model({
    status: a.ref('ShiftStatus'), // PENDING, IN_PROGRESS, COMPLETED, CANCELLED
    clinicalNote: a.string(),
    // No approval fields
    // No rejection fields
    // No state machine
})
```

**Gap:** The `Shift` model represents **scheduling**, not **visit documentation**. The workflow requires a separate `Visit` entity that:
1. Is created when a nurse completes a shift
2. Contains CARDEX (clinical notes)
3. Enters SUBMITTED state
4. Requires admin approval
5. Can be REJECTED with objections
6. Becomes APPROVED and immutable

#### 3.4 Correction Workflow
**Status:** ❌ **MISSING**

**Workflow Requirement:**
> If rejected: Visit is returned to the nurse. Nurse must correct documentation. Nurse resubmits for approval.

**Current Implementation:**
- ❌ No rejection mechanism
- ❌ No "return to nurse" logic
- ❌ No resubmission workflow
- ❌ No edit lock/unlock based on state

#### 3.5 Finalization
**Status:** ❌ **MISSING**

**Workflow Requirement:**
> Only approved visits: Become immutable, Become visible to family members, Are eligible for billing/compliance

**Current Implementation:**
- ❌ No immutability enforcement
- ❌ No family visibility filtering
- ❌ No billing eligibility check

---

### 4. PERSONA: NURSE

**Workflow Requirement:**
> Nurse sees only assigned patients and scheduled visits. Records CARDEX (clinical notes). Marks visit as Completed → enters Pending Approval state. Cannot edit after submission. If rejected, receives notification and can correct.

**Current Implementation:**

#### 4.1 Daily Assignment View
```typescript
// NurseDashboard.tsx
useEffect(() => {
    const query = client.models.Shift.observeQuery({
        filter: {
            tenantId: { eq: MOCK_USER.attributes['custom:tenantId'] }
        }
    });
    // ...
}, []);
```

**Status:** ⚠️ **PARTIAL COMPLIANCE**
- ✅ Nurse sees shifts
- ❌ No filtering by `nurseId` (sees ALL tenant shifts, not just assigned)
- ❌ No daily/weekly view logic

#### 4.2 Patient Visit Execution
**Status:** ❌ **VIOLATION**

**Missing:**
- ❌ No CARDEX model or field
- ❌ No structured clinical notes
- ❌ Only `clinicalNote: a.string()` exists on Shift
- ❌ No vitals recording during visit
- ❌ No medication administration tracking

#### 4.3 Visit Completion
**Status:** ❌ **VIOLATION**

**Current Implementation:**
```typescript
// NurseDashboard.tsx
const handleUpdateStatus = async (id: string, newStatus: Shift['status']) => {
    await client.models.Shift.update({
        id,
        status: newStatus,
        ...(newStatus === 'COMPLETED' ? { completedAt: new Date().toISOString() } : {}),
    });
};
```

**Gap:**
- ❌ Marking shift as COMPLETED does NOT create a Visit
- ❌ No transition to "Pending Approval" state
- ❌ No notification to admin
- ❌ Nurse can still edit after completion

#### 4.4 Rejection Handling
**Status:** ❌ **MISSING**
- ❌ No rejection notification system
- ❌ No "return to editable" logic
- ❌ No resubmission workflow

#### 4.5 Approval Confirmation
**Status:** ❌ **MISSING**
- ❌ No approval notification
- ❌ No read-only lock after approval

---

### 5. PERSONA: FAMILY / RELATIVE

**Workflow Requirement:**
> Family members are observers only. Can only see: Approved visits, High-level summaries, Historical timeline. No raw vitals, no internal notes. No access before admin approval.

**Current Implementation:**

```typescript
// FamilyPortal.tsx
useEffect(() => {
    const fetchData = async () => {
        const patientsRes = await client.models.Patient.list();
        const vitalsRes = await client.models.VitalSigns.list();
        // No filtering by approval status
    };
}, []);
```

**Status:** ❌ **CRITICAL VIOLATION**

**Gaps:**
1. ❌ Family sees ALL vitals, not just approved visits
2. ❌ No filtering by visit approval status
3. ❌ Raw clinical data is exposed (sys, dia, spo2, hr, note)
4. ❌ No high-level summary generation
5. ❌ Real-time data access (should be historical only)

**Security Risk:** Family members can see unapproved, unreviewed clinical data.

---

### 6. VISIT STATE MACHINE

**Workflow Requirement:**
> Visits MUST follow this lifecycle:
> 1. Draft (Nurse editing)
> 2. Submitted (Pending Admin Review)
> 3. Rejected (Returned to Nurse)
> 4. Approved (Final & Immutable)

**Current Implementation:**
```typescript
ShiftStatus: a.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
```

**Status:** ❌ **CRITICAL VIOLATION**

**Gap Analysis:**

| Required State | Current Equivalent | Exists? |
|----------------|-------------------|---------|
| DRAFT          | None              | ❌      |
| SUBMITTED      | None              | ❌      |
| REJECTED       | None              | ❌      |
| APPROVED       | None              | ❌      |

**Current ShiftStatus:**
- `PENDING` = Shift scheduled (not started)
- `IN_PROGRESS` = Nurse is on-site
- `COMPLETED` = Nurse finished (but NO approval workflow)
- `CANCELLED` = Shift cancelled

**Missing:**
- No visit documentation entity
- No approval workflow states
- No state transition validation
- No immutability enforcement

---

### 7. NOTIFICATIONS & AUTOMATION

**Workflow Requirement:**
> Event-driven notifications for:
> - Nurse: visit approved / rejected
> - Admin: pending visits awaiting review
> - Family: approved visit available
> Notifications must be triggered by state transitions, not UI actions.

**Current Implementation:**
- ❌ No notification system exists
- ❌ No SNS topics defined
- ❌ No EventBridge rules
- ❌ No email/SMS integration
- ❌ No in-app notification model

**Status:** ❌ **MISSING**

---

### 8. AUDIT TRAIL SYSTEM

**Workflow Requirement:**
> Every significant action MUST generate an immutable audit log:
> - User ID, Role, Tenant ID, Action type, Timestamp, Entity affected
> - Append-only (no deletes, no updates)
> - Only Super Admin can view global logs
> - Tenant Admin can view tenant-level logs

**Current Implementation:**
- ❌ No `AuditLog` model in schema
- ❌ No audit logging Lambda function
- ❌ No DynamoDB Streams integration
- ❌ No CloudWatch Logs integration

**Status:** ❌ **CRITICAL VIOLATION**

**Missing Actions to Audit:**
- Nurse submits visit
- Admin rejects visit
- Admin approves visit
- Nurse edits after rejection
- Family views patient data
- User login/logout
- Data modifications

---

### 9. BACKEND-FIRST LOGIC

**Workflow Requirement:**
> UI cannot bypass workflow rules. Approval gates are enforced server-side. Visit transitions require explicit authorization. Rejected visits become editable ONLY for nurses. Approved visits are read-only forever.

**Current Implementation:**

#### 9.1 Server-Side Validation
**Status:** ❌ **MISSING**

**Current Lambda Functions:**
- `rips-validator` - Validates billing records (✅ backend logic)
- `glosa-defender` - Generates defense letters (✅ backend logic)
- `roster-architect` - Assigns shifts (✅ backend logic)

**Missing Lambda Functions:**
- ❌ `submitVisit` - Validate and transition visit to SUBMITTED
- ❌ `approveVisit` - Admin approval with authorization check
- ❌ `rejectVisit` - Admin rejection with objection reason
- ❌ `editVisit` - Nurse edit with state validation

#### 9.2 Authorization Checks
**Current:**
```typescript
.authorization(allow => [
    allow.ownerDefinedIn('tenantId').identityClaim('custom:tenantId')
])
```

**Gap:**
- ✅ Tenant isolation enforced
- ❌ No role-based field-level authorization
- ❌ No state-based write permissions
- ❌ No approval authority validation

#### 9.3 Immutability Enforcement
**Status:** ❌ **MISSING**

**Required:**
- Approved visits cannot be updated (server-side check)
- Audit logs cannot be deleted (DynamoDB table config)
- State transitions must be validated (Lambda function)

**Current:**
- ❌ No immutability checks
- ❌ Any user can update any field
- ❌ No state transition validation

---

### 10. FRONTEND COMPONENT ANALYSIS

#### 10.1 AdminDashboard.tsx
**Status:** ⚠️ **DISCONNECTED**

**Current Behavior:**
- Shows stats (patients, shifts, inventory)
- Has "Clinical Audit" view (lists patients)
- No visit approval interface
- No pending visits queue
- No approve/reject actions

**Missing:**
1. ❌ Pending visits awaiting review
2. ❌ Individual visit approval UI
3. ❌ Rejection reason input
4. ❌ Approval confirmation
5. ❌ Audit log viewer

#### 10.2 NurseDashboard.tsx
**Status:** ⚠️ **PARTIAL**

**Current Behavior:**
- Lists shifts for tenant (not filtered by nurse)
- Can update shift status
- No visit submission workflow

**Missing:**
1. ❌ Filter shifts by assigned nurse
2. ❌ CARDEX entry form
3. ❌ Submit visit button
4. ❌ Rejection notification display
5. ❌ Edit lock after submission

#### 10.3 FamilyPortal.tsx
**Status:** ❌ **SECURITY VIOLATION**

**Current Behavior:**
- Shows ALL patients
- Shows ALL vitals (no approval filter)
- Exposes raw clinical data

**Missing:**
1. ❌ Filter by approved visits only
2. ❌ High-level summary view
3. ❌ Hide raw vitals/notes
4. ❌ Historical timeline view

---

## Summary of Critical Violations

### 🔴 Severity 1 (Breaks Core Workflow)
1. **No Visit Entity** - The central workflow object doesn't exist
2. **No State Machine** - Visit lifecycle is not implemented
3. **No Approval Workflow** - Admin review process is missing
4. **No Audit Trail** - Immutable logging is absent
5. **Family Sees Unapproved Data** - Security/privacy violation

### 🟡 Severity 2 (Functional Gaps)
6. **No Rejection Workflow** - Correction loop is missing
7. **No Notifications** - Event-driven alerts absent
8. **No Immutability** - Approved visits can be edited
9. **No Super Admin Role** - Platform owner persona missing
10. **Roles are Disconnected** - UI components don't interact

### 🟢 Severity 3 (Enhancement Needed)
11. **No CARDEX Model** - Structured clinical notes missing
12. **Nurse Sees All Shifts** - Should filter by assignment
13. **No Bulk Approval Prevention** - UI doesn't prevent it
14. **No Visit-Billing Link** - Approved visits not tied to billing

---

## Data Model Gaps

### Missing Models
1. ❌ **Visit** - Core workflow entity
   - Fields: visitId, shiftId, patientId, nurseId, tenantId
   - Fields: cardex (clinical notes), vitals, medications, tasks
   - Fields: status (DRAFT, SUBMITTED, REJECTED, APPROVED)
   - Fields: submittedAt, reviewedAt, reviewedBy, rejectionReason
   - Fields: approvedAt, approvedBy

2. ❌ **AuditLog** - Immutable event log
   - Fields: logId, tenantId, userId, role, action
   - Fields: entityType, entityId, timestamp, details

3. ❌ **Notification** - User notifications
   - Fields: notificationId, userId, tenantId, type
   - Fields: message, read, createdAt

### Missing Fields on Existing Models

#### Shift Model
- ❌ `assignedNurseId` (currently just `nurseId`)
- ❌ `visitId` (link to Visit entity)

#### Patient Model
- ❌ `familyMembers` (array of user IDs with read access)

#### Nurse Model
- ❌ `isActive` (activation/deactivation flag)

---

## Authorization Gaps

### Missing Authorization Rules

1. **Visit Mutations:**
   - ❌ Only assigned nurse can create/edit DRAFT visits
   - ❌ Only nurse can submit visit (DRAFT → SUBMITTED)
   - ❌ Only admin can approve/reject (SUBMITTED → APPROVED/REJECTED)
   - ❌ Only assigned nurse can edit REJECTED visits
   - ❌ Nobody can edit APPROVED visits

2. **Family Access:**
   - ❌ Family can only read APPROVED visits
   - ❌ Family cannot see raw clinical notes
   - ❌ Family cannot see internal nurse comments

3. **Audit Logs:**
   - ❌ Only Super Admin can read global logs
   - ❌ Tenant Admin can read tenant-scoped logs
   - ❌ Nobody can write/update/delete logs (append-only)

---

## Lambda Function Gaps

### Missing Functions

1. ❌ **submitVisit**
   - Input: visitId, nurseId
   - Validation: Nurse is assigned, visit is DRAFT, required fields complete
   - Action: Transition to SUBMITTED, notify admin
   - Output: Success/error

2. ❌ **approveVisit**
   - Input: visitId, adminId
   - Validation: Admin role, visit is SUBMITTED
   - Action: Transition to APPROVED, make immutable, notify nurse & family
   - Output: Success/error

3. ❌ **rejectVisit**
   - Input: visitId, adminId, rejectionReason
   - Validation: Admin role, visit is SUBMITTED, reason provided
   - Action: Transition to REJECTED, notify nurse
   - Output: Success/error

4. ❌ **editVisit**
   - Input: visitId, nurseId, updates
   - Validation: Nurse is assigned, visit is DRAFT or REJECTED
   - Action: Update fields, maintain DRAFT/REJECTED state
   - Output: Success/error

5. ❌ **auditLogger**
   - Input: action, userId, role, tenantId, entityType, entityId
   - Action: Write immutable log entry
   - Output: logId

---

## Next Steps (NOT IMPLEMENTED YET)

This document is **diagnostic only**. The next phases will:

1. **Phase 2:** Design domain models and state machines
2. **Phase 3:** Design backend-first logic (Lambdas, resolvers, validation)
3. **Phase 4:** Implement audit log system
4. **Phase 5:** Implement notifications & automation
5. **Phase 6:** Implement changes incrementally
6. **Phase 7:** Define acceptance checks

---

## Conclusion

The current IPS ERP implementation has a solid foundation (multi-tenancy, authentication, basic data models), but **fundamentally violates the workflow** by:

1. Missing the core Visit entity and state machine
2. Having no approval workflow
3. Allowing family to see unapproved data
4. Having no audit trail
5. Relying on UI-only enforcement

**The system currently operates as isolated dashboards, not a connected workflow.**

To comply with the authoritative workflow document, we must implement the Visit lifecycle, approval gates, audit logging, and role-based visibility rules **at the backend layer** before proceeding with any UI enhancements.
