# IPS-ERP Healthcare Design Token System
**Version:** 1.0.0  
**Last Updated:** 2026-01-28  
**Purpose:** Unified design language for healthcare SaaS application

---

## Overview

This design token system establishes a consistent, accessible, and healthcare-appropriate visual language for IPS-ERP. All tokens are defined as CSS custom properties in `src/styles/tokens.css`.

### Design Principles
1. **Trust & Professionalism** - Healthcare requires confidence-inspiring interfaces
2. **Accessibility First** - WCAG 2.1 AA compliance minimum
3. **Touch-Friendly** - Designed for tablet use (minimum 44px touch targets)
4. **Clarity Over Decoration** - Critical information must be immediately scannable
5. **Calm Under Pressure** - Reduce cognitive load in high-stress clinical settings

---

## 1. Color Palette

### 1.1 Primary Colors (Trust Blue)
The primary palette establishes trust and professionalism, essential in healthcare contexts.

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary-50` | `#EFF6FF` | Subtle backgrounds |
| `--color-primary-100` | `#DBEAFE` | Hover states |
| `--color-primary-200` | `#BFDBFE` | Active backgrounds |
| `--color-primary-300` | `#93C5FD` | Borders, dividers |
| `--color-primary-400` | `#60A5FA` | Icons, secondary elements |
| `--color-primary-500` | `#3B82F6` | **Primary actions** |
| `--color-primary-600` | `#2563EB` | **Primary buttons** |
| `--color-primary-700` | `#1D4ED8` | Hover on primary |
| `--color-primary-800` | `#1E40AF` | Active/pressed states |
| `--color-primary-900` | `#1E3A8A` | Dark mode primary |

### 1.2 Secondary Colors (Calming Teal/Green)
Secondary palette provides visual relief and represents positive health outcomes.

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-secondary-50` | `#F0FDFA` | Success backgrounds |
| `--color-secondary-100` | `#CCFBF1` | Wellness indicators |
| `--color-secondary-200` | `#99F6E4` | Light accents |
| `--color-secondary-300` | `#5EEAD4` | Progress indicators |
| `--color-secondary-400` | `#2DD4BF` | Active wellness |
| `--color-secondary-500` | `#14B8A6` | **Secondary actions** |
| `--color-secondary-600` | `#0D9488` | **Secondary buttons** |
| `--color-secondary-700` | `#0F766E` | Hover states |
| `--color-secondary-800` | `#115E59` | Active states |
| `--color-secondary-900` | `#134E4A` | Dark accents |

### 1.3 Semantic Colors
Critical for healthcare status communication.

#### Success (Green)
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-success-50` | `#F0FDF4` | Success alert bg |
| `--color-success-100` | `#DCFCE7` | Light success |
| `--color-success-500` | `#22C55E` | Success icons |
| `--color-success-600` | `#16A34A` | Success buttons |
| `--color-success-700` | `#15803D` | Success text |

#### Warning (Amber)
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-warning-50` | `#FFFBEB` | Warning alert bg |
| `--color-warning-100` | `#FEF3C7` | Light warning |
| `--color-warning-500` | `#F59E0B` | Warning icons |
| `--color-warning-600` | `#D97706` | Warning buttons |
| `--color-warning-700` | `#B45309` | Warning text |

#### Error (Red)
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-error-50` | `#FEF2F2` | Error alert bg |
| `--color-error-100` | `#FEE2E2` | Light error |
| `--color-error-500` | `#EF4444` | Error icons |
| `--color-error-600` | `#DC2626` | Error buttons |
| `--color-error-700` | `#B91C1C` | Error text |

#### Info (Sky Blue)
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-info-50` | `#F0F9FF` | Info alert bg |
| `--color-info-100` | `#E0F2FE` | Light info |
| `--color-info-500` | `#0EA5E9` | Info icons |
| `--color-info-600` | `#0284C7` | Info buttons |
| `--color-info-700` | `#0369A1` | Info text |

### 1.4 Neutral Grays
| Token | Hex | Usage | Contrast Ratio |
|-------|-----|-------|----------------|
| `--color-neutral-50` | `#F8FAFC` | Page backgrounds | - |
| `--color-neutral-100` | `#F1F5F9` | Card backgrounds | - |
| `--color-neutral-200` | `#E2E8F0` | Borders, dividers | - |
| `--color-neutral-300` | `#CBD5E1` | Disabled states | - |
| `--color-neutral-400` | `#94A3B8` | Placeholder text | 3.0:1 ⚠️ |
| `--color-neutral-500` | `#64748B` | Secondary text | 4.6:1 ✓ |
| `--color-neutral-600` | `#475569` | Body text | 7.0:1 ✓ |
| `--color-neutral-700` | `#334155` | Headings | 9.7:1 ✓ |
| `--color-neutral-800` | `#1E293B` | Primary text | 13.5:1 ✓ |
| `--color-neutral-900` | `#0F172A` | Maximum contrast | 17.1:1 ✓ |

### 1.5 Background Variants
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-page` | `#F8FAFC` | Main page background |
| `--bg-card` | `#FFFFFF` | Card/panel backgrounds |
| `--bg-elevated` | `#FFFFFF` | Modals, dropdowns |
| `--bg-overlay` | `rgba(15, 23, 42, 0.5)` | Modal overlays |
| `--bg-hover` | `rgba(59, 130, 246, 0.08)` | Hover states |
| `--bg-active` | `rgba(59, 130, 246, 0.12)` | Active/selected states |

### 1.6 Text Colors with Accessibility
| Token | Value | Min. Background | Ratio |
|-------|-------|-----------------|-------|
| `--text-primary` | `#1E293B` | White | 13.5:1 |
| `--text-secondary` | `#475569` | White | 7.0:1 |
| `--text-tertiary` | `#64748B` | White | 4.6:1 |
| `--text-disabled` | `#94A3B8` | White | 3.0:1 ⚠️ |
| `--text-inverse` | `#FFFFFF` | primary-600 | 4.5:1 |
| `--text-link` | `#2563EB` | White | 4.5:1 |
| `--text-link-hover` | `#1D4ED8` | White | 5.5:1 |

---

## 2. Typography Scale

### 2.1 Font Families
```css
--font-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, 'SF Mono', Consolas, monospace;
```

**Rationale:** Inter provides excellent readability, x-height, and tabular figures for clinical data. System fallbacks ensure fast initial render.

### 2.2 Size Scale (Mobile-First)
| Token | rem | px | Usage |
|-------|-----|-----|-------|
| `--text-xs` | 0.75 | 12 | Metadata only (avoid for body) |
| `--text-sm` | 0.875 | 14 | Secondary info, captions |
| `--text-base` | 1 | 16 | **Body text (minimum)** |
| `--text-lg` | 1.125 | 18 | Emphasized body |
| `--text-xl` | 1.25 | 20 | Section headings |
| `--text-2xl` | 1.5 | 24 | Card titles |
| `--text-3xl` | 1.875 | 30 | Page titles |
| `--text-4xl` | 2.25 | 36 | Dashboard KPIs |
| `--text-5xl` | 3 | 48 | Hero text |

### 2.3 Line Heights
| Token | Value | Usage |
|-------|-------|-------|
| `--leading-none` | 1 | Single-line badges |
| `--leading-tight` | 1.25 | Headings |
| `--leading-snug` | 1.375 | Subheadings |
| `--leading-normal` | 1.5 | Body text |
| `--leading-relaxed` | 1.625 | Long-form content |
| `--leading-loose` | 2 | Accessible reading |

### 2.4 Font Weights
| Token | Value | Usage |
|-------|-------|-------|
| `--font-light` | 300 | De-emphasized text |
| `--font-normal` | 400 | Body text |
| `--font-medium` | 500 | Labels, buttons |
| `--font-semibold` | 600 | Subheadings |
| `--font-bold` | 700 | Headings, emphasis |
| `--font-extrabold` | 800 | Page titles |

---

## 3. Spacing System

### 3.1 Base Unit
**Base:** 4px (`0.25rem`)

This allows fine-grained control while maintaining consistency.

### 3.2 Spacing Scale
| Token | rem | px | Usage |
|-------|-----|-----|-------|
| `--space-0` | 0 | 0 | Reset |
| `--space-0.5` | 0.125 | 2 | Micro gaps |
| `--space-1` | 0.25 | 4 | Tight inline spacing |
| `--space-1.5` | 0.375 | 6 | Icon gaps |
| `--space-2` | 0.5 | 8 | Compact padding |
| `--space-2.5` | 0.625 | 10 | Small gaps |
| `--space-3` | 0.75 | 12 | Button padding (x) |
| `--space-3.5` | 0.875 | 14 | Button padding (y) |
| `--space-4` | 1 | 16 | **Standard padding** |
| `--space-5` | 1.25 | 20 | Card padding |
| `--space-6` | 1.5 | 24 | Section gaps |
| `--space-8` | 2 | 32 | Component gaps |
| `--space-10` | 2.5 | 40 | Large sections |
| `--space-12` | 3 | 48 | **Touch target min** |
| `--space-14` | 3.5 | 56 | Comfortable touch |
| `--space-16` | 4 | 64 | Page sections |
| `--space-20` | 5 | 80 | Major sections |
| `--space-24` | 6 | 96 | Hero sections |

### 3.3 Touch Target Standards
| Token | Value | Usage |
|-------|-------|-------|
| `--touch-target-min` | 44px | WCAG minimum |
| `--touch-target-comfortable` | 48px | **Recommended** |
| `--touch-target-spacious` | 56px | Primary actions |

---

## 4. Component Tokens

### 4.1 Border Radius Scale
| Token | Value | Usage |
|-------|-------|-------|
| `--radius-none` | 0 | Sharp corners |
| `--radius-sm` | 0.25rem (4px) | Badges, pills |
| `--radius-md` | 0.375rem (6px) | Inputs |
| `--radius-lg` | 0.5rem (8px) | Buttons, cards |
| `--radius-xl` | 0.75rem (12px) | Modals |
| `--radius-2xl` | 1rem (16px) | Large cards |
| `--radius-3xl` | 1.5rem (24px) | Feature cards |
| `--radius-full` | 9999px | Avatars, toggles |

### 4.2 Shadow Depths
| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-xs` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` | Cards |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)` | Dropdowns |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)` | Modals |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)` | Dialogs |
| `--shadow-2xl` | `0 25px 50px rgba(0,0,0,0.25)` | Overlays |
| `--shadow-inner` | `inset 0 2px 4px rgba(0,0,0,0.06)` | Inputs focus |
| `--shadow-primary` | `0 4px 14px rgba(59,130,246,0.4)` | Primary button |
| `--shadow-success` | `0 4px 14px rgba(34,197,94,0.4)` | Success actions |
| `--shadow-error` | `0 4px 14px rgba(239,68,68,0.4)` | Error actions |

### 4.3 Transition Timings
| Token | Value | Usage |
|-------|-------|-------|
| `--duration-instant` | 0ms | Immediate feedback |
| `--duration-fast` | 100ms | Micro-interactions |
| `--duration-base` | 150ms | **Standard** |
| `--duration-moderate` | 200ms | Button states |
| `--duration-slow` | 300ms | Panel transitions |
| `--duration-slower` | 500ms | Page transitions |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Exit animations |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Enter animations |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | **Standard** |
| `--ease-bounce` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Playful feedback |

### 4.4 Z-Index Layers
| Token | Value | Usage |
|-------|-------|-------|
| `--z-deep` | -1 | Behind content |
| `--z-base` | 0 | Default |
| `--z-raised` | 10 | Raised cards |
| `--z-dropdown` | 100 | Dropdowns, popovers |
| `--z-sticky` | 200 | Sticky headers |
| `--z-drawer` | 300 | Side drawers |
| `--z-modal` | 400 | Modal dialogs |
| `--z-toast` | 500 | Toast notifications |
| `--z-tooltip` | 600 | Tooltips |
| `--z-max` | 9999 | Emergency overlays |

---

## 5. Healthcare-Specific Tokens

### 5.1 Patient Status Colors
| Token | Hex | Meaning |
|-------|-----|---------|
| `--status-patient-active` | `#22C55E` | Active/enrolled patient |
| `--status-patient-scheduled` | `#3B82F6` | Has upcoming appointments |
| `--status-patient-pending` | `#F59E0B` | Pending intake/approval |
| `--status-patient-discharged` | `#64748B` | Discharged/inactive |
| `--status-patient-deceased` | `#1E293B` | Deceased (handle sensitively) |
| `--status-patient-critical` | `#DC2626` | Critical/urgent status |

### 5.2 Visit Status Colors
| Token | Hex | Meaning |
|-------|-----|---------|
| `--status-visit-scheduled` | `#3B82F6` | Future appointment |
| `--status-visit-confirmed` | `#14B8A6` | Patient confirmed |
| `--status-visit-in-progress` | `#8B5CF6` | Currently in visit |
| `--status-visit-completed` | `#22C55E` | Visit finished |
| `--status-visit-cancelled` | `#EF4444` | Cancelled |
| `--status-visit-no-show` | `#F59E0B` | Patient no-show |
| `--status-visit-rescheduled` | `#6366F1` | Moved to new time |

### 5.3 Priority Indicators
| Token | Hex | Usage |
|-------|-----|-------|
| `--priority-critical` | `#DC2626` | Life-threatening, immediate |
| `--priority-critical-bg` | `#FEE2E2` | Critical background |
| `--priority-high` | `#F97316` | Urgent, same-day |
| `--priority-high-bg` | `#FFEDD5` | High priority background |
| `--priority-medium` | `#EAB308` | Within 24-48 hours |
| `--priority-medium-bg` | `#FEF9C3` | Medium priority background |
| `--priority-low` | `#22C55E` | Routine, scheduled |
| `--priority-low-bg` | `#DCFCE7` | Low priority background |
| `--priority-none` | `#94A3B8` | Informational only |
| `--priority-none-bg` | `#F1F5F9` | No priority background |

### 5.4 Alert & Notification Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--alert-emergency` | `#7F1D1D` | Emergency alerts (dark red) |
| `--alert-emergency-bg` | `#FEE2E2` | Emergency background |
| `--alert-emergency-border` | `#FECACA` | Emergency border |
| `--alert-warning` | `#92400E` | Warning alerts (dark amber) |
| `--alert-warning-bg` | `#FEF3C7` | Warning background |
| `--alert-warning-border` | `#FDE68A` | Warning border |
| `--alert-info` | `#1E40AF` | Info alerts (dark blue) |
| `--alert-info-bg` | `#DBEAFE` | Info background |
| `--alert-info-border` | `#BFDBFE` | Info border |
| `--alert-success` | `#166534` | Success alerts (dark green) |
| `--alert-success-bg` | `#DCFCE7` | Success background |
| `--alert-success-border` | `#BBF7D0` | Success border |

### 5.5 Compliance Indicator Colors
| Token | Hex | Meaning |
|-------|-----|---------|
| `--compliance-compliant` | `#22C55E` | Fully compliant (90-100%) |
| `--compliance-compliant-bg` | `#F0FDF4` | Compliant background |
| `--compliance-partial` | `#F59E0B` | Partially compliant (70-89%) |
| `--compliance-partial-bg` | `#FFFBEB` | Partial background |
| `--compliance-at-risk` | `#F97316` | At risk (50-69%) |
| `--compliance-at-risk-bg` | `#FFF7ED` | At risk background |
| `--compliance-non-compliant` | `#EF4444` | Non-compliant (<50%) |
| `--compliance-non-compliant-bg` | `#FEF2F2` | Non-compliant background |
| `--compliance-expired` | `#6B7280` | Expired/needs renewal |
| `--compliance-expired-bg` | `#F3F4F6` | Expired background |

### 5.6 Clinical Assessment Scales
| Token | Hex | Usage |
|-------|-----|-------|
| `--scale-severe` | `#7F1D1D` | Severe condition |
| `--scale-moderate` | `#C2410C` | Moderate condition |
| `--scale-mild` | `#CA8A04` | Mild condition |
| `--scale-minimal` | `#65A30D` | Minimal symptoms |
| `--scale-none` | `#16A34A` | No symptoms |

---

## 6. Usage Guidelines

### 6.1 Accessibility Requirements
- **Text contrast:** Minimum 4.5:1 for normal text, 3:1 for large text
- **Touch targets:** Minimum 44px, recommended 48px
- **Focus indicators:** 2px solid outline with 2px offset
- **Color alone:** Never use color as the only indicator

### 6.2 Button Hierarchy
1. **Primary:** `--color-primary-600` bg, `--text-inverse` text
2. **Secondary:** `--color-secondary-600` bg, `--text-inverse` text
3. **Outline:** Transparent bg, `--color-primary-600` border
4. **Ghost:** Transparent bg, `--color-primary-600` text
5. **Destructive:** `--color-error-600` bg, `--text-inverse` text

### 6.3 Form States
| State | Border | Background | Text |
|-------|--------|------------|------|
| Default | `--color-neutral-300` | `--bg-card` | `--text-primary` |
| Focus | `--color-primary-500` | `--bg-card` | `--text-primary` |
| Error | `--color-error-500` | `--color-error-50` | `--text-primary` |
| Disabled | `--color-neutral-200` | `--color-neutral-100` | `--text-disabled` |

### 6.4 Responsive Breakpoints
| Token | Value | Usage |
|-------|-------|-------|
| `--breakpoint-sm` | 640px | Mobile landscape |
| `--breakpoint-md` | 768px | Tablet portrait |
| `--breakpoint-lg` | 1024px | Tablet landscape |
| `--breakpoint-xl` | 1280px | Desktop |
| `--breakpoint-2xl` | 1536px | Large desktop |

---

## 7. Implementation

### File Location
```
src/styles/tokens.css
```

### Import Order
```css
/* In index.css or main entry */
@import url('./styles/tokens.css');
@import "tailwindcss";
```

### Usage Examples
```css
/* Button example */
.btn-primary {
  background-color: var(--color-primary-600);
  color: var(--text-inverse);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  font-weight: var(--font-medium);
  min-height: var(--touch-target-comfortable);
  transition: all var(--duration-base) var(--ease-in-out);
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  background-color: var(--color-primary-700);
  box-shadow: var(--shadow-primary);
}

/* Patient status badge */
.status-badge-active {
  background-color: var(--status-patient-active);
  color: white;
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
}

/* Priority alert */
.priority-critical {
  background-color: var(--priority-critical-bg);
  border-left: 4px solid var(--priority-critical);
  color: var(--priority-critical);
  padding: var(--space-4);
}
```

---

## 8. Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-01-28 | Initial design token system |

---

## 9. References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design 3](https://m3.material.io/)
- [IPS-ERP Mobile UX Audit](./MOBILE_UX_AUDIT.md)
- [IPS-ERP Admin UX Audit](./ADMIN_UX_AUDIT_2026-01-23.md)
