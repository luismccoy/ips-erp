# Clinical Assessment Scales - Technical Specification

**Created:** 2026-01-26  
**Source:** Domain expert input (nursing workflow)  
**Priority:** 🔴 Critical - Core clinical functionality

---

## Overview

Implement standardized nursing assessment scales used in Colombian home care IPS. These scales are legally required for patient documentation and RIPS compliance.

---

## Scales to Implement

### 1. Glasgow Coma Scale (GCS)
**Purpose:** Assess level of consciousness  
**Components:**
- Eye Opening (E): 1-4
- Verbal Response (V): 1-5
- Motor Response (M): 1-6

**Total Score:** 3-15  
**Interpretation:**
- 13-15: Mild injury
- 9-12: Moderate injury
- 3-8: Severe injury (critical alert)

---

### 2. Pain Scale (Escala del Dolor / EVA)
**Purpose:** Quantify pain intensity  
**Type:** Visual Analog Scale (VAS) or Numeric Rating Scale (NRS)

**Score:** 0-10  
**Interpretation:**
- 0: No pain
- 1-3: Mild pain
- 4-6: Moderate pain
- 7-10: Severe pain (alert threshold)

---

### 3. Braden Scale
**Purpose:** Predict pressure ulcer risk  
**Components (each 1-4):**
- Sensory Perception
- Moisture
- Activity
- Mobility
- Nutrition
- Friction/Shear (1-3)

**Total Score:** 6-23  
**Interpretation:**
- ≤9: Very high risk 🔴
- 10-12: High risk 🟠
- 13-14: Moderate risk 🟡
- 15-18: Mild risk
- 19-23: No risk ✅

---

### 4. Morse Fall Scale
**Purpose:** Assess fall risk  
**Components:**
- History of falling (0/25)
- Secondary diagnosis (0/15)
- Ambulatory aid (0/15/30)
- IV/Heparin lock (0/20)
- Gait (0/10/20)
- Mental status (0/15)

**Total Score:** 0-125  
**Interpretation:**
- 0-24: Low risk ✅
- 25-44: Moderate risk 🟡
- ≥45: High risk 🔴

---

### 5. NEWS / NEWS2 (National Early Warning Score)
**Purpose:** Early detection of clinical deterioration  
**Parameters:**
- Respiration rate (0-3)
- Oxygen saturation (0-3)
- Supplemental oxygen (0-2)
- Temperature (0-3)
- Systolic BP (0-3)
- Heart rate (0-3)
- Consciousness (0-3)

**Total Score:** 0-20  
**Interpretation:**
- 0-4: Low risk ✅
- 5-6: Medium risk 🟡
- ≥7: High risk 🔴 (immediate escalation)

---

### 6. Barthel Index
**Purpose:** Measure independence in Activities of Daily Living (ADL)  
**Components (10 items):**
- Feeding, Bathing, Grooming, Dressing, Bowels, Bladder, Toilet use, Transfers, Mobility, Stairs

**Total Score:** 0-100  
**Interpretation:**
- 0-20: Total dependence
- 21-60: Severe dependence
- 61-90: Moderate dependence
- 91-99: Slight dependence
- 100: Independent ✅

---

### 7. Norton Scale
**Purpose:** Pressure sore risk assessment  
**Components (each 1-4):**
- Physical condition
- Mental condition
- Activity
- Mobility
- Incontinence

**Total Score:** 5-20  
**Interpretation:**
- ≤14: High risk 🔴
- 15-16: Medium risk 🟡
- ≥17: Low risk ✅

---

### 8. RASS (Richmond Agitation-Sedation Scale)
**Purpose:** Assess sedation/agitation level  
**Score:** -5 to +4

| Score | Term | Description |
|-------|------|-------------|
| +4 | Combative | Violent, danger to staff |
| +3 | Very agitated | Pulls tubes, aggressive |
| +2 | Agitated | Frequent non-purposeful movement |
| +1 | Restless | Anxious but not aggressive |
| 0 | Alert & calm | ✅ Target |
| -1 | Drowsy | Sustained awakening to voice |
| -2 | Light sedation | Briefly awakens to voice |
| -3 | Moderate sedation | Movement to voice, no eye contact |
| -4 | Deep sedation | Movement to physical stimulation |
| -5 | Unarousable | No response |

---

## Data Model (GraphQL Schema)

```graphql
type PatientAssessment @model @auth(rules: [
  { allow: groups, groups: ["ADMIN"], operations: [create, read, update, delete] }
  { allow: groups, groups: ["NURSE"], operations: [create, read] }
  { allow: groups, groups: ["FAMILY"], operations: [read] }
]) {
  id: ID!
  patientId: ID! @index(name: "byPatient", sortKeyFields: ["assessedAt"])
  nurseId: ID! @index(name: "byNurse")
  tenantId: String! @index(name: "byTenant")
  assessedAt: AWSDateTime!
  
  # Scale scores (null if not assessed)
  glasgowScore: GlasgowScore
  painScore: Int # 0-10
  bradenScore: BradenScore
  morseScore: MorseScore
  newsScore: NEWSScore
  barthelScore: BarthelScore
  nortonScore: NortonScore
  rassScore: Int # -5 to +4
  
  # Computed fields
  alerts: [AssessmentAlert!]
  notes: String
}

type GlasgowScore {
  eye: Int!      # 1-4
  verbal: Int!   # 1-5
  motor: Int!    # 1-6
  total: Int!    # 3-15 (computed)
}

type BradenScore {
  sensoryPerception: Int!  # 1-4
  moisture: Int!           # 1-4
  activity: Int!           # 1-4
  mobility: Int!           # 1-4
  nutrition: Int!          # 1-4
  frictionShear: Int!      # 1-3
  total: Int!              # 6-23 (computed)
}

type MorseScore {
  historyOfFalling: Int!   # 0 or 25
  secondaryDiagnosis: Int! # 0 or 15
  ambulatoryAid: Int!      # 0, 15, or 30
  ivHeparinLock: Int!      # 0 or 20
  gait: Int!               # 0, 10, or 20
  mentalStatus: Int!       # 0 or 15
  total: Int!              # 0-125 (computed)
}

type NEWSScore {
  respirationRate: Int!    # 0-3
  oxygenSaturation: Int!   # 0-3
  supplementalO2: Int!     # 0-2
  temperature: Int!        # 0-3
  systolicBP: Int!         # 0-3
  heartRate: Int!          # 0-3
  consciousness: Int!      # 0-3
  total: Int!              # 0-20 (computed)
}

type BarthelScore {
  feeding: Int!      # 0, 5, 10
  bathing: Int!      # 0, 5
  grooming: Int!     # 0, 5
  dressing: Int!     # 0, 5, 10
  bowels: Int!       # 0, 5, 10
  bladder: Int!      # 0, 5, 10
  toiletUse: Int!    # 0, 5, 10
  transfers: Int!    # 0, 5, 10, 15
  mobility: Int!     # 0, 5, 10, 15
  stairs: Int!       # 0, 5, 10
  total: Int!        # 0-100 (computed)
}

type NortonScore {
  physicalCondition: Int!  # 1-4
  mentalCondition: Int!    # 1-4
  activity: Int!           # 1-4
  mobility: Int!           # 1-4
  incontinence: Int!       # 1-4
  total: Int!              # 5-20 (computed)
}

type AssessmentAlert {
  scale: String!
  level: AlertLevel!
  message: String!
}

enum AlertLevel {
  INFO
  WARNING
  CRITICAL
}
```

---

## Demo Data Requirements

Generate realistic sample assessments for demo mode:

```typescript
const DEMO_ASSESSMENTS = [
  {
    patientId: "patient-1", // María García (elderly, high care needs)
    nurseId: "nurse-1",
    glasgowScore: { eye: 4, verbal: 5, motor: 6, total: 15 },
    painScore: 3,
    bradenScore: { total: 14 }, // Moderate risk
    morseScore: { total: 55 },  // High fall risk
    newsScore: { total: 2 },
    barthelScore: { total: 45 }, // Severe dependence
    nortonScore: { total: 13 },  // High pressure sore risk
    rassScore: 0,
    alerts: [
      { scale: "Morse", level: "WARNING", message: "Alto riesgo de caídas" },
      { scale: "Norton", level: "WARNING", message: "Alto riesgo de escaras" }
    ]
  },
  // ... more realistic samples
];
```

---

## UI Components Needed

### 1. Assessment Form (Nurse App)
- Collapsible sections for each scale
- Auto-calculate totals
- Color-coded risk indicators
- Quick presets for common patterns
- Save as draft / Submit

### 2. Assessment History (Admin Portal)
- Timeline view per patient
- Trend charts for scores over time
- Filter by scale, date range, risk level
- Export to PDF for RIPS

### 3. Alert Dashboard Widget
- Real-time high-risk patient alerts
- Grouped by scale type
- One-click navigation to patient

### 4. Family Portal View
- Simplified, non-technical summary
- "Your loved one's care status" 
- Trend indicators (improving/stable/declining)

---

## RIPS Integration

These assessments must be included in RIPS reports:
- Link to consultation records
- Include in visit documentation
- Required for certain procedure codes
- Audit trail for regulatory compliance

---

## Implementation Checklist

### Backend (Kiro) ✅ COMPLETED 2026-01-27
- [x] Add `PatientAssessment` model to schema
- [x] Create indexes for efficient queries (`byPatient`, `byNurse`, `byTenant`)
- [x] Implement score calculation utilities (TypeScript)
- [x] Add alert generation logic (`generateAssessmentAlerts()`)
- [x] Seed demo data (9 realistic assessments across 8 patients)

### Frontend (Clawd/Antigravity)
- [ ] Assessment form component
- [ ] Score calculators (client-side validation)
- [ ] Risk indicator badges
- [ ] History timeline view
- [ ] Alert dashboard widget
- [ ] Demo mode data seeding

---

**Document Owner:** Clawd  
**Review Required:** Domain expert validation before production
