# API Security Audit - Cycle 1

**Date:** 2026-01-27  
**Auditor:** API Security Analyst (Sub-agent)  
**Scope:** All GraphQL endpoints and Lambda authorizers  
**Working Directory:** `~/projects/ERP/`

---

## Executive Summary

**Total Endpoints Audited:** 11 custom queries/mutations + 11 models  
**P0 Issues Found:** 0  
**P1 Issues Found:** 3  
**P2 Issues Found:** 2  

### High-Level Findings

✅ **Strengths:**
- AppSync configured with Cognito user pool (no unauthenticated access)
- All models use tenant isolation via `custom:tenantId` JWT claim
- Critical workflow mutations (approve/reject visit) have admin-only checks in Lambda
- Family portal has rate limiting (5 attempts = 15min lockout)
- Audit logging present for sensitive operations

⚠️ **Critical Gaps:**
- **3 billing/admin operations lack role-based authorization** (any nurse can access)
- Schema authorization rules don't reflect actual Lambda security model

---

## P0 Issues

**None found.** ✅

All endpoints require Cognito authentication. No unauthenticated access possible.

---

## P1 Issues

### 1. validateRIPS - Unrestricted Billing Validation

**Endpoint:** `validateRIPS` (Query)  
**Location:** `amplify/data/resource.ts:369`  
**Handler:** `amplify/functions/rips-validator/handler.ts`

**Issue:**  
Any authenticated user (including nurses) can validate billing records and access RIPS compliance data. This operation should be restricted to admin or billing roles.

**Authorization Rule:**
```typescript
.authorization(allow => [allow.authenticated()])
```

**Lambda Authorization:** ❌ None found

**Severity:** P1 (Role bypass)

**Reproduction:**
```graphql
query ValidateRIPS {
  validateRIPS(billingRecord: {
    id: "billing-123",
    date: "2026-01-27",
    procedures: ["890201"],
    diagnosis: "I10",
    eps: "SURA",
    totalAmount: 150000
  }) {
    isValid
    errors { field message }
  }
}
```
Any nurse with valid credentials can execute this query.

**Recommended Fix:**
```typescript
// Add to handler.ts
const callerGroups = identity?.groups || [];
if (!callerGroups.includes('ADMIN') && !callerGroups.includes('BILLING')) {
  throw new Error('Unauthorized: Only admins/billing staff can validate RIPS');
}
```

---

### 2. generateGlosaDefense - Unrestricted Billing Defense Generation

**Endpoint:** `generateGlosaDefense` (Query)  
**Location:** `amplify/data/resource.ts:376`  
**Handler:** `amplify/functions/glosa-defender/handler.ts`

**Issue:**  
Any authenticated user can generate AI-powered billing defense letters, potentially exposing sensitive patient data and billing strategies. This should be admin-only.

**Authorization Rule:**
```typescript
.authorization(allow => [allow.authenticated()])
```

**Lambda Authorization:** ❌ None found

**Severity:** P1 (Role bypass + potential data exposure)

**Reproduction:**
```graphql
query GenerateGlosa {
  generateGlosaDefense(
    billingRecord: { ... },
    patientHistory: { ... },
    clinicalNotes: [ ... ]
  ) {
    defenseLetter
    generatedAt
  }
}
```

**Recommended Fix:**
```typescript
// Add to handler.ts
const identity = event.identity as { sub: string; groups: string[] };
if (!identity?.groups?.includes('ADMIN')) {
  throw new Error('Unauthorized: Only admins can generate glosa defense letters');
}
```

---

### 3. generateRoster - Unrestricted AI Roster Generation

**Endpoint:** `generateRoster` (Query)  
**Location:** `amplify/data/resource.ts:360`  
**Handler:** `amplify/functions/roster-architect/handler.ts`

**Issue:**  
Any authenticated user can trigger AI roster generation, which is a critical administrative operation. Only coordinators/admins should manage shift assignments.

**Authorization Rule:**
```typescript
.authorization(allow => [allow.authenticated()])
```

**Lambda Authorization:** ❌ None found

**Severity:** P1 (Role bypass)

**Reproduction:**
```graphql
query GenerateRoster {
  generateRoster(
    nurses: [...],
    unassignedShifts: [...]
  ) {
    assignments { shiftId nurseId }
  }
}
```

**Recommended Fix:**
```typescript
// Add to handler.ts
const identity = event.identity as { groups: string[] };
const allowedRoles = ['ADMIN', 'COORDINATOR'];
const hasAccess = identity?.groups?.some(g => allowedRoles.includes(g));

if (!hasAccess) {
  throw new Error('Unauthorized: Only admins/coordinators can generate rosters');
}
```

---

## P2 Issues

### 1. Schema Authorization Doesn't Reflect Lambda Security Model

**Endpoints Affected:** All custom queries/mutations

**Issue:**  
All custom operations show `allow.authenticated()` in the GraphQL schema, but 5/10 have additional role-based checks in Lambda handlers. This creates confusion and makes it difficult to audit security from the schema alone.

**Examples:**
- `approveVisit` shows `allow.authenticated()` but Lambda enforces admin-only ✅
- `submitVisit` shows `allow.authenticated()` but Lambda enforces nurse ownership ✅
- `validateRIPS` shows `allow.authenticated()` and has NO Lambda checks ❌

**Severity:** P2 (Misleading documentation, potential for future bypasses)

**Recommendation:**
Add inline comments in schema or create a security documentation file:
```typescript
// Schema: allow.authenticated() (Lambda enforces: Admin only)
approveVisit: a.mutation()
  .authorization(allow => [allow.authenticated()])
  .handler(a.handler.function('approve-visit')),
```

---

### 2. Missing Audit Logging for AI Operations

**Endpoints Affected:**  
- `validateRIPS`
- `generateGlosaDefense`
- `generateRoster`

**Issue:**  
These operations invoke expensive AI models and access sensitive data, but do not create AuditLog entries. This makes it impossible to track who is using AI features and when.

**Severity:** P2 (Missing audit logging)

**Reproduction:**
Execute any of the 3 queries above → Check AuditLog table → No entry created

**Recommended Fix:**
Add audit logging to each Lambda handler:
```typescript
// Example for validateRIPS
await docClient.send(new PutCommand({
  TableName: process.env.AUDIT_TABLE_NAME!,
  Item: {
    id: `audit-${Date.now()}-${randomId}`,
    tenantId,
    userId,
    userRole: 'Nurse', // or from identity.groups
    action: 'AI_RIPS_VALIDATION',
    entityType: 'BillingRecord',
    entityId: billingRecord.id,
    timestamp: new Date().toISOString(),
    details: JSON.stringify({ modelId: process.env.MODEL_ID })
  }
}));
```

---

## Detailed Endpoint Analysis

### Custom Queries (8 total)

| Endpoint | Schema Auth | Lambda Auth | Status |
|----------|-------------|-------------|--------|
| `generateRoster` | ✅ authenticated | ❌ None | ⚠️ P1 |
| `validateRIPS` | ✅ authenticated | ❌ None | ⚠️ P1 |
| `generateGlosaDefense` | ✅ authenticated | ❌ None | ⚠️ P1 |
| `verifyFamilyAccessCode` | ✅ authenticated | ✅ Rate limiting + audit | ✅ Secure |
| `listApprovedVisitSummariesForFamily` | ✅ authenticated | ✅ Family member check | ✅ Secure |

### Custom Mutations (3 total)

| Endpoint | Schema Auth | Lambda Auth | Status |
|----------|-------------|-------------|--------|
| `createVisitDraftFromShift` | ✅ authenticated | ✅ Nurse ownership | ✅ Secure |
| `submitVisit` | ✅ authenticated | ✅ Nurse ownership | ✅ Secure |
| `approveVisit` | ✅ authenticated | ✅ Admin only | ✅ Secure |
| `rejectVisit` | ✅ authenticated | ✅ Admin only | ✅ Secure |
| `createNurseWithValidation` | ✅ authenticated | ✅ Admin/SuperAdmin | ✅ Secure |

### Model Authorization (11 models)

| Model | Authorization Rule | Status |
|-------|-------------------|--------|
| `Tenant` | ✅ `authenticated()` | ✅ OK (base tenant) |
| `Patient` | ✅ `ownerDefinedIn('tenantId')` | ✅ Tenant isolated |
| `Nurse` | ✅ `ownerDefinedIn('tenantId')` | ✅ Tenant isolated |
| `Shift` | ✅ `ownerDefinedIn('tenantId')` + groups | ✅ Role-based |
| `InventoryItem` | ✅ `ownerDefinedIn('tenantId')` + groups | ✅ Role-based |
| `VitalSigns` | ✅ `ownerDefinedIn('tenantId')` | ✅ Tenant isolated |
| `BillingRecord` | ✅ `ownerDefinedIn('tenantId')` + groups | ✅ Admin-only writes |
| `Visit` | ✅ `ownerDefinedIn('tenantId')` + authenticated | ⚠️ Lambda enforces nurse/admin |
| `AuditLog` | ✅ `ownerDefinedIn('tenantId')` + authenticated | ⚠️ Should be admin read-only |
| `Notification` | ✅ `ownerDefinedIn('tenantId')` + groups | ✅ Role-based |
| `PatientAssessment` | ✅ `ownerDefinedIn('tenantId')` + groups | ✅ Role-based (includes FAMILY) |

---

## AppSync/Cognito Configuration

**Default Authorization Mode:** `userPool` ✅  
**Unauthenticated Access:** ❌ Disabled  
**Tenant Isolation:** ✅ All models filter by `custom:tenantId` JWT claim

**Cognito Groups Expected:**
- `ADMIN` - Full system access
- `NURSE` - Limited to assigned patients
- `COORDINATOR` - Roster management
- `FAMILY` - Read-only approved visits
- `BILLING` - (Recommended) For RIPS operations

---

## Security Architect's 8 Flagged Mutations - Final Status

| Mutation | Lambda Auth | Final Classification |
|----------|-------------|---------------------|
| ✅ `createVisitDraftFromShift` | Nurse ownership check | **Secure** |
| ✅ `submitVisit` | Nurse ownership check | **Secure** |
| ✅ `approveVisit` | Admin-only check | **Secure** |
| ✅ `rejectVisit` | Admin-only check | **Secure** |
| ❌ `validateRIPS` | None | **P1: Role bypass** |
| ❌ `glosaDefender` | None | **P1: Role bypass + data exposure** |
| ❌ `rosterArchitect` | None | **P1: Role bypass** |
| ✅ `verifyFamilyAccess` | Rate limiting + audit | **Secure** |

**Result:** 5/8 are properly secured, 3/8 have critical gaps

---

## Recommendations

### Immediate Actions (P1)

1. **Add role-based authorization to billing operations:**
   - `validateRIPS` → Restrict to ADMIN/BILLING groups
   - `generateGlosaDefense` → Restrict to ADMIN group
   - `generateRoster` → Restrict to ADMIN/COORDINATOR groups

2. **Deploy fixes via Lambda code updates:**
   ```bash
   # Update handler.ts files
   amplify/functions/rips-validator/handler.ts
   amplify/functions/glosa-defender/handler.ts
   amplify/functions/roster-architect/handler.ts
   
   # Deploy
   npx ampx sandbox
   ```

3. **Add integration tests for authorization:**
   ```typescript
   // Test that nurses CANNOT call validateRIPS
   test('validateRIPS rejects non-admin users', async () => {
     const result = await client.queries.validateRIPS({ ... }, {
       authMode: 'userPool',
       authToken: nurseToken // Should fail
     });
     expect(result.errors[0].message).toContain('Unauthorized');
   });
   ```

### Short-Term Actions (P2)

4. **Add audit logging to AI operations** (see P2 Issue #2)

5. **Document schema vs. Lambda authorization model:**
   Create `docs/security/AUTHORIZATION_MODEL.md` explaining:
   - Schema-level rules (tenant isolation)
   - Lambda-level rules (role-based access)
   - Why some endpoints use both

6. **Restrict AuditLog reads to admins only:**
   ```typescript
   AuditLog: a.model({ ... }).authorization(allow => [
     allow.ownerDefinedIn('tenantId').identityClaim('custom:tenantId'),
     allow.groups(['ADMIN']).to(['read', 'list'])
   ])
   ```

### Long-Term Actions

7. **Create BILLING Cognito group** for RIPS operations
8. **Implement field-level authorization** for sensitive BillingRecord fields
9. **Add rate limiting to AI endpoints** (prevent abuse/cost overruns)
10. **Consider AppSync resolver-level authorization** for better schema clarity

---

## Conclusion

**Overall Security Posture: MODERATE**

The system has strong foundational security (Cognito + tenant isolation), but **billing and AI operations are over-permissioned**. The 3 P1 issues are exploitable by any authenticated nurse and should be patched immediately.

**Estimated Remediation Time:** 4-6 hours (code changes + testing + deployment)

---

**Next Steps:**
1. Review this audit with Security Architect
2. Create GitHub issues for P1 fixes
3. Implement role-based authorization for billing operations
4. Re-audit after fixes deployed (Cycle 2)

---

**Audit Completed:** 2026-01-27 UTC  
**Report Version:** 1.0
