# Quick Start Guide - AI Billing Suggestions

## 🚀 30-Second Integration

### 1. Import Components
```tsx
import { AISuggestionList, useAISuggestions } from './components/billing';
```

### 2. Add Hook
```tsx
const { suggestions, validateBillingData, dismissSuggestion } = useAISuggestions();
```

### 3. Add Validate Button
```tsx
<Button onClick={() => validateBillingData(billingRecord)}>
  Validate
</Button>
```

### 4. Display Suggestions
```tsx
<AISuggestionList 
  suggestions={suggestions}
  onDismiss={dismissSuggestion}
/>
```

Done! 🎉

---

## 📋 Copy-Paste Examples

### Minimal Integration (Existing Form)
```tsx
import { AISuggestionList, useAISuggestions } from './components/billing';
import { Sparkles } from 'lucide-react';
import { Button } from './ui/Button';

export function MyBillingForm() {
  // Your existing form state
  const [formData, setFormData] = useState({ ... });
  
  // Add AI validation
  const {
    suggestions,
    isValidating,
    validateBillingData,
    dismissSuggestion,
  } = useAISuggestions();

  // Validate function
  const handleValidate = () => {
    validateBillingData({
      date: formData.date,
      procedures: formData.procedures.split(','),
      diagnosis: formData.diagnosis,
      eps: formData.eps,
      totalAmount: parseFloat(formData.totalAmount) || 0,
    });
  };

  return (
    <div>
      {/* Your form fields */}
      
      {/* Validate button */}
      <Button
        icon={<Sparkles />}
        onClick={handleValidate}
        disabled={isValidating}
      >
        {isValidating ? 'Validating...' : 'Validate with AI'}
      </Button>

      {/* Display suggestions */}
      {suggestions.length > 0 && (
        <AISuggestionList
          suggestions={suggestions}
          onDismiss={dismissSuggestion}
        />
      )}
    </div>
  );
}
```

### Auto-Validate on Change
```tsx
// Add this useEffect to your component
useEffect(() => {
  // Only validate if required fields are filled
  if (!formData.date || !formData.procedures) return;

  // Debounce to avoid excessive API calls
  const timer = setTimeout(() => {
    validateBillingData({
      date: formData.date,
      procedures: formData.procedures.split(','),
      diagnosis: formData.diagnosis,
      eps: formData.eps,
    });
  }, 1000); // Wait 1 second after user stops typing

  return () => clearTimeout(timer);
}, [formData]);
```

### Add to BillingDashboard
```tsx
// In BillingDashboard.tsx, add these imports:
import { AISuggestionList, useAISuggestions } from './billing';
import { Sparkles } from 'lucide-react';

// Inside the BillingDashboard component:
export function BillingDashboard() {
  // ... existing state ...

  // Add AI validation hook
  const {
    suggestions,
    isValidating,
    validateBillingData,
    dismissSuggestion,
  } = useAISuggestions();

  // ... existing code ...

  return (
    <div>
      {/* Existing dashboard content */}
      
      {/* Add validate button for each bill */}
      {bills.map(bill => (
        <div key={bill.id}>
          <span>{bill.patientName}</span>
          
          <Button
            size="sm"
            icon={<Sparkles />}
            onClick={() => validateBillingData(bill)}
            disabled={isValidating}
          >
            Validate
          </Button>
        </div>
      ))}

      {/* Display suggestions */}
      {suggestions.length > 0 && (
        <div className="mt-6">
          <AISuggestionList
            suggestions={suggestions}
            onDismiss={dismissSuggestion}
          />
        </div>
      )}
    </div>
  );
}
```

### Standalone Form (Full Example)
```tsx
// Just import and use the pre-built component
import { BillingFormWithAI } from './components/billing/BillingFormWithAI';

function MyPage() {
  return <BillingFormWithAI />;
}
```

---

## 🎨 UI Customization

### Change Colors
```tsx
// In AISuggestionCard.tsx, modify severityConfig:
const severityConfig = {
  error: {
    borderColor: 'border-red-300',  // Your color
    bgColor: 'bg-red-100',          // Your color
    iconColor: 'text-red-700',      // Your color
  },
  // ... same for warning and info
};
```

### Custom Suggestion Card
```tsx
import { AISuggestionCard } from './components/billing';

<AISuggestionCard
  suggestion={suggestion}
  onDismiss={dismissSuggestion}
  className="my-custom-class"
/>
```

### Hide Dismiss Button
```tsx
// Modify AISuggestionCard.tsx line ~82:
{/* Dismiss Button */}
{false && ( // Add condition here
  <button onClick={() => onDismiss(id)}>
    <X />
  </button>
)}
```

---

## 🧪 Testing

### Test with Sample Data
```tsx
import { VALID_BILLING_RECORD, SAMPLE_SUGGESTIONS } from './components/billing/TEST_DATA';

// Test validation
validateBillingData(VALID_BILLING_RECORD);

// Test UI with mock data
const [suggestions, setSuggestions] = useState(SAMPLE_SUGGESTIONS);
```

### Manual Test Steps
1. Open form
2. Enter invalid CUPS code: `12345`
3. Click "Validate"
4. Should see error suggestion
5. Fix CUPS code: `890201`
6. Click "Validate" again
7. Error should disappear

---

## 🐛 Troubleshooting

### No Suggestions Appear
```tsx
// Add debug logging
console.log('Validation response:', response);
console.log('Parsed suggestions:', suggestions);
```

### Lambda Not Responding
```bash
# Check Lambda deployment
cd amplify/functions/rips-validator
ls handler.ts  # Should exist

# Check CloudWatch logs
# Go to AWS Console → CloudWatch → Log Groups
# Filter: /aws/lambda/rips-validator-*
```

### TypeScript Errors
```tsx
// If you get type errors, import types:
import type { AISuggestion, SuggestionSeverity } from './components/billing';
```

---

## 📊 Data Format

### Input (Billing Record)
```typescript
{
  date: '2024-01-27',           // ISO 8601
  procedures: ['890201'],       // Array of CUPS codes
  diagnosis: 'I10',             // ICD-10 code
  eps: 'SURA',                  // EPS code
  totalAmount: 150000,          // Number
  patientId?: 'patient-123',    // Optional
  shiftId?: 'shift-456',        // Optional
}
```

### Output (Suggestions)
```typescript
[
  {
    id: 'error-1',
    severity: 'error',          // 'error' | 'warning' | 'info'
    field: 'diagnosis',
    message: 'Invalid ICD-10 code',
    recommendedAction?: 'Use format: A00',
    autoFixAvailable?: false,
  }
]
```

---

## 🔗 Important Files

### Components
- `src/components/billing/AISuggestionCard.tsx` - UI component
- `src/components/billing/useAISuggestions.ts` - State hook
- `src/components/billing/BillingFormWithAI.tsx` - Example form

### Backend
- `amplify/functions/rips-validator/handler.ts` - Lambda validator
- `amplify/data/resource.ts` - GraphQL schema

### Docs
- `src/components/billing/README.md` - Full documentation
- `src/components/billing/IMPLEMENTATION_SUMMARY.md` - Overview

---

## ✅ Checklist

Before deploying:
- [ ] Lambda deployed (`rips-validator`)
- [ ] GraphQL query exists (`validateRIPS`)
- [ ] IAM permissions configured
- [ ] Components imported correctly
- [ ] Hook added to component
- [ ] Validate button added
- [ ] Suggestions display added
- [ ] Tested with valid data
- [ ] Tested with invalid data
- [ ] Error handling works

---

## 💡 Pro Tips

1. **Debounce validation** - Don't validate on every keystroke
2. **Show loading state** - Use `isValidating` to disable buttons
3. **Clear on success** - Auto-clear suggestions after save
4. **Keep history** - Log validation attempts for debugging
5. **Test offline** - Use TEST_DATA for UI development

---

## 🎯 Next Steps

After basic integration:
1. Test with real billing data
2. Adjust validation rules if needed
3. Add analytics tracking
4. Implement auto-apply fixes
5. Add validation history
6. Export validation reports

---

**Need Help?** Check `README.md` for detailed documentation.

**Found a Bug?** Check browser console and Lambda CloudWatch logs.

**Want More Features?** See IMPLEMENTATION_SUMMARY.md for future enhancements.
