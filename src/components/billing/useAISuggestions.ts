import { useState, useCallback } from 'react';
import { client } from '../../amplify-utils';
import type { AISuggestion } from './AISuggestionCard';

interface ValidationError {
    field: string;
    message: string;
}

interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: string[];
}

interface UseAISuggestionsReturn {
    suggestions: AISuggestion[];
    isValidating: boolean;
    error: string | null;
    validateBillingData: (billingData: any) => Promise<void>;
    dismissSuggestion: (suggestionId: string) => void;
    applySuggestion: (suggestionId: string) => void;
    clearSuggestions: () => void;
}

/**
 * Hook for managing AI-powered billing validation suggestions
 * 
 * This hook:
 * 1. Calls the RIPS validator Lambda function
 * 2. Parses validation results and AI suggestions
 * 3. Manages suggestion state (dismiss/apply)
 * 4. Tracks which suggestions have been applied
 */
export function useAISuggestions(): UseAISuggestionsReturn {
    const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

    /**
     * Parse validation result and convert to AISuggestion format
     */
    const parseValidationResult = useCallback((result: ValidationResult): AISuggestion[] => {
        const parsedSuggestions: AISuggestion[] = [];
        let idCounter = 0;

        // Convert errors to suggestions
        result.errors.forEach((error) => {
            parsedSuggestions.push({
                id: `error-${idCounter++}`,
                severity: 'error',
                field: error.field,
                message: error.message,
                autoFixAvailable: false,
            });
        });

        // Convert warnings to suggestions
        result.warnings.forEach((warning) => {
            // Detect if it's an AI warning (starts with emoji)
            const isAIWarning = warning.startsWith('⚠️ AI:') || warning.startsWith('💡');
            
            // Parse AI suggestions
            if (warning.startsWith('💡')) {
                parsedSuggestions.push({
                    id: `ai-suggestion-${idCounter++}`,
                    severity: 'info',
                    field: 'AI Recommendation',
                    message: warning.replace('💡', '').trim(),
                    autoFixAvailable: false,
                });
            } else if (warning.startsWith('⚠️ AI:')) {
                parsedSuggestions.push({
                    id: `ai-warning-${idCounter++}`,
                    severity: 'warning',
                    field: 'AI Compliance Check',
                    message: warning.replace('⚠️ AI:', '').trim(),
                    autoFixAvailable: false,
                });
            } else {
                // Regular warning
                parsedSuggestions.push({
                    id: `warning-${idCounter++}`,
                    severity: 'warning',
                    field: 'General',
                    message: warning,
                    autoFixAvailable: false,
                });
            }
        });

        return parsedSuggestions;
    }, []);

    /**
     * Validate billing data using the RIPS validator
     */
    const validateBillingData = useCallback(async (billingData: any) => {
        setIsValidating(true);
        setError(null);

        try {
            console.log('[useAISuggestions] Calling validateRIPS with data:', billingData);

            const response = await (client.queries as any).validateRIPS({
                billingRecord: billingData
            });

            console.log('[useAISuggestions] Validation response:', response);

            if (response.data) {
                // Parse the response (it might be a JSON string or object)
                const result: ValidationResult = typeof response.data === 'string' 
                    ? JSON.parse(response.data) 
                    : response.data;

                // Convert to suggestions
                const newSuggestions = parseValidationResult(result);
                setSuggestions(newSuggestions);

                console.log('[useAISuggestions] Parsed suggestions:', newSuggestions);
            } else {
                throw new Error('No data returned from validation');
            }

        } catch (err) {
            console.error('[useAISuggestions] Validation failed:', err);
            setError(err instanceof Error ? err.message : 'Validation failed');
            
            // Add error as a suggestion
            setSuggestions([{
                id: 'validation-error',
                severity: 'error',
                field: 'System',
                message: 'No se pudo completar la validación. Por favor, intente nuevamente.',
                autoFixAvailable: false,
            }]);
        } finally {
            setIsValidating(false);
        }
    }, [parseValidationResult]);

    /**
     * Dismiss a suggestion (remove from view)
     */
    const dismissSuggestion = useCallback((suggestionId: string) => {
        setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    }, []);

    /**
     * Apply a suggestion's recommended fix
     * (This is a placeholder - actual implementation depends on the field type)
     */
    const applySuggestion = useCallback((suggestionId: string) => {
        // Mark as applied
        setAppliedSuggestions(prev => new Set(prev).add(suggestionId));
        
        // For now, just dismiss it after applying
        // In a real implementation, you would:
        // 1. Apply the fix to the form data
        // 2. Show a success message
        // 3. Re-validate
        dismissSuggestion(suggestionId);
        
        console.log('[useAISuggestions] Applied suggestion:', suggestionId);
    }, [dismissSuggestion]);

    /**
     * Clear all suggestions
     */
    const clearSuggestions = useCallback(() => {
        setSuggestions([]);
        setError(null);
        setAppliedSuggestions(new Set());
    }, []);

    return {
        suggestions,
        isValidating,
        error,
        validateBillingData,
        dismissSuggestion,
        applySuggestion,
        clearSuggestions,
    };
}
