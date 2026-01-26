/**
 * RIPS Services - Resolución 2275/2023
 * 
 * Colombian healthcare electronic billing compliance services.
 * 
 * @example
 * ```typescript
 * import { 
 *   RIPSGenerator, 
 *   RIPSValidator, 
 *   RIPSExporter,
 *   generateRIPS,
 *   downloadRIPSJson 
 * } from '@/services/rips';
 * 
 * // Generate RIPS JSON
 * const result = generateRIPS(patients, visits, billings, {
 *   startDate: '2026-01-01',
 *   endDate: '2026-01-31',
 * });
 * 
 * // Download if valid
 * if (result.success && result.document) {
 *   downloadRIPSJson(result.document);
 * }
 * ```
 */

// Types
export type {
  // Codification types
  TipoDocumentoIdentificacion,
  CodigoSexo,
  CodigoZona,
  TipoUsuario,
  ModalidadGrupoServicio,
  GrupoServicios,
  FinalidadTecnologiaSalud,
  CausaMotivoAtencion,
  TipoDiagnosticoPrincipal,
  TipoNota,
  ViaIngresoUrgencias,
  CausaExternaUrgencias,
  DestinoSalidaUrgencias,
  
  // Document structures
  RIPSJsonDocument,
  RIPSTransaccion,
  RIPSUsuario,
  RIPSConsulta,
  RIPSProcedimiento,
  RIPSUrgencia,
  RIPSHospitalizacion,
  RIPSRecienNacido,
  RIPSMedicamento,
  RIPSOtroServicio,
  
  // Input types for mapping
  RIPSPatientInput,
  RIPSVisitInput,
  RIPSBillingInput,
  RIPSProviderConfig,
  RIPSExportOptions,
  
  // Result types
  RIPSGenerationResult,
  RIPSValidationError,
  RIPSValidationWarning,
} from './types';

// Generator
export {
  RIPSGenerator,
  createRIPSGenerator,
  generateRIPS,
} from './generator';

// Validator
export type { RIPSValidationResult } from './validator';
export {
  RIPSValidator,
  createRIPSValidator,
  validateRIPSDocument,
  isValidRIPSDocument,
} from './validator';

// Exporter
export type {
  RIPSExportConfig,
  RIPSExportResult,
  RIPSExportSummary,
} from './exporter';
export {
  RIPSExporter,
  createRIPSExporter,
  exportRIPSDocument,
  downloadRIPSJson,
  downloadRIPSFromResult,
  createRIPSBlobUrl,
  getRIPSExportSummary,
} from './exporter';
