# Clinical Assessment Components

Frontend components for capturing and displaying clinical assessment scales required for RIPS compliance in Colombian healthcare.

## Components

### 1. RiskIndicatorBadge.tsx
**Purpose:** Reusable visual indicator for clinical risk levels.

**Props:**
- `riskLevel`: 'none' | 'low' | 'moderate' | 'high' | 'critical'
- `scaleType`: Optional scale name for context
- `className`: Optional additional CSS classes

**Features:**
- Color-coded badges (green/yellow/orange/red)
- Tailwind CSS styling
- Spanish labels

**Usage:**
```tsx
import { RiskIndicatorBadge } from '@/components/clinical';

<RiskIndicatorBadge riskLevel="high" scaleType="Morse" />
```

---

### 2. AssessmentForm.tsx
**Purpose:** Comprehensive form to capture all 8 clinical assessment scales.

**Props:**
- `patientId`: Patient identifier
- `nurseId`: Nurse performing assessment
- `existingAssessment`: Optional existing data for editing
- `onSubmit`: Callback when assessment is submitted
- `onCancel`: Optional cancel callback

**Features:**
- Tabbed interface for 8 scales:
  - Glasgow Coma Scale (GCS)
  - Pain Scale (EVA)
  - Braden Scale
  - Morse Fall Scale
  - NEWS/NEWS2
  - Barthel Index
  - Norton Scale
  - RASS
- Auto-calculation of composite scores
- Real-time risk level badges
- Alert generation based on thresholds
- Clinical notes field
- Form validation

**Usage:**
```tsx
import { AssessmentForm } from '@/components/clinical';

<AssessmentForm
  patientId="patient-123"
  nurseId="nurse-456"
  onSubmit={async (assessment) => {
    // Save to GraphQL
    await createAssessment({ input: assessment });
  }}
  onCancel={() => router.back()}
/>
```

---

### 3. AssessmentHistory.tsx
**Purpose:** Timeline view of patient's clinical assessments with trend analysis.

**Props:**
- `assessments`: Array of PatientAssessment records
- `filterScale`: Optional filter ('all' | scale type)
- `isLoading`: Loading state
- `onAssessmentClick`: Callback when assessment is clicked

**Features:**
- Chronological timeline (newest first)
- Score display with trend indicators (↑/→/↓)
- Filter by scale type
- Risk level badges
- Alert display
- Clinical notes preview
- Responsive grid layout

**Usage:**
```tsx
import { AssessmentHistory } from '@/components/clinical';
import { useQuery } from '@apollo/client';

const { data, loading } = useQuery(LIST_PATIENT_ASSESSMENTS, {
  variables: { patientId: 'patient-123' }
});

<AssessmentHistory
  assessments={data?.listPatientAssessments?.items || []}
  isLoading={loading}
  onAssessmentClick={(assessment) => {
    // Navigate to detail view or open modal
  }}
/>
```

---

## GraphQL Integration

These components are designed to work with the `PatientAssessment` GraphQL model:

```graphql
mutation CreateAssessment($input: CreatePatientAssessmentInput!) {
  createPatientAssessment(input: $input) {
    id
    patientId
    nurseId
    assessedAt
    glasgowScore { total }
    painScore
    bradenScore { total }
    morseScore { total }
    newsScore { total }
    barthelScore { total }
    nortonScore { total }
    rassScore
    alerts { scale level message }
    notes
  }
}

query ListPatientAssessments($patientId: ID!) {
  listPatientAssessments(
    filter: { patientId: { eq: $patientId } }
    sortDirection: DESC
  ) {
    items {
      id
      assessedAt
      glasgowScore { total }
      # ... all scale scores
      alerts { scale level message }
      notes
    }
  }
}
```

---

## Type Safety

All components use TypeScript types from `@/types/clinical-scales`:

- `PatientAssessment`
- `GlasgowScore`, `BradenScore`, `MorseScore`, etc.
- `RiskLevel` ('none' | 'low' | 'moderate' | 'high' | 'critical')
- `AlertLevel` ('INFO' | 'WARNING' | 'CRITICAL')
- Helper functions: `calculateGlasgowTotal()`, `getBradenRiskLevel()`, etc.

---

## Styling

- Built with **Tailwind CSS**
- Responsive design (mobile-first)
- Accessible color contrast
- Focus states for keyboard navigation
- Consistent spacing and typography

---

## File Structure

```
src/components/clinical/
├── AssessmentForm.tsx       # Main assessment form (28KB, ~800 lines)
├── AssessmentHistory.tsx    # Timeline view (22KB, ~550 lines)
├── RiskIndicatorBadge.tsx   # Risk level badge (2KB, ~60 lines)
├── index.ts                 # Barrel export
└── README.md                # This file
```

---

## Next Steps

1. **Integration**: Wire up GraphQL mutations/queries in parent components
2. **Demo Mode**: Add sample data for demo mode testing
3. **Validation**: Add input validation for score ranges
4. **Accessibility**: Add ARIA labels and screen reader support
5. **Testing**: Write unit tests for calculations and trend logic
6. **Mobile UX**: Test and optimize for tablet/mobile use in field

---

**Created:** 2026-01-27  
**Version:** 1.0.0  
**Total Lines:** 1,417
