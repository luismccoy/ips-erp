# Fix: Admin Sidebar Navigation

## Problem
Clicking any sidebar item in the admin portal (Auditoría Clínica, Revisiones Pendientes, Facturación, etc.) did nothing - the view stayed stuck on "Resumen General" dashboard.

## Root Cause
The previous fix for preventing view resets (commit `28220fa`) used a `useRef` with a simple boolean flag (`initialViewSet.current`) to track if the initial view had been set. However, this approach had a subtle issue with how React manages refs vs state in the rendering lifecycle.

The ref-based approach meant:
1. On first render with admin role, `initialViewSet.current` was set to `true`
2. Any subsequent renders (including after sidebar clicks) would skip the view initialization block
3. **However**, the ref was not part of React's state management, so it could cause timing issues with how useEffect dependencies were evaluated

## Solution
**Replaced ref-based tracking with state-based tracking:**

### Before (ref-based):
```typescript
const initialViewSet = useRef(false);

useEffect(() => {
  if (role) {
    if (!initialViewSet.current) {
      initialViewSet.current = true;
      // Set initial view...
      if (role === 'admin') setView('dashboard');
    }
  } else {
    initialViewSet.current = false;
  }
}, [role, tenant, setDemoState, identifyUser, trackEvent]);
```

### After (state-based):
```typescript
const [initialViewSetForRole, setInitialViewSetForRole] = useState<string | null>(null);

useEffect(() => {
  if (role && initialViewSetForRole !== role) {
    // First-time setup for this role
    setInitialViewSetForRole(role);
    if (role === 'admin') setView('dashboard');
  }
  
  if (!role && initialViewSetForRole !== null) {
    setInitialViewSetForRole(null);
  }
}, [role, tenant, setDemoState, identifyUser, trackEvent, initialViewSetForRole]);
```

## Key Improvements

1. **State-based tracking**: Uses React state instead of a ref, making it properly integrated with the rendering lifecycle

2. **Role-specific initialization**: Tracks *which role* was initialized, not just a boolean flag. This is clearer and more maintainable.

3. **Proper dependency tracking**: `initialViewSetForRole` is included in the useEffect dependency array, ensuring predictable behavior

4. **Clear logic**: The condition `role && initialViewSetForRole !== role` is more explicit than `!initialViewSet.current`

## Behavior After Fix

### Initial Login (role changes from null to 'admin'):
1. `role = 'admin'`, `initialViewSetForRole = null`
2. Condition `role && initialViewSetForRole !== role` → `'admin' && null !== 'admin'` → **TRUE**
3. Execute initialization: set `initialViewSetForRole = 'admin'`, call `setView('dashboard')`

### Sidebar Click (user clicks "Auditoría Clínica"):
1. AdminDashboard calls `setView('audit')`
2. view state updates from 'dashboard' to 'audit'
3. Component re-renders
4. useEffect runs (due to dependencies)
5. `role = 'admin'`, `initialViewSetForRole = 'admin'`
6. Condition `role && initialViewSetForRole !== role` → `'admin' && 'admin' !== 'admin'` → **FALSE**
7. No setView call → view stays as 'audit' ✅

### Logout:
1. role becomes null
2. Condition `!role && initialViewSetForRole !== null` → TRUE
3. Reset: `setInitialViewSetForRole(null)`
4. Ready for next session

## Additional Fixes

1. **Fixed nurse deep link handler**: Added `&& !role` check to line 76 to match the pattern of other deep link handlers and prevent unnecessary `setDemoState` calls

2. **Added debug logging**: Temporary console logs to help diagnose any remaining issues. Can be removed once verified in production.

## Testing
After this fix:
- ✅ Sidebar navigation should work correctly
- ✅ Initial view still set correctly on login
- ✅ Demo mode switching should still work
- ✅ Deep link navigation should still work

## Files Changed
- `src/App.tsx`: Replaced ref-based initialization tracking with state-based tracking

## Related Issues
- Original bug: commit `28220fa` (attempted to fix view reset issue)
- Demo mode fixes: commit `cfa2db8` (module-level enableDemoMode)

## Notes
The debug logging can be removed once the fix is verified working in production. Look for lines with `[Navigation Debug]` prefix.
