/**
 * RIPS Export Panel Component
 * 
 * Provides UI for generating and downloading RIPS JSON exports
 * per Resolución 2275/2023 Colombian healthcare billing standard.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { FileJson, Download, Calendar, AlertCircle, CheckCircle, Loader2, RefreshCw, Eye, Users, ClipboardList, Stethoscope } from 'lucide-react';
import { client } from '../amplify-utils';
import { useLoadingTimeout } from '../hooks/useLoadingTimeout';
import {
  generateRIPS,
  downloadRIPSJson,
  validateRIPSDocument,
  getRIPSExportSummary,
  type RIPSJsonDocument,
  type RIPSGenerationResult,
  type RIPSPatientInput,
  type RIPSVisitInput,
  type RIPSBillingInput,
  type RIPSExportSummary,
  type RIPSValidationResult,
  type RIPSProviderConfig,
} from '../services/rips';

// ============================================================================
// TYPES
// ============================================================================

interface RipsExportPanelProps {
  tenantId?: string;
  tenantNit?: string;
  tenantName?: string;
  onExportComplete?: (result: RIPSGenerationResult) => void;
}

interface DateRange {
  startDate: string;
  endDate: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const RipsExportPanel: React.FC<RipsExportPanelProps> = ({
  tenantId,
  tenantNit = '900000000',
  tenantName = 'IPS-ERP',
  onExportComplete,
}) => {
  // Date range state
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: endOfMonth.toISOString().split('T')[0],
    };
  });

  // Generation state
  const [generationResult, setGenerationResult] = useState<RIPSGenerationResult | null>(null);
  const [exportSummary, setExportSummary] = useState<RIPSExportSummary | null>(null);
  const [validationResult, setValidationResult] = useState<RIPSValidationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  // Loading state
  const { isLoading, hasTimedOut, startLoading, stopLoading, retry } = useLoadingTimeout({
    timeoutMs: 60000,
    onTimeout: () => setErrorMessage('La generación está tomando más tiempo de lo esperado.'),
  });

  // Provider config
  const providerConfig: Partial<RIPSProviderConfig> = {
    nit: tenantNit,
    nombreIPS: tenantName,
    codigoHabilitacion: `${tenantNit}01`,
    modalidadDefault: '02', // Domiciliaria
    grupoServiciosDefault: '01', // Consulta externa
  };

  // ========================================================================
  // DATA FETCHING
  // ========================================================================

  const fetchDataAndGenerate = useCallback(async () => {
    startLoading();
    setErrorMessage('');
    setGenerationResult(null);
    setExportSummary(null);
    setValidationResult(null);

    try {
      // Fetch patients
      const patientsRes = await client.models.Patient.list({
        filter: tenantId ? { tenantId: { eq: tenantId } } : undefined,
      });
      const patients = (patientsRes.data || []) as any[];

      // Fetch shifts (visits) in date range
      const shiftsRes = await client.models.Shift.list({
        filter: {
          ...(tenantId ? { tenantId: { eq: tenantId } } : {}),
          scheduledTime: {
            ge: dateRange.startDate,
            le: dateRange.endDate + 'T23:59:59Z',
          },
        },
      });
      const shifts = (shiftsRes.data || []) as any[];

      // Fetch billing records in date range
      const billingsRes = await client.models.BillingRecord.list({
        filter: {
          ...(tenantId ? { tenantId: { eq: tenantId } } : {}),
          date: {
            ge: dateRange.startDate,
            le: dateRange.endDate,
          },
        },
      });
      const billings = (billingsRes.data || []) as any[];

      // Map to RIPS input formats
      const ripsPatients: RIPSPatientInput[] = patients.map(p => ({
        id: p.id,
        documentId: p.documentId || '',
        name: p.name || '',
        diagnosis: p.diagnosis || '',
        address: p.address || '',
        age: p.age,
      }));

      const ripsVisits: RIPSVisitInput[] = shifts.map(s => {
        const patient = patients.find(p => p.id === s.patientId);
        return {
          id: s.id,
          patientId: s.patientId,
          patientDocumentId: patient?.documentId || '',
          scheduledTime: s.scheduledTime,
          completedAt: s.completedAt || s.startedAt,
          clinicalNote: s.clinicalNote,
          diagnosis: patient?.diagnosis,
          serviceModality: '02', // Domiciliaria
          serviceGroup: '01', // Consulta externa
        };
      });

      const ripsBillings: RIPSBillingInput[] = billings.map(b => ({
        id: b.id,
        invoiceNumber: `FEV-${b.id.substring(0, 8).toUpperCase()}`,
        date: b.date,
        eps: b.eps,
        diagnosis: b.diagnosis,
        procedures: b.procedures || [],
        totalAmount: b.totalAmount || 0,
        patientId: b.patientId,
        shiftId: b.shiftId,
      }));

      // Generate RIPS
      const result = generateRIPS(
        ripsPatients,
        ripsVisits,
        ripsBillings,
        {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
        providerConfig
      );

      setGenerationResult(result);

      // Validate and get summary if successful
      if (result.success && result.document) {
        const validation = validateRIPSDocument(result.document);
        setValidationResult(validation);
        
        const summary = getRIPSExportSummary(result.document);
        setExportSummary(summary);
      }

      onExportComplete?.(result);

    } catch (error: any) {
      console.error('Error generating RIPS:', error);
      setErrorMessage(error.message || 'Error al generar RIPS');
    } finally {
      stopLoading();
    }
  }, [dateRange, tenantId, providerConfig, onExportComplete, startLoading, stopLoading]);

  // ========================================================================
  // HANDLERS
  // ========================================================================

  const handleDownload = () => {
    if (generationResult?.document) {
      downloadRIPSJson(generationResult.document, {
        filePrefix: 'RIPS',
        prettyPrint: true,
        validateBeforeExport: false, // Already validated
      });
    }
  };

  const handlePreviewToggle = () => {
    setShowPreview(!showPreview);
  };

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="rips-export-panel">
      {/* Header */}
      <div className="panel-header glass">
        <div className="header-content">
          <FileJson className="header-icon" size={24} />
          <div>
            <h2>Exportar RIPS JSON</h2>
            <p>Genere archivos RIPS según Resolución 2275/2023</p>
          </div>
        </div>
      </div>

      <div className="panel-grid">
        {/* Configuration Card */}
        <div className="config-card glass">
          <h3>Configuración de Exportación</h3>

          {/* Date Range */}
          <div className="date-range-section">
            <label className="section-label">
              <Calendar size={16} />
              Período de Facturación
            </label>
            <div className="date-inputs">
              <div className="input-group">
                <label htmlFor="start-date">Desde</label>
                <input
                  id="start-date"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="date-input"
                />
              </div>
              <div className="input-group">
                <label htmlFor="end-date">Hasta</label>
                <input
                  id="end-date"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="date-input"
                />
              </div>
            </div>
          </div>

          {/* Provider Info */}
          <div className="provider-info">
            <h4>Información del Prestador</h4>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">NIT</span>
                <span className="info-value">{tenantNit}</span>
              </div>
              <div className="info-item">
                <span className="info-label">IPS</span>
                <span className="info-value">{tenantName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Modalidad</span>
                <span className="info-value">Domiciliaria</span>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            className="btn-primary btn-full"
            onClick={fetchDataAndGenerate}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Generando...
              </>
            ) : (
              <>
                <RefreshCw size={18} />
                Generar RIPS JSON
              </>
            )}
          </button>
        </div>

        {/* Results Card */}
        <div className="results-card glass">
          <h3>Resultado de Generación</h3>

          {/* Error State */}
          {(errorMessage || hasTimedOut) && !isLoading && (
            <div className="error-banner">
              <AlertCircle size={20} />
              <div>
                <strong>Error</strong>
                <p>{errorMessage || 'Tiempo de espera agotado'}</p>
              </div>
              {hasTimedOut && (
                <button onClick={retry} className="btn-retry">Reintentar</button>
              )}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="loading-state">
              <Loader2 className="animate-spin" size={40} />
              <p>Consultando datos y generando RIPS...</p>
            </div>
          )}

          {/* Empty State */}
          {!generationResult && !isLoading && !errorMessage && (
            <div className="empty-state">
              <FileJson size={48} />
              <p>Seleccione el período y haga clic en "Generar RIPS JSON"</p>
            </div>
          )}

          {/* Success State */}
          {generationResult && !isLoading && (
            <div className="generation-results">
              {/* Status Banner */}
              <div className={`status-banner ${generationResult.success ? 'success' : 'error'}`}>
                {generationResult.success ? (
                  <>
                    <CheckCircle size={20} />
                    <span>RIPS generado exitosamente</span>
                  </>
                ) : (
                  <>
                    <AlertCircle size={20} />
                    <span>Generación con errores</span>
                  </>
                )}
              </div>

              {/* Statistics */}
              <div className="stats-grid">
                <div className="stat-card">
                  <Users size={24} />
                  <div className="stat-content">
                    <span className="stat-value">{generationResult.stats.totalUsuarios}</span>
                    <span className="stat-label">Usuarios (US)</span>
                  </div>
                </div>
                <div className="stat-card">
                  <Stethoscope size={24} />
                  <div className="stat-content">
                    <span className="stat-value">{generationResult.stats.totalConsultas}</span>
                    <span className="stat-label">Consultas (AC)</span>
                  </div>
                </div>
                <div className="stat-card">
                  <ClipboardList size={24} />
                  <div className="stat-content">
                    <span className="stat-value">{generationResult.stats.totalProcedimientos}</span>
                    <span className="stat-label">Procedimientos (AP)</span>
                  </div>
                </div>
                <div className="stat-card highlight">
                  <div className="stat-content">
                    <span className="stat-value">
                      ${generationResult.stats.valorTotal.toLocaleString('es-CO')}
                    </span>
                    <span className="stat-label">Valor Total</span>
                  </div>
                </div>
              </div>

              {/* Validation Results */}
              {validationResult && (
                <div className="validation-section">
                  <h4>Validación Técnica</h4>
                  <div className="validation-badges">
                    <span className={`badge ${validationResult.isValid ? 'valid' : 'invalid'}`}>
                      {validationResult.isValid ? 'Válido' : 'Con errores'}
                    </span>
                    {validationResult.summary.totalErrors > 0 && (
                      <span className="badge error">
                        {validationResult.summary.totalErrors} errores
                      </span>
                    )}
                    {validationResult.summary.totalWarnings > 0 && (
                      <span className="badge warning">
                        {validationResult.summary.totalWarnings} advertencias
                      </span>
                    )}
                  </div>

                  {/* Error List */}
                  {validationResult.errors.length > 0 && (
                    <div className="error-list">
                      <h5>Errores ({validationResult.errors.length})</h5>
                      <ul>
                        {validationResult.errors.slice(0, 5).map((err, i) => (
                          <li key={i} className="error-item">
                            <code>{err.code}</code>
                            <span>{err.message}</span>
                          </li>
                        ))}
                        {validationResult.errors.length > 5 && (
                          <li className="more-errors">
                            ... y {validationResult.errors.length - 5} más
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="action-buttons">
                <button
                  className="btn-secondary"
                  onClick={handlePreviewToggle}
                  disabled={!generationResult.document}
                >
                  <Eye size={18} />
                  {showPreview ? 'Ocultar' : 'Vista Previa'}
                </button>
                <button
                  className="btn-primary"
                  onClick={handleDownload}
                  disabled={!generationResult.success || !generationResult.document}
                >
                  <Download size={18} />
                  Descargar JSON
                </button>
              </div>

              {/* JSON Preview */}
              {showPreview && generationResult.document && (
                <div className="json-preview">
                  <h4>Vista Previa del JSON</h4>
                  <pre>
                    {JSON.stringify(generationResult.document, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .rips-export-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .panel-header {
          padding: 1.5rem 2rem;
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-icon {
          color: var(--primary-600);
        }

        .header-content h2 {
          margin: 0;
          font-size: 1.25rem;
          color: var(--neutral-900);
        }

        .header-content p {
          margin: 4px 0 0;
          font-size: 0.875rem;
          color: var(--neutral-500);
        }

        .panel-grid {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 1.5rem;
        }

        @media (max-width: 1024px) {
          .panel-grid {
            grid-template-columns: 1fr;
          }
        }

        .config-card, .results-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .config-card h3, .results-card h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          color: var(--neutral-800);
        }

        .section-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--neutral-600);
          margin-bottom: 0.75rem;
        }

        .date-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .input-group label {
          font-size: 0.75rem;
          color: var(--neutral-500);
        }

        .date-input {
          padding: 0.625rem 0.75rem;
          border: 1px solid var(--neutral-200);
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .date-input:focus {
          outline: none;
          border-color: var(--primary-400);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .provider-info {
          background: var(--neutral-50);
          padding: 1rem;
          border-radius: var(--radius-md);
        }

        .provider-info h4 {
          margin: 0 0 0.75rem;
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--neutral-500);
          font-weight: 700;
        }

        .info-grid {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
        }

        .info-label {
          color: var(--neutral-500);
        }

        .info-value {
          font-weight: 600;
          color: var(--neutral-800);
        }

        .btn-full {
          width: 100%;
          justify-content: center;
          height: 3rem;
          gap: 0.5rem;
        }

        .btn-primary, .btn-secondary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-primary {
          background: var(--primary-600);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--primary-700);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: white;
          border: 1px solid var(--neutral-200);
          color: var(--neutral-700);
        }

        .btn-secondary:hover:not(:disabled) {
          background: var(--neutral-50);
        }

        .error-banner {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem;
          background: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: var(--radius-md);
          color: #991b1b;
        }

        .error-banner strong {
          display: block;
          margin-bottom: 0.25rem;
        }

        .error-banner p {
          margin: 0;
          font-size: 0.875rem;
        }

        .btn-retry {
          margin-left: auto;
          padding: 0.375rem 0.75rem;
          background: #991b1b;
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
        }

        .loading-state, .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
          color: var(--neutral-400);
          text-align: center;
        }

        .loading-state p, .empty-state p {
          margin-top: 1rem;
          font-size: 0.875rem;
        }

        .generation-results {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .status-banner {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: 0.875rem;
        }

        .status-banner.success {
          background: #dcfce7;
          color: #166534;
        }

        .status-banner.error {
          background: #fee2e2;
          color: #991b1b;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: var(--neutral-50);
          border-radius: var(--radius-md);
        }

        .stat-card svg {
          color: var(--primary-500);
        }

        .stat-card.highlight {
          background: var(--primary-50);
          border: 1px solid var(--primary-200);
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--neutral-900);
        }

        .stat-label {
          font-size: 0.75rem;
          color: var(--neutral-500);
        }

        .validation-section h4 {
          margin: 0 0 0.75rem;
          font-size: 0.875rem;
          color: var(--neutral-700);
        }

        .validation-badges {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.625rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .badge.valid {
          background: #dcfce7;
          color: #166534;
        }

        .badge.invalid {
          background: #fee2e2;
          color: #991b1b;
        }

        .badge.error {
          background: #fee2e2;
          color: #991b1b;
        }

        .badge.warning {
          background: #fef3c7;
          color: #92400e;
        }

        .error-list {
          margin-top: 1rem;
          padding: 1rem;
          background: #fff5f5;
          border-radius: var(--radius-md);
        }

        .error-list h5 {
          margin: 0 0 0.5rem;
          font-size: 0.75rem;
          color: #991b1b;
        }

        .error-list ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .error-item {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: #991b1b;
        }

        .error-item code {
          background: rgba(153, 27, 27, 0.1);
          padding: 0.125rem 0.375rem;
          border-radius: 4px;
          font-size: 0.7rem;
        }

        .more-errors {
          font-style: italic;
          color: #b91c1c;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .json-preview {
          margin-top: 1rem;
          border: 1px solid var(--neutral-200);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .json-preview h4 {
          margin: 0;
          padding: 0.75rem 1rem;
          background: var(--neutral-50);
          border-bottom: 1px solid var(--neutral-200);
          font-size: 0.75rem;
          text-transform: uppercase;
          color: var(--neutral-500);
        }

        .json-preview pre {
          margin: 0;
          padding: 1rem;
          max-height: 400px;
          overflow: auto;
          font-size: 0.75rem;
          line-height: 1.5;
          background: var(--neutral-900);
          color: var(--neutral-100);
        }

        .glass {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
          border-radius: var(--radius-xl);
        }

        .animate-spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RipsExportPanel;
