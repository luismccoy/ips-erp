# IPS-ERP Active Tasks

**Project:** IPS-ERP Healthcare SaaS  
**Updated:** 2026-02-09 23:30 UTC

---

## 🔴 High Priority

*No critical tasks pending*

---

## 🟡 Medium Priority

*Tasks will be added here as they are created*

---

## 🟢 Active Tasks

### Backend (Kiro)

## 🔧 [Kiro] Fix Auth Logout Cleanup
- **Assignee:** Kiro
- **Type:** Backend
- **Status:** Assigned
- **Signed:** 2026-02-10 00:20 UTC
- **Details:** Fix `useAuth` hook to properly clear role/tenant/user state after logout. Current issue: logout tests failing because state persists after `signOut()` call. Ensure all auth state resets to initial values.

## 🔧 [Kiro] Fix SessionStorage Cleanup on Logout
- **Assignee:** Kiro
- **Type:** Backend
- **Status:** Assigned
- **Signed:** 2026-02-10 00:20 UTC
- **Details:** Ensure `signOut` function removes auth keys from SessionStorage. Current issue: keys persist after logout causing test failures. Verify cleanup in both `useAuth` and Amplify signOut flow.

## 🔧 [Kiro] Fix Logout Test Timeouts
- **Assignee:** Kiro
- **Type:** Backend
- **Status:** Assigned
- **Signed:** 2026-02-10 00:20 UTC
- **Details:** Adjust test timeouts for role-based redirects after logout. Tests are timing out waiting for async redirects. Either increase timeout thresholds or add explicit waits for redirect completion.

### Frontend (Antigravity)

*No active frontend tasks*

---

## ✅ Recently Completed

| Date | Task | IDE | Commit |
|------|------|-----|--------|
| 2026-01-28 | Subscription permissions fix | Kiro | `7cfd525` |
| 2026-01-28 | Auditoría Clínica sidebar fix | Antigravity | `28220fa` |
| 2026-01-27 | Clinical Scales frontend | Antigravity | - |
| 2026-01-27 | Dashboard v2 command center | Antigravity | - |

---

## 📋 Next Up (Planning Board)

See: `~/projects/ERP/docs/PLANNING_BOARD_RESEARCH_ITEMS.md`

### Quick Wins:
- [ ] Add hover states to all cards (3h) - Antigravity
- [ ] Implement page transitions (2h) - Antigravity
- [ ] Enhanced toast notifications (2h) - Antigravity

### Core Improvements:
- [ ] Role-based dashboard layouts (8h) - Backend + Frontend
- [ ] Upgrade calendar component (4h) - Antigravity
- [ ] Keyboard shortcuts (3h) - Antigravity

---

## Task Assignment Instructions

1. **Create Task:** Use `~/clawd/TASK_TEMPLATE.md` as reference
2. **Add to Section:** Place under Backend (Kiro) or Frontend (Antigravity)
3. **Notify:** Clawd will coordinate via git commits
4. **Update Status:** Change status as work progresses
5. **Complete:** Move to "Recently Completed" with commit hash

---

**Workflow Reminder:**
- Kiro = Backend/GraphQL/Lambda/CDK
- Antigravity = Frontend/React/UX/Styling
- Clawd = Orchestration/Git/Deploy/Docs
