# IPS-ERP Navigation Map

**Generated:** 2026-01-28  
**Repository:** ~/projects/ERP/ips-erp-1  
**React Router Installed:** Yes (v7.12.0) — **BUT NOT USED**  
**Navigation Pattern:** Manual state + URL pathname + sessionStorage

---

## Executive Summary

IPS-ERP uses a **custom navigation system** without React Router components. Navigation is controlled by:
1. **State variables** in `App.tsx` (`role`, `authStage`, `view`)
2. **URL pathname** for deep linking (`/dashboard`, `/nurse`, `/family`)
3. **sessionStorage** for demo mode persistence across refreshes
4. **useAuth hook** for role/tenant management

**Key Issue:** Multiple sources of truth create timing conflicts during navigation and refreshes.

---

## Sources of Truth

| Source | Type | What it Controls | Where Set |
|--------|------|------------------|-----------|
| `role` (useAuth) | React State | User's role (admin/nurse/family/superadmin) | `useAuth.ts:238`, persisted via sessionStorage |
| `authStage` (App) | React State | Auth UI flow (landing/demo/login) | `App.tsx:65` |
| `view` (App) | React State | Active dashboard view (for admin only) | `App.tsx:64` |
| `window.location.pathname` | Browser URL | Deep link routing (`/nurse`, `/dashboard`, `/family`) | Read at module level + useEffects |
| `sessionStorage['ips-erp-demo-mode']` | Browser Storage | Demo vs real backend toggle | `amplify-utils.ts:27,36` |
| `sessionStorage['ips-erp-demo-role']` | Browser Storage | Persisted demo role | `useAuth.ts:235` |
| `sessionStorage['ips-erp-demo-tenant']` | Browser Storage | Persisted demo tenant | `useAuth.ts:237` |
| `initialViewSetForRole` (App) | React State | Tracking flag to prevent double-initialization | `App.tsx:74` |
| `pendingDeepLinkRole` (App) | React State | Temp state for deep link role transition | `App.tsx:75` |

---

## Render Gates (Early Returns)

These block rendering and return different UI based on conditions:

| File:Line | Condition | Returns | Purpose |
|-----------|-----------|---------|---------|
| App.tsx:220 | `if (loading)` | Loading spinner | Wait for auth check |
| App.tsx:230 | `if (!role)` | Auth UI (landing/demo/login) | Unauthenticated flow |
| App.tsx:245 | `if (authStage === 'landing')` | `<LandingPage>` | First screen |
| App.tsx:251 | `if (authStage === 'demo')` | `<DemoSelection>` | Demo persona picker |
| App.tsx:262 | Default (no role) | `<LoginForm>` | Org login form |
| App.tsx:328+ | `if (role)` | Role-based component | Main app |

**Gate Order:**
1. Loading check → Spinner
2. Role check → Auth flow (landing → demo/login)
3. Role present → Render `<AdminDashboard>` / `<SimpleNurseApp>` / `<FamilyPortal>`

---

## Effects That Set Navigation State

App.tsx has **4 useEffects** that manipulate navigation:

| Effect | Line | Triggers | Sets | Dependencies | Execution Order |
|--------|------|----------|------|--------------|-----------------|
| Debug Logger | 78 | `view`, `role`, `initialViewSetForRole` | *(none)* | `[view, role, initialViewSetForRole]` | 1st (log only) |
| Query Param Handler | 84 | Page load, `?demo=` param | `role`, `tenant` via `setDemoState` | `[setDemoState, trackEvent]` | 2nd (runs once on mount) |
| Direct /family Route | 107 | Direct `/family` navigation | `role='family'` via `setDemoState` | `[role, setDemoState, trackEvent]` | 3rd (path-specific) |
| **Main Navigation** | 118 | `role` change, pathname | `view`, `role`, `tenant`, tracking flags | `[role, tenant, setDemoState, identifyUser, trackEvent, initialViewSetForRole, pendingDeepLinkRole]` | 4th (MAIN LOGIC) |

### Main Navigation Effect (Line 118) Logic Flow:

```javascript
1. Check URL pathname first:
   - /dashboard or /admin → Set role='admin' if not already
   - /app or /nurse → Set role='nurse' if not already  
   - /family → Set role='family' if not already

2. If role is set AND this is the first time for this role:
   - identifyUser() + trackEvent('Session Started')
   - Set view based on role:
     * admin → 'dashboard'
     * nurse → 'nurse'
     * family → 'family'
   - Mark role as initialized (initialViewSetForRole = role)

3. If role is cleared (logout):
   - Reset initialization tracking
```

### Module-Level URL Check (Before React Mounts)

**File:** App.tsx, **Lines:** 39-57  
**Runs:** Synchronously before any React component renders

```javascript
if (path === '/' || path === '/login') {
    // CLEAR demo state for landing/login
    sessionStorage.removeItem('ips-erp-demo-mode');
    sessionStorage.removeItem('ips-erp-demo-role');
    sessionStorage.removeItem('ips-erp-demo-tenant');
}
else if (path === '/nurse' || '/app' || '/dashboard' || '/admin' || '/family') {
    // PRE-ENABLE demo mode for deep links
    enableDemoMode();
}
```

**Purpose:** Prevent race condition where child components mount before demo mode is set.

---

## Storage Keys

| Key | Read Where | Written Where | Purpose |
|-----|------------|---------------|---------|
| `ips-erp-demo-mode` | `amplify-utils.ts:21`, module-level check | `amplify-utils.ts:27,36`, `App.tsx:48-50` | Toggle demo/real backend |
| `ips-erp-demo-role` | `useAuth.ts:168` | `useAuth.ts:235`, cleared in `App.tsx:234` | Persist demo role across refresh |
| `ips-erp-demo-tenant` | `useAuth.ts:169` | `useAuth.ts:237`, cleared in `App.tsx:235` | Persist demo tenant across refresh |
| `ips-demo-tour-completed` | `GuidedTour.tsx:83`, `AdminDashboard.tsx:63` | `GuidedTour.tsx:77`, removed in `GuidedTour.tsx:386` | Track onboarding tour completion |

**Storage Strategy:**
- All keys use `sessionStorage` (cleared on browser tab close)
- Demo state survives page refresh within same session
- Logging out clears all demo keys

---

## URL Handlers

| File:Line | Pattern | Action |
|-----------|---------|--------|
| App.tsx:44 (module) | `/` or `/login` | Clear demo state |
| App.tsx:54 (module) | `/nurse`, `/app`, `/dashboard`, `/admin`, `/family` | Pre-enable demo mode |
| App.tsx:89 | Query param present | `window.history.replaceState({}, '', pathname)` to clean URL |
| App.tsx:114 | `/family` route | `window.history.replaceState({}, '', '/')` after setting role |
| App.tsx:130 | `/dashboard` or `/admin` | Set `role='admin'` if missing |
| App.tsx:142 | `/app` or `/nurse` | Set `role='nurse'` |
| App.tsx:151 | `/family` | Set `role='family'` |
| ErrorBoundary.tsx:30 | Error state | `window.location.reload()` |
| ErrorBoundary.tsx:34 | Error state (alt) | `window.location.href = '/'` |

**URL Usage Pattern:**
- **Read-only:** `window.location.pathname` (no push/replace for navigation)
- **Clean URLs:** `window.history.replaceState` removes query params after reading
- **No hash routing:** URLs are clean paths

---

## Router Usage

**Package Installed:** `react-router-dom` ^7.12.0 (in package.json)

**Actual Usage:** **NONE**

```bash
$ grep -rn "BrowserRouter\|Routes\|Route\|useNavigate\|useLocation" src/
# No matches found (except false positives like "Route of administration")
```

**Why installed but unused:**
- Likely added during initial setup but never implemented
- App uses custom pathname-based navigation instead
- Can be removed to reduce bundle size

---

## Context Providers

| Provider | File | Purpose | Used By |
|----------|------|---------|---------|
| `ToastContext` | `ui/Toast.tsx:27` | Global toast notifications | All components via `useToast()` |
| `LanguageContext` | `contexts/LanguageContext.tsx:5` | i18n language switching | Components via `useLanguage()` |

**Note:** No navigation or routing context providers exist.

---

## Navigation Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ MODULE LEVEL (before React mounts)                         │
│ - Check window.location.pathname                           │
│ - Clear demo state if / or /login                          │
│ - Enable demo mode if /nurse, /dashboard, /family          │
└───────────────────┬─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ APP COMPONENT MOUNT                                         │
│ 1. useAuth() hook initializes                              │
│    - Checks sessionStorage for saved demo state            │
│    - Sets role + tenant if found                           │
│ 2. App sets loading=true                                   │
└───────────────────┬─────────────────────────────────────────┘
                    ↓
         ┌──────────┴──────────┐
         │  if (loading)       │ → Show spinner
         │  return <Spinner>   │
         └──────────┬──────────┘
                    ↓
         ┌──────────┴──────────┐
         │  if (!role)         │ → Show auth UI
         │  return <Auth>      │   (landing → demo/login)
         └──────────┬──────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│ EFFECTS RUN (role is set)                                  │
│ 1. Query param effect: Handle ?demo= param                 │
│ 2. /family route effect: Auto-set family role if needed    │
│ 3. MAIN NAVIGATION EFFECT:                                 │
│    - Check pathname for deep links                         │
│    - Set view based on role (if first time)                │
│    - Track session analytics                               │
└───────────────────┬─────────────────────────────────────────┘
                    ↓
         ┌──────────┴──────────┐
         │  Render role-based  │
         │  component:         │
         │  - AdminDashboard   │
         │  - SimpleNurseApp   │
         │  - FamilyPortal     │
         └─────────────────────┘
```

---

## Conflicts Identified

### 1. **Multiple Execution of Role-Setting Logic**
- **Issue:** Both module-level code AND useEffects check pathname and set role
- **Risk:** Race conditions, double-setting state, inconsistent behavior on refresh
- **Location:** App.tsx lines 39-57 (module), lines 118-178 (effect)

### 2. **Pathname Checked in Multiple Places**
- **Issue:** 3 separate useEffects read `window.location.pathname`
- **Effects:** Lines 84, 107, 118
- **Risk:** Order dependency, duplicate logic, hard to debug

### 3. **View State Redundancy (Admin Only)**
- **Issue:** `view` state only used for AdminDashboard, but exists at App level
- **Better:** Move to AdminDashboard internal state
- **Location:** App.tsx:64, passed as prop to AdminDashboard

### 4. **URL Cleaning Inconsistency**
- **Issue:** Some deep links clean URL (`history.replaceState`), others don't
- **Example:** `/family` cleans to `/`, but `/dashboard` stays
- **Location:** App.tsx:89, 114

### 5. **React Router Unused Dependency**
- **Issue:** `react-router-dom` installed but never imported/used
- **Impact:** +40KB bundle size for nothing
- **Solution:** Remove from package.json

### 6. **Session Storage Keys Scattered**
- **Issue:** Demo keys defined in multiple files with magic strings
- **Files:** App.tsx, useAuth.ts, amplify-utils.ts, GuidedTour.tsx
- **Risk:** Typos, inconsistent clearing, hard to refactor

### 7. **Deep Link Logic Duplication**
- **Issue:** Module-level AND useEffect both handle same paths
- **Example:** Both check for `/dashboard` and `/nurse`
- **Result:** Unclear which logic runs first on cold load

---

## Recommended Source of Truth

### **Single Responsibility Refactor**

#### ✅ **Keep:**
1. **`role` from useAuth** → Single source of role state
2. **Module-level demo mode enabler** → Critical for preventing race conditions
3. **sessionStorage for persistence** → Survives refresh, cleared on logout

#### ❌ **Remove/Refactor:**
1. **`authStage` state** → Can be derived from `role === null`
2. **`view` state in App** → Move to AdminDashboard internal state
3. **`initialViewSetForRole` tracking** → Use `useRef` instead of state for non-render logic
4. **Multiple pathname checks** → Consolidate to ONE place (module-level or effect, not both)
5. **React Router dependency** → Remove if not using

#### 🔄 **Consolidate:**
```javascript
// PROPOSED: Single navigation configuration
const ROUTE_CONFIG = {
  '/': { role: null, cleanUrl: false },
  '/login': { role: null, cleanUrl: false },
  '/dashboard': { role: 'admin', cleanUrl: true },
  '/admin': { role: 'admin', cleanUrl: true },
  '/nurse': { role: 'nurse', cleanUrl: true },
  '/app': { role: 'nurse', cleanUrl: true },
  '/family': { role: 'family', cleanUrl: true }
};
```

---

## Architecture Recommendations

### **Option A: Keep Custom Navigation (Current Pattern)**
**Pros:** No new dependencies, works well for simple SPA  
**Cons:** Hard to scale, prone to timing bugs

**Refactor Steps:**
1. Extract URL handling to `useNavigation()` hook
2. Consolidate all pathname logic to ONE effect
3. Use route config object (above)
4. Remove React Router dependency
5. Move `view` state to AdminDashboard

---

### **Option B: Implement React Router (Use Installed Dependency)**
**Pros:** Standard patterns, better dev tools, less custom code  
**Cons:** Requires refactor, learning curve for team

**Migration Steps:**
1. Wrap App in `<BrowserRouter>`
2. Define routes:
   ```jsx
   <Routes>
     <Route path="/" element={<LandingPage />} />
     <Route path="/dashboard" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
     <Route path="/nurse" element={<PrivateRoute role="nurse"><SimpleNurseApp /></PrivateRoute>} />
     <Route path="/family" element={<PrivateRoute role="family"><FamilyPortal /></PrivateRoute>} />
   </Routes>
   ```
3. Replace manual pathname checks with `useNavigate()` / `useLocation()`
4. Remove all `window.location` / `window.history` usage
5. Keep sessionStorage for demo mode only

---

### **Option C: Hybrid (Module-level Init + React Router)**
**Pros:** Best of both worlds — sync init + standard routing  
**Cons:** More complex

**Pattern:**
1. Keep module-level demo mode enabler (lines 39-57)
2. Let React Router handle all navigation after mount
3. Use `useEffect(() => navigate('/dashboard'), [role])` for role-based redirects
4. Remove all manual pathname checks from effects

---

## Quick Wins (No Refactor Needed)

1. **Consolidate storage keys** → Create constants file:
   ```typescript
   // src/constants/storage.ts
   export const STORAGE_KEYS = {
     DEMO_MODE: 'ips-erp-demo-mode',
     DEMO_ROLE: 'ips-erp-demo-role',
     DEMO_TENANT: 'ips-erp-demo-tenant',
     TOUR_COMPLETED: 'ips-demo-tour-completed'
   };
   ```

2. **Remove React Router** → If not planning to use:
   ```bash
   npm uninstall react-router-dom
   ```

3. **Add JSDoc comments** → Document navigation flow in App.tsx

4. **Extract route logic** → Move to `utils/routing.ts`:
   ```typescript
   export function getRouteConfig(pathname: string) {
     return ROUTE_CONFIG[pathname] || { role: null, cleanUrl: false };
   }
   ```

5. **Change `initialViewSetForRole` to `useRef`** → Doesn't need to trigger re-renders

---

## Testing Checklist

Navigation scenarios to verify after refactor:

- [ ] Direct URL: `https://app.com/dashboard` → Auto-login as admin
- [ ] Direct URL: `https://app.com/nurse` → Auto-login as nurse  
- [ ] Direct URL: `https://app.com/family` → Auto-login as family
- [ ] Landing page → View Demo → Select Admin → Dashboard loads
- [ ] Landing page → View Demo → Select Nurse → Nurse app loads
- [ ] Landing page → View Demo → Select Family → Family portal loads
- [ ] Landing page → Organization Access → Login form shows
- [ ] Page refresh on `/dashboard` → Stay logged in as admin
- [ ] Page refresh on `/nurse` → Stay logged in as nurse
- [ ] Logout from any view → Return to landing page
- [ ] Browser back button → Does NOT break navigation
- [ ] Open new tab with deep link → Works independently
- [ ] Query param `?demo=admin` → Redirects to dashboard
- [ ] Query param `?demo=nurse` → Redirects to nurse app
- [ ] Query param `?demo=family` → Redirects to family portal

---

## File References

### Primary Navigation Files
- **App.tsx** (lines 39-178) → Main navigation logic
- **useAuth.ts** (full file) → Role/tenant state management  
- **amplify-utils.ts** (lines 15-43) → Demo mode detection

### Secondary References
- ErrorBoundary.tsx:30,34 → Reload handlers
- GuidedTour.tsx:77,83,386 → Tour state
- AdminDashboard.tsx:63 → Tour check
- LandingPage.tsx → Entry point
- DemoSelection.tsx → Demo persona picker

---

**End of Navigation Map**  
Generated by ARCHITECT subagent | 2026-01-28
