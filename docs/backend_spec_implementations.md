# Backend Implementation Specification: Phase 11 Fixes
**To:** Kiro (Backend Lead)
**From:** Frontend Team (Antigravity)
**Date:** 2026-01-22
**Reference:** [ux_logic_audit.md](file:///Users/luiscoy/.gemini/antigravity/brain/669ff75d-d345-4d3a-acd0-33d229854b94/ux_logic_audit.md)

## Overview
This document specifies the technical changes required to resolve the logic gaps identified in the Admin Dashboard audit. These changes focus on Authorization Rules, Data Persistence for AI outputs, and Data Consistency.

---

## 1. Schema & Data Model Updates
**File:** [amplify/data/resource.ts](file:///Users/luiscoy/ERP/amplify/data/resource.ts)

### A. BillingRecord (AI Persistence)
**Problem:** AI-generated RIPS validation and Glosa defenses are currently ephemeral and lost on refresh.
**Requirement:** Add fields to store these outputs.
**Spec Change:**
```typescript
BillingRecord: a.model({
    // ... existing fields
    
    // [NEW] Store AI Validation Results
    ripsValidationResult: a.json(), // Stores the 'validateRIPS' JSON output
    
    // [NEW] Store AI Rebuttal
    glosaDefenseText: a.string(), // Stores the markdown text from 'glosaDefender'
    glosaDefenseGeneratedAt: a.datetime(),
})
```

### B. InventoryItem (Admin Write Access)
**Problem:** Inventory Dashboard is read-only. Admins cannot restock or add items.
**Requirement:** Allow Admins (via `custom:tenantId`) to create/update/delete.
**Spec Change:**
Currently: `allow.ownerDefinedIn('tenantId').identityClaim('custom:tenantId')` (Implicitly allows CRU? Verify if "Admin" role is distinct in your Lambda/Auth logic or if this rule is sufficient but the UI was just missing).
**Directive:** Ensure generic authenticated users with the correct `tenantId` claim have **WRITE** access, or add a specific group rule:
```typescript
.authorization(allow => [
    allow.ownerDefinedIn('tenantId').identityClaim('custom:tenantId'),
    // If strict role separation is needed:
    allow.groups(['ADMIN']).to(['create', 'update', 'delete', 'read'])
])
```

---

## 2. Lambda & Mutation Logic

### A. Visit Rejection Consistency
**Problem:** Rejected visits persist in the "Pending" list due to race conditions.
**Lambda:** [rejectVisit](file:///Users/luiscoy/ERP/src/mock-client.ts#354-401)
**Requirement:**
1.  **Strong Consistency:** Ensure the mutation returns the *updated* [Visit](file:///Users/luiscoy/ERP/src/types/workflow.ts#120-158) object with `status: REJECTED`.
2.  **Subscription Filter:** Ensure the [observeQuery](file:///Users/luiscoy/ERP/src/mock-client.ts#122-129) in [PendingReviewsPanel](file:///Users/luiscoy/ERP/src/components/PendingReviewsPanel.tsx#470-851) allows filtering OUT status `REJECTED`.
**Payload Update:**
```json
// Response from rejectVisit
{
  "id": "visit-123",
  "status": "REJECTED",
  "rejectionReason": "Missing vitals",
  "rejectedAt": "2026-01-22T..."
}
```

### B. Shift & Roster Management
**Problem:** No way to create shifts or optimize routes.
**Requirement:**
1.  **Expose `optimizeRoutes`:** Ensure `roster-architect` Lambda is deployed and accessible via AppSync.
2.  **Shift Creation:** Verify [Shift](file:///Users/luiscoy/ERP/src/types.ts#4-21) model allows creation by Admin users (see Auth section above).

---

## 3. Test Environment Setup (Critical)
**Action:** Create permanent seed users in **Production** User Pool.

| Persona | Email | Role/Attributes | Usage |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin.test@ips.com` | `custom:tenantId=IPS-001`, `custom:role=ADMIN` | Dashboard Logic, Billing, Approvals |
| **Nurse** | `nurse.maria@ips.com` | `custom:tenantId=IPS-001`, `custom:role=NURSE` | Creating Visits, Receiving Notifications |
| **Family** | `family.perez@ips.com` | `custom:role=FAMILY`, `linkedPatients=["patient-123"]` | View-only Patient Portal |

**Script (AWS CLI Example):**
```bash
aws cognito-idp admin-create-user --user-pool-id <POOL_ID> --username admin.test@ips.com ...
aws cognito-idp admin-set-user-attributes --user-attributes Name="custom:tenantId",Value="IPS-001" ...
```

---

## 4. Frontend-Backend Contract Updates
*   **glosaDefender Query:** Output must return a structure that can be directly saved to `BillingRecord.glosaDefenseText`.
*   **validateRIPS Query:** Output must return a JSON object compatible with `BillingRecord.ripsValidationResult`.
