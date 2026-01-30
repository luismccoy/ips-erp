# Bug Report - IPS-ERP Nurse Workflow
**Date:** 2026-01-29  
**Test Session:** Agentic Bug Hunt  
**Deploy Tested:** #6 (91e7757)

## P0 Bugs (Crash / Blocker)

### ✅ FIXED: React Router Context Error
**Status:** RESOLVED in deploy #6  
**Location:** Multiple components (VisitDocumentationForm, AssessmentForm, useUnsavedChangesWarning)  
**Error:**
```
Error: useNavigate() may be used only in the context of a <Router> component
```
**Fix:** Removed all react-router-dom imports (app doesn't use Router)

## P1 Bugs (Blocking Functionality)

### 🐛 BUG #1: simulateNetworkDelay Not Exported
**Status:** FIX DEPLOYED (#7, pending verification)  
**Location:** `src/api/workflow-api.ts` + `src/components/VisitDocumentationForm.tsx`  
**Error:**
```
ReferenceError: simulateNetworkDelay is not defined
```
**Impact:** Visit draft loading fails  
**Steps to Reproduce:**
1. Navigate to nurse demo
2. Click "Iniciar Visita"
3. Error appears in console

**Root Cause:** `simulateNetworkDelay` defined in workflow-api.ts but not exported, VisitDocumentationForm tries to import it

**Fix Applied:** Export function + add to import statement

### 🐛 BUG #2: Clinical Scales Tab Crash
**Status:** ACTIVE (unfixed)  
**Location:** `src/components/SimpleNurseApp.tsx` (Assessment form render)  
**Error:**
```
ReferenceError: Cannot access 'p' before initialization
```
**Impact:** Escalas Clínicas tab completely broken, crashes page  
**Steps to Reproduce:**
1. Navigate to nurse demo
2. Click "Iniciar Visita" on any patient
3. Click "Escalas Clínicas" tab
4. Immediate crash

**Root Cause:** Temporal Dead Zone (TDZ) violation - variable 'p' accessed before declaration in minified code. Likely a circular dependency or hoisting issue in the AssessmentForm component.

**Severity:** P1 - Blocks all clinical assessment workflows

## P2 Bugs (Non-Blocking)

### 🐛 BUG #3: Manifest Syntax Error
**Status:** ACTIVE (low priority)  
**Location:** `/manifest.webmanifest`  
**Error:**
```
Manifest: Line: 1, column: 1, Syntax error.
```
**Impact:** PWA features may not work, browser console noise  
**Steps to Reproduce:** Load any page, check console  
**Note:** Non-blocking, cosmetic issue

## Test Coverage

### ✅ Tested Successfully
- Landing page load
- Demo selector
- Nurse portal navigation
- Visit list display
- "Iniciar Visita" button (loads form without crash after Router fix)
- KARDEX tab (loads, shows fields)

### ❌ Blocked by Bugs
- Escalas Clínicas tab (crashes)
- Visit submission (cannot reach due to Clinical Scales crash)
- Visit draft recovery (blocked by simulateNetworkDelay)

### ⏳ Not Yet Tested
- Admin portal workflows
- Family portal workflows
- Edge cases (refresh, back button, empty states)
- Form validation
- Data persistence

## Recommended Fix Order
1. **Deploy #7 verification** - Confirm simulateNetworkDelay fix works
2. **Fix Clinical Scales crash** - P1 blocker, investigate TDZ error
3. **Full workflow test** - Once both fixed, test end-to-end
4. **Manifest fix** - Clean up console warnings
5. **Agentic sweep** - Comprehensive edge case testing

## Next Steps
1. Wait for deploy #7 completion
2. Verify simulateNetworkDelay fix
3. Investigate Clinical Scales TDZ error (likely AssessmentForm.tsx circular dependency)
4. Spawn Codex agent to fix TDZ bug
5. Deploy + verify
6. Continue comprehensive testing
