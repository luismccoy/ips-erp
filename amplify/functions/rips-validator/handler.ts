import { type Schema } from '../../data/resource';

/**
 * RIPS Validator - Colombian Health Ministry Compliance
 * Validates billing records against Resolución 2275 requirements
 * 
 * Validation Rules:
 * 1. Required fields: date, procedures (CUPS codes), diagnosis (ICD-10), EPS
 * 2. Date format: ISO 8601 (YYYY-MM-DD)
 * 3. Procedures: Array of valid CUPS codes (Colombian procedure codes)
 * 4. Diagnosis: Valid ICD-10 code format
 * 5. EPS: Valid Colombian health insurance provider
 */

interface ValidationError {
    field: string;
    message: string;
}

interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: string[];
}

export const handler: Schema["validateRIPS"]["functionHandler"] = async (event) => {
    const { billingRecord } = event.arguments;
    
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    // 1. Validate required fields
    if (!billingRecord.date) {
        errors.push({ field: 'date', message: 'Date is required' });
    }
    
    if (!billingRecord.procedures || billingRecord.procedures.length === 0) {
        errors.push({ field: 'procedures', message: 'At least one procedure (CUPS code) is required' });
    }
    
    if (!billingRecord.diagnosis) {
        errors.push({ field: 'diagnosis', message: 'Diagnosis (ICD-10 code) is required' });
    }
    
    if (!billingRecord.eps) {
        errors.push({ field: 'eps', message: 'EPS (health insurance provider) is required' });
    }

    // 2. Validate date format (ISO 8601)
    if (billingRecord.date) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(billingRecord.date)) {
            errors.push({ 
                field: 'date', 
                message: 'Date must be in ISO 8601 format (YYYY-MM-DD)' 
            });
        } else {
            // Check if date is valid
            const date = new Date(billingRecord.date);
            if (isNaN(date.getTime())) {
                errors.push({ field: 'date', message: 'Invalid date value' });
            }
            
            // Warn if date is in the future
            if (date > new Date()) {
                warnings.push('Date is in the future');
            }
        }
    }

    // 3. Validate CUPS codes (Colombian procedure codes)
    if (billingRecord.procedures && billingRecord.procedures.length > 0) {
        billingRecord.procedures.forEach((code: string, index: number) => {
            // CUPS codes are typically 6 digits
            const cupsRegex = /^\d{6}$/;
            if (!cupsRegex.test(code)) {
                errors.push({ 
                    field: `procedures[${index}]`, 
                    message: `Invalid CUPS code format: ${code}. Expected 6 digits.` 
                });
            }
        });
    }

    // 4. Validate ICD-10 diagnosis code
    if (billingRecord.diagnosis) {
        // ICD-10 codes: Letter + 2 digits + optional decimal + 1-2 digits
        // Examples: A00, A00.0, A00.01
        const icd10Regex = /^[A-Z]\d{2}(\.\d{1,2})?$/;
        if (!icd10Regex.test(billingRecord.diagnosis)) {
            errors.push({ 
                field: 'diagnosis', 
                message: `Invalid ICD-10 code format: ${billingRecord.diagnosis}` 
            });
        }
    }

    // 5. Validate EPS (Colombian health insurance providers)
    if (billingRecord.eps) {
        // Common Colombian EPS codes (simplified validation)
        const validEPS = [
            'EPS001', 'EPS002', 'EPS003', // Placeholder codes
            'SURA', 'SANITAS', 'COMPENSAR', 'FAMISANAR', 'SALUD_TOTAL'
        ];
        
        // For now, just check it's not empty and has reasonable length
        if (billingRecord.eps.length < 3) {
            errors.push({ 
                field: 'eps', 
                message: 'EPS code is too short' 
            });
        }
        
        // Warn if EPS is not in common list (but don't fail)
        if (!validEPS.includes(billingRecord.eps)) {
            warnings.push(`EPS '${billingRecord.eps}' is not in the common provider list`);
        }
    }

    // 6. Validate amount
    if (billingRecord.totalAmount !== undefined) {
        if (billingRecord.totalAmount < 0) {
            errors.push({ 
                field: 'totalAmount', 
                message: 'Amount cannot be negative' 
            });
        }
        
        if (billingRecord.totalAmount === 0) {
            warnings.push('Amount is zero');
        }
    }

    // 7. Check for missing optional but recommended fields
    if (!billingRecord.patientId) {
        warnings.push('Patient ID is missing (recommended for tracking)');
    }
    
    if (!billingRecord.shiftId) {
        warnings.push('Shift ID is missing (recommended for audit trail)');
    }

    const result: ValidationResult = {
        isValid: errors.length === 0,
        errors,
        warnings
    };

    return result;
};
