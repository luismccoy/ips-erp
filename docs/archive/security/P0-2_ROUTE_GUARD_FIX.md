# P0-2 Security Fix: Route Guard Implementation

**Status:** ✅ FIXED  
**Severity:** P0 (Critical)  
**Date:** 2026-01-27  
**Engineer:** Route Guard Engineer (Subagent)

## Vulnerability Summary

**CVE:** Unauthorized Role Escalation via URL Navigation

**Impact:**
- Any authenticated user could access admin dashboard by navigating to `/dashboard`
- Nurses could view admin data and controls
- Family members could access nurse/admin portals
- No role verification before rendering protected components

## Root Cause

In `App.tsx` (lines 87-96, original code):

```typescript
// VULNERABLE CODE - DO NOT RESTORE
if (path === '/dashboard' || path === '/admin') {
  if (role !== 'admin') {
    setDemoState('admin', TENANTS[0]);  // ⚠️ AUTOMATIC ROLE PROMOTION!
    return;
  }
}
```

**The app trusted the URL path to determine user role instead of enforcing role-based access control.**

When a nurse navigated to `/dashboard`, the app would automatically promote them to admin by calling `setDemoState('admin', TENANTS[0])` without any verification of their actual credentials.

## Fix Implementation

### 1. Route Permissions Matrix

Created `ROUTE_PERMISSIONS` in `src/constants/navigation.ts`:

```typescript
export const ROUTE_PERMISSIONS = {
  '/': ['*'], // Public
  '/login': ['*'], // Public
  '/dashboard': ['admin', 'superadmin'],
  '/admin': ['admin', 'superadmin'],
  '/nurse': ['nurse'],
  '/app': ['nurse'],
  '/family': ['family'],
} as const;
```

### 2. RouteGuard Component

Created `src/components/RouteGuard.tsx`:

**Features:**
- Blocks rendering of protected components until auth check passes
- Shows "Access Denied" screen for unauthorized access
- Logs security events via analytics
- Redirects users to their appropriate portal
- Prevents data fetching for unauthorized routes

**Usage:**
```typescript
<RouteGuard 
  userRole={role} 
  currentPath={window.location.pathname}
  onUnauthorized={handleUnauthorized}
>
  <AdminDashboard onLogout={handleLogout} tenant={tenant} />
</RouteGuard>
```

### 3. App.tsx Changes

**Removed:**
- Automatic role promotion on deep link navigation
- URL-based role assignment

**Added:**
- RouteGuard wrapping for all protected components (AdminDashboard, SimpleNurseApp, FamilyPortal)
- Unauthorized access handler that redirects to appropriate portal
- Security logging for access attempts

**Deep Link Handling (Fixed):**
```typescript
// Before: Automatic role promotion
if (path === '/dashboard') {
  setDemoState('admin', TENANTS[0]); // VULNERABLE!
}

// After: Prompt demo selection, then RouteGuard validates
if (isDemoMode() && !role && path === '/dashboard') {
  setAuthStage('demo'); // Show demo selection screen
  // User selects role → RouteGuard validates access
}
```

### 4. Helper Functions

Added to `src/constants/navigation.ts`:

- `isAuthorizedForRoute(pathname, userRole)` - Checks if user can access route
- `getDefaultRouteForRole(userRole)` - Returns home route for role
- Secure by default: Unknown routes are denied

## Security Guarantees

✅ **No component rendering before auth check**
- RouteGuard blocks render until authorization passes

✅ **No data fetching for unauthorized users**
- Protected components never mount if user lacks permission

✅ **All entry points protected:**
- Initial page load
- Deep link navigation
- Browser refresh
- Back/forward navigation
- Manual URL changes

✅ **Security event logging**
- All unauthorized access attempts tracked via analytics

✅ **Graceful user experience**
- Clear "Access Denied" screen
- Automatic redirect to user's appropriate portal

## Verification Testing

### Test Cases (All Passing ✅)

1. **Nurse accessing admin dashboard:**
   ```
   Login as: nurse@ips.com
   Navigate to: /dashboard
   Expected: Access Denied screen → Redirect to /app
   Result: ✅ BLOCKED
   ```

2. **Admin accessing admin dashboard:**
   ```
   Login as: admin@ips.com
   Navigate to: /dashboard
   Expected: Admin dashboard loads
   Result: ✅ ALLOWED
   ```

3. **Family accessing nurse portal:**
   ```
   Login as: family@ips.com
   Navigate to: /nurse
   Expected: Access Denied screen → Redirect to /family
   Result: ✅ BLOCKED
   ```

4. **Deep link to protected route (no auth):**
   ```
   Visit: https://app.com/dashboard (not logged in)
   Expected: Demo selection screen (if demo mode) or login
   Result: ✅ BLOCKED
   ```

5. **Page refresh on protected route:**
   ```
   Login as: nurse@ips.com
   Navigate to: /app (allowed)
   Then navigate to: /dashboard (via URL)
   Refresh page
   Expected: Access Denied on refresh
   Result: ✅ BLOCKED
   ```

6. **No admin data visible to nurse:**
   ```
   Login as: nurse@ips.com
   Navigate to: /dashboard
   Expected: No API calls to admin endpoints, no admin data rendered
   Result: ✅ PREVENTED (component never mounts)
   ```

## Files Modified

1. **src/constants/navigation.ts**
   - Added `ROUTE_PERMISSIONS` matrix
   - Added `isAuthorizedForRoute()` function
   - Added `getDefaultRouteForRole()` function

2. **src/components/RouteGuard.tsx** (NEW FILE)
   - RouteGuard component
   - UnauthorizedScreen component
   - Security event tracking

3. **src/App.tsx**
   - Imported RouteGuard and helper functions
   - Removed automatic role promotion from deep link handling
   - Wrapped AdminDashboard, SimpleNurseApp, FamilyPortal with RouteGuard
   - Added handleUnauthorized callback

## Deployment Coordination

⚠️ **DO NOT DEPLOY INDEPENDENTLY**

This fix is part of a coordinated security release:
- **P0-1:** Logout session cleanup (DONE)
- **P0-2:** Route guard RBAC (THIS FIX)
- **P0-3:** [Other security fixes if applicable]

**Deployment Checklist:**
- [ ] Code review by Security Architect
- [ ] Verify AUTHZ_MODEL.md exists (or use reasonable defaults implemented here)
- [ ] Test all user role combinations
- [ ] Coordinate with Logout Fixer for combined deployment
- [ ] Update CHANGELOG.md
- [ ] Tag release with security advisory

## Additional Security Considerations

### API-Level Authorization

While this fix prevents UI access, **backend API authorization is still required**:

1. All GraphQL resolvers must verify user role from JWT token
2. Lambda authorizers should enforce same RBAC rules
3. DynamoDB access patterns should use tenant isolation

**Backend verification prevents:**
- Direct API calls bypassing UI
- Token manipulation
- Privilege escalation via API

### Future Enhancements

Consider implementing:
1. **Permission-based access** (granular actions, not just roles)
2. **Audit trail** for all route access (compliant with HIPAA/SOC2)
3. **Rate limiting** for unauthorized access attempts
4. **Session timeout** for idle users
5. **2FA requirement** for admin routes

## References

- **RBAC Standard:** NIST SP 800-53 AC-3 (Access Enforcement)
- **Healthcare Compliance:** HIPAA Security Rule § 164.312(a)(1)
- **Related Fixes:** P0-1 (Logout Cleanup)
- **Code Location:** `~/projects/ERP/src/`

---

**Engineer Notes:**

This was a critical vulnerability that could have resulted in:
- HIPAA violations (unauthorized PHI access)
- Data breach (nurse accessing admin financial data)
- Compliance failures (audit showing unauthorized access)

The fix implements defense-in-depth:
1. **Prevention:** RouteGuard blocks unauthorized access
2. **Detection:** Analytics tracking logs all attempts
3. **Recovery:** Automatic redirect to appropriate portal

All test cases verified manually and via code review.

**Status:** Ready for Security Architect review and deployment coordination.
