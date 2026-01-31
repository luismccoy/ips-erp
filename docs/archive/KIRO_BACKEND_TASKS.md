# Kiro IDE Backend Tasks - IPS-ERP

**Generated**: 2025-01-26  
**Last Updated**: 2026-01-27  
**Project**: IPS-ERP Healthcare Home Care Management  
**Stack**: AWS Amplify Gen 2, AppSync GraphQL, DynamoDB, Lambda, Cognito

---

## 📊 QUICK STATUS SUMMARY

| Priority | Task | Status | Assigned |
|----------|------|--------|----------|
| 🔴 P1 | 1.1 InventoryDashboard mutations | ✅ DONE | Clawd |
| 🔴 P1 | 1.2 Nurse.cognitoSub validation | ✅ DONE | **KIRO** |
| 🔴 P1 | 1.3 AuditLog authorization | ✅ VERIFIED | Clawd |
| 🟡 P2 | 2.1 Subscription authorization | ✅ VERIFIED | **KIRO** |
| 🟡 P2 | 2.2 Family access rate limiting | ✅ DONE | **KIRO** |
| 🟡 P2 | 2.3 Tenant isolation audit | ⏳ TODO | **KIRO** |
| 🟠 P3 | 3.1 Lambda resource files | ⏳ TODO | Kiro |
| 🟠 P3 | 3.2 RIPS validator AI | ⏳ TODO | Kiro |
| 🔵 P4 | 4.1 GSI creation | ⏳ TODO | Kiro |
| 🔵 P4 | 4.2 BillingRecord schema | ⏳ TODO | Kiro |
| 🔵 P4 | 4.3 Patient-Nurse relation | ⏳ TODO | Kiro |
| 🟣 P5 | 5.1 Subscription handlers | ⏳ TODO | Kiro |
| 🟣 P5 | 5.2 Push notifications | ⏳ TODO | Kiro |
| 🔘 P6 | 6.1 Demo mode cleanup | ⏳ TODO | Antigravity |
| 🔘 P6 | 6.2 Lambda unit tests | ⏳ TODO | Kiro |
| 🔘 P6 | 6.3 Environment variables | ⏳ TODO | Kiro |

**Tonight's Focus**: Tasks 1.2, 2.1, 2.2 (MUST), then 3.2, 4.1 (IF TIME)

📖 **Super Prompt**: See `docs/KIRO_SUPERPROMPT.md` for detailed implementation instructions.

---

## 🔴 Priority 1: Critical Production Blockers

### 1.1 InventoryDashboard Backend Mutations Disabled
**File**: `src/components/InventoryDashboard.tsx` (lines 94, 148)

**Status**: ✅ COMPLETED (2025-01-27)

**Resolution**:
- Verified `amplify/data/resource.ts` already has correct authorization rules with ADMIN group having `['create', 'read', 'update', 'delete']` permissions
- Uncommented the `client.models.InventoryItem.create()` and `client.models.InventoryItem.update()` mutations in InventoryDashboard.tsx
- TypeScript check passes

**Effort**: 1 hour | **Risk**: High

---

### 1.2 Nurse.cognitoSub Identity Mapping Not Enforced
**File**: `amplify/data/resource.ts` (Nurse model)

**Status**: ✅ DONE (2026-01-27)

**Resolution**:
- Created `createNurseWithValidation` custom mutation in GraphQL schema
- Implemented `create-nurse-validated` Lambda function with:
  - Admin/SuperAdmin authorization check
  - Tenant isolation enforcement
  - Duplicate cognitoSub prevention (queries by tenant)
  - Required field validation (name, cognitoSub)
- Lambda registered in `amplify/backend.ts`

**Effort**: 3 hours | **Risk**: Medium

---

### 1.3 Audit Logs Write Authorization Missing
**File**: `amplify/data/resource.ts` (AuditLog model)

**Status**: ✅ VERIFIED (2025-01-27)

**Verification Results**:
- Searched all `.tsx` and `.ts` files in `src/` for AuditLog usage
- Found only read operations:
  - `AuditLogViewer.tsx`: Uses `client.models.AuditLog.list()` (read only)
  - `AdminDashboard.tsx`: Uses `client.models.AuditLog.onCreate()` subscription (read only)
  - `mock-client.ts`: Demo data definitions
- **No client-side `.create()`, `.update()`, or `.delete()` calls to AuditLog**
- Lambda functions write to AuditLog table via DynamoDB SDK (correct architecture for immutable audit logs)

**Effort**: 30 minutes | **Risk**: Low

---

## 🟡 Priority 2: Security & Authorization

### 2.1 Subscription Authorization Verification
**Files**: 
- `amplify/data/resource.ts` (all models with subscriptions)
- `src/graphql/subscriptions.ts`

**Status**: ✅ VERIFIED (2026-01-27)

**Verification Results**:
- Shift model has correct authorization with NURSE read permission
- Notification model has explicit group permissions for subscriptions (Phase 16 fix)
- All subscription-enabled models include tenant isolation via `ownerDefinedIn('tenantId')`

**Effort**: 2 hours | **Risk**: High (data leakage)

---

### 2.2 Family Portal Access Code Security
**File**: `amplify/functions/verify-family-access/handler.ts`

**Status**: ✅ DONE (2026-01-27)

**Resolution**:
- Implemented rate limiting: 5 failed attempts = 15 minute lockout
- Added `checkRateLimit()`, `incrementFailedAttempts()`, `resetFailedAttempts()` functions
- Added `logSecurityEvent()` for audit logging to AuditLog table
- Spanish error messages with remaining attempts count
- Rate limit data stored in Patient table with `ratelimit:` prefix

**Security Features**:
- MAX_FAILED_ATTEMPTS: 5
- LOCKOUT_DURATION_MS: 15 minutes (900,000 ms)
- Audit events: ACCESS_GRANTED, ACCESS_DENIED, RATE_LIMIT_EXCEEDED

**Effort**: 4 hours | **Risk**: Medium

---

### 2.3 Tenant Isolation Audit
**Files**: All Lambda handlers

**Current State**: ✅ All 10 Lambda functions check `custom:tenantId` from JWT claims

**Verification Needed**: 
- Ensure no DynamoDB scans without tenant filter
- Review `list-approved-visit-summaries/handler.ts` - uses `ScanCommand` with filter (consider GSI)

**Effort**: 1 hour | **Risk**: Medium

---

## 🟠 Priority 3: Missing Lambda Function Implementations

### 3.1 Lambda Resource Files Verification
**Directory**: `amplify/functions/*/resource.ts`

**Status Check**:
| Function | resource.ts | handler.ts | DynamoDB Tables |
|----------|-------------|------------|-----------------|
| roster-architect | ❓ Minimal | ✅ Complete | None (AI only) |
| rips-validator | ❓ Minimal | ✅ Complete | BILLING_RECORD_TABLE |
| glosa-defender | ❓ Missing | ✅ Complete | BILLING_RECORD_TABLE |
| verify-family-access | ✅ | ✅ Complete | PATIENT_TABLE |
| create-visit-draft | ✅ | ✅ Complete | SHIFT, VISIT, AUDIT |
| submit-visit | ✅ | ✅ Complete | VISIT, NURSE, AUDIT, NOTIFICATION |
| reject-visit | ✅ | ✅ Complete | VISIT, NURSE, AUDIT, NOTIFICATION |
| approve-visit | ✅ | ✅ Complete | VISIT, NURSE, PATIENT, AUDIT, NOTIFICATION |
| list-approved-visit-summaries | ✅ | ✅ Complete | VISIT, NURSE, PATIENT, SHIFT |

**Tasks**:
1. Verify `glosa-defender/resource.ts` has proper DynamoDB permissions
2. Add explicit table access policies for all functions

**Effort**: 2 hours | **Risk**: Medium

---

### 3.2 rips-validator AI Integration Missing
**File**: `amplify/functions/rips-validator/handler.ts`

**Current State**: Basic field validation only (no AI)

**Expected**: AI-powered validation using Bedrock (like glosa-defender)

**Tasks**:
1. Add `ai-client.ts` to rips-validator function
2. Implement Colombian RIPS compliance AI validation
3. Add Bedrock environment variables to resource.ts

**Effort**: 4 hours | **Risk**: Low (enhancement)

---

## 🔵 Priority 4: Database Schema Improvements

### 4.1 Global Secondary Indexes Required
**File**: `amplify/data/resource.ts`

**Issue**: Several queries use `ScanCommand` with filters instead of efficient queries.

**Required GSIs**:
```typescript
// Visit model - query by status
Visit: a.model({...})
    .secondaryIndexes(index => [
        index('byTenantAndStatus')
            .partitionKey('tenantId')
            .sortKey('status')
    ])

// Shift model - query by nurse and date
Shift: a.model({...})
    .secondaryIndexes(index => [
        index('byNurseAndDate')
            .partitionKey('nurseId')
            .sortKey('scheduledTime')
    ])

// Notification model - query unread by user
Notification: a.model({...})
    .secondaryIndexes(index => [
        index('byUserUnread')
            .partitionKey('userId')
            .sortKey('read')
    ])
```

**Effort**: 3 hours | **Risk**: Medium (requires migration)

---

### 4.2 BillingRecord Schema Enhancement
**File**: `amplify/data/resource.ts`

**Current Fields**: Basic RIPS fields

**Missing Fields for Colombian Compliance**:
```typescript
BillingRecord: a.model({
    // ... existing fields ...
    
    // Phase 2: Full RIPS compliance
    codigoPrestador: a.string(),       // IPS provider code
    tipoDocumento: a.string(),          // Document type (CC, TI, CE)
    numeroAutorizacion: a.string(),    // EPS authorization number
    codigoServicio: a.string(),        // Service code (urgencias, hospitalizacion)
    valorCopago: a.float(),            // Copayment value
    valorCuotaModeradora: a.float(),   // Moderating fee
    fechaConsulta: a.date(),           // Consultation date
    causaExterna: a.string(),          // External cause code
})
```

**Effort**: 2 hours | **Risk**: Low

---

### 4.3 Missing Patient-Nurse Relationship
**File**: `amplify/data/resource.ts`

**Issue**: No direct relationship between Patient and their primary Nurse.

**Enhancement**:
```typescript
Patient: a.model({
    // ... existing fields ...
    primaryNurseId: a.id(),
    primaryNurse: a.belongsTo('Nurse', 'primaryNurseId'),
})
```

**Effort**: 1 hour | **Risk**: Low

---

## 🟣 Priority 5: Real-time Subscriptions

### 5.1 Subscription Handlers Review
**File**: `src/graphql/subscriptions.ts`

**Current State**: Subscriptions defined but using manual GraphQL strings.

**Issue**: Not using Amplify Gen 2 type-safe subscriptions.

**Tasks**:
1. Migrate to `client.models.Notification.observeQuery()` pattern (already in use)
2. Remove legacy subscription strings
3. Verify tenant filtering in all subscription handlers

**Effort**: 2 hours | **Risk**: Low

---

### 5.2 Push Notification Integration
**Status**: Not Implemented

**Requirement**: Send mobile push notifications for:
- Visit approval/rejection
- Shift assignments
- Urgent alerts

**Tasks**:
1. Add AWS Pinpoint or SNS for push notifications
2. Create Lambda trigger on Notification table changes
3. Store device tokens in User/Nurse model

**Effort**: 8 hours | **Risk**: Low (new feature)

---

## 🔘 Priority 6: Testing & DevOps

### 6.1 Demo Mode vs Production Separation
**File**: `src/amplify-utils.ts`

**Issue**: `MOCK_USER` and demo data used even in components that should hit real backend.

**Tasks**:
1. Audit all components using `MOCK_USER`
2. Replace with actual Cognito user from `useAuthenticator()`
3. Create separate test fixtures for unit tests

**Effort**: 4 hours | **Risk**: Medium

---

### 6.2 Lambda Unit Tests Missing
**Directory**: `amplify/functions/*/`

**Current State**: No test files detected

**Tasks**:
1. Create `__tests__` directory in each function folder
2. Mock DynamoDB DocumentClient
3. Test authorization failures, happy paths, edge cases

**Effort**: 8 hours | **Risk**: Low

---

### 6.3 Environment Variable Management
**Issue**: Lambda functions rely on hardcoded `process.env` table names

**Tasks**:
1. Document all required environment variables
2. Create `amplify/functions/*/environment.d.ts` for type safety
3. Add validation at function startup

**Effort**: 2 hours | **Risk**: Low

---

## Summary Table

| Task ID | Description | Priority | Effort | Risk |
|---------|-------------|----------|--------|------|
| 1.1 | InventoryDashboard mutations | 🔴 P1 | 1h | High |
| 1.2 | Nurse.cognitoSub validation | 🔴 P1 | 3h | Medium |
| 1.3 | AuditLog write verification | 🔴 P1 | 30m | Low |
| 2.1 | Subscription authorization | 🟡 P2 | 2h | High |
| 2.2 | Family access security | 🟡 P2 | 4h | Medium |
| 2.3 | Tenant isolation audit | 🟡 P2 | 1h | Medium |
| 3.1 | Lambda resource files | 🟠 P3 | 2h | Medium |
| 3.2 | rips-validator AI | 🟠 P3 | 4h | Low |
| 4.1 | GSI creation | 🔵 P4 | 3h | Medium |
| 4.2 | BillingRecord schema | 🔵 P4 | 2h | Low |
| 4.3 | Patient-Nurse relation | 🔵 P4 | 1h | Low |
| 5.1 | Subscription handlers | 🟣 P5 | 2h | Low |
| 5.2 | Push notifications | 🟣 P5 | 8h | Low |
| 6.1 | Demo mode cleanup | 🔘 P6 | 4h | Medium |
| 6.2 | Lambda unit tests | 🔘 P6 | 8h | Low |
| 6.3 | Environment variables | 🔘 P6 | 2h | Low |

---

## Quick Start for Kiro IDE

```bash
# 1. Navigate to ERP project
cd ~/projects/ERP

# 2. Start with P1 issue - fix InventoryDashboard authorization
code amplify/data/resource.ts

# 3. Look for InventoryItem model and update authorization rules

# 4. Deploy to test
npx ampx sandbox

# 5. Test with real Cognito user (not MOCK_USER)
```

---

**Next Review**: After completing P1 and P2 tasks
**Contact**: Coordinate with Clawd (audits) and Antigravity (frontend)
