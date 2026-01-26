/**
 * AssessmentRIPSExport Component
 * 
 * Exports clinical assessments in RIPS-compatible format for Colombian healthcare compliance.
 * Integrates with billing records for complete documentation.
 */

import { useState } from 'react';
import { FileText, Download, CheckCircle, AlertTriangle, Loader } from 'lucide-react';
import { client } from '../amplify-utils';
import type { PatientAssessment } from '../types/clinical-scales';
import type { Patient, BillingRecord } from '../types';

interface AssessmentRIPSExportProps {
  patientId: string;
  billingRecordId?: string;
  onExport?: (data: RIPSAssessmentData) => void;
}

interface RIPSAssessmentData {
  // RIPS AC (Consultas) fields
  codigoPrestador: string;
  fechaConsulta: string;
  numeroAutorizacion: string;
  codigoConsulta: string;
  finalidadConsulta: string;
  causaExterna: string;
  codigoDiagnosticoPrincipal: string;
  tipoDocumento: string;
  numeroDocumento: string;
  
  // Clinical Assessment Summary
  valoracionClinica: {
    glasgow: number | null;
    dolor: number | null;
    braden: number | null;
    morse: number | null;
    news: number | null;
    barthel: number | null;
    norton: number | null;
    rass: number | null;
    alertas: string[];
    observaciones: string;
  };
  
  // Metadata
  fechaGeneracion: string;
  generadoPor: string;
}

export function AssessmentRIPSExport({ 
  patientId, 
  billingRecordId,
  onExport 
}: AssessmentRIPSExportProps) {
  const [loading, setLoading] = useState(false);
  const [exportData, setExportData] = useState<RIPSAssessmentData | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generateRIPSData() {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch patient, latest assessment, and billing record
      const [patientRes, assessmentsRes] = await Promise.all([
        client.models.Patient.get({ id: patientId }),
        client.models.PatientAssessment.list({ filter: { patientId: { eq: patientId } } })
      ]);

      const patient = patientRes.data as Patient | null;
      const assessments = assessmentsRes.data as PatientAssessment[];
      
      if (!patient) {
        throw new Error('Paciente no encontrado');
      }

      // Get latest assessment
      const sortedAssessments = [...assessments].sort((a, b) => 
        new Date(b.assessedAt).getTime() - new Date(a.assessedAt).getTime()
      );
      const latestAssessment = sortedAssessments[0];

      // Get billing record if provided
      let billing: BillingRecord | null = null;
      if (billingRecordId) {
        const billingRes = await client.models.BillingRecord.get({ id: billingRecordId });
        billing = billingRes.data as BillingRecord | null;
      }

      // Generate RIPS data
      const ripsData: RIPSAssessmentData = {
        codigoPrestador: 'IPS-VIDA-001', // TODO: Get from tenant config
        fechaConsulta: latestAssessment?.assessedAt?.split('T')[0] || new Date().toISOString().split('T')[0],
        numeroAutorizacion: billing?.invoiceNumber || 'PENDIENTE',
        codigoConsulta: '890201', // Consulta de control (CUPS code)
        finalidadConsulta: '10', // Control
        causaExterna: '13', // No aplica
        codigoDiagnosticoPrincipal: patient.diagnosis?.split(' - ')[0] || 'Z00.0',
        tipoDocumento: 'CC',
        numeroDocumento: patient.documentId || '',
        
        valoracionClinica: {
          glasgow: latestAssessment?.glasgowScore?.total ?? null,
          dolor: latestAssessment?.painScore ?? null,
          braden: latestAssessment?.bradenScore?.total ?? null,
          morse: latestAssessment?.morseScore?.total ?? null,
          news: latestAssessment?.newsScore?.total ?? null,
          barthel: latestAssessment?.barthelScore?.total ?? null,
          norton: latestAssessment?.nortonScore?.total ?? null,
          rass: latestAssessment?.rassScore ?? null,
          alertas: latestAssessment?.alerts?.map(a => a.message) || [],
          observaciones: latestAssessment?.notes || '',
        },
        
        fechaGeneracion: new Date().toISOString(),
        generadoPor: 'IPS-ERP Sistema',
      };

      setExportData(ripsData);
      onExport?.(ripsData);
    } catch (err) {
      console.error('Error generating RIPS data:', err);
      setError(err instanceof Error ? err.message : 'Error al generar datos RIPS');
    } finally {
      setLoading(false);
    }
  }

  function downloadAsJSON() {
    if (!exportData) return;
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RIPS_valoracion_${exportData.numeroDocumento}_${exportData.fechaConsulta}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadAsCSV() {
    if (!exportData) return;
    
    const vc = exportData.valoracionClinica;
    const rows = [
      ['Campo', 'Valor'],
      ['Código Prestador', exportData.codigoPrestador],
      ['Fecha Consulta', exportData.fechaConsulta],
      ['Número Autorización', exportData.numeroAutorizacion],
      ['Tipo Documento', exportData.tipoDocumento],
      ['Número Documento', exportData.numeroDocumento],
      ['Diagnóstico Principal', exportData.codigoDiagnosticoPrincipal],
      [''],
      ['ESCALAS CLÍNICAS', ''],
      ['Glasgow (GCS)', vc.glasgow?.toString() || 'N/A'],
      ['Dolor (EVA)', vc.dolor?.toString() || 'N/A'],
      ['Braden', vc.braden?.toString() || 'N/A'],
      ['Morse', vc.morse?.toString() || 'N/A'],
      ['NEWS', vc.news?.toString() || 'N/A'],
      ['Barthel', vc.barthel?.toString() || 'N/A'],
      ['Norton', vc.norton?.toString() || 'N/A'],
      ['RASS', vc.rass?.toString() || 'N/A'],
      [''],
      ['Alertas', vc.alertas.join('; ')],
      ['Observaciones', vc.observaciones],
    ];
    
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RIPS_valoracion_${exportData.numeroDocumento}_${exportData.fechaConsulta}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center gap-2">
          <FileText className="text-blue-600" size={20} />
          <h3 className="font-semibold text-gray-900">Exportar a RIPS</h3>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Genera archivo compatible con Resolución 2275/2023
        </p>
      </div>

      {/* Content */}
      <div className="p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {!exportData ? (
          <button
            onClick={generateRIPSData}
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="animate-spin" size={18} />
                Generando...
              </>
            ) : (
              <>
                <FileText size={18} />
                Generar Datos RIPS
              </>
            )}
          </button>
        ) : (
          <div className="space-y-4">
            {/* Success */}
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <CheckCircle className="text-green-500 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-sm font-medium text-green-800">Datos generados exitosamente</p>
                <p className="text-xs text-green-600 mt-1">
                  Paciente: {exportData.numeroDocumento} • Fecha: {exportData.fechaConsulta}
                </p>
              </div>
            </div>

            {/* Preview */}
            <div className="border rounded-lg overflow-hidden">
              <div className="p-3 bg-gray-50 border-b">
                <h4 className="text-sm font-medium text-gray-700">Vista Previa</h4>
              </div>
              <div className="p-3 text-sm space-y-2 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-500">Diagnóstico:</div>
                  <div className="font-medium">{exportData.codigoDiagnosticoPrincipal}</div>
                  
                  <div className="text-gray-500">Glasgow:</div>
                  <div className="font-medium">{exportData.valoracionClinica.glasgow ?? 'N/A'}/15</div>
                  
                  <div className="text-gray-500">Dolor:</div>
                  <div className="font-medium">{exportData.valoracionClinica.dolor ?? 'N/A'}/10</div>
                  
                  <div className="text-gray-500">Morse:</div>
                  <div className="font-medium">{exportData.valoracionClinica.morse ?? 'N/A'}/125</div>
                  
                  <div className="text-gray-500">Barthel:</div>
                  <div className="font-medium">{exportData.valoracionClinica.barthel ?? 'N/A'}/100</div>
                </div>
                
                {exportData.valoracionClinica.alertas.length > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <div className="text-gray-500 mb-1">Alertas:</div>
                    <ul className="text-xs text-orange-700 space-y-1">
                      {exportData.valoracionClinica.alertas.slice(0, 3).map((a, i) => (
                        <li key={i}>• {a}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Download Buttons */}
            <div className="flex gap-2">
              <button
                onClick={downloadAsJSON}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <Download size={16} />
                JSON
              </button>
              <button
                onClick={downloadAsCSV}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <Download size={16} />
                CSV
              </button>
            </div>

            {/* Reset */}
            <button
              onClick={() => setExportData(null)}
              className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Generar nuevo reporte
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AssessmentRIPSExport;
