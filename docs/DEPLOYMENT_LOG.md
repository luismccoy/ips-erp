# IPS-ERP Deployment Log

> **Cross-IDE Documentation**: This file is maintained for coordination between **Clawd** (EC2 agent), **Kiro IDE** (backend), and **Antigravity** (frontend UX).

---

## Deployment: 2026-01-26 13:00 UTC

### Summary
| Field | Value |
|-------|-------|
| **Commit** | `f7d3d14` |
| **Branch** | `main` (merged from `fix/demo-mode-and-ux-improvements`) |
| **Deployed By** | Clawd (EC2 Agent) |
| **Trigger** | Git push to `main` → AWS Amplify auto-deploy |
| **Production URL** | https://main.d2wwgecog8smmr.amplifyapp.com |

### What Changed

#### 🎭 Demo Mode System (NEW)
**Files:** `src/amplify-utils.ts`, `src/components/DemoSelection.tsx`

```typescript
// amplify-utils.ts - Key change
const IS_DEMO_MODE = typeof window !== 'undefined' && sessionStorage.getItem('ips-demo-mode') === 'true';
const USE_REAL_BACKEND = !IS_DEMO_MODE && (import.meta.env.PROD || import.meta.env.VITE_USE_REAL_BACKEND === 'true');
```

**Behavior:**
- When user clicks "View Demo" → `sessionStorage.setItem('ips-demo-mode', 'true')`
- Demo users see pre-seeded mock data
- Production users (without demo flag) hit real AWS backend

**Why:** Demo mode was broken. Visitors saw empty data (`0 Patients, 0 Shifts`) because production always used the real (empty) backend.

---

#### 📊 Rich Demo Data
**File:** `src/mock-client.ts` (+788 lines)

| Entity | Count | Notes |
|--------|-------|-------|
| Patients | 8 | Colombian diagnoses (HTA, Diabetes, EPOC, etc.) |
| Nurses | 4 | Skills, locations in Bogotá |
| Shifts | 12 | Mix: Completed, In Progress, Pending, Unassigned |
| Inventory | 15 | In Stock, Low Stock, Out of Stock alerts |
| Billing | 6 | Including 2 GLOSED records for AI demo |
| Vitals | ✅ | History for chart visualization |
| Notifications | ✅ | Sample alerts |

---

#### 🔔 Toast Notification System (NEW)
**Files:** `src/components/ui/Toast.tsx`, `src/App.tsx`

- 4 variants: `success`, `error`, `warning`, `info`
- Slide-in animation with auto-dismiss (5s default)
- `ToastProvider` integrated at App root level
- Used by: `PatientManager`, `StaffManager` for CRUD feedback

**Usage (for Kiro/Antigravity):**
```typescript
import { useToast } from '@/components/ui/Toast';

const { addToast } = useToast();
addToast({ type: 'success', message: 'Patient saved!' });
```

---

#### ⏱️ Loading Timeout Hook (NEW)
**File:** `src/hooks/useLoadingTimeout.ts`

Prevents infinite loading spinners. Shows Spanish error message with retry option after timeout.

**Usage:**
```typescript
const { isTimedOut, reset } = useLoadingTimeout(10000); // 10s timeout
if (isTimedOut) return <ErrorState onRetry={reset} />;
```

---

#### 🛠️ Component Updates

| Component | Changes |
|-----------|---------|
| `AdminDashboard.tsx` | Uses mock client for demo stats |
| `PatientManager.tsx` | Toast notifications for CRUD |
| `StaffManager.tsx` | Toast notifications for CRUD |
| `InventoryDashboard.tsx` | Always uses client for data |
| `RosterDashboard.tsx` | Always uses client for data |
| `BillingDashboard.tsx` | Updated data fetching |
| `AuditLogViewer.tsx` | Improved loading states |
| `ReportingDashboard.tsx` | Loading timeout integration |

---

### Infrastructure Notes

#### Git Remote Fix
```bash
# Was (broken for automated push):
https://github.com/luismccoy/ips-erp.git

# Now (SSH, works with deploy key):
git@github.com:luismccoy/ips-erp.git
```

**Deploy Key Location:** `~/.ssh/github_deploy`

#### AWS Amplify
- **App ID:** Check Amplify Console
- **Branch:** `main` (auto-deploy enabled)
- **Build Spec:** Standard Vite/React build

---

### Testing Checklist

- [ ] Visit https://main.d2wwgecog8smmr.amplifyapp.com
- [ ] Click "View Demo" on landing page
- [ ] Verify Admin Dashboard shows 8 patients, 12 shifts
- [ ] Verify Billing shows $42.5M with sample invoices
- [ ] Verify Inventory shows items with LOW_STOCK alerts
- [ ] Test Toast notifications (create/edit a patient)
- [ ] Verify loading states don't hang indefinitely

---

### Related Docs
- `docs/ADMIN_UX_AUDIT_2026-01-23.md` - Original UX audit findings
- `docs/UI_UX_TEST_REPORT.md` - Comprehensive test report
- `AGENTS.md` (workspace root) - Project context for AI agents

---

## Previous Deployments

### 2026-01-23 - v1.0.0 Release
- **Commit:** `8d256be`
- **Notes:** Official release (Admin Dashboard, Nurse App, Family Portal)

### 2026-01-23 - UX Audit Fixes
- **Commit:** `835ce1b`
- **Notes:** Patient/Staff Managers, Nurse App fixes

---

*Last updated: 2026-01-26 13:00 UTC by Clawd*
