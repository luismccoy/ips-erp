# Pre-Deploy Security Test Checklist

**Version:** 1.0  
**Last Updated:** 2026-01-29  
**Status:** CRITICAL - P0 Security Incident Response  

---

## Overview

This checklist verifies authorization (AuthZ) and logout security fixes before deployment to production. All tests must pass before releasing code that touches authentication or routing.

**Test Environment:**
- [ ] Demo Mode (client-side simulation)
- [ ] Production Backend (real AWS Cognito + DynamoDB)

---

## 🚨 CRITICAL: Logout Tests

### LC-01: Storage Cleanup

**Goal:** Verify logout completely clears all authentication state.

**Steps:**
1. Login as Admin (demo or real)
2. Open DevTools → Application → Storage
3. Note all `ips-erp-*` sessionStorage keys
4. Click Logout button
5. Refresh Application → Storage tab

**Expected:**
- [ ] `ips-erp-demo-mode` is removed
- [ ] `ips-erp-demo-role` is removed
- [ ] `ips-erp-demo-tenant` is removed
- [ ] No residual auth tokens in localStorage
- [ ] No residual auth tokens in sessionStorage

**FAIL If:** Any auth-related key remains after logout

---

### LC-02: Route Protection After Logout

**Goal:** Verify protected routes are inaccessible after logout.

**Steps:**
1. Login as Admin
2. Navigate to `/dashboard` → Verify access granted
3. Click Logout
4. Manually navigate to `/dashboard` in URL bar

**Expected:**
- [ ] Redirected to landing/login page
- [ ] Dashboard does NOT render
- [ ] No patient data visible

**FAIL If:** Dashboard loads or any protected content shows

---

### LC-03: Back Button Security

**Goal:** Verify back button doesn't restore logged-out session.

**Steps:**
1. Login as Nurse
2. Navigate to `/nurse` → See patient list
3. Click Logout → Return to landing page
4. Click browser **Back** button

**Expected:**
- [ ] Landing page remains visible OR login prompt appears
- [ ] Patient list does NOT re-appear
- [ ] No cached data restored

**FAIL If:** Nurse app restores with data after logout

---

### LC-04: Refresh After Logout

**Goal:** Verify page refresh maintains logged-out state.

**Steps:**
1. Login as Family
2. Access `/family` portal
3. Click Logout
4. Press F5 or Cmd+R to refresh page

**Expected:**
- [ ] Landing page loads
- [ ] Login/demo selection shown
- [ ] Family portal does NOT auto-load

**FAIL If:** Family portal loads after refresh

---

### LC-05: Tab Persistence

**Goal:** Verify logout affects all tabs (if multi-tab support exists).

**Steps:**
1. Login as Admin in Tab A
2. Open new Tab B → Navigate to app
3. In Tab A, click Logout
4. Switch to Tab B

**Expected:**
- [ ] Tab B detects logout (via storage event listener)
- [ ] Tab B redirects to login/landing
- [ ] No admin content remains in Tab B

**FAIL If:** Tab B remains logged in

---

## 🔒 Role-Based Access Control (RBAC) Tests

### RC-01: Admin Dashboard Access

**Goal:** Verify only admins can access admin dashboard.

| Role | Action | Expected Result |
|------|--------|----------------|
| **Admin** | Navigate to `/dashboard` | ✅ Access granted |
| **Nurse** | Navigate to `/dashboard` | ❌ Blocked → Redirected to `/nurse` |
| **Family** | Navigate to `/dashboard` | ❌ Blocked → Redirected to `/family` |
| **Anonymous** | Navigate to `/dashboard` | ❌ Blocked → Redirected to login |

**Test Steps:**
1. Logout completely
2. Login as each role above
3. Attempt to access `/dashboard`
4. Record result

**Pass Criteria:**
- [ ] Admin sees dashboard
- [ ] Nurse is blocked
- [ ] Family is blocked
- [ ] Anonymous is blocked

---

### RC-02: Nurse App Access

**Goal:** Verify only nurses can access nurse application.

| Role | Action | Expected Result |
|------|--------|----------------|
| **Admin** | Navigate to `/nurse` | ❌ Blocked → Redirected to `/dashboard` |
| **Nurse** | Navigate to `/nurse` | ✅ Access granted |
| **Family** | Navigate to `/nurse` | ❌ Blocked → Redirected to `/family` |
| **Anonymous** | Navigate to `/nurse` | ❌ Blocked → Redirected to login |

**Test Steps:**
1. Logout completely
2. Login as each role above
3. Attempt to access `/nurse`
4. Record result

**Pass Criteria:**
- [ ] Admin is redirected to own portal
- [ ] Nurse sees nurse app
- [ ] Family is blocked
- [ ] Anonymous is blocked

---

### RC-03: Family Portal Access

**Goal:** Verify only family members can access family portal.

| Role | Action | Expected Result |
|------|--------|----------------|
| **Admin** | Navigate to `/family` | ❌ Blocked → Redirected to `/dashboard` |
| **Nurse** | Navigate to `/family` | ❌ Blocked → Redirected to `/nurse` |
| **Family** | Navigate to `/family` | ✅ Access granted |
| **Anonymous** | Navigate to `/family` | ❌ Blocked → Redirected to login |

**Test Steps:**
1. Logout completely
2. Login as each role above
3. Attempt to access `/family`
4. Record result

**Pass Criteria:**
- [ ] Admin is redirected to own portal
- [ ] Nurse is redirected to own portal
- [ ] Family sees family portal
- [ ] Anonymous is blocked

---

## 🔗 Deep Link Security Tests

### DL-01: Unauthenticated Deep Link

**Goal:** Verify deep links require authentication.

**Test URLs:**
- `/dashboard`
- `/nurse`
- `/family`
- `/app`
- `/admin`

**Steps:**
1. Open **private/incognito** browser window
2. Clear all storage (DevTools → Application → Clear storage)
3. Paste test URL directly in address bar
4. Press Enter

**Expected (Demo Mode):**
- [ ] URL triggers demo mode activation
- [ ] User is prompted to select demo role OR auto-logged into appropriate role
- [ ] Protected content loads ONLY after demo auth

**Expected (Production Mode):**
- [ ] Redirected to login page
- [ ] Protected content does NOT load
- [ ] After login, user can access if authorized

**FAIL If:** Protected content loads before authentication

---

### DL-02: Cross-Role Deep Link

**Goal:** Verify deep link respects current user role.

**Steps:**
1. Login as **Nurse**
2. Copy URL: `http://localhost/dashboard`
3. Paste in address bar and press Enter

**Expected:**
- [ ] Request to `/dashboard` is blocked
- [ ] Nurse redirected to `/nurse` (own portal)
- [ ] Dashboard does NOT load

**Repeat for:**
- [ ] Family → `/dashboard` (blocked)
- [ ] Family → `/nurse` (blocked)
- [ ] Nurse → `/family` (blocked)

---

### DL-03: Refresh on Protected Route

**Goal:** Verify page refresh maintains auth state correctly.

**Steps:**
1. Login as **Nurse**
2. Navigate to `/nurse`
3. See patient list load
4. Press F5 (page refresh)

**Expected:**
- [ ] Nurse app reloads successfully
- [ ] Patient list remains visible
- [ ] No logout occurs

**Now test negative case:**
1. Logout (stay on page if possible)
2. Press F5 (page refresh)

**Expected:**
- [ ] User is logged out
- [ ] Landing/login page loads
- [ ] Patient data NOT visible

---

## 🎭 Demo Mode Specific Tests

### DM-01: Demo State Persistence

**Goal:** Verify demo mode survives page refresh.

**Steps:**
1. Select "Try Demo" → Choose Nurse
2. See nurse app load
3. Press F5 to refresh
4. Observe behavior

**Expected:**
- [ ] Nurse app reloads (demo state persists)
- [ ] Mock data still loads
- [ ] No real backend calls

---

### DM-02: Demo State Clearing

**Goal:** Verify navigating to landing clears demo state.

**Steps:**
1. Select "Try Demo" → Choose Admin
2. See dashboard load
3. Navigate to `/` (root path)
4. Observe storage in DevTools

**Expected:**
- [ ] `ips-erp-demo-mode` cleared
- [ ] `ips-erp-demo-role` cleared
- [ ] Landing page shows (not auto-logged in)

---

## 🧪 Production Backend Tests

### PB-01: Real Cognito Logout

**Goal:** Verify AWS Amplify signOut is called.

**Prerequisites:** Real AWS backend configured

**Steps:**
1. Login with real Cognito credentials
2. Open DevTools → Network tab
3. Click Logout
4. Check Network requests

**Expected:**
- [ ] `signOut` API call to AWS Cognito
- [ ] JWT tokens cleared
- [ ] Session terminated server-side

---

### PB-02: JWT Token Validation

**Goal:** Verify role comes from JWT, not client storage.

**Prerequisites:** Real AWS backend configured

**Steps:**
1. Login as Nurse (real Cognito)
2. Open DevTools → Application → Storage
3. Manually change `ips-erp-demo-role` to `admin`
4. Refresh page

**Expected:**
- [ ] Role remains **Nurse** (from JWT)
- [ ] Client storage ignored for role resolution
- [ ] Dashboard still blocked

**FAIL If:** Changing storage grants admin access

---

### PB-03: Token Refresh

**Goal:** Verify session refreshes without logout.

**Prerequisites:** Real AWS backend configured

**Steps:**
1. Login as Admin
2. Wait 10+ minutes (token refresh interval)
3. Perform an action (e.g., navigate pages)
4. Check DevTools → Console for token refresh events

**Expected:**
- [ ] Token refreshes automatically
- [ ] No logout occurs
- [ ] User remains authenticated

---

## 🚀 Pre-Deployment Checklist

**Before merging to main:**

### Automated Tests
- [ ] All Vitest tests pass: `npm run test:run`
- [ ] `useAuth.test.ts` - 100% pass
- [ ] `App.test.tsx` - 100% pass
- [ ] Coverage > 80% for auth-related code

### Manual Tests (Demo Mode)
- [ ] LC-01: Storage Cleanup
- [ ] LC-02: Route Protection After Logout
- [ ] LC-03: Back Button Security
- [ ] LC-04: Refresh After Logout
- [ ] RC-01: Admin Dashboard Access
- [ ] RC-02: Nurse App Access
- [ ] RC-03: Family Portal Access
- [ ] DL-01: Unauthenticated Deep Link
- [ ] DL-02: Cross-Role Deep Link
- [ ] DL-03: Refresh on Protected Route

### Manual Tests (Production Backend)
- [ ] PB-01: Real Cognito Logout
- [ ] PB-02: JWT Token Validation
- [ ] PB-03: Token Refresh

### Documentation
- [ ] Update CHANGELOG.md with security fixes
- [ ] Tag release as SECURITY_PATCH in git
- [ ] Notify stakeholders of deployment

---

## 🐛 Bug Reporting Template

If any test fails, use this template:

```markdown
**Test ID:** [e.g., LC-02]
**Severity:** Critical / High / Medium / Low
**Environment:** Demo / Production
**Role:** Admin / Nurse / Family / Anonymous

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**


**Actual Behavior:**


**Evidence:**
- [ ] Screenshot attached
- [ ] DevTools console log attached
- [ ] Network trace attached
```

---

## 📞 Contact

**Security Issues:** Escalate immediately via incident response process  
**Questions:** Refer to [SECURITY.md](./SECURITY.md)  
**Test Engineer:** Agent Test-Engineer-919928fe

---

**Sign-off:**

- [ ] **Tester:** _________________ Date: _______
- [ ] **Code Reviewer:** _________________ Date: _______
- [ ] **Product Owner:** _________________ Date: _______

