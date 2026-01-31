# IPS-ERP Authorization Model

> **Security Architecture Document v1.0**  
> Created: 2025-01-28  
> Status: **P0 SECURITY INCIDENT - IMMEDIATE ACTION REQUIRED**

## Executive Summary

**Critical Finding:** The IPS-ERP application has **NO FRONTEND ROUTE GUARDS**. Any authenticated user (or demo user) can access any route by manipulating session storage or navigating directly. The backend has partial protections but is inconsistently applied.

### Vulnerability Status

| Component | Status | Severity |
|-----------|--------|----------|
| Frontend Route Guards | ❌ **MISSING** | P0 - Critical |
| GraphQL Mutations | ⚠️ Partially Protected | P1 - High |
| Model-Level Auth | ✅ Tenant Isolation Works | - |
| Lambda Role Checks | ✅ Admin-only works | - |
| Demo Mode Bypass | ❌ **VULNERABLE** | P0 - Critical |

---

## 1. Route → Role Mapping (Source of Truth)

### Required Authorization by Route

| Route | Required Role(s) | Current Status | Action |
|-------|-----------------|----------------|--------|
| `/` | PUBLIC | ✅ Works | None |
| `/login` | PUBLIC | ✅ Works | None |
| `/dashboard` | `admin`, `superadmin` | ❌ **NO GUARD** | Implement guard |
| `/admin` | `admin`, `superadmin` | ❌ **NO GUARD** | Implement guard |
| `/nurse`, `/app` | `nurse` | ❌ **NO GUARD** | Implement guard |
| `/family` | `family` | ❌ **NO GUARD** | Implement guard |

### Role Hierarchy

```
superadmin (platform-wide)
    └── admin (tenant-scoped)
         ├── nurse (tenant-scoped, assigned shifts only)
         └── family (tenant-scoped, read-only, linked patients only)
```

### Role Capabilities Matrix

| Capability | SuperAdmin | Admin | Nurse | Family |
|------------|:----------:|:-----:|:-----:|:------:|
| View Admin Dashboard | ✅ | ✅ | ❌ | ❌ |
| Approve/Reject Visits | ✅ | ✅ | ❌ | ❌ |
| View Audit Logs | ✅ | ✅ | ❌ | ❌ |
| Manage Staff | ✅ | ✅ | ❌ | ❌ |
| Manage Patients | ✅ | ✅ | ❌ | ❌ |
| View Nurse App | ❌ | ❌ | ✅ | ❌ |
| Document Visits | ❌ | ❌ | ✅ | ❌ |
| Record Vitals | ❌ | ❌ | ✅ | ❌ |
| View Family Portal | ❌ | ❌ | ❌ | ✅ |
| View Visit Summaries | ❌ | ❌ | ❌ | ✅ |

---

## 2. Role Sources (Priority Order)

### Production Mode (Real Cognito)

1. **JWT Token `cognito:groups` claim** (PRIMARY - USE THIS)
   - Location: `session.tokens?.accessToken?.payload['cognito:groups']`
   - Values: `['SuperAdmin']`, `['Admin']`, `['Nurse']`, `['Family']`
   - Code: `src/hooks/useAuth.ts:resolveRoleFromGroups()`

2. **Cognito User Groups** (Managed in AWS Console)
   - Groups defined in `amplify/auth/resource.ts`:
     - `SuperAdmin` - Platform administrators
     - `Admin` - IPS business owners
     - `Nurse` - Healthcare workers
     - `Family` - Patient family members

3. **User Attributes** (Secondary)
   - `custom:tenantId` - Tenant isolation (NOT for role)
   - `sub` - User ID

### Demo Mode (Mock Auth)

Currently uses session storage (VULNERABLE):
- `sessionStorage['ips-erp-demo-role']` 
- Can be manipulated by any user

**FIX REQUIRED:** Demo mode should still enforce route guards based on selected demo role.

---

## 3. Guard Rules

### Where Guards MUST Be Enforced

#### Layer 1: Route Entry (Frontend)

**File:** `src/App.tsx` (NEW: `src/components/guards/RouteGuard.tsx`)

```tsx
// REQUIRED IMPLEMENTATION
interface RouteGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: 'redirect' | '403';
}

// Guard should check:
// 1. Is user authenticated? (role !== null)
// 2. Does user.role match allowedRoles?
// 3. If not, redirect to / or show 403
```

**Locations to add guards:**

| Location | Guard Configuration |
|----------|-------------------|
| Before rendering `AdminDashboard` | `allowedRoles: ['admin', 'superadmin']` |
| Before rendering `SimpleNurseApp` | `allowedRoles: ['nurse']` |
| Before rendering `FamilyPortal` | `allowedRoles: ['family']` |
| On URL deep-link handling | Check role BEFORE enabling demo mode |

#### Layer 2: Component Mount

Each protected component should validate role on mount:

**Files to update:**
- `src/components/AdminDashboard.tsx`
- `src/components/SimpleNurseApp.tsx`
- `src/components/FamilyPortal.tsx`

```tsx
// Add to each protected component
useEffect(() => {
  if (!role || !ALLOWED_ROLES.includes(role)) {
    // Log security event
    console.warn(`Unauthorized access attempt: role=${role}`);
    // Redirect to landing
    window.location.href = '/';
  }
}, [role]);
```

#### Layer 3: API (GraphQL Resolvers)

**File:** `amplify/data/resource.ts`

Current state of mutations:

| Mutation | Current Auth | Required Auth | Status |
|----------|-------------|---------------|--------|
| `createVisitDraftFromShift` | `allow.authenticated()` | `allow.groups(['NURSE'])` | ⚠️ Fix needed |
| `submitVisit` | `allow.authenticated()` | `allow.groups(['NURSE'])` | ⚠️ Fix needed |
| `approveVisit` | `allow.authenticated()` | `allow.groups(['ADMIN'])` | ⚠️ Fix needed* |
| `rejectVisit` | `allow.authenticated()` | `allow.groups(['ADMIN'])` | ⚠️ Fix needed* |
| `validateRIPS` | `allow.authenticated()` | `allow.groups(['ADMIN'])` | ⚠️ Fix needed |
| `glosaDefender` | `allow.authenticated()` | `allow.groups(['ADMIN'])` | ⚠️ Fix needed |
| `rosterArchitect` | `allow.authenticated()` | `allow.groups(['ADMIN'])` | ⚠️ Fix needed |
| `verifyFamilyAccess` | `allow.authenticated()` | `allow.groups(['FAMILY'])` | ⚠️ Fix needed |

*Note: Lambda handlers do check admin role, but GraphQL layer should also enforce.

#### Layer 4: Lambda Functions (Defense in Depth)

**Status:** ✅ Properly implemented for admin-only functions

Files with correct role checks:
- `amplify/functions/approve-visit/handler.ts` - Checks `nurse.role !== 'ADMIN'`
- `amplify/functions/reject-visit/handler.ts` - Checks `nurse.role !== 'ADMIN'`

**Issue:** These check `Nurse.role` field in DynamoDB, not JWT `cognito:groups`. Should use JWT for consistency.

### Unauthorized Behavior

| Scenario | Action | Redirect Target |
|----------|--------|-----------------|
| Unauthenticated user accesses protected route | Redirect | `/` (landing) |
| Authenticated user accesses unauthorized route | Redirect | Role-appropriate home |
| Expired token | Re-authenticate | `/login` |
| Missing role claim | Log out + redirect | `/` |
| Demo mode with wrong role | Show correct demo portal | Role-appropriate demo view |

---

## 4. Backend Authorization Details

### Model-Level Authorization

**Tenant Isolation Pattern** (Correctly Implemented):

```typescript
// All tenant-scoped models use this pattern:
.authorization(allow => [
  allow.ownerDefinedIn('tenantId').identityClaim('custom:tenantId')
])
```

**Models with proper group-based auth:**

| Model | ADMIN | NURSE | FAMILY |
|-------|:-----:|:-----:|:------:|
| Shift | CRUD + subscribe | read, list, subscribe | - |
| InventoryItem | CRUD | read, list | - |
| BillingRecord | CRUD | - | - |
| PatientAssessment | CRUD | create, read, list | read, list |
| Notification | CRUD + subscribe | CRUD + subscribe | - |

**Models needing auth review:**

| Model | Current | Issue |
|-------|---------|-------|
| Tenant | `allow.authenticated()` | Too permissive |
| Visit | `allow.authenticated()` | Should restrict to assigned nurse + admin |
| AuditLog | `allow.authenticated()` | Should be admin-only read |

### API Endpoints Returning Admin Data

| Endpoint/Query | Data Type | Current Protection | Required |
|----------------|-----------|-------------------|----------|
| `listBillingRecords` | Financial | Tenant only | Add `ADMIN` group |
| `listAuditLogs` | Audit trail | Tenant only | Add `ADMIN` group |
| `listStaffs` | Staff PII | Tenant only | Add `ADMIN` group |
| `listPatients` | Patient PII | Tenant only | Keep (nurse needs) |
| `listNotifications` | User-specific | Group-based | ✅ OK |

---

## 5. Storage Key Scoping

### Session Storage Keys

| Key | Purpose | Security Concern |
|-----|---------|------------------|
| `ips-erp-demo-mode` | Demo mode flag | Can enable demo bypass |
| `ips-erp-demo-role` | Demo role selection | **VULNERABLE** - Can be set to any role |
| `ips-erp-demo-tenant` | Demo tenant context | Minor - data scoping |
| `ips-demo-tour-completed` | Onboarding state | None |

**FIX:** Demo role should only enable demonstration data, NOT grant actual access to protected functionality.

### Amplify/Cognito Storage

| Key Pattern | Purpose | Notes |
|-------------|---------|-------|
| `CognitoIdentityServiceProvider.*` | Cognito tokens | Managed by Amplify |
| `amplify-*` | Amplify cache | Managed by Amplify |

---

## 6. Code Locations Requiring Guards

### Frontend (React)

| File | Line(s) | Issue | Fix |
|------|---------|-------|-----|
| `src/App.tsx` | 147-150 | Renders AdminDashboard without guard | Wrap with RouteGuard |
| `src/App.tsx` | 145 | Renders SimpleNurseApp without guard | Wrap with RouteGuard |
| `src/App.tsx` | 146 | Renders FamilyPortal without guard | Wrap with RouteGuard |
| `src/App.tsx` | 82-117 | Deep link handling sets role without validation | Validate before set |

### Backend (Amplify)

| File | Line(s) | Issue | Fix |
|------|---------|-------|-----|
| `amplify/data/resource.ts` | ~495-530 | Mutations use `allow.authenticated()` | Change to `allow.groups([...])` |
| `amplify/data/resource.ts` | ~185 | Tenant model too permissive | Add admin group requirement |

---

## 7. JWT Claims Reference

### Access Token Payload Structure

```json
{
  "sub": "user-uuid-here",
  "cognito:groups": ["Admin"],
  "iss": "https://cognito-idp.{region}.amazonaws.com/{poolId}",
  "client_id": "app-client-id",
  "origin_jti": "...",
  "event_id": "...",
  "token_use": "access",
  "scope": "aws.cognito.signin.user.admin",
  "auth_time": 1706400000,
  "exp": 1706403600,
  "iat": 1706400000,
  "jti": "...",
  "username": "user@example.com"
}
```

### ID Token Custom Claims

```json
{
  "custom:tenantId": "tenant-uuid-here",
  "email": "user@example.com",
  "email_verified": true,
  "cognito:groups": ["Admin"],
  "cognito:username": "user@example.com"
}
```

### Extracting Claims in Frontend

```typescript
// In useAuth.ts - CORRECT approach
const session = await fetchAuthSession();
const groups = session.tokens?.accessToken?.payload['cognito:groups'] as string[] || [];
const tenantId = attributes['custom:tenantId'];
```

### Extracting Claims in Lambda

```typescript
// In Lambda handlers - CORRECT approach
const identity = event.identity as { 
  sub: string; 
  claims: Record<string, string>;
  groups?: string[];
};
const groups = identity.groups || [];
const tenantId = identity.claims?.['custom:tenantId'];
```

---

## 8. Recommended Implementation Approach

### Phase 1: Immediate (P0 - This Sprint)

1. **Create RouteGuard Component**
   ```
   src/components/guards/RouteGuard.tsx
   src/components/guards/index.ts
   ```

2. **Wrap Protected Components in App.tsx**
   ```tsx
   <RouteGuard allowedRoles={['admin', 'superadmin']}>
     <AdminDashboard ... />
   </RouteGuard>
   ```

3. **Fix Deep Link Role Setting**
   - Validate that URL path matches expected role
   - Don't auto-set role based on URL in demo mode

### Phase 2: High Priority (P1 - Next Sprint)

1. **Update GraphQL Mutation Auth**
   - Change `allow.authenticated()` to `allow.groups([...])` for all mutations

2. **Add Component-Level Guards**
   - Secondary defense in each protected component

3. **Audit Log Security Events**
   - Log all unauthorized access attempts

### Phase 3: Hardening (P2 - Future)

1. **Lambda JWT Group Validation**
   - Use `cognito:groups` from JWT instead of DB lookup

2. **Demo Mode Security**
   - Demo mode shows mock data only, never grants real access

3. **Rate Limiting**
   - Implement rate limits on sensitive endpoints

---

## 9. Testing Checklist

### Manual Security Tests

- [ ] Nurse user navigates to `/dashboard` → Should redirect to `/nurse`
- [ ] Family user navigates to `/admin` → Should redirect to `/family`
- [ ] Unauthenticated user navigates to `/dashboard` → Should redirect to `/`
- [ ] Demo admin tries to approve real visit → Should fail
- [ ] Manipulate `sessionStorage['ips-erp-demo-role']` → Should not grant access

### Automated Tests Required

```typescript
// tests/security/route-guards.test.ts
describe('Route Guards', () => {
  it('redirects nurse from admin routes');
  it('redirects family from nurse routes');
  it('allows admin to access dashboard');
  it('prevents session storage manipulation attacks');
});
```

---

## 10. Appendix: Current Vulnerability Reproduction

### Steps to Reproduce P0-2 (RBAC Broken)

1. Open https://main.d2wwgecog8smmr.amplifyapp.com
2. Click "Ver Demo"
3. Select "Nurse Portal"
4. Open browser DevTools → Application → Session Storage
5. Change `ips-erp-demo-role` from `nurse` to `admin`
6. Refresh page
7. **RESULT:** Nurse now sees Admin Dashboard

### Alternative Attack Vector

1. Navigate directly to https://main.d2wwgecog8smmr.amplifyapp.com/dashboard
2. **RESULT:** Demo mode auto-enables, admin role auto-sets
3. No validation that user should have admin access

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-28 | Security Architect Agent | Initial creation |

**Next Review:** After Route Guard Engineer completes implementation
