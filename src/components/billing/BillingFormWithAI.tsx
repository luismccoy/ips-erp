import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Sparkles, Save, FileText } from 'lucide-react';
import { AISuggestionList } from './AISuggestionCard';
import { useAISuggestions } from './useAISuggestions';
import { LoadingSpinner } from '../ui/LoadingSpinner';

/**
 * Example Billing Form with AI Suggestions Integration
 * 
 * This component demonstrates how to:
 * 1. Integrate the AI suggestions UI into a billing form
 * 2. Call the validator when data changes
 * 3. Display suggestions to the user
 * 4. Handle dismiss/apply actions
 * 
 * Usage:
 * ```tsx
 * import { BillingFormWithAI } from './components/billing';
 * 
 * function MyBillingPage() {
 *   return <BillingFormWithAI />;
 * }
 * ```
 */
export const BillingFormWithAI: React.FC = () => {
    // Form state
    const [formData, setFormData] = useState({
        date: '',
        procedures: '',
        diagnosis: '',
        eps: '',
        totalAmount: '',
        patientId: '',
        shiftId: '',
    });

    // AI suggestions hook
    const {
        suggestions,
        isValidating,
        error,
        validateBillingData,
        dismissSuggestion,
        applySuggestion,
        clearSuggestions,
    } = useAISuggestions();

    // Auto-validate on form change (debounced)
    useEffect(() => {
        // Only validate if we have the required fields
        if (!formData.date || !formData.procedures || !formData.diagnosis || !formData.eps) {
            return;
        }

        // Debounce validation to avoid excessive API calls
        const timer = setTimeout(() => {
            validateBillingRecord();
        }, 1000);

        return () => clearTimeout(timer);
    }, [formData]);

    /**
     * Validate the current billing record
     */
    const validateBillingRecord = async () => {
        // Convert form data to the format expected by the validator
        const billingData = {
            id: 'temp-' + Date.now(), // Temporary ID for new records
            date: formData.date,
            procedures: formData.procedures.split(',').map(p => p.trim()),
            diagnosis: formData.diagnosis,
            eps: formData.eps,
            totalAmount: parseFloat(formData.totalAmount) || 0,
            patientId: formData.patientId || undefined,
            shiftId: formData.shiftId || undefined,
        };

        await validateBillingData(billingData);
    };

    /**
     * Handle form field changes
     */
    const handleFieldChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    /**
     * Save the billing record
     */
    const handleSave = async () => {
        // First validate
        await validateBillingRecord();

        // Check if there are any errors
        const hasErrors = suggestions.some(s => s.severity === 'error');
        
        if (hasErrors) {
            alert('Por favor, corrija los errores antes de guardar.');
            return;
        }

        // TODO: Implement actual save logic
        alert('Guardando registro de facturación...');
        console.log('Saving billing record:', formData);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-7 h-7 text-indigo-600" />
                    Registro de Facturación RIPS
                </h1>
            </div>

            {/* Main Form */}
            <Card>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Date */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Fecha *
                            </label>
                            <Input
                                type="date"
                                value={formData.date}
                                onChange={(e) => handleFieldChange('date', e.target.value)}
                                required
                            />
                        </div>

                        {/* EPS */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                EPS *
                            </label>
                            <Input
                                type="text"
                                placeholder="Ej: SURA, SANITAS, COMPENSAR"
                                value={formData.eps}
                                onChange={(e) => handleFieldChange('eps', e.target.value)}
                                required
                            />
                        </div>

                        {/* Procedures (CUPS codes) */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Procedimientos (CUPS) *
                            </label>
                            <Input
                                type="text"
                                placeholder="Ej: 890201, 890301 (separados por coma)"
                                value={formData.procedures}
                                onChange={(e) => handleFieldChange('procedures', e.target.value)}
                                required
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Códigos CUPS de 6 dígitos, separados por coma
                            </p>
                        </div>

                        {/* Diagnosis (ICD-10) */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Diagnóstico (CIE-10) *
                            </label>
                            <Input
                                type="text"
                                placeholder="Ej: A00, I10, E11.9"
                                value={formData.diagnosis}
                                onChange={(e) => handleFieldChange('diagnosis', e.target.value)}
                                required
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Código CIE-10 (Letra + 2 dígitos)
                            </p>
                        </div>

                        {/* Total Amount */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Monto Total
                            </label>
                            <Input
                                type="number"
                                placeholder="0.00"
                                value={formData.totalAmount}
                                onChange={(e) => handleFieldChange('totalAmount', e.target.value)}
                                step="0.01"
                                min="0"
                            />
                        </div>

                        {/* Patient ID (optional) */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                ID Paciente (opcional)
                            </label>
                            <Input
                                type="text"
                                placeholder="ID del paciente"
                                value={formData.patientId}
                                onChange={(e) => handleFieldChange('patientId', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                        <Button
                            type="button"
                            variant="secondary"
                            icon={<Sparkles className="w-4 h-4" />}
                            onClick={validateBillingRecord}
                            disabled={isValidating}
                            isLoading={isValidating}
                        >
                            {isValidating ? 'Validando...' : 'Validar con IA'}
                        </Button>

                        <Button
                            type="submit"
                            variant="primary"
                            icon={<Save className="w-4 h-4" />}
                            disabled={isValidating}
                        >
                            Guardar
                        </Button>

                        {suggestions.length > 0 && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={clearSuggestions}
                            >
                                Limpiar Sugerencias
                            </Button>
                        )}
                    </div>
                </form>
            </Card>

            {/* Validation Status */}
            {isValidating && (
                <Card className="border-indigo-200">
                    <div className="flex items-center gap-3 text-indigo-700">
                        <LoadingSpinner />
                        <span className="text-sm font-medium">
                            Validando con IA...
                        </span>
                    </div>
                </Card>
            )}

            {/* Error Display */}
            {error && !isValidating && (
                <Card className="border-red-200 bg-red-50">
                    <div className="text-sm text-red-700">
                        <strong>Error:</strong> {error}
                    </div>
                </Card>
            )}

            {/* AI Suggestions List */}
            {!isValidating && suggestions.length > 0 && (
                <AISuggestionList
                    suggestions={suggestions}
                    onDismiss={dismissSuggestion}
                    onApply={applySuggestion}
                />
            )}

            {/* Success State */}
            {!isValidating && !error && suggestions.length === 0 && formData.date && (
                <Card className="border-green-200 bg-green-50">
                    <div className="flex items-center gap-2 text-green-700">
                        <Sparkles className="w-5 h-5" />
                        <span className="text-sm font-medium">
                            ✅ No se encontraron problemas. El registro cumple con las validaciones RIPS.
                        </span>
                    </div>
                </Card>
            )}
        </div>
    );
};
