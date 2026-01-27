/**
 * BillingDashboard Integration Example
 * 
 * This file shows how to integrate the AI Suggestions components
 * into the existing BillingDashboard.tsx
 * 
 * INSTRUCTIONS:
 * 1. Copy the imports below
 * 2. Add the useAISuggestions hook
 * 3. Add the validate button
 * 4. Add the suggestions display section
 */

import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { AISuggestionList } from './AISuggestionCard';
import { useAISuggestions } from './useAISuggestions';

// ============================================
// STEP 1: Add these imports to BillingDashboard.tsx
// ============================================
/*
import { AISuggestionList } from './billing';
import { useAISuggestions } from './billing';
*/

// ============================================
// STEP 2: Add the hook inside BillingDashboard component
// ============================================
/*
export function BillingDashboard() {
    // ... existing state ...

    // Add AI Suggestions hook
    const {
        suggestions,
        isValidating,
        error: validationError,
        validateBillingData,
        dismissSuggestion,
        applySuggestion,
        clearSuggestions,
    } = useAISuggestions();

    // ... rest of component ...
}
*/

// ============================================
// STEP 3: Add validate button to your bill actions
// ============================================
/*
<Button
    size="sm"
    variant="secondary"
    icon={<Sparkles className="w-4 h-4" />}
    onClick={() => validateBillingData(bill)}
    disabled={isValidating}
    isLoading={isValidating}
>
    {isValidating ? 'Validando...' : 'Validar RIPS'}
</Button>
*/

// ============================================
// STEP 4: Add suggestions display section
// ============================================
/*
{suggestions.length > 0 && (
    <div className="mt-6">
        <AISuggestionList
            suggestions={suggestions}
            onDismiss={dismissSuggestion}
            onApply={applySuggestion}
        />
    </div>
)}
*/

// ============================================
// STEP 5: Add loading state display (optional)
// ============================================
/*
{isValidating && (
    <Card className="border-indigo-200">
        <div className="flex items-center gap-3 text-indigo-700">
            <LoadingSpinner />
            <span className="text-sm font-medium">
                Validando registro de facturación con IA...
            </span>
        </div>
    </Card>
)}
*/

// ============================================
// FULL INTEGRATION EXAMPLE
// ============================================

/**
 * Example of how the bill row might look with validation
 */
export function BillingRowWithValidation({ bill }: { bill: any }) {
    const { validateBillingData, isValidating } = useAISuggestions();

    return (
        <div className="flex items-center justify-between p-4 border-b">
            <div>
                <p className="font-medium">{bill.patientName}</p>
                <p className="text-sm text-slate-500">{bill.date}</p>
            </div>
            
            <div className="flex gap-2">
                <Button
                    size="sm"
                    variant="secondary"
                    icon={<Sparkles className="w-4 h-4" />}
                    onClick={() => validateBillingData(bill)}
                    disabled={isValidating}
                >
                    Validar
                </Button>
            </div>
        </div>
    );
}

// ============================================
// ALTERNATIVE: Modal-based Validation
// ============================================

/**
 * If you prefer to show suggestions in a modal/dialog
 */
export function BillingValidationModal({ 
    bill, 
    isOpen, 
    onClose 
}: { 
    bill: any; 
    isOpen: boolean; 
    onClose: () => void;
}) {
    const {
        suggestions,
        isValidating,
        validateBillingData,
        dismissSuggestion,
        applySuggestion,
    } = useAISuggestions();

    React.useEffect(() => {
        if (isOpen && bill) {
            validateBillingData(bill);
        }
    }, [isOpen, bill]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">
                        Validación RIPS - {bill?.patientName}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600"
                    >
                        ✕
                    </button>
                </div>

                {isValidating && (
                    <div className="text-center py-8">
                        <p className="text-slate-600">Validando...</p>
                    </div>
                )}

                {!isValidating && suggestions.length === 0 && (
                    <div className="text-center py-8 text-green-600">
                        ✅ No se encontraron problemas
                    </div>
                )}

                {!isValidating && suggestions.length > 0 && (
                    <AISuggestionList
                        suggestions={suggestions}
                        onDismiss={dismissSuggestion}
                        onApply={applySuggestion}
                    />
                )}

                <div className="mt-6 flex justify-end">
                    <Button onClick={onClose}>
                        Cerrar
                    </Button>
                </div>
            </div>
        </div>
    );
}

// ============================================
// INLINE SUGGESTIONS (Best for forms)
// ============================================

/**
 * Show suggestions inline with the form
 * This is the recommended approach for forms
 */
export function BillingFormWithInlineSuggestions() {
    const [formData, setFormData] = React.useState({
        date: '',
        procedures: '',
        diagnosis: '',
        eps: '',
    });

    const {
        suggestions,
        isValidating,
        validateBillingData,
        dismissSuggestion,
    } = useAISuggestions();

    // Auto-validate on change (debounced)
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (formData.date && formData.procedures) {
                validateBillingData({
                    ...formData,
                    procedures: formData.procedures.split(','),
                });
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [formData]);

    return (
        <div className="space-y-6">
            {/* Form fields */}
            <div className="space-y-4">
                <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2 border rounded"
                />
                
                {/* ... more fields ... */}
            </div>

            {/* Inline suggestions */}
            {suggestions.length > 0 && (
                <div className="mt-4">
                    <AISuggestionList
                        suggestions={suggestions}
                        onDismiss={dismissSuggestion}
                    />
                </div>
            )}

            {/* Show loading indicator */}
            {isValidating && (
                <div className="text-sm text-slate-500">
                    Validando...
                </div>
            )}
        </div>
    );
}
