# IPS-ERP Design System

## Color Palette

### Primary Colors
| Color | Hex | Usage |
|-------|-----|-------|
| **Blue 600** | #1565C0 | Primary CTA, Headlines, Key elements |
| **Blue 900** | #0D47A1 | Footer, Dark backgrounds |
| **Teal 600** | #00897B | Secondary elements, Hover states |
| **Teal 300** | #4DD4CF | Gradient accents, Highlights |

### Neutral Colors
| Color | Hex | Usage |
|-------|-----|-------|
| **Gray 900** | #212121 | Headlines, Primary text |
| **Gray 600** | #616161 | Body text |
| **Gray 100** | #F5F5F5 | Background sections |
| **Gray 50** | #F9FAFB | Light backgrounds |
| **White** | #FFFFFF | Primary background |

### Semantic Colors
| Color | Hex | Usage |
|-------|-----|-------|
| **Red 500** | #F44336 | Errors, Glosa warnings |
| **Green 600** | #2E7D32 | Success, Positive indicators |
| **Orange 600** | #FF6F00 | Warnings, Action needed |
| **Purple 600** | #7B1FA2 | Information, Secondary CTAs |

## Typography

### Font Families
- **Primary**: Inter (Google Fonts, wght: 400,500,600,700)
- **Fallback**: System fonts (San Francisco, Segoe UI, Roboto)

### Type Scale
```
Display L:  56px / 700 weight / -0.02em letter-spacing
Display M:  48px / 700 weight / -0.02em letter-spacing
Headline:   40px / 700 weight / -0.01em letter-spacing
Title L:    32px / 600 weight / 0em letter-spacing
Title M:    28px / 600 weight / 0em letter-spacing
Title S:    24px / 600 weight / 0em letter-spacing
Body L:     20px / 400 weight / 0em letter-spacing
Body M:     16px / 400 weight / 0em letter-spacing
Body S:     14px / 400 weight / 0em letter-spacing
Label:      12px / 500 weight / 0.04em letter-spacing
```

### Line Heights
- Display: 1.2
- Headings: 1.3
- Body: 1.6

## Spacing

```
4px   = 0.25rem = xs
8px   = 0.5rem  = sm
16px  = 1rem    = md
24px  = 1.5rem  = lg
32px  = 2rem    = xl
48px  = 3rem    = 2xl
64px  = 4rem    = 3xl
96px  = 6rem    = 4xl
128px = 8rem    = 5xl
```

## Component Guidelines

### Hero Section
- Minimum height: 100vh (full viewport)
- Hero image aspect ratio: 16:9
- Text contrast: WCAG AA compliant
- CTA buttons: At least 48px height (touch-friendly)

### Cards
- Border radius: 16px (lg) or 12px (md)
- Shadow: 0 4px 6px rgba(0,0,0,0.1)
- Hover shadow: 0 10px 20px rgba(0,0,0,0.1)
- Padding: 24px (p-6) or 32px (p-8)

### Buttons
- **Primary**: Blue 600 background, white text
- **Secondary**: Gray 100 background, gray text
- **Outline**: Transparent, border color
- Minimum size: 44x44px (touch-friendly)
- Padding: 12px (horizontal), 8px (vertical) minimum

### Forms
- Input height: 44px minimum
- Border radius: 12px
- Focus ring: 4px blue 600
- Label: Body S (12px)
- Help text: Caption (12px, gray 600)

### Animations
- Duration: 200-500ms
- Easing: ease-out or cubic-bezier(0.4, 0, 0.2, 1)
- Avoid: More than 3 simultaneous animations

## Responsive Breakpoints

| Device | Breakpoint | Usage |
|--------|-----------|-------|
| Mobile | 320px | min-width |
| Tablet Small | 640px | sm: |
| Tablet | 768px | md: |
| Desktop Small | 1024px | lg: |
| Desktop | 1280px | xl: |
| Desktop Large | 1536px | 2xl: |

## Accessibility

### Color Contrast
- Large text (18px+): 3:1 minimum
- Normal text: 4.5:1 minimum
- UI components: 3:1 minimum

### Interactive Elements
- Minimum target size: 44x44px
- Focus visible: 4px outline
- Focus order: Logical and intuitive

### Images
- All images: Alt text required
- SVG icons: aria-hidden or aria-label
- Charts/graphs: Data table alternative

### Text
- Font size: Minimum 14px (body)
- Line height: Minimum 1.5
- Line length: Maximum 80 characters
- Color not the only differentiator

## Icon System

### Icon Size Scale
- Icon XS: 16px (used in buttons)
- Icon SM: 20px (in text)
- Icon MD: 24px (standard)
- Icon LG: 32px (featured)
- Icon XL: 48px (hero)

### Icon Set
- Primary: Heroicons (MIT License)
- Alternative: Phosphor Icons
- Stroke width: 1.5 (consistent)

## Dark Mode (Future)

Color adjustments for dark mode:
- Background: Gray 900
- Text primary: White
- Text secondary: Gray 400
- Borders: Gray 700
- Elevation: Gray 800/850/900

---

*This design system ensures consistency and scalability across all IPS-ERP products.*
