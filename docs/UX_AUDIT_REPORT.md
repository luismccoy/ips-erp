# UX Audit Report: Nurse & Family Personas
**Date:** 2026-01-23
**Auditor:** Antigravity Agent
**Deployment:** Production (v1.0.0)

## Executive Summary
The deployment was successful in terms of code delivery, but the application is **functionally blocked** in the Production environment due to missing Administrative UI components and Backend permission errors. 

**Current Status:**
- **Admin Portal:** Accessible (Login works), but **Data Entry is impossible**.
- **Nurse App:** Untestable (Cannot create Nurse credentials).
- **Family Portal:** Untestable (Cannot create Patient data; Mock Auth generic).

---

## 🛑 Critical Blockers (Priority 0)

### 1. Missing Admin Management UI due to "View" State Logic
**Observation:** The Admin Dashboard successfully loads, but there is **no navigation or button** to create:
- **Patients**
- **Nurses/Staff**
Since the production database starts empty, the application is stuck in a "Read-Only" state with no data.
**Impact:** Rostering, Nurse App, and Family Portal cannot be used.

### 2. Infinite Loading on Key Modules
**Observation:** Clicking "Clinical Audit" or "Billing & RIPS" results in an infinite spinner.
**Browser Logs:** `Unauthorized` errors on `listNotifications` and `onUpdateShift` subscriptions.
**Cause:** The IAM Role for the authenticated Admin user likely lacks permission to execute specific AppSync subscriptions or Lambda resolvers in the `prod` environment.

### 3. Family Portal Authentication Gap
**Observation:** The Family Portal presently uses a hardcoded mock check (`accessCode === '1234'`) even in Production mode.
**Security Risk:** It fetches the *first available patient* in the database blindly. This is a critical privacy breach if multiple patients existed.
**Required Fix:** Backend authentication (Cognito or Custom Lambda Authorizer) verifying the Access Code against a specific Patient record.

### 4. Nurse App Offline/Tracking Gap
**Observation:** Code analysis reveals no implementation of:
- **GPS Tracking:** `locationLat`/`locationLng` are defined in schema but not captured during visits.
- **Offline Mode:** No Service Worker or local storage logic found in `SimpleNurseApp.tsx`.

---

## User Journey Audit

### 👩‍⚕️ Nurse Persona
| Feature | Status | Notes |
| :--- | :--- | :--- |
| **Login** | 🟡 **Blocked** | Login screen exists, but no Nurse Account can be created to test it. |
| **Shift List** | ⚪ **Untested** | Depends on Admin creating a shift. |
| **Visit Form** | ⚪ **Untested** | "Start Documentation" flow logic appears sound in code but unverified. |
| **Packet** | 🔴 **Gap** | No visible link between "Submit Visit" and "Billing Packet Generation". |

### 👨‍👩‍👧 Family Persona
| Feature | Status | Notes |
| :--- | :--- | :--- |
| **Login** | 🔴 **Critical** | Uses Hardcoded '1234'. **MUST** be replaced with backend auth. |
| **Timeline** | 🟢 **Partial** | UI seems complete, but fetches random patient. |
| **Vitals** | 🟡 **Mocked** | Vitals chart uses `Math.random()` in frontend. Needs dedicated API field. |

---

## Instructions for Kiro (Backend Handoff)

**Kiro ID:** `backend-team-01`

### Immediate Tasks
1.  **Seed Production Data:**
    Please manually seed the DynamoDB tables or User Pool with at least one Nurse and one Patient so functionality can be tested while UI is built.
    - **Nurse:** `nurse.betty@ips.com` / `TempPass123!`
    - **Patient:** "Grandpa Joe" (assign to Tenant 1)
2.  **Fix Authorizer Permissions:**
    Investigate `Unauthorized` errors for `listNotifications` and `Subscription` operations for the Admin Group.
3.  **Implement Family Auth:**
    Create a Lambda Resolver for `verifyFamilyAccessCode(code: string)` that returns the associated Patient ID.

### Frontend Tasks (For Antigravity/Dev)
1.  **Build "Patients" CRUD Page:** Admin needs a form to `createPatient`.
2.  **Build "Staff" CRUD Page:** Admin needs a form to `createNurse` (and create Cognito User).
