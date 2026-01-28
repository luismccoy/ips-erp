# Critical Fixes Handoff Document
## IPS-ERP Navigation & UX Crisis Resolution

**Date:** January 28, 2026  
**Owner:** Clawd (Emergency Fix Sprint)  
**Status:** 🔴 CRITICAL - Blocking all sales

---

## Executive Summary

Production stress testing revealed **fundamental navigation and routing bugs** that make the application unusable. 0/4 test personas could complete their basic tasks. This document details the root causes, fixes applied, and guidance to prevent recurrence.

---

## Root Cause Analysis

### The Core Bug: `App.tsx` useEffect Resetting View State

**Location:** `src/App.tsx`, lines 57-80

**Problem:**
```javascript
useEffect(() => {
    if (role === 'admin') setView('dashboard');
    if (role === 'nurse') setView('nurse');
    if (role === 'family') setView('family');
    // ...
}, [role, tenant, identifyUser, trackEvent, setDemoState]);
```

**Impact:** Every time ANY dependency changes (not just `role`), the view resets to the default. User clicks "Facturación" → view briefly changes → useEffect fires → view resets to "dashboard".

**Fix Applied:** Added ref to track if initial view has been set, preventing subsequent resets.

---

## Fixes Applied (January 28, 2026)

### P0-001: Sidebar Navigation
- **File:** `src/App.tsx`
- **Fix:** Added `initialViewSet` ref to prevent view state from resetting after initial load
- **Test:** Click any sidebar item → content should change and STAY changed

### P0-004: Login Button on Landing Page
- **File:** `src/components/LandingPage.tsx`
- **Fix:** Verified onClick handler is properly wired to `onLogin` prop
- **Test:** Click "Iniciar Sesión" → should show login options or form

### P0-005: Red Overlay Bug
- **File:** `src/components/GuidedTour.tsx`
- **Fix:** Added proper tour completion handling, overlay cleanup, and skip option
- **Test:** Complete or skip tour → no lingering overlay

### P0-006: PWA Manifest
- **File:** `amplify.yml` or `vite.config.ts`
- **Fix:** Added rewrite rule to prevent SPA routing from catching .webmanifest
- **Test:** `curl https://[domain]/manifest.webmanifest` should return JSON

### P1: Nurse App - Today Filter
- **File:** `src/components/SimpleNurseApp.tsx`
- **Fix:** Added "SOLO HOY" toggle to filter visits by current date
- **Test:** Toggle on → only today's visits visible

### P1: Family Portal - Demo Code Hint
- **File:** `src/components/FamilyPortal.tsx`
- **Fix:** Added hint text: "Código demo: FAM001" below input
- **Test:** Family login page shows demo code hint

### P2: Demo Data - Professional Names
- **File:** `src/data/mock-data.ts`
- **Fix:** Replaced joke names (Chespirito, Borges) with realistic Colombian names
- **Test:** No more celebrity/meme names in patient list

---

## Architectural Guidance for Kiro & Antigravity

### 🚨 NEVER DO THIS:

1. **Don't reset state in useEffects with many dependencies**
   ```javascript
   // BAD - view resets on every dependency change
   useEffect(() => {
       setView('default');
   }, [dep1, dep2, dep3, dep4]);
   ```

2. **Don't share view state across portals**
   - Admin, Nurse, and Family should be ISOLATED
   - One portal's state should NEVER affect another

3. **Don't mix routing patterns**
   - Either use React Router fully, OR custom state-based routing
   - Don't mix both (causes confusion)

4. **Don't forget edge cases in auth flow**
   - What happens if user bookmarks `/admin` and visits directly?
   - What happens if session expires mid-navigation?

### ✅ ALWAYS DO THIS:

1. **Use refs to track initialization**
   ```javascript
   const initialized = useRef(false);
   useEffect(() => {
       if (initialized.current) return;
       initialized.current = true;
       // one-time setup
   }, [deps]);
   ```

2. **Test navigation after EVERY PR**
   - Click every sidebar item
   - Verify content actually changes
   - Check for console errors

3. **Isolate portal components**
   - Each portal should manage its own state
   - Props should flow down, never sideways

4. **Clear session storage on logout**
   - Don't leave stale demo state
   - Prevents "trapped in wrong portal" bugs

---

## Testing Checklist (Before ANY Deployment)

### Navigation Tests
- [ ] Admin: All 10 sidebar items navigate correctly
- [ ] Admin: Content changes AND stays changed
- [ ] Nurse: Route list shows today's visits
- [ ] Nurse: Can tap into assessment form
- [ ] Family: Demo code works (FAM001)
- [ ] Family: Shows next visit prominently

### State Tests
- [ ] Login → works for all 3 demo modes
- [ ] Logout → fully clears state
- [ ] Refresh → maintains current view
- [ ] Deep link `/family` → loads family portal directly

### Console Tests
- [ ] No errors on initial load
- [ ] No errors during navigation
- [ ] No manifest syntax errors
- [ ] No GraphQL errors

---

## Deployment Verification

After merging these fixes, verify production:

```bash
# 1. Check build succeeds
cd ~/projects/ERP && npm run build

# 2. Deploy
git add -A
git commit -m "fix: Critical navigation and UX fixes from stress test"
git push origin main

# 3. Wait for Amplify build (~3 min)

# 4. Verify in production
# - Visit https://main.d2wwgecog8smmr.amplifyapp.com
# - Test all 4 personas manually
# - Check console for errors
```

---

## Success Criteria for Re-Test

The next stress test will PASS if:

1. ✅ María (Admin) can see Facturación, Inventario, Reportes by clicking sidebar
2. ✅ Camila (Nurse) can filter to today's visits and tap to log assessment
3. ✅ Don Roberto (Family) can enter demo code and see next visit
4. ✅ Valentina (UX) sees no red overlay, consistent navigation, proper colors

---

## Contacts

- **Clawd (Orchestrator):** Primary owner of this fix sprint
- **Kiro:** Backend/Amplify config issues
- **Antigravity:** Frontend component issues (ON PAUSE pending review)

---

*This is a living document. Update as fixes are verified.*
