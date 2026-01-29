# Cycle 2 Priority Fixes
**Created:** January 29, 2026  
**Sprint Focus:** HIPAA Compliance + Clinical UX Critical Path  
**Estimated Total Effort:** 4-6 hours  
**Owner:** Frontend Team (Antigravity IDE)

---

## Executive Decision Summary

### Priority Rationale

**C2 (Data Loss Warning) is the #1 fix** — not because it's the hardest, but because:
1. 🏥 **HIPAA Violation Risk**: Lost clinical documentation = compliance exposure
2. 💰 **Legal Liability**: Nurses could lose 15-30 min of documentation with one accidental tap
3. 🔥 **User Trust Destroyer**: One data loss incident = permanent distrust of the system
4. ⚡ **Low Effort / Massive Impact**: ~45 min for enterprise-grade protection

### Prioritization Formula Used

```
Priority Score = (Clinical Safety × 3) + (HIPAA Risk × 3) + (User Impact × 2) + (1 / Effort)
```

| Fix | Clinical Safety | HIPAA Risk | User Impact | Effort | **Score** |
|-----|-----------------|------------|-------------|--------|-----------|
| **C2: Data Loss Warning** | 9/10 | 10/10 | 9/10 | LOW | **87** |
| **H1: Loading Timeouts** | 7/10 | 3/10 | 8/10 | LOW | **52** |
| **C1: Hidden Buttons** | 8/10 | 2/10 | 9/10 | MED | **51** |
| **H2: Pain Scale Numeric** | 6/10 | 4/10 | 6/10 | LOW | **44** |

---

## Implementation Sequence (Optimal Order)

### 1️⃣ C2: Form Close Data Loss Warning
**Time Estimate:** 45 minutes  
**Impact:** CRITICAL (HIPAA + Trust)  
**Dependencies:** None  

#### Why First?
- Zero dependencies — can start immediately
- Highest regulatory risk if shipped without
- Single file change with reusable pattern
- "First, do no harm" — prevent data loss before adding features

#### Implementation Spec

**Location:** `src/components/VisitDocumentationForm.tsx` (and any other forms with state)

**Behavior:**
```
IF user clicks close/back/navigate away
AND form has unsaved changes (dirty state)
THEN show confirmation modal:
  "¿Descartar cambios?"
  "Tienes cambios sin guardar. Si cierras ahora, se perderán."
  [Descartar] [Seguir Editando]
```

**Technical Approach:**
```tsx
// 1. Track dirty state
const [isDirty, setIsDirty] = useState(false);
const [showDiscardModal, setShowDiscardModal] = useState(false);

// 2. Mark dirty on any input change
const handleFieldChange = (field, value) => {
  setIsDirty(true);
  // existing logic
};

// 3. Intercept close
const handleClose = () => {
  if (isDirty) {
    setShowDiscardModal(true);
  } else {
    onClose();
  }
};

// 4. Browser navigation protection
useEffect(() => {
  const handleBeforeUnload = (e) => {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  };
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [isDirty]);
```

**Modal Design:**
- Use existing Modal component
- Warning icon (⚠️)
- Primary action: "Seguir Editando" (keep them safe)
- Destructive secondary: "Descartar" (red text)

**Test Cases:**
- [ ] Fill any field → click X → warning appears
- [ ] Fill field → save → click X → no warning (clean state)
- [ ] Fill field → browser back → warning appears
- [ ] Fill field → refresh → browser native warning

---

### 2️⃣ H1: Loading State Timeouts
**Time Estimate:** 30 minutes  
**Impact:** HIGH (prevents infinite spinners)  
**Dependencies:** None  

#### Why Second?
- Reusable hook pattern (write once, use everywhere)
- Quick win that prevents support tickets
- Improves perceived reliability

#### Implementation Spec

**Create:** `src/hooks/useLoadingTimeout.ts`

```tsx
import { useState, useEffect, useCallback } from 'react';

interface LoadingTimeoutOptions {
  timeoutMs?: number;
  onTimeout?: () => void;
}

export function useLoadingTimeout(
  isLoading: boolean,
  options: LoadingTimeoutOptions = {}
) {
  const { timeoutMs = 15000, onTimeout } = options;
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setHasTimedOut(false);
      return;
    }

    const timer = setTimeout(() => {
      setHasTimedOut(true);
      onTimeout?.();
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [isLoading, timeoutMs, onTimeout]);

  const retry = useCallback(() => {
    setHasTimedOut(false);
  }, []);

  return { hasTimedOut, retry };
}
```

**Usage Pattern:**
```tsx
const { hasTimedOut, retry } = useLoadingTimeout(loading, {
  timeoutMs: 15000,
  onTimeout: () => console.warn('Load timeout reached')
});

if (hasTimedOut) {
  return (
    <ErrorState 
      message="La carga está tardando más de lo esperado"
      actionLabel="Reintentar"
      onAction={retry}
    />
  );
}
```

**Apply To:**
- [ ] `SimpleNurseApp.tsx` patient list loading
- [ ] `VisitDocumentationForm.tsx` save operation
- [ ] `BillingDashboard.tsx` data fetch
- [ ] Any GraphQL query loading state

---

### 3️⃣ C1: Hidden Action Buttons Fix
**Time Estimate:** 1-1.5 hours  
**Impact:** HIGH (workflow completion)  
**Dependencies:** May need mobile viewport testing  

#### Why Third?
- More complex — needs responsive logic review
- C2 and H1 provide safety net while this is WIP
- Requires more thorough testing

#### Problem Analysis

**Root Cause:** Action buttons in `ShiftCard.tsx` are either:
1. Conditionally hidden based on status logic
2. Overflowing and clipped on certain viewports
3. Z-index issues with overlapping elements

**Investigation Steps:**
1. Inspect `ShiftCard.tsx` for conditional rendering
2. Check CSS for `overflow: hidden` on parent containers
3. Test at 320px, 375px, 414px viewport widths
4. Verify status-based button visibility logic

**Expected Fix:**
```tsx
// Ensure buttons always visible regardless of status
// Use responsive stacking on small screens

<div className="flex flex-col sm:flex-row gap-2 mt-4">
  <Button 
    variant="primary"
    className="w-full sm:w-auto min-h-[48px]"
  >
    Iniciar Visita
  </Button>
  {/* Secondary actions in dropdown on mobile */}
</div>
```

**Alternative: Action Menu Pattern**
If too many buttons, consolidate into:
- Primary action always visible
- Secondary actions in "..." menu

---

### 4️⃣ H2: Pain Scale Numeric Input
**Time Estimate:** 45 minutes  
**Impact:** MEDIUM-HIGH (clinical precision)  
**Dependencies:** None  

#### Why Fourth?
- Important for clinical accuracy but not blocking
- Slider works, numeric is enhancement
- Lower regulatory risk than C2

#### Problem Statement
Current pain scale is slider-only. Nurses need:
1. Quick thumb-tap for common values (0, 5, 10)
2. Exact numeric entry for precise documentation
3. Visual feedback of selected value

#### Implementation Spec

**Location:** `src/components/AssessmentEntryForm.tsx` (or wherever pain scale lives)

**Design Pattern: Hybrid Input**
```tsx
<div className="space-y-3">
  <label className="text-sm font-medium">Escala de Dolor (0-10)</label>
  
  {/* Quick-tap chips for common values */}
  <div className="flex gap-2 flex-wrap">
    {[0, 2, 4, 5, 6, 8, 10].map(val => (
      <button
        key={val}
        onClick={() => setPainValue(val)}
        className={`
          w-10 h-10 rounded-full border-2 font-bold
          ${painValue === val ? 'bg-primary-500 border-primary-500 text-white' : 'border-gray-600'}
        `}
      >
        {val}
      </button>
    ))}
  </div>
  
  {/* Slider for fine adjustment */}
  <input
    type="range"
    min="0"
    max="10"
    step="1"
    value={painValue}
    onChange={(e) => setPainValue(Number(e.target.value))}
    className="w-full"
  />
  
  {/* Numeric display/input */}
  <div className="flex items-center gap-2">
    <span className="text-3xl font-bold">{painValue}</span>
    <span className="text-gray-400">/10</span>
  </div>
</div>
```

**Clinical Considerations:**
- 0-3: Green (mild)
- 4-6: Yellow (moderate)  
- 7-10: Red (severe)
- Add color coding to value display

---

## Implementation Schedule

### Suggested Time Blocks

| Block | Fix | Duration | Checkpoint |
|-------|-----|----------|------------|
| **Block A** | C2: Data Loss Warning | 45 min | Form close protection working |
| **Break** | Testing | 10 min | Verify C2 in all forms |
| **Block B** | H1: Loading Timeout Hook | 30 min | Hook created + 1 integration |
| **Break** | Testing | 10 min | Verify timeout UI appears |
| **Block C** | C1: Hidden Buttons | 60-90 min | All action buttons visible |
| **Break** | Mobile Testing | 15 min | Test on 3 viewport sizes |
| **Block D** | H2: Pain Scale Numeric | 45 min | Hybrid input working |
| **Final** | Integration Testing | 20 min | Full nurse workflow pass |

**Total: ~4.5-5.5 hours** (including testing)

---

## Risk Assessment

### If We Skip C2 (Data Loss Warning)
- ⚠️ **Probability of data loss incident:** HIGH (within 2 weeks)
- ⚠️ **Impact:** Nurse loses 20+ min of documentation
- ⚠️ **Outcome:** Complaint to supervisor, possible HIPAA report
- ⚠️ **Recovery cost:** 4-8 hours of crisis response + reputation damage

### If We Skip H1 (Loading Timeout)
- **Probability of issue:** MEDIUM
- **Impact:** User sees infinite spinner, force-quits app
- **Outcome:** Support ticket, user frustration
- **Recovery cost:** 30 min to hotfix

### If We Skip C1 (Hidden Buttons)
- **Probability of issue:** HIGH (every session)
- **Impact:** User can't complete workflow without workaround
- **Outcome:** Training burden, reduced efficiency
- **Recovery cost:** 1-2 hours to fix

### If We Skip H2 (Pain Scale)
- **Probability of issue:** LOW-MEDIUM
- **Impact:** Slight documentation friction
- **Outcome:** Nurses adapt, minor complaints
- **Recovery cost:** 45 min (can defer)

---

## Definition of Done

### C2: Data Loss Warning
- [ ] Warning modal appears when closing dirty form
- [ ] Browser beforeunload event fires on navigation
- [ ] "Seguir Editando" returns user to form
- [ ] "Descartar" closes without saving
- [ ] Clean forms close without warning
- [ ] Spanish copy reviewed

### H1: Loading Timeouts
- [ ] `useLoadingTimeout` hook exists
- [ ] 15-second default timeout
- [ ] Timeout shows retry UI
- [ ] Retry resets timeout
- [ ] Applied to at least 2 components

### C1: Hidden Buttons
- [ ] "Iniciar Visita" visible on all viewport sizes
- [ ] Buttons accessible on 320px width
- [ ] Touch targets ≥48px
- [ ] Action visibility not blocked by status

### H2: Pain Scale Numeric
- [ ] Quick-tap chips for common values
- [ ] Slider still functional
- [ ] Numeric value clearly displayed
- [ ] Color coding by severity
- [ ] Accessible via keyboard

---

## Post-Cycle Metrics

After Cycle 2, re-measure:

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|-------------|
| Clinical Documentation Journey Score | 75/100 | 82/100 | Heuristic re-eval |
| Nielsen #3 (User Control) | 52/100 | 70/100 | C2 fix |
| Nielsen #5 (Error Prevention) | 55/100 | 68/100 | C2 + H1 fixes |
| Touch Target Compliance | 85% | 95% | C1 + responsive |

---

## Appendix: Files to Modify

| File | Fixes | Priority |
|------|-------|----------|
| `src/components/VisitDocumentationForm.tsx` | C2 | P0 |
| `src/hooks/useLoadingTimeout.ts` | H1 (create) | P1 |
| `src/components/SimpleNurseApp.tsx` | H1 integration | P1 |
| `src/components/ShiftCard.tsx` | C1 | P1 |
| `src/components/AssessmentEntryForm.tsx` | H2 | P1 |
| `src/components/PatientForm.tsx` | C2 (secondary) | P0 |

---

**Cycle 2 Start:** Ready for implementation  
**Cycle 2 Review:** After all 4 fixes + testing  
**Next Cycle (3):** P1 remainder (H3 status badges, H6 contrast) + P2 items
