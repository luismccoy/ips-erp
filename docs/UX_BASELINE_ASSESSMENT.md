# IPS-ERP UX Baseline Assessment
**Version:** 1.0  
**Assessment Date:** January 29, 2026  
**Prepared By:** UX Strategist (Opus Subagent)  
**Methodology:** Multi-document synthesis, codebase analysis, persona testing review

---

## Executive Summary

This document establishes **baseline UX scores** for IPS-ERP across all core user workflows. It consolidates findings from 18+ UX research documents and provides a quantitative framework for measuring improvement.

### Overall UX Health Score: **68/100** ⚠️ NEEDS IMPROVEMENT

| Dimension | Score | Status |
|-----------|-------|--------|
| **Functionality** | 72/100 | 🟡 Moderate Issues |
| **Usability** | 65/100 | 🟡 Moderate Issues |
| **Accessibility** | 58/100 | 🔴 Needs Work |
| **Mobile/Touch** | 70/100 | 🟡 Moderate Issues |
| **Clinical Safety** | 62/100 | 🔴 Critical Gaps |
| **Performance (Perceived)** | 75/100 | 🟢 Acceptable |

---

## 1. Critical User Journeys Inventory

### 1.1 PATIENT INTAKE JOURNEY

**User:** Admin/Clinical Coordinator  
**Frequency:** 5-10 new patients/week (typical IPS)  
**Time Criticality:** Medium (same-day completion expected)

```
Landing Page → Login → Admin Dashboard → Pacientes → Nuevo Paciente → PatientForm → Save
```

#### Current State Analysis

| Step | Component | UX Score | Issues |
|------|-----------|----------|--------|
| 1. Login | `App.tsx` | 55/100 | Routing confusion - redirects to Family Portal from `/`, `/admin` |
| 2. Navigate to Patients | `AdminDashboard.tsx` | 40/100 | **P0 BUG**: Sidebar navigation non-functional |
| 3. Open New Patient Form | `PatientsPage.tsx` | 70/100 | Modal opens correctly |
| 4. Complete Patient Form | `PatientForm.tsx` | 65/100 | Some fields UI-only (not persisted) |
| 5. Save Patient | GraphQL mutation | 75/100 | Works in demo mode |

**Journey Score: 61/100** 🔴

**Critical Blockers:**
- ❌ C4: Admin sidebar navigation completely broken
- ⚠️ Routing issues prevent natural admin access

**Form Completeness:**
| Field | Persisted | Required |
|-------|-----------|----------|
| Name | ✅ Yes | ✅ |
| Document ID | ✅ Yes | ✅ |
| DOB/Age | ✅ Yes | ✅ |
| Address | ✅ Yes | ❌ |
| Phone | ❌ UI-only | ❌ |
| City | ❌ UI-only | ❌ |
| Diagnosis | ✅ Yes | ❌ |
| EPS | ✅ Yes | ❌ |
| Emergency Contact | ❌ UI-only | ❌ |

---

### 1.2 CLINICAL DOCUMENTATION JOURNEY

**User:** Nurse (Field Staff)  
**Frequency:** 3-8 visits/day per nurse  
**Time Criticality:** HIGH (documentation during or immediately after visit)

```
SimpleNurseApp → Select Patient → "Iniciar Visita" → VisitDocumentationForm → 
Complete KARDEX → Vitals → Medications → "Nueva Valoración" → Clinical Scales → Submit
```

#### Current State Analysis

| Step | Component | UX Score | Issues |
|------|-----------|----------|--------|
| 1. Load Patient List | `SimpleNurseApp.tsx` | 85/100 | ✅ Works well with demo data |
| 2. View Patient Card | `ShiftCard.tsx` | 80/100 | ✅ Status badges visible |
| 3. Start Visit | Action buttons | 75/100 | ⚠️ C1: Some buttons hidden (partially fixed) |
| 4. KARDEX Documentation | `VisitDocumentationForm.tsx` | 70/100 | ⚠️ Close button non-responsive |
| 5. Enter Vitals | Vitals section | 75/100 | Input types appropriate |
| 6. Clinical Scales | `AssessmentEntryForm.tsx` | 72/100 | ⚠️ H2: Pain scale needs numeric input |
| 7. Submit for Review | Submit workflow | 68/100 | ⚠️ Unclear why button disabled |

**Journey Score: 75/100** 🟡

**Critical Issues Found:**
- ❌ C2: No data loss warning on form close (HIPAA risk)
- ⚠️ Close button behavior inconsistent
- ⚠️ "Nueva Valoración" feature unclear location

**Touch Target Compliance:**
| Element | Current Size | Required | Status |
|---------|--------------|----------|--------|
| Patient Cards | ~Full width | 44px+ | ✅ Pass |
| "Iniciar Visita" | ~48px | 48px | ✅ Pass |
| Tab Buttons | ~200px+ | 44px+ | ✅ Pass |
| Modal Close (X) | 24px | 44px | ❌ **FAIL** |
| Pain Slider | Adequate | 44px+ | ✅ Pass |
| Form Submit | ~48px | 48px | ✅ Pass |

---

### 1.3 BILLING/RIPS JOURNEY

**User:** Admin/Billing Staff  
**Frequency:** Daily batch processing  
**Time Criticality:** Medium (monthly compliance deadlines)

```
Admin Dashboard → Facturación y RIPS → Select Records → Validate → Generate JSON → 
AI Glosa Defense (if needed) → Export
```

#### Current State Analysis

| Step | Component | UX Score | Issues |
|------|-----------|----------|--------|
| 1. Navigate to Billing | Sidebar navigation | 0/100 | ❌ P0: Navigation broken |
| 2. View Billing Records | `BillingDashboard.tsx` | 70/100 | Component exists |
| 3. AI Validation | `BillingFormWithAI.tsx` | 68/100 | Auto-debounce works |
| 4. View Suggestions | `AISuggestionCard.tsx` | 72/100 | Clear severity badges |
| 5. RIPS Export | `RipsExportPanel.tsx` | 75/100 | Validation badges visible |
| 6. AI Glosa Defense | `EvidenceGenerator.tsx` | N/A | ⏭️ Not tested (blocked) |

**Journey Score: 47/100** 🔴 (Blocked by navigation)

**Key Differentiator Status:**
- 🔴 AI Glosa Defender: **CANNOT TEST** due to navigation blocker
- ⚠️ Critical feature for market positioning untestable

---

## 2. UX Baseline Scores by Heuristic

### 2.1 Nielsen's 10 Usability Heuristics

| # | Heuristic | Score | Evidence |
|---|-----------|-------|----------|
| 1 | **Visibility of System Status** | 70/100 | ✅ Sync badges, ⚠️ Loading timeouts missing |
| 2 | **Match Real World** | 82/100 | ✅ Spanish localization, healthcare terminology |
| 3 | **User Control & Freedom** | 52/100 | ❌ No undo, ❌ No data loss warning |
| 4 | **Consistency & Standards** | 68/100 | ⚠️ Mixed animation systems (CSS + Framer) |
| 5 | **Error Prevention** | 55/100 | ❌ Form close discards data, ❌ Double-submit risk |
| 6 | **Recognition > Recall** | 75/100 | ✅ Status badges, ⚠️ Hidden action buttons |
| 7 | **Flexibility & Efficiency** | 60/100 | ❌ No keyboard shortcuts, ❌ No saved filters |
| 8 | **Aesthetic & Minimalist** | 85/100 | ✅ Modern dark theme, clean cards |
| 9 | **Help Recovery from Errors** | 58/100 | ⚠️ ErrorState not localized, ⚠️ Generic messages |
| 10 | **Help & Documentation** | 65/100 | ✅ Guided tour, ⚠️ No contextual help |

**Heuristic Average: 67/100**

---

### 2.2 Accessibility (WCAG 2.1 AA)

| Criterion | Status | Score | Details |
|-----------|--------|-------|---------|
| **Color Contrast** | ⚠️ Issues | 60/100 | Light gray text fails 4.5:1 ratio |
| **Touch Targets** | ⚠️ Mixed | 65/100 | Modal X button only 24px |
| **Focus Indicators** | ⚠️ Missing | 55/100 | No focus-visible styles |
| **Screen Reader** | ⚠️ Gaps | 50/100 | Missing aria-labels on icon buttons |
| **Keyboard Navigation** | ⚠️ Limited | 58/100 | No global shortcuts |
| **Text Resizing** | ✅ Good | 80/100 | Relative units used |

**Accessibility Score: 61/100** 🔴

**Priority Fixes:**
1. All icon buttons need `aria-label`
2. Modal close button → 44px minimum
3. Add `focus-visible` outline styles
4. Fix light gray text contrast

---

### 2.3 Mobile UX Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Touch target size | ≥44px | Mixed | 🟡 Most pass, Modal X fails |
| Button spacing | ≥8px | 16px+ | ✅ Pass |
| Text readability | ≥16px body | 14-16px | 🟡 Some secondary text small |
| Card padding | ≥16px | 24px | ✅ Pass |
| Action discoverability | Primary visible | Mixed | 🟡 Some buttons hidden |

**Mobile Score: 70/100**

---

## 3. Priority Matrix

### 3.1 Impact vs. Effort Analysis

```
HIGH IMPACT
    │
    │   C4: Sidebar Navigation       C2: Data Loss Warning
    │   ┌───────────┐                ┌───────────┐
    │   │ CRITICAL  │                │  QUICK    │
    │   │  FIX NOW  │                │   WIN     │
    │   └───────────┘                └───────────┘
    │
    │   C3: Modal Touch Target       H4: Framer Motion
    │   ┌───────────┐                ┌───────────┐
    │   │  QUICK    │                │  PLAN     │
    │   │   WIN     │                │  LATER    │
    │   └───────────┘                └───────────┘
    │
    └────────────────────────────────────────────────►
         LOW EFFORT                  HIGH EFFORT
```

### 3.2 Prioritized Fix List

#### 🔴 P0 - SHIP BLOCKERS (Fix This Week)

| ID | Issue | Impact | Effort | Owner |
|----|-------|--------|--------|-------|
| **C4** | Admin sidebar navigation broken | 100% admin features blocked | M | Frontend |
| **C2** | No data loss warning on form close | HIPAA risk, data loss | S | Frontend |
| **C3** | Modal close button 24px (need 44px) | Accessibility fail, frustration | XS | Frontend |
| **C5** | ErrorState not localized to Spanish | Inconsistent UX | XS | Frontend |
| **Routing** | Admin routes redirect to Family Portal | Cannot access admin | M | Frontend |

**Estimated Time: 2-3 days**

#### 🟡 P1 - HIGH (Fix This Sprint)

| ID | Issue | Impact | Effort | Owner |
|----|-------|--------|--------|-------|
| **C1** | Hidden "Iniciar Visita" buttons | Workflow confusion | M | Frontend |
| **H1** | No loading timeout with error | Infinite spinners | S | Frontend |
| **H2** | Pain scale needs numeric input | Clinical precision | S | Frontend |
| **H3** | Status badge confusion (3+ per card) | Cognitive overload | S | Frontend |
| **H6** | Light gray text contrast | WCAG fail | XS | Frontend |

**Estimated Time: 4-5 days**

#### 🟢 P2 - MEDIUM (Next Sprint)

| ID | Issue | Impact | Effort | Owner |
|----|-------|--------|--------|-------|
| **M1** | Missing aria-labels | Screen reader fails | S | Frontend |
| **M2** | Empty states lack CTAs | User confusion | S | Frontend |
| **M3** | No skeleton loaders | Poor perceived perf | M | Frontend |
| **M4** | Tooltips missing on icons | Discoverability | S | Frontend |
| **H4** | Modals use CSS not Framer Motion | Inconsistent | M | Frontend |
| **H5** | No page transitions | Unpolished feel | M | Frontend |

**Estimated Time: 3-4 days**

---

## 4. Journey Success Metrics

### 4.1 Current Baseline (To Track Improvement)

| Journey | Current Score | Target Score | Gap |
|---------|---------------|--------------|-----|
| Patient Intake | 61/100 | 85/100 | -24 |
| Clinical Documentation | 75/100 | 90/100 | -15 |
| Billing/RIPS | 47/100 | 85/100 | -38 |
| **Overall** | **61/100** | **87/100** | **-26** |

### 4.2 KPIs to Track

| Metric | Current Estimate | Target | Measurement Method |
|--------|------------------|--------|-------------------|
| Task Success Rate | ~70% | 95%+ | User testing |
| Time on Task (Patient Intake) | Unknown | <3 min | Analytics |
| Error Rate (Form Submission) | Unknown | <5% | Error logs |
| Mobile Tap Accuracy | ~85% | 98%+ | Touch analytics |
| SUS Score | Est. 62 | 72+ | Survey |

---

## 5. Competitive Position

### 5.1 UX Benchmarks vs. Competition

| Competitor | Est. UX Score | IPS-ERP Comparison |
|------------|---------------|-------------------|
| Medifolios | 55/100 (Legacy UI) | +13 ahead |
| HeOn | 70/100 (Enterprise) | -2 behind |
| Saludtools | 65/100 (Functional) | +3 ahead |
| **IPS-ERP** | **68/100** | Baseline |

### 5.2 Differentiator Status

| Feature | UX Status | Market Uniqueness |
|---------|-----------|-------------------|
| AI Glosa Defense | 🔴 **BLOCKED** (cannot test) | ✅ UNIQUE |
| Family Portal | 🟡 Works but routing issues | ✅ UNIQUE |
| Modern Dark Theme | ✅ Excellent | ✅ AHEAD |
| Mobile-First Nurse App | 🟡 Good (minor issues) | ✅ COMPETITIVE |
| AI Rostering | 🔴 **BLOCKED** (cannot test) | ✅ UNIQUE |

---

## 6. Recommended Action Plan

### Week 1: Critical Fixes
- [ ] **Day 1-2:** Fix P0 sidebar navigation bug
- [ ] **Day 2:** Fix routing (admin, dashboard paths)
- [ ] **Day 3:** Implement data loss warning on form close
- [ ] **Day 3:** Fix modal close button size (44px)
- [ ] **Day 4:** Localize ErrorState to Spanish
- [ ] **Day 5:** Re-test all P0 items, verify fixes

### Week 2: High Priority
- [ ] Fix hidden action buttons (C1)
- [ ] Implement useLoadingTimeout hook (H1)
- [ ] Add numeric input for pain scale (H2)
- [ ] Simplify status badge logic (H3)
- [ ] Fix text contrast issues (H6)

### Week 3-4: Polish & Accessibility
- [ ] Add aria-labels to all icon buttons
- [ ] Create skeleton loaders
- [ ] Implement Tooltip component
- [ ] Standardize Framer Motion animations
- [ ] Add page transitions

---

## 7. Appendix: Source Documents

This assessment synthesized findings from:

1. `UX_MASTER_CONSOLIDATED.md` - 47 actionable issues
2. `UI_UX_RESEARCH.md` - Design patterns and inspiration
3. `CLINICAL_UX_STRESS_TEST.md` (Rounds 1-4) - Clinical workflow testing
4. `MOBILE_UX_AUDIT.md` - Touch target analysis
5. `DESIGN_TOKENS.md` - Design system spec
6. `COMPETITOR_ANALYSIS.md` - Market positioning
7. `PERSONA_TEST_NURSE.md` - End-to-end nurse testing
8. `PERSONA_TEST_ADMIN.md` - End-to-end admin testing
9. `NAV_MAP_ARCHITECTURE.md` - Route analysis
10. Codebase analysis: `App.tsx`, `SimpleNurseApp.tsx`, `PatientForm.tsx`, `BillingFormWithAI.tsx`, `AssessmentForm.tsx`

---

## 8. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-29 | UX Strategist (Opus) | Initial baseline assessment |

---

**Next Review Date:** After P0 fixes (estimated Week 2)  
**Assessment Frequency:** Weekly during active development
