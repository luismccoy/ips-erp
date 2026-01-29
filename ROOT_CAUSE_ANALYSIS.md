# Root Cause Analysis: Infinite Loading Spinner Pattern

**Date:** 2025-01-28  
**Analyzed Files:**
- `src/components/ReportingDashboard.tsx`
- `src/pages/admin/PatientsPage.tsx`
- `src/pages/admin/StaffPage.tsx`

---

## Executive Summary

Three distinct patterns are causing infinite loading spinners across the application:

| Issue | Severity | Files Affected |
|-------|----------|----------------|
| Hook API Mismatch | 🔴 CRITICAL | ReportingDashboard |
| useCallback Dependency Trap | 🟡 HIGH | ReportingDashboard |
| Missing Loading Timeout | 🟠 MEDIUM | PatientsPage, StaffPage |

---

## Issue #1: Hook API Mismatch (CRITICAL)

### Location
**File:** `src/components/ReportingDashboard.tsx`  
**Line:** 12

```tsx
const { isLoading, hasTimedOut, startLoading, stopLoading } = useLoadingTimeout();
```

### Problem
The `useLoadingTimeout` hook **does not export** the properties being destructured.

**Hook Actual API** (`src/hooks/useLoadingTimeout.ts`):
```tsx
export const useLoadingTimeout = (
  isLoading: boolean,  // ← Requires a boolean parameter!
  { timeoutMs, maxRetries, onTimeout } = {}
) => {
  return {
    hasTimedOut,
    currentRetryCount,
    canRetry,
    retry,
    reset,
  };
};
```

**What Component Expects:**
```tsx
{
  isLoading,      // ← Does not exist in hook return
  hasTimedOut,    // ✓ Exists
  startLoading,   // ← Does not exist in hook return
  stopLoading,    // ← Does not exist in hook return
}
```

### Impact
- `isLoading` is always `undefined` (falsy) → loading spinner never shows
- `startLoading()` and `stopLoading()` throw `TypeError: startLoading is not a function`
- If error is caught silently, component may appear stuck

### Root Cause
Two possible scenarios:
1. Hook was refactored but consumers were not updated
2. Different hook version was expected (copy-paste from another project)

---

## Issue #2: useCallback Dependency Trap (HIGH)

### Location
**File:** `src/components/ReportingDashboard.tsx`  
**Lines:** 27-69, 77-79

```tsx
// Line 27-69: fetchData has loadBills, loadShifts in dependencies
const fetchData = useCallback(async () => {
    startLoading();
    try {
        // ...
        loadBills(async (token) => { /* ... */ }, true);
        loadShifts(async (token) => { /* ... */ }, true);
        // ...
    } catch (error) { /* ... */ }
}, [loadBills, loadShifts, startLoading, stopLoading]);  // ← Dependencies

// Line 77-79: fetchData in useEffect dependency
useEffect(() => {
    fetchData();
}, [fetchData]);  // ← Re-runs when fetchData changes
```

### Problem
While `usePagination` hook uses refs internally to prevent re-render cycles, the **dependency chain** creates potential instability:

```
useCallback deps: [loadBills, loadShifts, startLoading, stopLoading]
                      ↓
              If any reference changes → fetchData recreated
                      ↓
              useEffect sees new fetchData → re-triggers fetch
                      ↓
              Potential infinite loop (especially with broken hooks)
```

### Mitigating Factor
The `usePagination` hook (`src/hooks/usePagination.ts`) correctly uses `useRef` to prevent this:
```tsx
const loadMore = useCallback(async (...) => {
    // Uses refs instead of state for checks
    if (isLoadingRef.current || (!hasMoreRef.current && !isReset)) return;
    // ...
}, []); // Empty deps - refs are stable
```

However, the broken `startLoading`/`stopLoading` calls would throw before reaching the stable `loadMore`.

---

## Issue #3: Missing Loading Timeout (MEDIUM)

### Location
**File:** `src/pages/admin/PatientsPage.tsx` – Lines 25-37  
**File:** `src/pages/admin/StaffPage.tsx` – Lines 26-38

### Pattern
```tsx
// PatientsPage.tsx - Lines 25-37
const fetchPatients = async () => {
    setLoading(true);
    try {
        const response = await (client.models.Patient as any).list();
        setPatients(response.data || []);
    } catch (err) {
        console.error('Error fetching patients:', err);
        showToast('error', 'Error al cargar la lista de pacientes');
    } finally {
        setLoading(false);
    }
};
```

### Problem
1. **No timeout mechanism** – If the API hangs indefinitely, the spinner spins forever
2. **No retry logic** – Users have no way to recover without page refresh
3. **Silent network failures** – CORS errors, network timeouts, or AbortController issues may not trigger catch block in all browsers

### Specific Risk Scenarios
| Scenario | Result |
|----------|--------|
| API returns 504 timeout | Spinner shows ~60s, then stops |
| Network disconnect mid-request | May hang indefinitely |
| AWS AppSync cold start | 10-30s delay, no feedback |
| CORS preflight failure | Fetch promise may reject oddly |

---

## Common Anti-Patterns Identified

### 1. Inconsistent Loading State Management

| File | Loading State | Timeout | Retry |
|------|---------------|---------|-------|
| ReportingDashboard | Custom hook (broken) | ✓ (broken) | ✓ (broken) |
| PatientsPage | useState only | ✗ | ✗ |
| StaffPage | useState only | ✗ | ✗ |

### 2. Fire-and-Forget useEffect

```tsx
// Anti-pattern present in all 3 files
useEffect(() => {
    fetchData();  // No cleanup, no abort controller
}, []);
```

**Issues:**
- Component unmount during fetch → state update on unmounted component
- No cancellation on re-render
- Memory leaks in strict mode / hot reload

### 3. Type Assertion Abuse

```tsx
const response = await (client.models.Patient as any).list();
//                                           ^^^^^
```

Present in all files. Masks TypeScript errors that could indicate API mismatches.

---

## Generic Fix Template

### For Simple CRUD Pages (PatientsPage, StaffPage)

```tsx
// Template: Robust data fetching pattern
import { useState, useEffect, useCallback, useRef } from 'react';

export function DataPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchData = useCallback(async () => {
        // Cancel any in-flight request
        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();
        
        setLoading(true);
        setError(null);
        
        try {
            // Add timeout wrapper
            const timeoutId = setTimeout(() => {
                abortControllerRef.current?.abort();
            }, 30000); // 30s timeout
            
            const response = await client.models.Entity.list({
                // If API supports it:
                // signal: abortControllerRef.current.signal
            });
            
            clearTimeout(timeoutId);
            setData(response.data || []);
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err instanceof Error ? err : new Error('Unknown error'));
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        
        return () => {
            abortControllerRef.current?.abort();
        };
    }, [fetchData]);

    // ... render with error state
}
```

### For Complex Dashboards (ReportingDashboard)

```tsx
// Template: Fix useLoadingTimeout usage
// Option A: Create the expected overload
export function useLoadingTimeout() {
    const [isLoading, setIsLoading] = useState(false);
    const [hasTimedOut, setHasTimedOut] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout>();
    
    const startLoading = useCallback(() => {
        setIsLoading(true);
        setHasTimedOut(false);
        timeoutRef.current = setTimeout(() => {
            setHasTimedOut(true);
        }, 30000);
    }, []);
    
    const stopLoading = useCallback(() => {
        setIsLoading(false);
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }, []);
    
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);
    
    return { isLoading, hasTimedOut, startLoading, stopLoading };
}

// Option B: Adapt component to existing hook API
const [isLoading, setIsLoading] = useState(false);
const { hasTimedOut, reset } = useLoadingTimeout(isLoading, { timeoutMs: 30000 });
```

---

## Prevention Guidelines

### 1. TypeScript Strictness
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```
**Remove `as any` casts** – they hide exactly these issues.

### 2. Hook Contract Testing
```tsx
// hooks/__tests__/useLoadingTimeout.test.ts
describe('useLoadingTimeout', () => {
    it('should return expected API shape', () => {
        const { result } = renderHook(() => useLoadingTimeout());
        
        // Fails fast if API changes
        expect(result.current).toHaveProperty('isLoading');
        expect(result.current).toHaveProperty('startLoading');
        expect(result.current).toHaveProperty('stopLoading');
    });
});
```

### 3. Standard Data Fetching Pattern
Create a shared hook for all CRUD pages:
```tsx
// hooks/useDataFetch.ts
export function useDataFetch<T>(fetchFn: () => Promise<T[]>) {
    // Encapsulate: loading, error, timeout, retry, abort
    // All pages use this → consistent behavior
}
```

### 4. Loading State Checklist
Before shipping any data-fetching component:
- [ ] Loading state has a maximum duration (timeout)
- [ ] Error state is displayed, not just logged
- [ ] User can retry without page refresh
- [ ] Component cleanup cancels in-flight requests
- [ ] TypeScript compiles without `as any` on API calls

### 5. ESLint Rules
```js
// .eslintrc
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

---

## Recommended Fix Priority

| Priority | Issue | Fix Effort | Impact |
|----------|-------|------------|--------|
| P0 | Hook API mismatch | ~2 hours | Unblocks ReportingDashboard |
| P1 | Add timeout to CRUD pages | ~1 hour | Prevents hung states |
| P2 | Add AbortController cleanup | ~30 min | Prevents memory leaks |
| P3 | Remove `as any` casts | ~2 hours | Catches future breaks |

---

## Appendix: Exact Lines Reference

### ReportingDashboard.tsx
| Line | Issue |
|------|-------|
| 12 | `useLoadingTimeout()` - wrong API |
| 28 | `startLoading()` - undefined function |
| 65 | `stopLoading()` - undefined function |
| 67 | `stopLoading()` - undefined function |
| 69 | `[loadBills, loadShifts, startLoading, stopLoading]` - broken deps |
| 77-79 | `useEffect` with unstable `fetchData` |

### PatientsPage.tsx
| Line | Issue |
|------|-------|
| 25-37 | `fetchPatients` - no timeout/abort |
| 39-41 | `useEffect` - no cleanup |

### StaffPage.tsx
| Line | Issue |
|------|-------|
| 26-38 | `fetchNurses` - no timeout/abort |
| 40-42 | `useEffect` - no cleanup |

---

*Analysis complete. Do NOT apply fixes automatically – review with team first.*
