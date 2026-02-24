# IPS-ERP UI/UX Design Guidelines

> **Consolidated from 16 research documents, audits, and competitor analyses.**
> **Purpose:** Single source of truth for the UI/UX redesign.
> **Last Updated:** February 10, 2026

---

## 1. Design Principles

| Principle | Rule |
|-----------|------|
| **Trust First** | Healthcare demands credibility. Use compliance badges, testimonials, enterprise typography. No neon, no emoji icons, no startup aesthetics. |
| **Role-Based UX** | Admin = data-dense command center. Nurse = mobile-first task flow. Family = simple, reassuring read-only. |
| **Mobile-First** | 70%+ of nurses use mobile. Design for 375px first, scale up. All touch targets >= 48px. |
| **Clarity Over Cleverness** | Medical data must be instantly scannable. No decorative animations. Clear status hierarchy (critical > warning > info > neutral). |
| **Offline-Resilient** | Show sync status always. Queue actions locally. Never lose data on disconnect. |
| **Calm Under Pressure** | Reduce cognitive load in clinical settings. Generous whitespace. Muted palettes. Limit choices per screen. |

---

## 2. Color System

### 2.1 Primary (Trust Blue)

| Token | Hex | Use |
|-------|-----|-----|
| `primary-50` | `#EFF6FF` | Subtle backgrounds |
| `primary-100` | `#DBEAFE` | Hover states |
| `primary-200` | `#BFDBFE` | Active backgrounds |
| `primary-300` | `#93C5FD` | Borders, dividers |
| `primary-400` | `#60A5FA` | Icons, secondary elements |
| `primary-500` | `#3B82F6` | Primary actions |
| `primary-600` | `#2563EB` | **Primary buttons** |
| `primary-700` | `#1D4ED8` | Hover on primary |
| `primary-800` | `#1E40AF` | Active/pressed |
| `primary-900` | `#1E3A8A` | Dark mode primary |

### 2.2 Secondary (Calming Teal)

| Token | Hex | Use |
|-------|-----|-----|
| `secondary-500` | `#14B8A6` | Secondary actions |
| `secondary-600` | `#0D9488` | Secondary buttons |
| `secondary-700` | `#0F766E` | Hover |

### 2.3 Semantic

| Role | Hex | Background | Text |
|------|-----|------------|------|
| Success | `#22C55E` | `#F0FDF4` | `#15803D` |
| Warning | `#F59E0B` | `#FFFBEB` | `#B45309` |
| Error | `#EF4444` | `#FEF2F2` | `#B91C1C` |
| Info | `#0EA5E9` | `#F0F9FF` | `#0369A1` |

### 2.4 Neutrals

| Token | Hex | Use | Contrast vs White |
|-------|-----|-----|-------------------|
| `neutral-50` | `#F8FAFC` | Page background | — |
| `neutral-100` | `#F1F5F9` | Card background | — |
| `neutral-200` | `#E2E8F0` | Borders | — |
| `neutral-300` | `#CBD5E1` | Disabled | — |
| `neutral-400` | `#94A3B8` | Placeholder only | 3.0:1 (fails AA) |
| `neutral-500` | `#64748B` | Secondary text | 4.6:1 |
| `neutral-600` | `#475569` | Body text | 7.0:1 |
| `neutral-700` | `#334155` | Headings | 9.7:1 |
| `neutral-800` | `#1E293B` | Primary text | 13.5:1 |

### 2.5 Healthcare Status Colors

| Status | Color | Use |
|--------|-------|-----|
| Patient Active | `#22C55E` | Enrolled |
| Patient Critical | `#DC2626` | Urgent |
| Patient Discharged | `#64748B` | Inactive |
| Visit Scheduled | `#3B82F6` | Future |
| Visit In-Progress | `#8B5CF6` | Current |
| Visit Completed | `#22C55E` | Done |
| Visit Cancelled | `#EF4444` | Cancelled |
| Priority Critical | `#DC2626` on `#FEE2E2` | Life-threatening |
| Priority High | `#F97316` on `#FFEDD5` | Same-day |
| Priority Medium | `#EAB308` on `#FEF9C3` | 24-48h |
| Priority Low | `#22C55E` on `#DCFCE7` | Routine |

### 2.6 Colors to Avoid

- Bright red as primary (alarm association)
- Neon anything (startup look)
- Purple gradients as dominant color (trendy/non-medical)
- Black backgrounds (too aggressive for healthcare)
- Pure black text — use `neutral-800` instead

---

## 3. Typography

### 3.1 Font Stack

```css
--font-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Consolas, monospace;
```

**Why Inter:** Excellent x-height, tabular figures for clinical data, readable at small sizes.

### 3.2 Scale

| Token | Size | Use |
|-------|------|-----|
| `text-xs` | 12px | Metadata only (never body) |
| `text-sm` | 14px | Captions, secondary |
| `text-base` | **16px** | **Body text minimum** |
| `text-lg` | 18px | Emphasized body |
| `text-xl` | 20px | Section headings |
| `text-2xl` | 24px | Card titles |
| `text-3xl` | 30px | Page titles |
| `text-4xl` | 36px | Dashboard KPIs |
| `text-5xl` | 48px | Hero text |

### 3.3 Weights & Line Heights

| Weight | Value | Use |
|--------|-------|-----|
| Normal | 400 | Body text |
| Medium | 500 | Labels, buttons |
| Semibold | 600 | Subheadings |
| Bold | 700 | Headings, emphasis |

| Context | Line Height |
|---------|-------------|
| Headings | 1.25 |
| Body text | 1.5 |
| Long-form | 1.625 |

### 3.4 Healthcare Typography Rules

- **Minimum body text:** 16px (prevents zoom on mobile)
- **Vital signs:** Use `text-3xl font-bold` with unit in `text-lg font-normal text-neutral-500`
- **Line length:** 50-75 characters max
- **Letter spacing:** -0.02em for headings, 0 for body

---

## 4. Spacing & Layout

### 4.1 Base Unit: 4px

| Token | px | Common Use |
|-------|-----|------------|
| `space-1` | 4px | Tight inline |
| `space-2` | 8px | Compact padding |
| `space-3` | 12px | Button padding-x |
| `space-4` | **16px** | **Standard padding** |
| `space-5` | 20px | Card padding |
| `space-6` | 24px | Section gaps |
| `space-8` | 32px | Component gaps |
| `space-12` | 48px | Touch target min |
| `space-16` | 64px | Page sections |
| `space-20` | 80px | Major sections |
| `space-24` | 96px | Hero sections |

### 4.2 Touch Targets

| Standard | Size | When |
|----------|------|------|
| WCAG minimum | 44px | Absolute minimum |
| **Recommended** | **48px** | **Default for all interactive** |
| Spacious | 56px | Primary actions, nurse field use |
| Gloved hands | 60px | Form inputs in clinical contexts |

### 4.3 Responsive Breakpoints

| Token | Width | Use |
|-------|-------|-----|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablet portrait |
| `lg` | 1024px | Tablet landscape / small desktop |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Large desktop |

### 4.4 Container Widths

- **Full-width content:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- **Focused content (forms, articles):** `max-w-4xl mx-auto px-4`
- **Narrow content (modals):** `max-w-2xl mx-auto px-4`

### 4.5 Section Spacing

- Between major page sections: 80-120px top/bottom
- Between components within a section: 48-64px
- Between cards: 24-32px
- **Golden Rule:** When in doubt, add more space. Enterprise = breathing room.

---

## 5. Component Tokens

### 5.1 Border Radius

| Token | Value | Use |
|-------|-------|-----|
| `radius-sm` | 4px | Badges |
| `radius-md` | 6px | Inputs |
| `radius-lg` | 8px | Buttons, cards |
| `radius-xl` | 12px | Modals |
| `radius-2xl` | 16px | Large cards |
| `radius-full` | 9999px | Avatars, toggles |

### 5.2 Shadows

| Token | Use |
|-------|-----|
| `shadow-xs` | Subtle lift |
| `shadow-sm` | Cards at rest |
| `shadow-md` | Dropdowns |
| `shadow-lg` | Modals |
| `shadow-xl` | Dialogs |
| `shadow-primary` (`rgba(59,130,246,0.4)`) | Primary button hover |

### 5.3 Transitions

| Speed | Duration | Use |
|-------|----------|-----|
| Fast | 100ms | Micro-interactions |
| **Standard** | **150ms** | **Default** |
| Moderate | 200ms | Button states |
| Slow | 300ms | Panel transitions |
| Slower | 500ms | Page transitions |

**Easing:** `cubic-bezier(0.4, 0, 0.2, 1)` for standard, `cubic-bezier(0, 0, 0.2, 1)` for enter.

### 5.4 Z-Index

| Layer | Value |
|-------|-------|
| Base | 0 |
| Raised | 10 |
| Dropdown | 100 |
| Sticky header | 200 |
| Drawer | 300 |
| Modal | 400 |
| Toast | 500 |
| Tooltip | 600 |

---

## 6. Portal-Specific Layout Guidelines

### 6.1 Admin Portal

**Pattern:** Sidebar (264px) + main content area.

- **Sidebar:** Dark (`slate-900`) with icon + label nav items. Active = `blue-600` bg. Collapsible on mobile via hamburger.
- **Header:** 64px height, white bg, border-bottom. Contains search (`Cmd+K`), notification bell (with badge), user avatar dropdown.
- **Main:** `bg-neutral-50`. Stats row (4-col grid) -> charts row (2-col) -> data tables.
- **KPI Cards:** Metric value in `text-3xl font-bold`, sparkline on right, change indicator below.
- **Tabs:** Use horizontal tabs (Hoy | Semana | Mes) for time-scoped views.

### 6.2 Nurse Portal

**Pattern:** Full-screen mobile-first with bottom nav.

- **Bottom Nav:** 2-4 items max. Icon + label. Active = `blue-600`. 56px bar height.
- **Header:** Compact. Avatar + name left, connection status + notification bell right.
- **Visit Cards:** Rounded-xl, white bg, border on left for status color. Patient name prominent, address with map pin, time, and CTA button.
- **Visit Workflow:** Clock In (1 tap) -> Vitals (5-10 taps) -> Tasks (checklist) -> Notes (voice/template) -> Submit (1 tap). Total: 10-15 taps.
- **Offline Banner:** Yellow bg, WifiOff icon, "Modo offline - Se sincronizará automáticamente".
- **Form Inputs:** 60px height for gloved hands. Steppers (±) for numeric. Large toggles for yes/no.

### 6.3 Family Portal

**Pattern:** Centered content, max-w-4xl, calming gradient backgrounds.

- **Auth:** Simple 4-digit access code input.
- **Status Card:** Prominent. Green border when stable, yellow when needs attention, red when critical. CheckCircle icon + clear text.
- **Visit History:** Timeline layout with date, nurse name, services, filtered notes.
- **Vitals Chart:** Line chart for BP/weight/glucose trends.
- **Tone:** Reassuring. "Todo en orden." Large text, simple language, zero medical jargon.
- **Read-only:** No edit capabilities. No destructive actions.

---

## 7. Accessibility (WCAG 2.1 AA)

### 7.1 Non-Negotiable Requirements

| Rule | Standard |
|------|----------|
| Text contrast | 4.5:1 normal, 3:1 large (18px+ or 14px bold) |
| UI component contrast | 3:1 against adjacent colors |
| Touch targets | 44px minimum, 48px recommended |
| Focus indicators | 2px solid outline, 2px offset, `blue-500` |
| Color alone | Never the only indicator — always pair with icon/text |
| Keyboard nav | All actions reachable via Tab + Enter/Space |
| Screen readers | Semantic HTML, ARIA labels on icon buttons, live regions for dynamic content |
| Text resize | Support 200% zoom without loss of function |

### 7.2 Focus States

```css
*:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}
```

### 7.3 ARIA Patterns

- **Icon buttons:** Always add `aria-label` (e.g., `aria-label="Eliminar paciente"`)
- **Dynamic content:** Use `role="status" aria-live="polite"` for notifications
- **Tables:** `role="grid" aria-label="Lista de visitas del día"`
- **Forms:** `aria-describedby` linking inputs to hint/error text, `aria-invalid` for errors
- **Modals:** Focus trap, `aria-modal="true"`, return focus on close

### 7.4 Accessible Form Pattern

```jsx
<div>
  <Label htmlFor="blood-pressure">Presión Arterial</Label>
  <Input
    id="blood-pressure"
    aria-describedby="bp-hint bp-error"
    aria-invalid={hasError}
  />
  <p id="bp-hint" className="text-sm text-neutral-500">
    Formato: sistólica/diastólica (ej: 120/80)
  </p>
  {hasError && (
    <p id="bp-error" className="text-sm text-error-600" role="alert">
      El valor debe estar entre 60/40 y 250/150
    </p>
  )}
</div>
```

---

## 8. Component Library Checklist

### Core UI

- [ ] Button (primary, secondary, outline, ghost, destructive)
- [ ] Input (text, number, date, time, with validation states)
- [ ] Select / Dropdown
- [ ] Checkbox / Radio / Switch
- [ ] Textarea
- [ ] Badge (status variants)
- [ ] Avatar (with fallback initials)
- [ ] Card (with header, content, footer slots)
- [ ] Table (sortable, filterable, paginated)
- [ ] Tabs
- [ ] Modal / Dialog (with focus trap)
- [ ] Toast / Notification (success, error, warning, info + action)
- [ ] Tooltip
- [ ] Dropdown Menu
- [ ] Skeleton Loader (matching table/card shapes)
- [ ] Empty State (icon + title + description + CTA)
- [ ] Error State (with retry)

### Healthcare-Specific

- [ ] PatientCard (name, age, diagnosis, status badge)
- [ ] VisitCard (time, patient, nurse, status, address, CTA)
- [ ] VitalSignsInput (steppers with normal range indicators)
- [ ] ClinicalScaleForm (Glasgow, Braden, Morse, NEWS, Barthel, Norton, RASS)
- [ ] StatusBadge (visit, patient, priority, compliance variants)
- [ ] ComplianceBadge (Res 3100, RIPS 2275, Habeas Data)
- [ ] SyncStatusIndicator (synced/syncing/offline/error)
- [ ] OfflineBanner
- [ ] TimelineEvent (for visit history)
- [ ] KPICard (value + sparkline + change indicator)

### Layout

- [ ] AppShell (sidebar + header for admin)
- [ ] MobileShell (bottom nav for nurse)
- [ ] PageHeader (title + actions)
- [ ] Section (with consistent padding)
- [ ] ErrorBoundary (with fallback UI)
- [ ] LoadingScreen (with timeout fallback)
- [ ] PageTransition (fade + slide, 200ms)

---

## 9. Interaction Patterns

### 9.1 Micro-Interactions

| Element | Hover | Active | Transition |
|---------|-------|--------|------------|
| Card | `y: -4px`, shadow elevation | `scale: 0.98` | 200ms ease |
| Button | Color shift + shadow | `translateY(0)` press | 150ms |
| Nav item | `bg-neutral-50` | `bg-primary-600 text-white` | 150ms |
| List item | `pl-2`, icon scale 110% | — | 200ms |

### 9.2 Page Transitions

```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.2 }}
/>
```

### 9.3 Loading States

- **Data tables:** Skeleton loader matching column structure
- **Panels:** Spinner with 5-second timeout -> error state with retry
- **Buttons:** Disabled + spinner during async operations (prevent double-submit)
- **API calls:** Toast promise pattern (loading -> success/error)

### 9.4 Form UX

- **Auto-save** drafts every 30 seconds (offline-safe)
- **Progressive disclosure** — show fields based on visit type
- **Smart defaults** — pre-fill from last visit or care plan
- **Inline validation** — real-time with color-coded feedback
- **Character counters** on constrained fields
- **Voice input** button for clinical notes

---

## 10. Enterprise Landing Page Guidelines

### 10.1 Enterprise vs. Startup Aesthetic

| Aspect | Do (Enterprise) | Don't (Startup) |
|--------|-----------------|------------------|
| Photography | Real healthcare professionals, Colombian diversity | Generic stock, studio shots |
| Colors | Muted blues/teals, professional | Bright gradients, neon |
| Typography | Serif headlines optional for trust, clean sans body | Playful/rounded fonts |
| Icons | Minimal line-based, subtle | Colorful emoji-style |
| Layout | Generous whitespace | Information-dense |
| Messaging | Outcomes + metrics | Features + hype |
| CTAs | "Solicitar Demo", "Hablar con Experto" | "Sign Up Free" |
| Trust | Client logos, certifications, case studies | User counts |

### 10.2 CTA Strategy

- **Primary:** "Agendar Demo" or "Solicitar Demo" (enterprise, low commitment)
- **Secondary:** "Probar Gratis 14 Días" or "Ver Plataforma en Acción"
- **Avoid:** "Comprar Ahora" (too aggressive), "Registrarse Gratis" (devalues), "Click Aquí" (vague)

### 10.3 Trust Signals

- Compliance badges: Resolución 3100, RIPS 2275, Habeas Data (Ley 1581)
- Statistics: Concrete numbers (e.g., "Reduce glosas de 15% a 3%")
- Testimonials: Real quotes with name, title, IPS name, city
- Client logos: Grayscale, hover to color
- Awards and certifications

### 10.4 Colombian Market

- Use "usted" (formal), never "tú"
- Include local terms: IPS, EPS, RIPS, Historia Clínica, Atención Domiciliaria
- Show multigenerational families (cultural norm)
- Latin American healthcare professionals in imagery
- Mix urban and semi-urban Colombian settings
- Reference Colombian regulations for instant credibility

---

## 11. Known Issues & Lessons from Audits

These are documented UX problems discovered across multiple audits. Address during redesign:

### Critical (Resolved or Must-Fix)

| Issue | Source | Status |
|-------|--------|--------|
| Nurse "Iniciar Visita" crash | Production UX Baseline | Previously critical |
| Modules infinite-loading (Reportes, Pacientes, Personal) | Admin Audit | Check current state |
| Dashboard data inconsistency with module data | Admin Audit | Centralize demo data |

### High Priority for Redesign

| Issue | Recommendation |
|-------|----------------|
| Mobile responsiveness 6/10 | Need proper breakpoints on sidebar, modals, tables |
| Accessibility 5/10 | 90% of interactive elements lack ARIA labels |
| No skeleton loaders | Add to all lazy-loaded panels (not just spinner) |
| Welcome tour every session | Persist dismissal in localStorage |
| No pagination on patient lists | Add for lists > 20 items |
| No calendar view in scheduling | Add day/week/month calendar |
| No drill-down on invoices | Make rows clickable |
| Mix of inline styles and CSS modules | Standardize on Tailwind utility classes |

### UX Polish Items

| Item | Detail |
|------|--------|
| Empty states | Add illustration + description + CTA (not just text) |
| Tooltips | Add for truncated text in tables |
| Animation timing | Standardize: 100ms fast, 200ms standard, 300ms slow |
| Error boundaries | Wrap ALL lazy-loaded panels |
| Form validation | Real-time inline feedback on all forms |
| Offline indicator | Always visible sync status in nurse portal |

---

## 12. Competitor Benchmarks

Key patterns observed across AthenaHealth, Axxess, AlayaCare, DrChrono, SimplePractice:

| Pattern | Adoption | Our Target |
|---------|----------|------------|
| Video/animated hero | 3/5 | Photo hero with stats band |
| Trust badges/awards | 5/5 | Compliance badges prominent |
| Demo CTA | 5/5 | Dual CTA (Demo + Trial) |
| Customer testimonials | 5/5 | 3+ with metrics |
| AI/Innovation messaging | 4/5 | Specific capabilities, not buzzwords |
| Mobile emphasis | 4/5 | Mobile-first nurse portal |
| Specialty segmentation | 5/5 | Role-based portals |
| Sticky navigation | 5/5 | Fixed header on all pages |
| Map integration | 2/5 | Route optimization view |
| G2/award badges | 3/5 | When available |

---

## 13. Implementation Priority

### Phase 1: Foundation (Week 1-2)
1. Implement design tokens as CSS custom properties (`src/styles/tokens.css`)
2. Standardize Tailwind config with brand colors/typography
3. Build/refine core components (Button, Card, Input, Badge, Table, Modal, Toast)
4. Add skeleton loaders and empty states

### Phase 2: Admin Portal Redesign (Week 2-4)
1. Responsive sidebar with mobile hamburger
2. KPI cards with sparklines
3. Proper data tables with sort/filter/pagination
4. Error boundaries on all lazy panels
5. Calendar view for scheduling

### Phase 3: Nurse Portal Redesign (Week 4-6)
1. Bottom nav mobile shell
2. Visit cards with status colors
3. Visit documentation workflow (10-15 taps)
4. Offline mode with sync indicators
5. Clinical scales with inline interpretation

### Phase 4: Family Portal + Landing (Week 6-8)
1. Calming, reassuring design
2. Vitals trend charts
3. Timeline UI for visit history
4. Landing page with enterprise aesthetic
5. Trust signals, testimonials, compliance badges

### Phase 5: Polish & Accessibility (Week 8-9)
1. WCAG 2.1 AA full audit
2. ARIA labels on all interactive elements
3. Keyboard navigation testing
4. Animation timing standardization
5. Performance optimization (lazy loading, code splitting)

---

*Consolidated from: UI_UX_RESEARCH.md, UX_RESEARCH_HEALTHCARE_SAAS.md, DESIGN_TOKENS.md, DESIGN_IMPLEMENTATION_GUIDE.md, ENTERPRISE_DESIGN_PATTERNS.md, COMPETITOR_SCREENSHOTS_ANALYSIS.md, ips-erp-ux-audit.md, PRODUCTION_UX_BASELINE.md, HOMEPAGE_USABILITY_BUGS.md, UX_ENHANCEMENTS_IMPLEMENTED.md, UX_P1_POLISH_COMPLETE.md, IPS-ERP_Frontend_QA_Report.md, ADMIN_AUDIT_REPORT.md, AUDIT_DELIVERABLES.md, and related memory/task files.*
