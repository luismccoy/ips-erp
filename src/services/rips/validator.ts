/**
 * RIPS JSON Validator - Resolución 2275/2023
 * 
 * Validates RIPS JSON documents before export.
 * Ensures compliance with Colombian healthcare billing standards.
 */

import type {
  RIPSJsonDocument,
  RIPSUsuario,
  RIPSConsulta,
  RIPSProcedimiento,
  RIPSOtroServicio,
  RIPSValidationError,
  RIPSValidationWarning,
  TipoDocumentoIdentificacion,
} from './types';

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface RIPSValidationResult {
  isValid: boolean;
  errors: RIPSValidationError[];
  warnings: RIPSValidationWarning[];
  summary: {
    totalErrors: number;
    totalWarnings: number;
    errorsByType: Record<string, number>;
    warningsByType: Record<string, number>;
  };
}

// ============================================================================
// VALIDATION RULES & PATTERNS
// ============================================================================

// CIE-10 code pattern (alphanumeric, 3-5 chars)
const CIE10_PATTERN = /^[A-Z]\d{2}(\d{0,2})?$/i;

// CUPS code pattern (6 digits)
const CUPS_PATTERN = /^\d{6}$/;

// Document number patterns by type
const DOCUMENT_PATTERNS: Partial<Record<TipoDocumentoIdentificacion, RegExp>> = {
  'CC': /^\d{6,12}$/,
  'TI': /^\d{6,12}$/,
  'CE': /^[A-Z0-9]{5,12}$/i,
  'PA': /^[A-Z0-9]{5,15}$/i,
  'RC': /^\d{8,12}$/,
  'NI': /^\d{9,10}$/,
};

// Valid date pattern (YYYY-MM-DD)
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Valid datetime pattern (ISO 8601)
const DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

// ============================================================================
// RIPS VALIDATOR CLASS
// ============================================================================

export class RIPSValidator {
  private errors: RIPSValidationError[] = [];
  private warnings: RIPSValidationWarning[] = [];

  constructor() {
    this.reset();
  }

  /**
   * Reset validation state
   */
  private reset(): void {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Add an error
   */
  private addError(
    code: string,
    field: string,
    message: string,
    recordType: RIPSValidationError['recordType'],
    recordId?: string
  ): void {
    this.errors.push({ code, field, message, recordType, recordId, severity: 'error' });
  }

  /**
   * Add a warning
   */
  private addWarning(
    code: string,
    field: string,
    message: string,
    recordType: RIPSValidationWarning['recordType'],
    recordId?: string
  ): void {
    this.warnings.push({ code, field, message, recordType, recordId, severity: 'warning' });
  }

  // ==========================================================================
  // INDIVIDUAL FIELD VALIDATORS
  // ==========================================================================

  /**
   * Validate date format (YYYY-MM-DD)
   */
  private validateDate(value: string | undefined, field: string, recordType: RIPSValidationError['recordType'], recordId?: string): boolean {
    if (!value) {
      this.addError('VAL001', field, `${field} es requerido`, recordType, recordId);
      return false;
    }
    
    if (!DATE_PATTERN.test(value)) {
      this.addError('VAL002', field, `${field} debe tener formato YYYY-MM-DD`, recordType, recordId);
      return false;
    }
    
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      this.addError('VAL003', field, `${field} no es una fecha válida`, recordType, recordId);
      return false;
    }
    
    // Check if date is not in the future (unless it's a scheduled date)
    if (date > new Date() && !field.toLowerCase().includes('program')) {
      this.addWarning('VAL004', field, `${field} está en el futuro`, recordType, recordId);
    }
    
    return true;
  }

  /**
   * Validate datetime format (ISO 8601)
   */
  private validateDateTime(value: string | undefined, field: string, recordType: RIPSValidationError['recordType'], recordId?: string): boolean {
    if (!value) {
      this.addError('VAL005', field, `${field} es requerido`, recordType, recordId);
      return false;
    }
    
    if (!DATETIME_PATTERN.test(value)) {
      this.addError('VAL006', field, `${field} debe tener formato ISO 8601`, recordType, recordId);
      return false;
    }
    
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      this.addError('VAL007', field, `${field} no es una fecha/hora válida`, recordType, recordId);
      return false;
    }
    
    return true;
  }

  /**
   * Validate CIE-10 code
   */
  private validateCIE10(code: string | undefined | null, field: string, recordType: RIPSValidationError['recordType'], recordId?: string, required = true): boolean {
    if (!code) {
      if (required) {
        this.addError('VAL010', field, `Código CIE-10 requerido en ${field}`, recordType, recordId);
        return false;
      }
      return true;
    }
    
    // Remove any dots for validation
    const cleanCode = code.replace(/\./g, '');
    
    if (!CIE10_PATTERN.test(cleanCode)) {
      this.addError('VAL011', field, `Código CIE-10 inválido: ${code}`, recordType, recordId);
      return false;
    }
    
    return true;
  }

  /**
   * Validate CUPS code
   */
  private validateCUPS(code: string | undefined, field: string, recordType: RIPSValidationError['recordType'], recordId?: string, required = true): boolean {
    if (!code) {
      if (required) {
        this.addError('VAL020', field, `Código CUPS requerido en ${field}`, recordType, recordId);
        return false;
      }
      return true;
    }
    
    if (!CUPS_PATTERN.test(code)) {
      this.addWarning('VAL021', field, `Código CUPS posiblemente inválido: ${code}`, recordType, recordId);
    }
    
    return true;
  }

  /**
   * Validate document number
   */
  private validateDocumentNumber(
    docType: TipoDocumentoIdentificacion | undefined,
    docNumber: string | undefined,
    recordType: RIPSValidationError['recordType'],
    recordId?: string
  ): boolean {
    if (!docNumber) {
      this.addError('VAL030', 'numDocumentoIdentificacion', 'Número de documento requerido', recordType, recordId);
      return false;
    }
    
    const type = docType || 'CC';
    const pattern = DOCUMENT_PATTERNS[type];
    
    if (pattern && !pattern.test(docNumber)) {
      this.addWarning('VAL031', 'numDocumentoIdentificacion', 
        `Formato de documento posiblemente inválido para tipo ${type}: ${docNumber}`, recordType, recordId);
    }
    
    return true;
  }

  /**
   * Validate numeric value
   */
  private validateNumber(
    value: number | undefined,
    field: string,
    recordType: RIPSValidationError['recordType'],
    recordId?: string,
    options: { min?: number; max?: number; required?: boolean } = {}
  ): boolean {
    const { min, max, required = false } = options;
    
    if (value === undefined || value === null) {
      if (required) {
        this.addError('VAL040', field, `${field} es requerido`, recordType, recordId);
        return false;
      }
      return true;
    }
    
    if (typeof value !== 'number' || isNaN(value)) {
      this.addError('VAL041', field, `${field} debe ser un número válido`, recordType, recordId);
      return false;
    }
    
    if (min !== undefined && value < min) {
      this.addError('VAL042', field, `${field} debe ser mayor o igual a ${min}`, recordType, recordId);
      return false;
    }
    
    if (max !== undefined && value > max) {
      this.addError('VAL043', field, `${field} debe ser menor o igual a ${max}`, recordType, recordId);
      return false;
    }
    
    return true;
  }

  // ==========================================================================
  // RECORD VALIDATORS
  // ==========================================================================

  /**
   * Validate Transacción record
   */
  private validateTransaccion(doc: RIPSJsonDocument): void {
    const tx = doc.transaccion;
    
    if (!tx) {
      this.addError('TX001', 'transaccion', 'Transacción es requerida', 'TX');
      return;
    }
    
    if (!tx.codigoFacturador) {
      this.addError('TX002', 'codigoFacturador', 'Código del facturador (NIT) es requerido', 'TX');
    }
    
    if (!tx.numeroFactura) {
      this.addError('TX003', 'numeroFactura', 'Número de factura es requerido', 'TX');
    }
    
    if (!tx.tipoNota || !['NA', 'NC', 'ND'].includes(tx.tipoNota)) {
      this.addError('TX004', 'tipoNota', 'Tipo de nota inválido (debe ser NA, NC o ND)', 'TX');
    }
    
    this.validateDate(tx.fechaFactura, 'fechaFactura', 'TX');
    
    if (tx.periodoInicio && tx.periodoFin) {
      const inicio = new Date(tx.periodoInicio);
      const fin = new Date(tx.periodoFin);
      if (inicio > fin) {
        this.addError('TX005', 'periodoInicio', 'Período de inicio no puede ser posterior al período final', 'TX');
      }
    }
  }

  /**
   * Validate Usuario record
   */
  private validateUsuario(usuario: RIPSUsuario, index: number): void {
    const recordId = `US-${index + 1}`;
    
    this.validateDocumentNumber(
      usuario.tipoDocumentoIdentificacion,
      usuario.numDocumentoIdentificacion,
      'US',
      recordId
    );
    
    if (!usuario.tipoUsuario) {
      this.addError('US001', 'tipoUsuario', 'Tipo de usuario es requerido', 'US', recordId);
    }
    
    this.validateDate(usuario.fechaNacimiento, 'fechaNacimiento', 'US', recordId);
    
    if (!usuario.codigoSexo || !['M', 'F', 'I'].includes(usuario.codigoSexo)) {
      this.addError('US002', 'codigoSexo', 'Código de sexo inválido', 'US', recordId);
    }
    
    if (!usuario.codPaisResidencia) {
      this.addWarning('US003', 'codPaisResidencia', 'Código de país de residencia no especificado', 'US', recordId);
    }
    
    if (!usuario.codMunicipioResidencia) {
      this.addWarning('US004', 'codMunicipioResidencia', 'Código de municipio de residencia no especificado', 'US', recordId);
    }
  }

  /**
   * Validate Consulta record
   */
  private validateConsulta(consulta: RIPSConsulta, index: number, usuarios: RIPSUsuario[]): void {
    const recordId = `AC-${index + 1}`;
    
    if (!consulta.codPrestador) {
      this.addError('AC001', 'codPrestador', 'Código de prestador es requerido', 'AC', recordId);
    }
    
    this.validateDateTime(consulta.fechaInicioAtencion, 'fechaInicioAtencion', 'AC', recordId);
    
    if (!consulta.codConsulta) {
      this.addError('AC002', 'codConsulta', 'Código de consulta (CUPS) es requerido', 'AC', recordId);
    }
    
    this.validateCIE10(consulta.codDiagnosticoPrincipal, 'codDiagnosticoPrincipal', 'AC', recordId);
    this.validateCIE10(consulta.codDiagnosticoRelacionado1, 'codDiagnosticoRelacionado1', 'AC', recordId, false);
    this.validateCIE10(consulta.codDiagnosticoRelacionado2, 'codDiagnosticoRelacionado2', 'AC', recordId, false);
    this.validateCIE10(consulta.codDiagnosticoRelacionado3, 'codDiagnosticoRelacionado3', 'AC', recordId, false);
    
    this.validateNumber(consulta.vrServicio, 'vrServicio', 'AC', recordId, { min: 0 });
    
    // Verify user exists
    const userExists = usuarios.some(u => 
      u.numDocumentoIdentificacion === consulta.numDocumentoIdentificacion &&
      u.tipoDocumentoIdentificacion === consulta.tipoDocumentoIdentificacion
    );
    
    if (!userExists) {
      this.addError('AC003', 'numDocumentoIdentificacion', 
        'Usuario no encontrado en lista de usuarios', 'AC', recordId);
    }
  }

  /**
   * Validate Procedimiento record
   */
  private validateProcedimiento(proc: RIPSProcedimiento, index: number, usuarios: RIPSUsuario[]): void {
    const recordId = `AP-${index + 1}`;
    
    if (!proc.codPrestador) {
      this.addError('AP001', 'codPrestador', 'Código de prestador es requerido', 'AP', recordId);
    }
    
    this.validateDateTime(proc.fechaInicioAtencion, 'fechaInicioAtencion', 'AP', recordId);
    
    this.validateCUPS(proc.codProcedimiento, 'codProcedimiento', 'AP', recordId);
    
    this.validateCIE10(proc.codDiagnosticoPrincipal, 'codDiagnosticoPrincipal', 'AP', recordId);
    
    this.validateNumber(proc.vrServicio, 'vrServicio', 'AP', recordId, { min: 0 });
    
    // Verify user exists
    const userExists = usuarios.some(u => 
      u.numDocumentoIdentificacion === proc.numDocumentoIdentificacion &&
      u.tipoDocumentoIdentificacion === proc.tipoDocumentoIdentificacion
    );
    
    if (!userExists) {
      this.addError('AP002', 'numDocumentoIdentificacion', 
        'Usuario no encontrado en lista de usuarios', 'AP', recordId);
    }
  }

  /**
   * Validate OtroServicio record
   */
  private validateOtroServicio(servicio: RIPSOtroServicio, index: number, usuarios: RIPSUsuario[]): void {
    const recordId = `AT-${index + 1}`;
    
    if (!servicio.codPrestador) {
      this.addError('AT001', 'codPrestador', 'Código de prestador es requerido', 'AT', recordId);
    }
    
    this.validateDateTime(servicio.fechaSuministroTecnologia, 'fechaSuministroTecnologia', 'AT', recordId);
    
    if (!servicio.tipoServicio) {
      this.addError('AT002', 'tipoServicio', 'Tipo de servicio es requerido', 'AT', recordId);
    }
    
    this.validateNumber(servicio.cantidad, 'cantidad', 'AT', recordId, { min: 1, required: true });
    this.validateNumber(servicio.vrUnitario, 'vrUnitario', 'AT', recordId, { min: 0 });
    this.validateNumber(servicio.vrServicio, 'vrServicio', 'AT', recordId, { min: 0 });
    
    // Verify user exists
    const userExists = usuarios.some(u => 
      u.numDocumentoIdentificacion === servicio.numDocumentoIdentificacion &&
      u.tipoDocumentoIdentificacion === servicio.tipoDocumentoIdentificacion
    );
    
    if (!userExists) {
      this.addError('AT003', 'numDocumentoIdentificacion', 
        'Usuario no encontrado en lista de usuarios', 'AT', recordId);
    }
  }

  // ==========================================================================
  // DOCUMENT VALIDATION
  // ==========================================================================

  /**
   * Validate complete RIPS JSON document
   */
  validate(document: RIPSJsonDocument): RIPSValidationResult {
    this.reset();

    // Validate transacción
    this.validateTransaccion(document);

    // Validate usuarios
    if (!document.usuarios || document.usuarios.length === 0) {
      this.addError('DOC001', 'usuarios', 'Debe incluir al menos un usuario', 'US');
    } else {
      document.usuarios.forEach((usuario, index) => this.validateUsuario(usuario, index));
    }

    // Validate consultas
    if (document.consulta && document.consulta.length > 0) {
      document.consulta.forEach((consulta, index) => 
        this.validateConsulta(consulta, index, document.usuarios));
    }

    // Validate procedimientos
    if (document.procedimientos && document.procedimientos.length > 0) {
      document.procedimientos.forEach((proc, index) => 
        this.validateProcedimiento(proc, index, document.usuarios));
    }

    // Validate otros servicios
    if (document.otrosServicios && document.otrosServicios.length > 0) {
      document.otrosServicios.forEach((servicio, index) => 
        this.validateOtroServicio(servicio, index, document.usuarios));
    }

    // Check for at least one service record
    const totalServices = 
      (document.consulta?.length || 0) +
      (document.procedimientos?.length || 0) +
      (document.urgencias?.length || 0) +
      (document.hospitalizacion?.length || 0) +
      (document.medicamentos?.length || 0) +
      (document.otrosServicios?.length || 0);

    if (totalServices === 0) {
      this.addWarning('DOC002', 'servicios', 
        'El documento no contiene registros de servicios (consultas, procedimientos, etc.)', 'TX');
    }

    // Build summary
    const errorsByType: Record<string, number> = {};
    const warningsByType: Record<string, number> = {};

    this.errors.forEach(e => {
      errorsByType[e.recordType] = (errorsByType[e.recordType] || 0) + 1;
    });

    this.warnings.forEach(w => {
      warningsByType[w.recordType] = (warningsByType[w.recordType] || 0) + 1;
    });

    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      summary: {
        totalErrors: this.errors.length,
        totalWarnings: this.warnings.length,
        errorsByType,
        warningsByType,
      },
    };
  }

  /**
   * Quick validation check
   */
  isValid(document: RIPSJsonDocument): boolean {
    const result = this.validate(document);
    return result.isValid;
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Create a new RIPS validator
 */
export function createRIPSValidator(): RIPSValidator {
  return new RIPSValidator();
}

/**
 * Quick validate RIPS document
 */
export function validateRIPSDocument(document: RIPSJsonDocument): RIPSValidationResult {
  const validator = new RIPSValidator();
  return validator.validate(document);
}

/**
 * Check if RIPS document is valid
 */
export function isValidRIPSDocument(document: RIPSJsonDocument): boolean {
  const validator = new RIPSValidator();
  return validator.isValid(document);
}

export default RIPSValidator;
