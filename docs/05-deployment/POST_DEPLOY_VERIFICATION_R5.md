# Post-Deployment Verification Report R5
**Date:** 2026-01-28  
**Deployment Time:** ~05:23 UTC  
**Commits Tested:**
- 28220fa - Auditoría Clínica sidebar fix
- 7cfd525 - Subscription permissions fix

**Test Environment:** https://main.d2wwgecog8smmr.amplifyapp.com  
**Test User:** admin@ips.com

---

## Test Results Summary

| Test | Status | Details |
|------|--------|---------|
| **A: Auditoría Clínica Navigation** | ✅ PASS | Fixed - no redirect to Panel Principal |
| **B: Direct URL Navigation** | ✅ PASS | Both /dashboard and /app work correctly |
| **C: Portal Selector** | ⚠️ UNABLE TO LOCATE | Selector not found in UI |
| **D: Subscription Errors** | ❌ FAIL | Errors still present in console |

---

## Detailed Test Results

### Test A: Auditoría Clínica Navigation ✅ PASS

**Test Steps:**
1. Logged in as admin@ips.com
2. Clicked "Auditoría Clínica" in sidebar
3. Verified view displayed

**Result:** SUCCESS
- Sidebar button marked as [active]
- Main heading shows "Auditoría Clínica" (not "Resumen General")
- Dedicated Auditoría Clínica view displayed with "Sin registros" message
- **No redirect to Panel Principal** ✅

**Fix Confirmed:** Commit 28220fa successfully resolved the navigation issue.

---

### Test B: Direct URL Navigation ✅ PASS

#### Part 1: /dashboard
- **URL:** https://main.d2wwgecog8smmr.amplifyapp.com/dashboard
- **Result:** Correctly displays admin dashboard
- **Heading:** "Resumen General"
- **Content:** Shows patient stats, alerts, system status

#### Part 2: /app
- **URL:** https://main.d2wwgecog8smmr.amplifyapp.com/app
- **Result:** Correctly displays nurse app view
- **Title:** "IPS ERP - Enfermería"
- **Content:** Shows "Mi Ruta", patient visits, shift schedule

**Both direct navigation routes work as expected.** ✅

---

### Test C: Portal Selector ⚠️ UNABLE TO LOCATE

**Test Steps:**
1. Searched admin dashboard for "Portal Administrativo" selector
2. Checked header/navigation areas
3. Searched nurse app view for portal switcher

**Result:** NOT FOUND
- No visible "Portal Administrativo" selector in admin dashboard UI
- No portal switcher control found in nurse app UI
- No dropdown or toggle for switching between portals

**Note:** This feature may not be implemented yet, or may be accessible through a different mechanism not discovered during testing.

---

### Test D: Browser Console - Subscription Errors ❌ FAIL

**Expected:** No subscription errors after permissions fix (commit 7cfd525)

**Actual:** Subscription errors STILL PRESENT

#### Error 1: Notifications Subscription
```
Error in notifications subscription: {
  "path": ["listNotifications"],
  "data": null,
  "errorType": "Unauthorized",
  "errorInfo": null,
  "message": "Not Authorized to access listNotifications on type Query"
}
```
**Source:** `NotificationBell-CdNbcBKw.js:2791`  
**Timestamp:** 2026-01-28T05:23:49.381Z

#### Error 2: Shift Update Subscription
```
Shift update sub failed
```
**Source:** `AdminDashboard-BVQUXlON.js:7128`  
**Timestamp:** 2026-01-28T05:23:49.396Z

**Analysis:**
The subscription permissions fix (commit 7cfd525) did NOT resolve the subscription errors. The admin user still receives "Not Authorized" errors when attempting to access:
1. `listNotifications` query
2. Shift update subscriptions

---

## Additional Findings

### Other Console Errors

**Inventory Status Transformation Errors** (15+ instances):
```
Error transforming inventory status: Error: Invalid GraphQL inventory status: "in-stock". 
Valid values: IN_STOCK, LOW_STOCK, OUT_OF_STOCK
```
**Note:** These are unrelated to the tested fixes but indicate a data format inconsistency issue that should be addressed.

**Manifest Error:**
```
Manifest: Line: 1, column: 1, Syntax error.
```
**Note:** Minor PWA manifest issue, does not affect functionality.

---

## Recommendations

### Critical (Blocking)
1. **Fix Subscription Permissions** - Commit 7cfd525 did not resolve the issue
   - Review IAM policy for `listNotifications` query
   - Check GraphQL schema authorization rules
   - Verify admin role has access to notification subscriptions
   - Test with updated permissions and re-deploy

### Medium Priority
2. **Inventory Status Data** - Fix GraphQL enum mismatches
   - Update demo data to use uppercase enums (IN_STOCK, LOW_STOCK, OUT_OF_STOCK)
   - Or update transformation logic to handle lowercase variants

3. **Portal Selector Investigation** - Clarify expected behavior
   - Document if portal selector is implemented
   - If not implemented, create ticket for feature
   - If implemented, document how to access it

### Low Priority
4. **PWA Manifest** - Fix manifest.webmanifest syntax error

---

## Next Steps

1. **Investigate subscription permissions** - Commit 7cfd525 was expected to fix this but didn't
2. **Check amplify/backend/api permissions** for `listNotifications` and shift subscriptions
3. **Verify admin user group** has necessary IAM policies attached
4. **Re-deploy after permissions fix** and re-test
5. **Update this document** with R6 results after next deployment

---

## Environment Info
- **Browser:** Chrome (Chromium)
- **Test Session:** 2026-01-28 05:23-05:25 UTC
- **Network:** Stable connection
- **Auth:** Email/password (admin@ips.com)

---

**Report Generated:** 2026-01-28T05:26:00Z  
**Agent:** Subagent (post-deploy-verify)  
**Status:** 2/4 tests passed, 1 failed, 1 unable to locate

---

## Visual Evidence

### Admin Dashboard (Resumen General)
![Admin Dashboard](/.clawdbot/media/browser/51dfc162-2268-446c-85f3-2a8e7eb05578.png)

*Screenshot shows successful admin dashboard load with no data (0 patients, 0 turnos, 0 alerts)*
