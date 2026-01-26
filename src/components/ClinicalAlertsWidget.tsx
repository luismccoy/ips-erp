/**
 * ClinicalAlertsWidget Component
 * 
 * Dashboard widget showing patients with critical/warning clinical alerts.
 * Designed for Admin Dashboard integration.
 */

import { useState, useEffect } from 'react';
import { AlertTriangle, ChevronRight, RefreshCw, User } from 'lucide-react';
import { client } from '../amplify-utils';
import type { PatientAssessment, AssessmentAlert, AlertLevel } from '../types/clinical-scales';
import type { Patient } from '../types';

interface PatientWithAlerts {
  patient: Patient;
  assessment: PatientAssessment;
  criticalCount: number;
  warningCount: number;
}

interface ClinicalAlertsWidgetProps {
  onPatientClick?: (patientId: string) => void;
  maxItems?: number;
}

export function ClinicalAlertsWidget({ 
  onPatientClick, 
  maxItems = 5 
}: ClinicalAlertsWidgetProps) {
  const [patientsWithAlerts, setPatientsWithAlerts] = useState<PatientWithAlerts[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  async function loadAlerts() {
    try {
      // Load all assessments and patients
      const [assessmentsRes, patientsRes] = await Promise.all([
        client.models.PatientAssessment.list({}),
        client.models.Patient.list({})
      ]);

      const patients = patientsRes.data;
      const assessments = assessmentsRes.data;

      // Group by patient, keeping only most recent assessment per patient
      const latestByPatient = new Map<string, PatientAssessment>();
      
      assessments.forEach(assessment => {
        const existing = latestByPatient.get(assessment.patientId);
        if (!existing || new Date(assessment.assessedAt) > new Date(existing.assessedAt)) {
          latestByPatient.set(assessment.patientId, assessment);
        }
      });

      // Filter patients with alerts and count severity
      const withAlerts: PatientWithAlerts[] = [];
      
      latestByPatient.forEach((assessment, patientId) => {
        const alerts = assessment.alerts || [];
        const criticalCount = alerts.filter(a => a.level === 'CRITICAL').length;
        const warningCount = alerts.filter(a => a.level === 'WARNING').length;
        
        if (criticalCount > 0 || warningCount > 0) {
          const patient = patients.find(p => p.id === patientId);
          if (patient) {
            withAlerts.push({
              patient,
              assessment,
              criticalCount,
              warningCount
            });
          }
        }
      });

      // Sort by critical count desc, then warning count desc
      withAlerts.sort((a, b) => {
        if (b.criticalCount !== a.criticalCount) {
          return b.criticalCount - a.criticalCount;
        }
        return b.warningCount - a.warningCount;
      });

      setPatientsWithAlerts(withAlerts.slice(0, maxItems));
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function handleRefresh() {
    setRefreshing(true);
    loadAlerts();
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      </div>
    );
  }

  const totalCritical = patientsWithAlerts.reduce((sum, p) => sum + p.criticalCount, 0);
  const totalWarning = patientsWithAlerts.reduce((sum, p) => sum + p.warningCount, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-gradient-to-r from-red-50 to-yellow-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={20} />
            <h3 className="font-semibold text-gray-900">Alertas Clínicas</h3>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
        {(totalCritical > 0 || totalWarning > 0) && (
          <div className="flex items-center gap-3 mt-2 text-sm">
            {totalCritical > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-red-100 text-red-800">
                🔴 {totalCritical} Críticas
              </span>
            )}
            {totalWarning > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                🟡 {totalWarning} Advertencias
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      {patientsWithAlerts.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <div className="mx-auto h-12 w-12 text-green-400 mb-2">✓</div>
          <p className="text-sm">Sin alertas clínicas activas</p>
          <p className="text-xs text-gray-400 mt-1">Todos los pacientes en rangos normales</p>
        </div>
      ) : (
        <div className="divide-y">
          {patientsWithAlerts.map(({ patient, assessment, criticalCount, warningCount }) => (
            <div
              key={patient.id}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onPatientClick?.(patient.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    criticalCount > 0 ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    <User size={16} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{patient.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {patient.diagnosis?.split(' - ')[1] || patient.diagnosis || 'Sin diagnóstico'}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {assessment.alerts?.slice(0, 2).map((alert, i) => (
                        <span
                          key={i}
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs ${
                            alert.level === 'CRITICAL'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-yellow-50 text-yellow-700'
                          }`}
                        >
                          {alert.scale}
                        </span>
                      ))}
                      {(assessment.alerts?.length || 0) > 2 && (
                        <span className="text-xs text-gray-400">
                          +{(assessment.alerts?.length || 0) - 2} más
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-gray-400 mt-1" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      {patientsWithAlerts.length > 0 && (
        <div className="px-4 py-2 bg-gray-50 border-t">
          <button
            onClick={() => onPatientClick?.('all')}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Ver todas las valoraciones →
          </button>
        </div>
      )}
    </div>
  );
}

export default ClinicalAlertsWidget;
