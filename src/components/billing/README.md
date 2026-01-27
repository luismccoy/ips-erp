# AI Billing Suggestions Component

This module provides AI-powered validation and suggestions for billing records in the IPS-ERP system. It integrates with the RIPS Validator Lambda function to validate Colombian RIPS billing compliance.

## Components

### 1. `AISuggestionCard`
Displays a single AI suggestion with severity, message, and actions.

**Props:**
- `suggestion: AISuggestion` - The suggestion data
- `onDismiss: (id: string) => void` - Callback when user dismisses
- `onApply?: (id: string) => void` - Callback when user applies fix (optional)
- `className?: string` - Additional CSS classes

**Severity Levels:**
- `error` - Critical validation errors (red)
- `warning` - Important warnings (amber)
- `info` - Informational suggestions (blue)

**Example:**
```tsx
<AISuggestionCard
  suggestion={{
    id: '1',
    severity: 'error',
    field: 'diagnosis',
    message: 'Invalid ICD-10 code format',
    recommendedAction: 'Use format: Letter + 2 digits (e.g., A00)',
    autoFixAvailable: false
  }}
  onDismiss={(id) => console.log('Dismissed:', id)}
/>
```

### 2. `AISuggestionList`
Container that displays multiple suggestions with a header.

**Props:**
- `suggestions: AISuggestion[]` - Array of suggestions
- `onDismiss: (id: string) => void` - Dismiss callback
- `onApply?: (id: string) => void` - Apply callback (optional)
- `className?: string` - Additional CSS classes

**Example:**
```tsx
<AISuggestionList
  suggestions={suggestions}
  onDismiss={dismissSuggestion}
  onApply={applySuggestion}
/>
```

### 3. `useAISuggestions` Hook
React hook that manages AI validation state and API calls.

**Returns:**
```typescript
{
  suggestions: AISuggestion[];
  isValidating: boolean;
  error: string | null;
  validateBillingData: (data: any) => Promise<void>;
  dismissSuggestion: (id: string) => void;
  applySuggestion: (id: string) => void;
  clearSuggestions: () => void;
}
```

**Example:**
```tsx
function MyBillingForm() {
  const {
    suggestions,
    isValidating,
    validateBillingData,
    dismissSuggestion,
  } = useAISuggestions();

  const handleValidate = async () => {
    await validateBillingData({
      date: '2024-01-27',
      procedures: ['890201', '890301'],
      diagnosis: 'I10',
      eps: 'SURA',
      totalAmount: 150000,
    });
  };

  return (
    <div>
      <button onClick={handleValidate} disabled={isValidating}>
        Validate
      </button>
      
      <AISuggestionList
        suggestions={suggestions}
        onDismiss={dismissSuggestion}
      />
    </div>
  );
}
```

## Integration Guide

### Option 1: Full Example Component
Use the pre-built form component:

```tsx
import { BillingFormWithAI } from './components/billing';

function MyPage() {
  return <BillingFormWithAI />;
}
```

### Option 2: Add to Existing BillingDashboard

1. Import the components:
```tsx
import { AISuggestionList } from './billing';
import { useAISuggestions } from './billing';
```

2. Add the hook to your component:
```tsx
const {
  suggestions,
  isValidating,
  validateBillingData,
  dismissSuggestion,
  applySuggestion,
} = useAISuggestions();
```

3. Add a validate button:
```tsx
<Button
  icon={<Sparkles />}
  onClick={() => validateBillingData(currentBillingRecord)}
  disabled={isValidating}
>
  Validar con IA
</Button>
```

4. Display suggestions:
```tsx
{suggestions.length > 0 && (
  <AISuggestionList
    suggestions={suggestions}
    onDismiss={dismissSuggestion}
    onApply={applySuggestion}
  />
)}
```

### Option 3: Manual Integration

```tsx
import { useState } from 'react';
import { client } from '../amplify-utils';
import { AISuggestionCard } from './billing/AISuggestionCard';

function MyComponent() {
  const [suggestions, setSuggestions] = useState([]);

  const validate = async (billingData) => {
    const response = await client.queries.validateRIPS({
      billingRecord: billingData
    });
    
    const result = JSON.parse(response.data);
    
    // Convert to suggestions
    const newSuggestions = result.errors.map((err, i) => ({
      id: `error-${i}`,
      severity: 'error',
      field: err.field,
      message: err.message,
    }));
    
    setSuggestions(newSuggestions);
  };

  return (
    <div>
      {suggestions.map(s => (
        <AISuggestionCard
          key={s.id}
          suggestion={s}
          onDismiss={(id) => setSuggestions(prev => 
            prev.filter(s => s.id !== id)
          )}
        />
      ))}
    </div>
  );
}
```

## API Reference

### Validation Response Format

The RIPS Validator Lambda returns:

```typescript
{
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
  warnings: string[];
}
```

**Warnings can include:**
- Regular warnings: Plain text
- AI warnings: Prefixed with `⚠️ AI:`
- AI suggestions: Prefixed with `💡`

The `useAISuggestions` hook automatically parses these formats and converts them to `AISuggestion` objects.

## Validation Rules

The validator checks:

1. **Required Fields:**
   - Date (ISO 8601 format)
   - Procedures (CUPS codes)
   - Diagnosis (ICD-10)
   - EPS (health insurance)

2. **Format Validation:**
   - CUPS: 6 digits (e.g., `890201`)
   - ICD-10: Letter + 2 digits + optional decimal (e.g., `I10`, `A00.1`)
   - Date: `YYYY-MM-DD`

3. **Business Rules:**
   - Amount cannot be negative
   - Date cannot be in the future
   - EPS code must be valid

4. **AI Validation** (if MODEL_ID configured):
   - Clinical coherence
   - Regulatory compliance (Resolución 3100)
   - Risk of glosa (billing rejection)
   - Procedure-diagnosis consistency

## Styling

All components use:
- **Tailwind CSS** for styling
- **Lucide React** for icons
- Consistent with existing UI components (Card, Button, Badge)

Colors match severity:
- Error: Red (`red-600`, `red-50`)
- Warning: Amber (`amber-600`, `amber-50`)
- Info: Blue (`sky-600`, `sky-50`)

## Auto-Validation

To auto-validate on form changes:

```tsx
useEffect(() => {
  const timer = setTimeout(() => {
    if (hasRequiredFields(formData)) {
      validateBillingData(formData);
    }
  }, 1000); // Debounce 1 second

  return () => clearTimeout(timer);
}, [formData]);
```

## Testing

Test with sample data:

```typescript
const testData = {
  date: '2024-01-27',
  procedures: ['890201'], // Valid CUPS code
  diagnosis: 'I10', // Valid ICD-10
  eps: 'SURA',
  totalAmount: 150000,
  patientId: 'patient-123',
  shiftId: 'shift-456',
};

await validateBillingData(testData);
```

Expected results:
- ✅ Valid data: No suggestions
- ❌ Invalid CUPS: Error suggestion
- ⚠️ Missing optional field: Warning suggestion
- 💡 AI recommendation: Info suggestion

## Troubleshooting

### "No data returned from validation"
- Check that `rips-validator` Lambda is deployed
- Verify IAM permissions for Lambda
- Check CloudWatch logs: `/aws/lambda/rips-validator-*`

### "AI validation could not be completed"
- Verify `MODEL_ID` environment variable is set
- Check Bedrock IAM permissions
- AI validation is optional - basic validation still works

### Suggestions not appearing
- Check browser console for errors
- Verify the validation response format
- Use demo data to test the UI components directly

## Future Enhancements

Potential improvements:
- [ ] Auto-apply suggestions with form field updates
- [ ] Suggestion history/undo
- [ ] Bulk validation for multiple records
- [ ] Export suggestions to PDF/CSV
- [ ] Integration with billing workflow states
- [ ] Spanish translations (i18n)

## Related Files

- Lambda: `amplify/functions/rips-validator/`
- Schema: `amplify/data/resource.ts` (validateRIPS query)
- Types: `src/types.ts` (BillingRecord)
- Dashboard: `src/components/BillingDashboard.tsx`
