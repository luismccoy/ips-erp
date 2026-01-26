/**
 * RIPS JSON Types - Resolución 2275/2023
 * 
 * Complete TypeScript types for Colombian RIPS JSON format
 * as defined by MinSalud for electronic health billing.
 * 
 * @see https://www.minsalud.gov.co - Resolución 2275 de 2023
 */

// ============================================================================
// CODIFICATION TYPES
// ============================================================================

/**
 * Tipos de documento de identificación
 */
export type TipoDocumentoIdentificacion = 
  | 'CC'   // Cédula de Ciudadanía
  | 'CE'   // Cédula de Extranjería
  | 'PA'   // Pasaporte
  | 'RC'   // Registro Civil
  | 'TI'   // Tarjeta de Identidad
  | 'AS'   // Adulto sin identificar
  | 'MS'   // Menor sin identificar
  | 'CN'   // Certificado de nacido vivo
  | 'SC'   // Salvoconducto
  | 'PE'   // Permiso especial de permanencia
  | 'PT'   // Permiso por Protección Temporal
  | 'DE'   // Documento extranjero
  | 'NI';  // NIT

/**
 * Código de sexo
 */
export type CodigoSexo = 'M' | 'F' | 'I'; // Masculino, Femenino, Indeterminado

/**
 * Código de zona territorial de residencia
 */
export type CodigoZona = 'U' | 'R'; // Urbana, Rural

/**
 * Tipo de usuario
 */
export type TipoUsuario = 
  | '01' // Contributivo cotizante
  | '02' // Contributivo beneficiario
  | '03' // Subsidiado
  | '04' // No asegurado
  | '05' // Particular
  | '06' // Víctimas - Régimen contributivo
  | '07' // Víctimas - Régimen subsidiado
  | '08' // Víctimas - No asegurado
  | '09'; // Régimen especial

/**
 * Modalidad de grupo de servicio tecnología en salud
 */
export type ModalidadGrupoServicio = 
  | '01' // Intramural
  | '02' // Extramural - domiciliaria
  | '03' // Extramural - unidad móvil
  | '04' // Extramural - jornada de salud
  | '05' // Telemedicina interactiva
  | '06' // Telemedicina no interactiva
  | '07' // Telemedicina telexperticia
  | '08' // Telemedicina telemonitoreo;

/**
 * Grupo de servicios
 */
export type GrupoServicios = 
  | '01' // Consulta externa
  | '02' // Apoyo diagnóstico y complementación terapéutica
  | '03' // Internación
  | '04' // Quirúrgico
  | '05' // Atención inmediata;

/**
 * Finalidad de la tecnología en salud
 */
export type FinalidadTecnologiaSalud = 
  | '01' // Diagnóstico
  | '02' // Terapéutico
  | '03' // Protección específica
  | '04' // Detección temprana
  | '05' // Promoción
  | '06' // Paliativo;

/**
 * Causa o motivo de la atención
 */
export type CausaMotivoAtencion = 
  | '01' // Accidente de trabajo
  | '02' // Accidente de tránsito
  | '03' // Accidente rábico
  | '04' // Accidente ofídico
  | '05' // Otro tipo de accidente
  | '06' // Evento catastrófico
  | '07' // Lesión por agresión
  | '08' // Lesión autoinfligida
  | '09' // Sospecha de maltrato físico
  | '10' // Sospecha de abuso sexual
  | '11' // Sospecha de violencia sexual
  | '12' // Sospecha de maltrato emocional
  | '13' // Enfermedad general
  | '14' // Enfermedad profesional
  | '15' // Maternidad
  | '16' // Promoción
  | '17' // Protección específica
  | '18' // Detección temprana;

/**
 * Tipo diagnóstico principal
 */
export type TipoDiagnosticoPrincipal = 
  | '1' // Impresión diagnóstica
  | '2' // Confirmado nuevo
  | '3' // Confirmado repetido;

/**
 * Tipo de nota (para notas crédito/débito)
 */
export type TipoNota = 
  | 'NA'  // No aplica (factura)
  | 'NC'  // Nota crédito
  | 'ND'; // Nota débito

/**
 * Vía de ingreso a urgencias
 */
export type ViaIngresoUrgencias = 
  | '01' // Demanda espontánea
  | '02' // Referencia
  | '03' // Contrareferencia;

/**
 * Causa externa para urgencias
 */
export type CausaExternaUrgencias = 
  | '01' // Accidente de trabajo
  | '02' // Accidente de tránsito
  | '03' // Accidente rábico
  | '04' // Accidente ofídico
  | '05' // Otro tipo de accidente
  | '06' // Evento catastrófico
  | '07' // Lesión por agresión
  | '08' // Lesión autoinfligida
  | '09' // Sospecha de maltrato físico
  | '10' // Sospecha de abuso sexual
  | '11' // Sospecha de violencia sexual
  | '12' // Sospecha de maltrato emocional
  | '13' // Enfermedad general
  | '14' // Enfermedad profesional
  | '15'; // Maternidad

/**
 * Destino del usuario a la salida de urgencias
 */
export type DestinoSalidaUrgencias = 
  | '01' // Alta
  | '02' // Remisión
  | '03' // Hospitalización
  | '04' // Cirugía
  | '05' // Observación
  | '06' // Fallecido;

// ============================================================================
// MAIN RIPS JSON STRUCTURES
// ============================================================================

/**
 * Información de la transacción/factura
 */
export interface RIPSTransaccion {
  /** Código del facturador (NIT sin DV) */
  codigoFacturador: string;
  /** Número de factura */
  numeroFactura: string;
  /** Tipo de nota (NA para factura, NC para nota crédito, ND para débito) */
  tipoNota: TipoNota;
  /** Fecha de la factura (YYYY-MM-DD) */
  fechaFactura: string;
  /** Fecha hora de expedición (ISO 8601) */
  fechaHoraExpedicion?: string;
  /** Número de referencia factura (para NC/ND) */
  numFacturaRef?: string;
  /** Código entidad pagadora */
  codigoEntidadPagadora?: string;
  /** Período facturado inicio */
  periodoInicio?: string;
  /** Período facturado fin */
  periodoFin?: string;
}

/**
 * Información del usuario/paciente (US - Usuarios)
 */
export interface RIPSUsuario {
  /** Tipo de documento de identificación */
  tipoDocumentoIdentificacion: TipoDocumentoIdentificacion;
  /** Número de documento de identificación */
  numDocumentoIdentificacion: string;
  /** Tipo de usuario */
  tipoUsuario: TipoUsuario;
  /** Fecha de nacimiento (YYYY-MM-DD) */
  fechaNacimiento: string;
  /** Código de sexo */
  codigoSexo: CodigoSexo;
  /** Código de país de residencia (ISO 3166-1 alfa-2) */
  codPaisResidencia: string;
  /** Código DANE del municipio de residencia */
  codMunicipioResidencia: string;
  /** Código de zona territorial de residencia */
  codZonaTerritorialResidencia: CodigoZona;
  /** Indica si el paciente vive incapacitado */
  incapacidad?: boolean;
  /** Consecutivo del usuario dentro del archivo */
  consecutivo?: number;
  /** Primer apellido */
  primerApellido?: string;
  /** Segundo apellido */
  segundoApellido?: string;
  /** Primer nombre */
  primerNombre?: string;
  /** Segundo nombre */
  segundoNombre?: string;
  /** Código entidad administradora (EPS) */
  codEntidadAdministradora?: string;
}

/**
 * Información de consulta (AC - Consultas)
 */
export interface RIPSConsulta {
  /** Código del prestador habilitado */
  codPrestador: string;
  /** Fecha y hora de inicio de la atención (ISO 8601) */
  fechaInicioAtencion: string;
  /** Número de autorización */
  numAutorizacion?: string;
  /** Código de consulta (CUPS) */
  codConsulta: string;
  /** Modalidad del grupo de servicio */
  modalidadGrupoServicioTecSal: ModalidadGrupoServicio;
  /** Grupo de servicios */
  grupoServicios: GrupoServicios;
  /** Código de servicio */
  codServicio: string;
  /** Finalidad de la tecnología en salud */
  finalidadTecnologiaSalud: FinalidadTecnologiaSalud;
  /** Causa o motivo de la atención */
  causaMotivoAtencion: CausaMotivoAtencion;
  /** Código CIE-10 del diagnóstico principal */
  codDiagnosticoPrincipal: string;
  /** Código CIE-10 del diagnóstico relacionado 1 */
  codDiagnosticoRelacionado1?: string | null;
  /** Código CIE-10 del diagnóstico relacionado 2 */
  codDiagnosticoRelacionado2?: string | null;
  /** Código CIE-10 del diagnóstico relacionado 3 */
  codDiagnosticoRelacionado3?: string | null;
  /** Tipo de diagnóstico principal */
  tipoDiagnosticoPrincipal: TipoDiagnosticoPrincipal;
  /** Valor del servicio */
  vrServicio: number;
  /** Tipo de documento del paciente (para vincular con usuario) */
  tipoDocumentoIdentificacion: TipoDocumentoIdentificacion;
  /** Número de documento del paciente */
  numDocumentoIdentificacion: string;
  /** Código del concepto de recaudo */
  conceptoRecaudo?: string;
  /** Valor de recaudo moderador */
  valorRecaudoModerador?: number;
  /** Número de factura relacionada */
  numFACTURA?: string;
}

/**
 * Información de procedimiento (AP - Procedimientos)
 */
export interface RIPSProcedimiento {
  /** Código del prestador habilitado */
  codPrestador: string;
  /** Fecha y hora del procedimiento (ISO 8601) */
  fechaInicioAtencion: string;
  /** Identificador del grupo de servicios CUPS */
  idMIPRES?: string;
  /** Número de autorización */
  numAutorizacion?: string;
  /** Código del procedimiento (CUPS) */
  codProcedimiento: string;
  /** Vía del procedimiento */
  viaIngresoProcedimiento?: string;
  /** Modalidad del grupo de servicio */
  modalidadGrupoServicioTecSal: ModalidadGrupoServicio;
  /** Grupo de servicios */
  grupoServicios: GrupoServicios;
  /** Código del servicio habilitado */
  codServicio: string;
  /** Finalidad de la tecnología en salud */
  finalidadTecnologiaSalud: FinalidadTecnologiaSalud;
  /** Tipo de documento del paciente */
  tipoDocumentoIdentificacion: TipoDocumentoIdentificacion;
  /** Número de documento del paciente */
  numDocumentoIdentificacion: string;
  /** Código CIE-10 del diagnóstico principal */
  codDiagnosticoPrincipal: string;
  /** Código CIE-10 del diagnóstico relacionado */
  codDiagnosticoRelacionado?: string | null;
  /** Código del profesional que realizó el procedimiento */
  codComplicacion?: string | null;
  /** Valor del procedimiento */
  vrServicio: number;
  /** Número de factura */
  numFACTURA?: string;
}

/**
 * Información de urgencias (AU - Urgencias)
 */
export interface RIPSUrgencia {
  /** Código del prestador habilitado */
  codPrestador: string;
  /** Fecha y hora de ingreso (ISO 8601) */
  fechaInicioAtencion: string;
  /** Número de autorización */
  numAutorizacion?: string;
  /** Causa externa */
  causaExterna: CausaExternaUrgencias;
  /** Código CIE-10 de diagnóstico a la salida */
  codDiagnosticoPrincipal: string;
  /** Diagnóstico relacionado 1 */
  codDiagnosticoRelacionado1?: string | null;
  /** Diagnóstico relacionado 2 */
  codDiagnosticoRelacionado2?: string | null;
  /** Diagnóstico relacionado 3 */
  codDiagnosticoRelacionado3?: string | null;
  /** Destino del usuario a la salida */
  destinoSalida: DestinoSalidaUrgencias;
  /** Estado de la salida */
  estadoSalida: '1' | '2'; // 1=Vivo, 2=Muerto
  /** Causa de muerte (si aplica) */
  causaMuerte?: string | null;
  /** Fecha y hora de salida (ISO 8601) */
  fechaHoraSalida: string;
  /** Tipo de documento del paciente */
  tipoDocumentoIdentificacion: TipoDocumentoIdentificacion;
  /** Número de documento del paciente */
  numDocumentoIdentificacion: string;
}

/**
 * Información de hospitalización (AH - Hospitalización)
 */
export interface RIPSHospitalizacion {
  /** Código del prestador habilitado */
  codPrestador: string;
  /** Vía de ingreso */
  viaIngresoInstitucion: '01' | '02' | '03' | '04'; // Urgencias, Consulta externa, Remitido, Nacido en la institución
  /** Fecha y hora de ingreso (ISO 8601) */
  fechaInicioAtencion: string;
  /** Número de autorización */
  numAutorizacion?: string;
  /** Causa externa */
  causaExterna: CausaExternaUrgencias;
  /** Diagnóstico de ingreso */
  codDiagnosticoPrincipal: string;
  /** Diagnóstico de egreso principal */
  codDiagnosticoEgresoPrincipal: string;
  /** Diagnóstico de egreso relacionado 1 */
  codDiagnosticoRelacionado1?: string | null;
  /** Diagnóstico de egreso relacionado 2 */
  codDiagnosticoRelacionado2?: string | null;
  /** Diagnóstico de egreso relacionado 3 */
  codDiagnosticoRelacionado3?: string | null;
  /** Complicación */
  codComplicacion?: string | null;
  /** Estado a la salida */
  estadoSalida: '1' | '2'; // 1=Vivo, 2=Muerto
  /** Diagnóstico causa de muerte */
  codDiagnosticoMuerte?: string | null;
  /** Fecha y hora de egreso (ISO 8601) */
  fechaEgreso: string;
  /** Tipo de documento del paciente */
  tipoDocumentoIdentificacion: TipoDocumentoIdentificacion;
  /** Número de documento del paciente */
  numDocumentoIdentificacion: string;
}

/**
 * Información de recién nacidos (AN - Recién Nacidos)
 */
export interface RIPSRecienNacido {
  /** Código del prestador habilitado */
  codPrestador: string;
  /** Tipo documento de la madre */
  tipoDocumentoIdMadre: TipoDocumentoIdentificacion;
  /** Número documento de la madre */
  numDocumentoIdMadre: string;
  /** Fecha de nacimiento del RN (YYYY-MM-DD) */
  fechaNacimiento: string;
  /** Hora de nacimiento */
  horaNacimiento?: string;
  /** Edad gestacional */
  edadGestacional: number;
  /** Control prenatal */
  controlPrenatal: 'S' | 'N';
  /** Sexo del recién nacido */
  sexo: CodigoSexo;
  /** Peso al nacer (gramos) */
  peso: number;
  /** Diagnóstico del recién nacido (CIE-10) */
  codDiagnosticoPrincipal: string;
  /** Causa de muerte si aplica */
  causaMuerte?: string | null;
  /** Fecha de muerte si aplica */
  fechaMuerte?: string | null;
}

/**
 * Información de medicamentos (AM - Medicamentos)
 */
export interface RIPSMedicamento {
  /** Código del prestador habilitado */
  codPrestador: string;
  /** Número de autorización */
  numAutorizacion?: string;
  /** Identificador MIPRES */
  idMIPRES?: string;
  /** Fecha de dispensación (ISO 8601) */
  fechaDispensAdmon: string;
  /** Código del medicamento (CUM/INVIMA) */
  codDiagnosticoPrincipal: string;
  /** Tipo de medicamento */
  tipoMedicamento: '01' | '02' | '03' | '04'; // PBS, No PBS, No incluido Res. 1885, Especial
  /** Número de unidades dispensadas */
  cantidadDispensada: number;
  /** Valor unitario */
  vrUnitario: number;
  /** Valor total */
  vrServicio: number;
  /** Tipo de documento del paciente */
  tipoDocumentoIdentificacion: TipoDocumentoIdentificacion;
  /** Número de documento del paciente */
  numDocumentoIdentificacion: string;
  /** Número de factura */
  numFACTURA?: string;
}

/**
 * Información de otros servicios (AT - Otros Servicios)
 */
export interface RIPSOtroServicio {
  /** Código del prestador habilitado */
  codPrestador: string;
  /** Número de autorización */
  numAutorizacion?: string;
  /** Identificador MIPRES */
  idMIPRES?: string;
  /** Fecha del servicio (ISO 8601) */
  fechaSuministroTecnologia: string;
  /** Tipo de servicio */
  tipoServicio: '01' | '02' | '03' | '04' | '05'; // Material de osteosíntesis, Estancia, Traslado, Dispositivo médico, Otros
  /** Código del servicio */
  codServicio?: string;
  /** Nombre/descripción del servicio */
  nombreServicio?: string;
  /** Cantidad */
  cantidad: number;
  /** Valor unitario */
  vrUnitario: number;
  /** Valor total */
  vrServicio: number;
  /** Tipo de documento del paciente */
  tipoDocumentoIdentificacion: TipoDocumentoIdentificacion;
  /** Número de documento del paciente */
  numDocumentoIdentificacion: string;
  /** Número de factura */
  numFACTURA?: string;
}

// ============================================================================
// COMPLETE RIPS JSON DOCUMENT
// ============================================================================

/**
 * Documento RIPS JSON completo según Resolución 2275/2023
 */
export interface RIPSJsonDocument {
  /** Versión del formato */
  version?: string;
  /** Información de la transacción/factura */
  transaccion: RIPSTransaccion;
  /** Lista de usuarios/pacientes */
  usuarios: RIPSUsuario[];
  /** Lista de consultas */
  consulta: RIPSConsulta[];
  /** Lista de procedimientos */
  procedimientos: RIPSProcedimiento[];
  /** Lista de urgencias */
  urgencias: RIPSUrgencia[];
  /** Lista de hospitalización */
  hospitalizacion: RIPSHospitalizacion[];
  /** Lista de recién nacidos */
  recienNacidos: RIPSRecienNacido[];
  /** Lista de medicamentos */
  medicamentos: RIPSMedicamento[];
  /** Lista de otros servicios */
  otrosServicios: RIPSOtroServicio[];
}

// ============================================================================
// IPS-ERP DATA MAPPING INTERFACES
// ============================================================================

/**
 * Patient data for RIPS mapping
 */
export interface RIPSPatientInput {
  id: string;
  documentId: string;
  documentType?: TipoDocumentoIdentificacion;
  name: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  sex?: CodigoSexo;
  countryCode?: string;
  municipalityCode?: string;
  zone?: CodigoZona;
  userType?: TipoUsuario;
  epsCode?: string;
  diagnosis?: string;
  address?: string;
  age?: number;
}

/**
 * Visit/Shift data for RIPS mapping
 */
export interface RIPSVisitInput {
  id: string;
  patientId: string;
  patientDocumentId: string;
  patientDocumentType?: TipoDocumentoIdentificacion;
  scheduledTime: string;
  completedAt?: string;
  clinicalNote?: string;
  diagnosis?: string;
  diagnosisCode?: string;
  procedures?: string[];
  providerCode?: string;
  authorizationNumber?: string;
  serviceModality?: ModalidadGrupoServicio;
  serviceGroup?: GrupoServicios;
  serviceCode?: string;
  servicePurpose?: FinalidadTecnologiaSalud;
  visitReason?: CausaMotivoAtencion;
  serviceValue?: number;
}

/**
 * Billing data for RIPS mapping
 */
export interface RIPSBillingInput {
  id: string;
  invoiceNumber?: string;
  date: string;
  eps: string;
  diagnosis: string;
  diagnosisCode?: string;
  procedures?: string[];
  totalAmount: number;
  patientId: string;
  shiftId?: string;
  copayment?: number;
  moderationFee?: number;
}

/**
 * IPS/Provider configuration for RIPS
 */
export interface RIPSProviderConfig {
  /** NIT del facturador */
  nit: string;
  /** Código habilitación prestador */
  codigoHabilitacion: string;
  /** Nombre de la IPS */
  nombreIPS: string;
  /** Código del servicio habilitado default */
  codigoServicioDefault: string;
  /** Grupo de servicios default */
  grupoServiciosDefault: GrupoServicios;
  /** Modalidad de atención default */
  modalidadDefault: ModalidadGrupoServicio;
}

/**
 * RIPS export options
 */
export interface RIPSExportOptions {
  /** Start date for export range */
  startDate: string;
  /** End date for export range */
  endDate: string;
  /** Include only specific patient IDs */
  patientIds?: string[];
  /** Include only specific billing record IDs */
  billingRecordIds?: string[];
  /** Invoice number prefix */
  invoicePrefix?: string;
  /** Whether to include draft/pending records */
  includePending?: boolean;
}

/**
 * RIPS generation result
 */
export interface RIPSGenerationResult {
  success: boolean;
  document?: RIPSJsonDocument;
  errors: RIPSValidationError[];
  warnings: RIPSValidationWarning[];
  stats: {
    totalUsuarios: number;
    totalConsultas: number;
    totalProcedimientos: number;
    totalOtrosServicios: number;
    totalMedicamentos: number;
    totalUrgencias: number;
    totalHospitalizacion: number;
    totalRecienNacidos: number;
    valorTotal: number;
  };
}

/**
 * RIPS validation error
 */
export interface RIPSValidationError {
  code: string;
  field: string;
  message: string;
  recordType: 'US' | 'AC' | 'AP' | 'AU' | 'AH' | 'AN' | 'AM' | 'AT' | 'TX';
  recordId?: string;
  severity: 'error';
}

/**
 * RIPS validation warning
 */
export interface RIPSValidationWarning {
  code: string;
  field: string;
  message: string;
  recordType: 'US' | 'AC' | 'AP' | 'AU' | 'AH' | 'AN' | 'AM' | 'AT' | 'TX';
  recordId?: string;
  severity: 'warning';
}
