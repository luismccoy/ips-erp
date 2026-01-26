/**
 * RIPS JSON Generator - Resolución 2275/2023
 * 
 * Generates RIPS JSON documents from IPS-ERP data models.
 * Maps Patient, Shift, and BillingRecord to Colombian RIPS format.
 */

import type {
  RIPSJsonDocument,
  RIPSTransaccion,
  RIPSUsuario,
  RIPSConsulta,
  RIPSProcedimiento,
  RIPSOtroServicio,
  RIPSPatientInput,
  RIPSVisitInput,
  RIPSBillingInput,
  RIPSProviderConfig,
  RIPSExportOptions,
  RIPSGenerationResult,
  RIPSValidationError,
  RIPSValidationWarning,
  TipoDocumentoIdentificacion,
  CodigoSexo,
  ModalidadGrupoServicio,
  GrupoServicios,
  FinalidadTecnologiaSalud,
  CausaMotivoAtencion,
  TipoDiagnosticoPrincipal,
} from './types';

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_PROVIDER_CONFIG: RIPSProviderConfig = {
  nit: '900000000',
  codigoHabilitacion: '110010001001',
  nombreIPS: 'IPS-ERP Sistema',
  codigoServicioDefault: '301', // Consulta medicina general
  grupoServiciosDefault: '01', // Consulta externa
  modalidadDefault: '02', // Extramural domiciliaria
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Parse diagnosis string to extract CIE-10 code
 * Handles formats like "I10 - Hipertensión" or just "I10"
 */
function extractDiagnosisCode(diagnosis: string | undefined): string {
  if (!diagnosis) return 'Z00'; // General examination
  
  // Try to extract code from "CODE - Description" format
  const match = diagnosis.match(/^([A-Z]\d{2}(?:\.\d{1,2})?)/i);
  if (match) {
    return match[1].toUpperCase().replace('.', '');
  }
  
  // Return as-is if looks like a code
  if (/^[A-Z]\d{2}/i.test(diagnosis)) {
    return diagnosis.split(' ')[0].toUpperCase().replace('.', '');
  }
  
  // Default
  return 'Z00';
}

/**
 * Parse document type from various formats
 */
function parseDocumentType(docType: string | undefined): TipoDocumentoIdentificacion {
  if (!docType) return 'CC';
  
  const normalized = docType.toUpperCase().replace(/[^A-Z]/g, '');
  
  const mapping: Record<string, TipoDocumentoIdentificacion> = {
    'CC': 'CC',
    'CEDULA': 'CC',
    'CEDULADECIUDADANIA': 'CC',
    'CE': 'CE',
    'CEDULADEEXTRANJERIA': 'CE',
    'TI': 'TI',
    'TARJETADEIDENTIDAD': 'TI',
    'PA': 'PA',
    'PASAPORTE': 'PA',
    'RC': 'RC',
    'REGISTROCIVIL': 'RC',
    'NIT': 'NI',
    'PE': 'PE',
    'PT': 'PT',
  };
  
  return mapping[normalized] || 'CC';
}

/**
 * Parse sex from various formats
 */
function parseSex(sex: string | undefined): CodigoSexo {
  if (!sex) return 'M';
  
  const normalized = sex.toUpperCase().charAt(0);
  
  if (normalized === 'F' || normalized === 'W') return 'F';
  if (normalized === 'M' || normalized === 'H') return 'M';
  if (normalized === 'I' || normalized === 'O') return 'I';
  
  return 'M';
}

/**
 * Format date to YYYY-MM-DD
 */
function formatDate(date: string | Date | undefined): string {
  if (!date) return new Date().toISOString().split('T')[0];
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
  
  return d.toISOString().split('T')[0];
}

/**
 * Format datetime to ISO 8601
 */
function formatDateTime(date: string | Date | undefined): string {
  if (!date) return new Date().toISOString();
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return new Date().toISOString();
  
  return d.toISOString();
}

/**
 * Generate invoice number
 */
function generateInvoiceNumber(prefix: string, date: string, index: number): string {
  const dateStr = date.replace(/-/g, '');
  return `${prefix}${dateStr}-${String(index).padStart(4, '0')}`;
}

/**
 * Estimate birth date from age
 */
function estimateBirthDateFromAge(age: number | undefined): string {
  if (!age || age <= 0) return '1970-01-01';
  
  const now = new Date();
  const birthYear = now.getFullYear() - age;
  return `${birthYear}-01-01`;
}

// ============================================================================
// RIPS GENERATOR CLASS
// ============================================================================

export class RIPSGenerator {
  private config: RIPSProviderConfig;
  private errors: RIPSValidationError[] = [];
  private warnings: RIPSValidationWarning[] = [];

  constructor(config?: Partial<RIPSProviderConfig>) {
    this.config = { ...DEFAULT_PROVIDER_CONFIG, ...config };
  }

  /**
   * Reset errors and warnings for a new generation
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

  /**
   * Generate RIPS Transacción from billing data
   */
  generateTransaccion(
    billing: RIPSBillingInput | undefined,
    options: RIPSExportOptions,
    invoiceIndex: number
  ): RIPSTransaccion {
    const invoiceNumber = billing?.invoiceNumber || 
      generateInvoiceNumber('FEV', options.startDate, invoiceIndex);
    
    return {
      codigoFacturador: this.config.nit,
      numeroFactura: invoiceNumber,
      tipoNota: 'NA',
      fechaFactura: formatDate(billing?.date || options.startDate),
      fechaHoraExpedicion: formatDateTime(new Date()),
      codigoEntidadPagadora: billing?.eps?.replace(/\s/g, '').substring(0, 6).toUpperCase() || 'EPS001',
      periodoInicio: options.startDate,
      periodoFin: options.endDate,
    };
  }

  /**
   * Generate RIPS Usuario from patient data
   */
  generateUsuario(patient: RIPSPatientInput, consecutivo: number): RIPSUsuario {
    // Validate required fields
    if (!patient.documentId) {
      this.addError('US001', 'numDocumentoIdentificacion', 'Número de documento requerido', 'US', patient.id);
    }

    // Parse name parts
    let primerApellido = '';
    let segundoApellido = '';
    let primerNombre = '';
    let segundoNombre = '';
    
    if (patient.lastName && patient.firstName) {
      const lastNames = patient.lastName.split(' ');
      primerApellido = lastNames[0] || '';
      segundoApellido = lastNames[1] || '';
      
      const firstNames = patient.firstName.split(' ');
      primerNombre = firstNames[0] || '';
      segundoNombre = firstNames[1] || '';
    } else if (patient.name) {
      const parts = patient.name.split(' ');
      if (parts.length >= 2) {
        primerNombre = parts[0];
        segundoNombre = parts.length > 2 ? parts[1] : '';
        primerApellido = parts.length > 2 ? parts[2] : parts[1];
        segundoApellido = parts.length > 3 ? parts[3] : '';
      } else {
        primerNombre = parts[0] || '';
        primerApellido = 'NN';
      }
    }

    // Determine birth date
    let fechaNacimiento = patient.birthDate;
    if (!fechaNacimiento && patient.age) {
      fechaNacimiento = estimateBirthDateFromAge(patient.age);
      this.addWarning('US002', 'fechaNacimiento', 'Fecha de nacimiento estimada desde edad', 'US', patient.id);
    }
    if (!fechaNacimiento) {
      fechaNacimiento = '1970-01-01';
      this.addWarning('US003', 'fechaNacimiento', 'Fecha de nacimiento no disponible, usando default', 'US', patient.id);
    }

    return {
      tipoDocumentoIdentificacion: patient.documentType || parseDocumentType(undefined),
      numDocumentoIdentificacion: patient.documentId || '',
      tipoUsuario: patient.userType || '01',
      fechaNacimiento: formatDate(fechaNacimiento),
      codigoSexo: patient.sex || parseSex(undefined),
      codPaisResidencia: patient.countryCode || 'CO',
      codMunicipioResidencia: patient.municipalityCode || '11001', // Bogotá default
      codZonaTerritorialResidencia: patient.zone || 'U',
      consecutivo,
      primerApellido: primerApellido.toUpperCase(),
      segundoApellido: segundoApellido.toUpperCase(),
      primerNombre: primerNombre.toUpperCase(),
      segundoNombre: segundoNombre.toUpperCase(),
      codEntidadAdministradora: patient.epsCode,
    };
  }

  /**
   * Generate RIPS Consulta from visit data
   */
  generateConsulta(
    visit: RIPSVisitInput,
    patient: RIPSPatientInput
  ): RIPSConsulta {
    const diagCode = extractDiagnosisCode(visit.diagnosis || patient.diagnosis);
    
    if (!visit.completedAt && !visit.scheduledTime) {
      this.addError('AC001', 'fechaInicioAtencion', 'Fecha de atención requerida', 'AC', visit.id);
    }

    return {
      codPrestador: visit.providerCode || this.config.codigoHabilitacion,
      fechaInicioAtencion: formatDateTime(visit.completedAt || visit.scheduledTime),
      numAutorizacion: visit.authorizationNumber || undefined,
      codConsulta: '890201', // Consulta de medicina general
      modalidadGrupoServicioTecSal: visit.serviceModality || this.config.modalidadDefault,
      grupoServicios: visit.serviceGroup || this.config.grupoServiciosDefault,
      codServicio: visit.serviceCode || this.config.codigoServicioDefault,
      finalidadTecnologiaSalud: visit.servicePurpose || '02', // Terapéutico
      causaMotivoAtencion: visit.visitReason || '13', // Enfermedad general
      codDiagnosticoPrincipal: diagCode,
      codDiagnosticoRelacionado1: null,
      codDiagnosticoRelacionado2: null,
      codDiagnosticoRelacionado3: null,
      tipoDiagnosticoPrincipal: '1' as TipoDiagnosticoPrincipal, // Impresión diagnóstica
      vrServicio: visit.serviceValue || 0,
      tipoDocumentoIdentificacion: visit.patientDocumentType || patient.documentType || 'CC',
      numDocumentoIdentificacion: visit.patientDocumentId || patient.documentId,
    };
  }

  /**
   * Generate RIPS Procedimiento from procedure codes
   */
  generateProcedimiento(
    procedureCode: string,
    visit: RIPSVisitInput,
    patient: RIPSPatientInput,
    value: number = 0
  ): RIPSProcedimiento {
    const diagCode = extractDiagnosisCode(visit.diagnosis || patient.diagnosis);

    return {
      codPrestador: visit.providerCode || this.config.codigoHabilitacion,
      fechaInicioAtencion: formatDateTime(visit.completedAt || visit.scheduledTime),
      numAutorizacion: visit.authorizationNumber || undefined,
      codProcedimiento: procedureCode,
      modalidadGrupoServicioTecSal: visit.serviceModality || this.config.modalidadDefault,
      grupoServicios: visit.serviceGroup || this.config.grupoServiciosDefault,
      codServicio: visit.serviceCode || this.config.codigoServicioDefault,
      finalidadTecnologiaSalud: visit.servicePurpose || '02',
      tipoDocumentoIdentificacion: visit.patientDocumentType || patient.documentType || 'CC',
      numDocumentoIdentificacion: visit.patientDocumentId || patient.documentId,
      codDiagnosticoPrincipal: diagCode,
      codDiagnosticoRelacionado: null,
      codComplicacion: null,
      vrServicio: value,
    };
  }

  /**
   * Generate RIPS Otro Servicio
   */
  generateOtroServicio(
    serviceName: string,
    visit: RIPSVisitInput,
    patient: RIPSPatientInput,
    quantity: number = 1,
    unitValue: number = 0
  ): RIPSOtroServicio {
    return {
      codPrestador: visit.providerCode || this.config.codigoHabilitacion,
      numAutorizacion: visit.authorizationNumber || undefined,
      fechaSuministroTecnologia: formatDateTime(visit.completedAt || visit.scheduledTime),
      tipoServicio: '05', // Otros
      nombreServicio: serviceName,
      cantidad: quantity,
      vrUnitario: unitValue,
      vrServicio: quantity * unitValue,
      tipoDocumentoIdentificacion: visit.patientDocumentType || patient.documentType || 'CC',
      numDocumentoIdentificacion: visit.patientDocumentId || patient.documentId,
    };
  }

  /**
   * Generate complete RIPS JSON document
   */
  generate(
    patients: RIPSPatientInput[],
    visits: RIPSVisitInput[],
    billings: RIPSBillingInput[],
    options: RIPSExportOptions
  ): RIPSGenerationResult {
    this.reset();

    // Validate inputs
    if (patients.length === 0) {
      this.addError('GEN001', 'usuarios', 'No hay pacientes para generar RIPS', 'US');
    }

    // Create patient map for quick lookup
    const patientMap = new Map<string, RIPSPatientInput>();
    patients.forEach(p => {
      patientMap.set(p.id, p);
      if (p.documentId) {
        patientMap.set(p.documentId, p);
      }
    });

    // Generate usuarios
    const usuarios: RIPSUsuario[] = [];
    const processedPatients = new Set<string>();
    
    patients.forEach((patient, index) => {
      if (!processedPatients.has(patient.documentId)) {
        usuarios.push(this.generateUsuario(patient, index + 1));
        processedPatients.add(patient.documentId);
      }
    });

    // Generate consultas and procedimientos
    const consultas: RIPSConsulta[] = [];
    const procedimientos: RIPSProcedimiento[] = [];
    const otrosServicios: RIPSOtroServicio[] = [];

    visits.forEach(visit => {
      const patient = patientMap.get(visit.patientId) || patientMap.get(visit.patientDocumentId);
      
      if (!patient) {
        this.addWarning('GEN002', 'patientId', `Paciente no encontrado para visita ${visit.id}`, 'AC', visit.id);
        return;
      }

      // Filter by date range
      const visitDate = new Date(visit.completedAt || visit.scheduledTime);
      const startDate = new Date(options.startDate);
      const endDate = new Date(options.endDate);
      endDate.setHours(23, 59, 59, 999);

      if (visitDate < startDate || visitDate > endDate) {
        return;
      }

      // Generate consulta
      consultas.push(this.generateConsulta(visit, patient));

      // Generate procedimientos from procedures array
      if (visit.procedures && visit.procedures.length > 0) {
        visit.procedures.forEach(proc => {
          // Extract CUPS code if in "CODE - Description" format
          const cupsMatch = proc.match(/^(\d{6})/);
          const cupsCode = cupsMatch ? cupsMatch[1] : proc.replace(/\D/g, '').substring(0, 6).padEnd(6, '0');
          
          if (cupsCode && cupsCode !== '000000') {
            procedimientos.push(this.generateProcedimiento(cupsCode, visit, patient, 0));
          }
        });
      }
    });

    // Calculate totals from billings
    let valorTotal = 0;
    billings.forEach(billing => {
      valorTotal += billing.totalAmount || 0;
    });

    // If no visits but billing exists, create consultas from billing records
    if (consultas.length === 0 && billings.length > 0) {
      billings.forEach(billing => {
        const patient = patientMap.get(billing.patientId);
        if (patient) {
          const pseudoVisit: RIPSVisitInput = {
            id: billing.id,
            patientId: billing.patientId,
            patientDocumentId: patient.documentId,
            scheduledTime: billing.date,
            completedAt: billing.date,
            diagnosis: billing.diagnosis,
            diagnosisCode: billing.diagnosisCode,
            procedures: billing.procedures,
            serviceValue: billing.totalAmount,
          };
          consultas.push(this.generateConsulta(pseudoVisit, patient));
        }
      });
    }

    // Generate transacción
    const primaryBilling = billings[0];
    const transaccion = this.generateTransaccion(primaryBilling, options, 1);

    // Build RIPS document
    const document: RIPSJsonDocument = {
      version: '2.0',
      transaccion,
      usuarios,
      consulta: consultas,
      procedimientos,
      urgencias: [],
      hospitalizacion: [],
      recienNacidos: [],
      medicamentos: [],
      otrosServicios,
    };

    // Compile stats
    const stats = {
      totalUsuarios: usuarios.length,
      totalConsultas: consultas.length,
      totalProcedimientos: procedimientos.length,
      totalOtrosServicios: otrosServicios.length,
      totalMedicamentos: 0,
      totalUrgencias: 0,
      totalHospitalizacion: 0,
      totalRecienNacidos: 0,
      valorTotal,
    };

    return {
      success: this.errors.length === 0,
      document,
      errors: this.errors,
      warnings: this.warnings,
      stats,
    };
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Create a new RIPS generator with default config
 */
export function createRIPSGenerator(config?: Partial<RIPSProviderConfig>): RIPSGenerator {
  return new RIPSGenerator(config);
}

/**
 * Quick generate RIPS from raw data
 */
export function generateRIPS(
  patients: RIPSPatientInput[],
  visits: RIPSVisitInput[],
  billings: RIPSBillingInput[],
  options: RIPSExportOptions,
  config?: Partial<RIPSProviderConfig>
): RIPSGenerationResult {
  const generator = new RIPSGenerator(config);
  return generator.generate(patients, visits, billings, options);
}

export default RIPSGenerator;
