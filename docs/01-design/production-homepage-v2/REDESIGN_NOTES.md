# IPS-ERP Landing Page Redesign v2

## Overview
Complete redesign based on expert review feedback. Focus on **honesty, real product, and credibility**.

## What Was Removed ❌
1. **Fake testimonials** - No more invented quotes from "Dr. María García"
2. **"500+ IPS activas" claims** - We don't have 500 clients yet
3. **Placeholder logos** - "Logo 1, Logo 2, Logo 3" looked unprofessional
4. **Generic stock photos** - Hospital hallways, operating rooms = irrelevant
5. **Inflated recovery numbers** - "$5.1M mensuales" without proof

## What Was Added ✅
1. **Real app screenshots** - Actual interfaces from our product
2. **Honest messaging** - "Launching Q2 2026" instead of fake traction
3. **Technical credibility** - AWS Bedrock, TypeScript, modern stack
4. **Product tour section** - Interactive walkthrough of features
5. **Early Access CTA** - "Join the beta program"

## New Section Structure

### 1. Hero Section
- **Headline:** "Sistema ERP Inteligente para IPS de Cuidado Domiciliario"
- **Subheadline:** "Built for Colombian healthcare. Launching Q2 2026."
- **CTA:** "Solicitar Acceso Anticipado"
- **Visual:** App dashboard screenshot (real)

### 2. The Problem
- Keep existing pain points (these are real)
- Manual RIPS filing
- Glosas eating into revenue
- Compliance complexity

### 3. Our Solution - 3 AI Agents
- **RIPS Agent:** Automated filing, validation
- **Glosa Defender:** AI-powered dispute resolution
- **Clinical Assistant:** KARDEX, scales, documentation
- Show REAL outputs from each

### 4. Product Tour
- Interactive carousel of real screenshots
- Dashboard → Visits → Forms → AI Features
- Mobile + Desktop views

### 5. Technology Stack
- AWS Bedrock (Claude AI)
- React + TypeScript
- GraphQL API
- Offline-first mobile
- Colombian compliance built-in

### 6. Compliance
- Resolution 3100/2019
- RIPS standards
- Data sovereignty (AWS Bogotá region)

### 7. Early Access
- "Product in active development"
- "Real-world testing starting Q2 2026"
- Email capture form
- No fake urgency

## Screenshot Requirements

### Admin Portal (Desktop)
| Screenshot | Description | Priority |
|------------|-------------|----------|
| dashboard-kpis.png | Main dashboard with metrics | HIGH |
| visit-approvals.png | Approval workflow | HIGH |
| rips-management.png | RIPS filing interface | HIGH |
| glosa-defender.png | AI glosa analysis | HIGH |
| patient-list.png | Patient management | MEDIUM |

### Mobile App (Phone frame)
| Screenshot | Description | Priority |
|------------|-------------|----------|
| mobile-visits.png | Visit list view | HIGH |
| mobile-kardex.png | KARDEX form | HIGH |
| mobile-barthel.png | Clinical scales | MEDIUM |
| mobile-offline.png | Offline indicator | MEDIUM |

## Photography Recommendations

### Instead of Stock Photos, Use:
1. **Midjourney prompts** for custom imagery:
   - "Colombian nurse visiting elderly patient at home, warm natural lighting, living room setting, professional but caring, photorealistic --ar 16:9"
   - "Healthcare professional using tablet in patient's home, Colombian setting, elderly care, soft afternoon light --ar 16:9"

2. **Premium stock sources** (if needed):
   - Getty Images: "home healthcare Colombia"
   - Adobe Stock: "domiciliary care elderly"
   - Focus on HOME settings, not hospitals

3. **What to avoid:**
   - Hospital corridors
   - Operating rooms
   - Clinical/sterile environments
   - Generic handshakes

## Color Palette (Maintained)
- Primary: #2563EB (Blue)
- Secondary: #10B981 (Green for success)
- Background: #F8FAFC
- Text: #1E293B
- Accent: #F59E0B (Orange for CTAs)

## Typography
- Headings: Inter (Bold)
- Body: Inter (Regular)
- Code/Tech: JetBrains Mono

## Messaging Tone
- **Professional** but not corporate
- **Honest** about development stage
- **Technical** credibility without jargon
- **Colombian** context throughout

## Success Metrics
Target scores from expert reviews:
- Startup Expert: 8.5+/10
- VC Perspective: 8.5+/10
- Healthcare SME: 9+/10

## Files Created
- `preview.html` - Complete standalone preview
- `components/` - React component files
- `screenshots/` - Placeholder for real captures
- `PHOTOGRAPHY_GUIDE.md` - Stock photo recommendations
