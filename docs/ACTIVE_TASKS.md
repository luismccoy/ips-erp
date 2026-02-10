# IPS-ERP Active Tasks

**Project:** IPS-ERP Healthcare SaaS  
**Updated:** 2026-02-10

---

## 🔴 High Priority

### BUG-003: Patient Create Mutation Returns Null (Investigation Needed)
- **Status:** Partially fixed (null guard added), root cause TBD
- **File:** `src/pages/admin/PatientsPage.tsx`
- **Details:** `client.models.Patient.create()` returns `result.data = null`. The crash is fixed (null guard), but the mutation itself still fails silently. Likely an auth rule issue — Patient model uses `ownerDefinedIn('tenantId').identityClaim('custom:tenantId')` which may not match the admin user's JWT claim format.
- **IDE:** Kiro (backend investigation) + Antigravity (frontend guard)

### BUG-001: `listNotifications` Unauthorized for All Roles
- **Status:** Open
- **Details:** Console error `"Not Authorized to access listNotifications on type Query"` fires 8+ times on every page load for Admin, Nurse, and Family roles. The Notification model auth includes `allow.groups(['ADMIN', 'NURSE'])` but the query still fails. Family group is not included at all.
- **IDE:** Kiro (schema auth rules)

---

## 🟡 Medium Priority

### BUG-002: `removeChild` DOM Error (React Race Condition)
- **Status:** Open (intermittent, non-blocking)
- **Details:** `NotFoundError: Failed to execute 'removeChild' on 'Node'` during component unmount/remount. Seen on Family Portal and Admin pages. No user-visible impact.
- **IDE:** Antigravity (React lifecycle)

### BUG-004: Page Title Shows Wrong Role
- **Status:** Open (cosmetic)
- **Details:** Document title shows "IPS ERP - Enfermería" when admin logs in instead of "IPS ERP - Administración"
- **IDE:** Antigravity (frontend)

### Seed Data Needed for Full Workflow Testing
- **Status:** Blocked
- **Details:** ALL DynamoDB tables are empty. Cannot test: patient create (mutation fails), visit workflow, billing, family portal authenticated view, route optimization. Need to either fix the create mutation or seed data directly.
- **IDE:** Kiro

---

## 🟢 Active Tasks

### Backend (Kiro)

*No active backend tasks*

### Frontend (Antigravity)

*No active frontend tasks*

---

## ✅ Recently Completed

| Date | Task | IDE | Commit |
|------|------|-----|--------|
| 2026-02-10 | Fix patient create null crash (BUG-003 guard) | Kiro | pending |
| 2026-02-10 | Comprehensive E2E testing: Admin 10 sections, Nurse all tabs, Family partial | Kiro | — |
| 2026-02-10 | Fix demo mode overriding Cognito auth on protected routes | Kiro | `5d762cc` |
| 2026-02-10 | E2E testing: all 3 roles auth verified, RBAC confirmed | Kiro | — |
| 2026-02-09 | Fix auth logout state/sessionStorage cleanup | Kiro | `b8327f7` |
| 2026-01-28 | Subscription permissions fix | Kiro | `7cfd525` |
| 2026-01-28 | Auditoría Clínica sidebar fix | Antigravity | `28220fa` |

---

## 📋 Next Up (Planning Board)

### Immediate (Blocking Full Testing):
- [ ] Investigate why Patient.create() mutation returns null (auth rule issue?)
- [ ] Fix `listNotifications` unauthorized error (BUG-001)
- [ ] Seed test data or fix mutations to enable workflow testing

### Quick Wins:
- [ ] Fix page title for admin role (BUG-004)
- [ ] Add hover states to all cards (3h) - Antigravity
- [ ] Implement page transitions (2h) - Antigravity

---

**Workflow Reminder:**
- Kiro = Backend/GraphQL/Lambda/CDK
- Antigravity = Frontend/React/UX/Styling
- Clawd = Orchestration/Git/Deploy/Docs
