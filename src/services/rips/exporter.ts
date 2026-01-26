/**
 * RIPS JSON Exporter - Resolución 2275/2023
 * 
 * Exports RIPS JSON documents as downloadable files.
 * Provides various export formats and utilities.
 */

import type { RIPSJsonDocument, RIPSGenerationResult, RIPSProviderConfig } from './types';
import { validateRIPSDocument, type RIPSValidationResult } from './validator';

// ============================================================================
// EXPORT TYPES
// ============================================================================

export interface RIPSExportConfig {
  /** Include validation before export */
  validateBeforeExport?: boolean;
  /** Format JSON with indentation */
  prettyPrint?: boolean;
  /** Indentation size for pretty print */
  indent?: number;
  /** File name prefix */
  filePrefix?: string;
  /** Include timestamp in filename */
  includeTimestamp?: boolean;
  /** Provider configuration for metadata */
  providerConfig?: Partial<RIPSProviderConfig>;
}

export interface RIPSExportResult {
  success: boolean;
  filename: string;
  content: string;
  validation?: RIPSValidationResult;
  error?: string;
  metadata: {
    exportedAt: string;
    recordCounts: {
      usuarios: number;
      consultas: number;
      procedimientos: number;
      urgencias: number;
      hospitalizacion: number;
      recienNacidos: number;
      medicamentos: number;
      otrosServicios: number;
    };
    fileSize: number;
  };
}

export interface RIPSExportSummary {
  /** Invoice number */
  numeroFactura: string;
  /** Export date */
  fechaExportacion: string;
  /** Period start */
  periodoInicio: string;
  /** Period end */
  periodoFin: string;
  /** Total value */
  valorTotal: number;
  /** Record counts */
  registros: {
    usuarios: number;
    consultas: number;
    procedimientos: number;
    otrosServicios: number;
    total: number;
  };
  /** Validation status */
  validacion: {
    valido: boolean;
    errores: number;
    advertencias: number;
  };
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_EXPORT_CONFIG: RIPSExportConfig = {
  validateBeforeExport: true,
  prettyPrint: true,
  indent: 2,
  filePrefix: 'RIPS',
  includeTimestamp: true,
};

// ============================================================================
// RIPS EXPORTER CLASS
// ============================================================================

export class RIPSExporter {
  private config: RIPSExportConfig;

  constructor(config?: Partial<RIPSExportConfig>) {
    this.config = { ...DEFAULT_EXPORT_CONFIG, ...config };
  }

  /**
   * Generate filename for export
   */
  private generateFilename(document: RIPSJsonDocument): string {
    const prefix = this.config.filePrefix || 'RIPS';
    const invoiceNumber = document.transaccion?.numeroFactura || 'SIN-FACTURA';
    const dateStr = document.transaccion?.fechaFactura?.replace(/-/g, '') || 
      new Date().toISOString().split('T')[0].replace(/-/g, '');
    
    let filename = `${prefix}_${invoiceNumber}_${dateStr}`;
    
    if (this.config.includeTimestamp) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      filename += `_${timestamp}`;
    }
    
    return `${filename}.json`;
  }

  /**
   * Export document to JSON string
   */
  private serializeDocument(document: RIPSJsonDocument): string {
    if (this.config.prettyPrint) {
      return JSON.stringify(document, null, this.config.indent);
    }
    return JSON.stringify(document);
  }

  /**
   * Calculate total value from document
   */
  private calculateTotalValue(document: RIPSJsonDocument): number {
    let total = 0;
    
    document.consulta?.forEach(c => total += c.vrServicio || 0);
    document.procedimientos?.forEach(p => total += p.vrServicio || 0);
    document.medicamentos?.forEach(m => total += m.vrServicio || 0);
    document.otrosServicios?.forEach(o => total += o.vrServicio || 0);
    
    return total;
  }

  /**
   * Export RIPS document
   */
  export(document: RIPSJsonDocument): RIPSExportResult {
    // Validate if configured
    let validation: RIPSValidationResult | undefined;
    
    if (this.config.validateBeforeExport) {
      validation = validateRIPSDocument(document);
      
      if (!validation.isValid) {
        return {
          success: false,
          filename: '',
          content: '',
          validation,
          error: `Documento inválido: ${validation.summary.totalErrors} errores encontrados`,
          metadata: {
            exportedAt: new Date().toISOString(),
            recordCounts: this.getRecordCounts(document),
            fileSize: 0,
          },
        };
      }
    }

    // Serialize document
    const content = this.serializeDocument(document);
    const filename = this.generateFilename(document);

    return {
      success: true,
      filename,
      content,
      validation,
      metadata: {
        exportedAt: new Date().toISOString(),
        recordCounts: this.getRecordCounts(document),
        fileSize: new Blob([content]).size,
      },
    };
  }

  /**
   * Export from generation result
   */
  exportFromResult(result: RIPSGenerationResult): RIPSExportResult {
    if (!result.success || !result.document) {
      return {
        success: false,
        filename: '',
        content: '',
        error: `Error en generación: ${result.errors.map(e => e.message).join(', ')}`,
        metadata: {
          exportedAt: new Date().toISOString(),
          recordCounts: {
            usuarios: 0,
            consultas: 0,
            procedimientos: 0,
            urgencias: 0,
            hospitalizacion: 0,
            recienNacidos: 0,
            medicamentos: 0,
            otrosServicios: 0,
          },
          fileSize: 0,
        },
      };
    }

    return this.export(result.document);
  }

  /**
   * Get record counts from document
   */
  private getRecordCounts(document: RIPSJsonDocument) {
    return {
      usuarios: document.usuarios?.length || 0,
      consultas: document.consulta?.length || 0,
      procedimientos: document.procedimientos?.length || 0,
      urgencias: document.urgencias?.length || 0,
      hospitalizacion: document.hospitalizacion?.length || 0,
      recienNacidos: document.recienNacidos?.length || 0,
      medicamentos: document.medicamentos?.length || 0,
      otrosServicios: document.otrosServicios?.length || 0,
    };
  }

  /**
   * Generate export summary
   */
  getSummary(document: RIPSJsonDocument, validation?: RIPSValidationResult): RIPSExportSummary {
    const counts = this.getRecordCounts(document);
    
    return {
      numeroFactura: document.transaccion?.numeroFactura || 'N/A',
      fechaExportacion: new Date().toISOString(),
      periodoInicio: document.transaccion?.periodoInicio || document.transaccion?.fechaFactura || 'N/A',
      periodoFin: document.transaccion?.periodoFin || document.transaccion?.fechaFactura || 'N/A',
      valorTotal: this.calculateTotalValue(document),
      registros: {
        usuarios: counts.usuarios,
        consultas: counts.consultas,
        procedimientos: counts.procedimientos,
        otrosServicios: counts.otrosServicios,
        total: counts.usuarios + counts.consultas + counts.procedimientos + 
               counts.urgencias + counts.hospitalizacion + counts.recienNacidos +
               counts.medicamentos + counts.otrosServicios,
      },
      validacion: {
        valido: validation?.isValid ?? true,
        errores: validation?.summary.totalErrors ?? 0,
        advertencias: validation?.summary.totalWarnings ?? 0,
      },
    };
  }
}

// ============================================================================
// BROWSER DOWNLOAD UTILITIES
// ============================================================================

/**
 * Download RIPS JSON as file in browser
 */
export function downloadRIPSJson(ripsDocument: RIPSJsonDocument, config?: RIPSExportConfig): RIPSExportResult {
  const exporter = new RIPSExporter(config);
  const result = exporter.export(ripsDocument);
  
  if (result.success && typeof window !== 'undefined' && typeof document !== 'undefined') {
    const blob = new Blob([result.content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = result.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  
  return result;
}

/**
 * Download RIPS from generation result
 */
export function downloadRIPSFromResult(generationResult: RIPSGenerationResult, config?: RIPSExportConfig): RIPSExportResult {
  if (!generationResult.success || !generationResult.document) {
    return {
      success: false,
      filename: '',
      content: '',
      error: 'No hay documento RIPS para exportar',
      metadata: {
        exportedAt: new Date().toISOString(),
        recordCounts: {
          usuarios: 0,
          consultas: 0,
          procedimientos: 0,
          urgencias: 0,
          hospitalizacion: 0,
          recienNacidos: 0,
          medicamentos: 0,
          otrosServicios: 0,
        },
        fileSize: 0,
      },
    };
  }
  
  return downloadRIPSJson(generationResult.document, config);
}

/**
 * Create downloadable blob URL for RIPS document
 */
export function createRIPSBlobUrl(ripsDocument: RIPSJsonDocument, config?: RIPSExportConfig): { url: string; filename: string } | null {
  const exporter = new RIPSExporter(config);
  const result = exporter.export(ripsDocument);
  
  if (!result.success) {
    return null;
  }
  
  const blob = new Blob([result.content], { type: 'application/json' });
  return {
    url: URL.createObjectURL(blob),
    filename: result.filename,
  };
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Create a new RIPS exporter
 */
export function createRIPSExporter(config?: Partial<RIPSExportConfig>): RIPSExporter {
  return new RIPSExporter(config);
}

/**
 * Quick export RIPS document
 */
export function exportRIPSDocument(document: RIPSJsonDocument, config?: RIPSExportConfig): RIPSExportResult {
  const exporter = new RIPSExporter(config);
  return exporter.export(document);
}

/**
 * Get export summary
 */
export function getRIPSExportSummary(document: RIPSJsonDocument): RIPSExportSummary {
  const exporter = new RIPSExporter();
  return exporter.getSummary(document);
}

export default RIPSExporter;
