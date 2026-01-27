/**
 * Test Data for AI Suggestions Component
 * 
 * Use these data sets to test the billing validation UI
 */

import type { AISuggestion } from './AISuggestionCard';

/**
 * Valid billing record - should pass validation
 */
export const VALID_BILLING_RECORD = {
    id: 'test-valid-001',
    date: '2024-01-27',
    procedures: ['890201', '890301'], // Valid CUPS codes
    diagnosis: 'I10', // Valid ICD-10: Essential hypertension
    eps: 'SURA',
    totalAmount: 150000,
    patientId: 'patient-123',
    shiftId: 'shift-456',
};

/**
 * Invalid billing record - multiple errors
 */
export const INVALID_BILLING_RECORD = {
    id: 'test-invalid-001',
    date: '2024-13-45', // Invalid date
    procedures: ['12345'], // Invalid CUPS (not 6 digits)
    diagnosis: 'XYZ', // Invalid ICD-10 format
    eps: '', // Missing EPS
    totalAmount: -100, // Negative amount
};

/**
 * Partial billing record - warnings only
 */
export const PARTIAL_BILLING_RECORD = {
    id: 'test-partial-001',
    date: '2024-02-15',
    procedures: ['890201'],
    diagnosis: 'I10',
    eps: 'UNKNOWN_EPS', // Not in common list
    totalAmount: 0, // Zero amount (warning)
    // Missing patientId and shiftId (warnings)
};

/**
 * Sample suggestions for UI testing
 */
export const SAMPLE_SUGGESTIONS: AISuggestion[] = [
    {
        id: 'error-1',
        severity: 'error',
        field: 'diagnosis',
        message: 'Invalid ICD-10 code format: XYZ. Expected format: Letter + 2 digits (e.g., I10, A00)',
        recommendedAction: 'Use a valid ICD-10 code like I10 (Essential hypertension) or E11 (Type 2 diabetes)',
        autoFixAvailable: false,
    },
    {
        id: 'error-2',
        severity: 'error',
        field: 'procedures[0]',
        message: 'Invalid CUPS code format: 12345. Expected 6 digits.',
        recommendedAction: 'CUPS codes must be exactly 6 digits. Example: 890201',
        autoFixAvailable: false,
    },
    {
        id: 'warning-1',
        severity: 'warning',
        field: 'eps',
        message: 'EPS "UNKNOWN_EPS" is not in the common provider list',
        recommendedAction: 'Verify the EPS code. Common providers: SURA, SANITAS, COMPENSAR, FAMISANAR',
        autoFixAvailable: false,
    },
    {
        id: 'warning-2',
        severity: 'warning',
        field: 'totalAmount',
        message: 'Amount is zero',
        recommendedAction: 'Verify that this billing record should have no charge',
        autoFixAvailable: false,
    },
    {
        id: 'ai-warning-1',
        severity: 'warning',
        field: 'AI Compliance Check',
        message: 'El procedimiento 890201 requiere orden médica según Resolución 3100. Verificar documentación de soporte.',
        recommendedAction: 'Adjuntar copia de la orden médica al expediente del paciente',
        autoFixAvailable: false,
    },
    {
        id: 'ai-suggestion-1',
        severity: 'info',
        field: 'AI Recommendation',
        message: 'Para pacientes con diagnóstico I10 (Hipertensión), considere incluir el código CUPS 890301 (Toma de signos vitales) si se realizó monitoreo.',
        recommendedAction: 'Revisar el registro clínico y agregar códigos adicionales si aplica',
        autoFixAvailable: false,
    },
    {
        id: 'info-1',
        severity: 'info',
        field: 'patientId',
        message: 'Patient ID is missing (recommended for tracking)',
        recommendedAction: 'Link this billing record to a patient for better audit trail',
        autoFixAvailable: false,
    },
];

/**
 * Sample suggestions by severity for UI testing
 */
export const SUGGESTIONS_BY_SEVERITY = {
    errors: SAMPLE_SUGGESTIONS.filter(s => s.severity === 'error'),
    warnings: SAMPLE_SUGGESTIONS.filter(s => s.severity === 'warning'),
    info: SAMPLE_SUGGESTIONS.filter(s => s.severity === 'info'),
};

/**
 * Test scenario: Successful validation
 */
export const SCENARIO_SUCCESS = {
    billingRecord: VALID_BILLING_RECORD,
    expectedSuggestions: [],
    expectedValid: true,
};

/**
 * Test scenario: Multiple errors
 */
export const SCENARIO_ERRORS = {
    billingRecord: INVALID_BILLING_RECORD,
    expectedSuggestions: SAMPLE_SUGGESTIONS.filter(s => s.severity === 'error'),
    expectedValid: false,
};

/**
 * Test scenario: Warnings only
 */
export const SCENARIO_WARNINGS = {
    billingRecord: PARTIAL_BILLING_RECORD,
    expectedSuggestions: SAMPLE_SUGGESTIONS.filter(s => s.severity === 'warning' || s.severity === 'info'),
    expectedValid: true, // Valid but with warnings
};
