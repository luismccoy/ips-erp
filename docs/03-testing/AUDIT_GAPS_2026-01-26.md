# IPS-ERP Security & Feature Audit

**Date:** 2026-01-26  
**Auditor:** Clawd  
**Scope:** Full codebase review for production readiness

---

## 🔴 CRITICAL GAPS

### 1. PendingReviewsPanel - Missing Tenant Filter
**Status:** ✅ FIXED

**Issue:** Query filter only checked `status: 'SUBMITTED'`, not `tenantId`.
```tsx
// BEFORE (vulnerable)
filter: { status: { eq: 'SUBMITTED' } }

// AFTER (fixed)
filter: { 
  status: { eq: 'SUBMITTED' },
  tenantId: { eq: tenantId }
}
```
**Risk:** Medium (backend AppSync auth provides tenant isolation, but defense-in-depth is important)

---

### 2. FamilyPortal - Broken Production Auth
**Status:** 🔴 NEEDS FIX

**Issue:** 
- Demo mode: Accepts hardcoded `'1234'` for any access
- Production mode: Fetches first patient regardless of access code entered

**File:** `src/components/FamilyPortal.tsx` (lines 45-60)

**Current Code:**
```tsx
if (accessCode === '1234') { // Hardcoded for demo/MVP
    setIsAuthenticated(true);
    fetchFamilyData();
}

// In fetchFamilyData, production mode:
const patientsRes = await (client.models.Patient as any).list({ limit: 1 });
targetPatient = patientsRes.data[0]; // ⚠️ Gets first patient, ignores code!
```

**Fix Required:**
1. In production, query patient by `familyAccessCode` field
2. If no match, show error
3. If match, load only that patient's data

**Risk:** HIGH - Anyone with any 4-digit code could access patient data in production

---

### 3. ReportingDashboard - No Tenant Filter
**Status:** 🟡 LOW RISK (backend provides isolation)

**Issue:** Queries don't include tenantId filter, relies entirely on backend auth.

**File:** `src/components/ReportingDashboard.tsx`

**Note:** Backend `ownerDefinedIn('tenantId')` authorization provides isolation, but adding frontend filter improves defense-in-depth.

---

### 4. SuperAdmin View - Not Implemented
**Status:** 🟡 FEATURE GAP

**Issue:** `useAuth` exposes `isSuperAdmin` flag but:
- No dedicated SuperAdmin dashboard
- No multi-tenant overview
- SuperAdmin can't see all tenants' data

**Fix Required:** Create SuperAdmin portal with:
- List of all tenants
- Platform-wide metrics
- User management
- System configuration

---

## 🟡 MEDIUM GAPS

### 5. Some Components Use MOCK_USER Instead of Auth Context
**Status:** 🟡 NEEDS REFACTOR

**Files Affected:**
- `src/components/PatientDashboard.tsx`
- `src/components/StaffManagement.tsx`

**Issue:** Hardcoded `MOCK_USER.attributes['custom:tenantId']` instead of getting tenantId from auth hook.

---

### 6. Loading States - Some Panels Don't Show Proper Loading
**Status:** ✅ PARTIALLY FIXED (via lazy loading)

---

## ✅ CONFIRMED WORKING

1. **Backend Tenant Isolation** - AppSync authorization rules properly configured
2. **Auth Hook** - Correctly reads from Cognito groups
3. **AI Services** - Proper error handling implemented
4. **Performance** - Lazy loading + state persistence implemented
5. **Navigation** - Fixed (no more page reloads)

---

## 📊 Risk Summary

| Gap | Risk Level | Status | Fix Complexity |
|-----|------------|--------|----------------|
| PendingReviewsPanel filter | Medium | ✅ Fixed | Low |
| FamilyPortal auth | HIGH | 🔴 Needs Fix | Medium |
| ReportingDashboard filter | Low | 🟡 Backlog | Low |
| SuperAdmin view | Medium | 🟡 Feature | High |
| MOCK_USER references | Low | 🟡 Backlog | Medium |

---

## 🔧 Immediate Action Items

1. **[HIGH]** Fix FamilyPortal production auth
2. **[MEDIUM]** Add seed script for production data (created)
3. **[LOW]** Add tenant filters to remaining dashboards

---

## 📁 Files Modified This Session

- `src/components/AdminDashboard.tsx` - Performance (lazy loading)
- `src/components/PendingReviewsPanel.tsx` - Security (tenant filter)
- `src/hooks/useAuth.ts` - Fixed role detection
- `amplify/auth/resource.ts` - Added SuperAdmin group
- `docs/KIRO_BACKEND_TASKS.md` - Backend task list
- `docs/TEAM_HANDOFF.md` - Coordination doc
- `scripts/seed-production-data.ts` - Data seeding script (NEW)
