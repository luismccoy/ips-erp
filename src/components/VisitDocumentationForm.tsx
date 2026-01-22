/**
 * VisitDocumentationForm Component
 * 
 * A comprehensive form for nurses to document clinical visits in the IPS ERP system.
 * This component integrates with the Visit Workflow Compliance system, allowing nurses
 * to create visit drafts, fill out KARDEX documentation, and submit for admin review.
 * 
 * Features:
 * - Fetches existing visit draft if exists
 * - Embeds KardexForm for clinical documentation
 * - Save functionality (maintains DRAFT status)
 * - Submit for review functionality (transitions to SUBMITTED)
 * - Loading states during fetch and mutations
 * - Success/error feedback messages
 * - Spanish language labels (Colombian IPS context)
 * - Tailwind CSS styling consistent with existing components
 * 
 * Requirements: 1.3, 2.5, 3.1, 3.2, 3.3, 9.5
 * 
 * @example
 * <VisitDocumentationForm
 *   shiftId="shift-123"
 *   patientId="patient-456"
 *   patientName="Juan Pérez"
 *   onClose={() => setShowForm(false)}
 *   onSubmitSuccess={() => refreshShiftList()}
 * />
 */

import React, { useState, useEffect, useCallback } from 'react';
import { isUsingRealBackend, client } from '../amplify-utils';
import { KardexForm } from './KardexForm';
import { createVisitDraft, submitVisit } from '../api/workflow-api';
import type {
  VisitDocumentationFormProps,
  KardexData,
  VitalsData,
  MedicationAdminData,
  TaskCompletionData,
  VisitStatus,
} from '../types/workflow';
import {
  validateKardex,
  validateVitals,
} from '../types/workflow';

// ============================================================================
// Default Values
// ============================================================================

const EMPTY_KARDEX: KardexData = {
  generalObservations: '',
  skinCondition: undefined,
  mobilityStatus: undefined,
  nutritionIntake: undefined,
  painLevel: undefined,
  mentalStatus: undefined,
  environmentalSafety: undefined,
  caregiverSupport: undefined,
  internalNotes: undefined,
};

const EMPTY_VITALS: VitalsData = {
  sys: 0,
  dia: 0,
  spo2: 0,
  hr: 0,
  temperature: undefined,
  weight: undefined,
};

// ============================================================================
// Icons
// ============================================================================

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SaveIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
);

const SendIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const SpinnerIcon = () => (
  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

// ============================================================================
// Mock Visit Data for Development
// ============================================================================

interface MockVisitStore {
  [shiftId: string]: {
    id: string;
    status: VisitStatus;
    kardex: KardexData;
    vitalsRecorded?: VitalsData;
    medicationsAdministered?: MedicationAdminData[];
    tasksCompleted?: TaskCompletionData[];
  };
}

// In-memory store for mock visits (persists during session)
const mockVisitStore: MockVisitStore = {};

// ============================================================================
// VisitDocumentationForm Component
// ============================================================================

export const VisitDocumentationForm: React.FC<VisitDocumentationFormProps> = ({
  shiftId,
  patientId: _patientId, // Reserved for future use with real backend
  patientName,
  onClose,
  onSubmitSuccess,
}) => {
  // ============================================================================
  // State
  // ============================================================================

  // Form data state
  const [kardex, setKardex] = useState<KardexData>(EMPTY_KARDEX);
  const [vitals, setVitals] = useState<VitalsData>(EMPTY_VITALS);
  const [medications, setMedications] = useState<MedicationAdminData[]>([]);
  const [tasks, setTasks] = useState<TaskCompletionData[]>([]);

  // Visit state
  const [_visitId, setVisitId] = useState<string | null>(null); // Track visit ID for future use
  const [visitStatus, setVisitStatus] = useState<VisitStatus>('DRAFT');
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Validation state
  const [vitalsErrors, setVitalsErrors] = useState<string[]>([]);
  const [_kardexErrors, setKardexErrors] = useState<string[]>([]); // Track for future validation display

  // ============================================================================
  // Fetch Existing Visit Draft
  // ============================================================================

  useEffect(() => {
    const fetchVisitDraft = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!isUsingRealBackend()) {
          // Mock mode: check if visit exists in mock store
          console.log('[Mock] Fetching visit draft for shift:', shiftId);
          await simulateNetworkDelay();

          const existingVisit = mockVisitStore[shiftId];
          if (existingVisit) {
            setVisitId(existingVisit.id);
            setVisitStatus(existingVisit.status);
            setKardex(existingVisit.kardex || EMPTY_KARDEX);
            setVitals(existingVisit.vitalsRecorded || EMPTY_VITALS);
            setMedications(existingVisit.medicationsAdministered || []);
            setTasks(existingVisit.tasksCompleted || []);
          } else {
            // Create new draft in mock store
            const newVisit = {
              id: shiftId,
              status: 'DRAFT' as VisitStatus,
              kardex: EMPTY_KARDEX,
              vitalsRecorded: EMPTY_VITALS,
              medicationsAdministered: [],
              tasksCompleted: [],
            };
            mockVisitStore[shiftId] = newVisit;
            setVisitId(shiftId);
            setVisitStatus('DRAFT');
          }
        } else {
          // Real backend: try to fetch existing visit
          // First, try to get existing visit by shiftId (Visit.id = shiftId)
          const response = await (client.models as any).Visit?.get({ id: shiftId });
          
          if (response?.data) {
            const visit = response.data;
            setVisitId(visit.id);
            setVisitStatus(visit.status || 'DRAFT');
            setRejectionReason(visit.rejectionReason || null);
            
            // Parse KARDEX data if it's a JSON string
            if (visit.kardex) {
              const kardexData = typeof visit.kardex === 'string' 
                ? JSON.parse(visit.kardex) 
                : visit.kardex;
              setKardex(kardexData);
            }
            
            // Parse vitals data
            if (visit.vitalsRecorded) {
              const vitalsData = typeof visit.vitalsRecorded === 'string'
                ? JSON.parse(visit.vitalsRecorded)
                : visit.vitalsRecorded;
              setVitals(vitalsData);
            }
            
            // Parse medications
            if (visit.medicationsAdministered) {
              const medsData = typeof visit.medicationsAdministered === 'string'
                ? JSON.parse(visit.medicationsAdministered)
                : visit.medicationsAdministered;
              setMedications(medsData || []);
            }
            
            // Parse tasks
            if (visit.tasksCompleted) {
              const tasksData = typeof visit.tasksCompleted === 'string'
                ? JSON.parse(visit.tasksCompleted)
                : visit.tasksCompleted;
              setTasks(tasksData || []);
            }
          } else {
            // No existing visit, create a draft
            const createResult = await createVisitDraft(shiftId);
            if (createResult.success) {
              setVisitId(createResult.data || shiftId);
              setVisitStatus('DRAFT');
            } else {
              setError(createResult.error || 'Error al crear el borrador de visita');
            }
          }
        }
      } catch (err) {
        console.error('Error fetching visit draft:', err);
        setError('Error al cargar la documentación de la visita. Por favor intente de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisitDraft();
  }, [shiftId]);

  // ============================================================================
  // Save Functionality (Maintains DRAFT status)
  // ============================================================================

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (!isUsingRealBackend()) {
        // Mock mode: save to mock store
        console.log('[Mock] Saving visit draft for shift:', shiftId);
        await simulateNetworkDelay();

        mockVisitStore[shiftId] = {
          id: shiftId,
          status: 'DRAFT',
          kardex,
          vitalsRecorded: vitals,
          medicationsAdministered: medications,
          tasksCompleted: tasks,
        };

        setSuccessMessage('Documentación guardada exitosamente');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        // Real backend: update visit record
        const updateData = {
          id: shiftId,
          kardex: JSON.stringify(kardex),
          vitalsRecorded: JSON.stringify(vitals),
          medicationsAdministered: JSON.stringify(medications),
          tasksCompleted: JSON.stringify(tasks),
          // Status remains DRAFT on save
        };

        const response = await (client.models as any).Visit?.update(updateData);
        
        if (response?.data) {
          setSuccessMessage('Documentación guardada exitosamente');
          setTimeout(() => setSuccessMessage(null), 3000);
        } else {
          throw new Error('No se pudo guardar la documentación');
        }
      }
    } catch (err) {
      console.error('Error saving visit:', err);
      setError('Error al guardar la documentación. Por favor intente de nuevo.');
    } finally {
      setIsSaving(false);
    }
  }, [shiftId, kardex, vitals, medications, tasks]);

  // ============================================================================
  // Submit for Review Functionality
  // ============================================================================

  const validateForm = useCallback((): boolean => {
    // Validate KARDEX
    const kardexValidationErrors = validateKardex(kardex);
    setKardexErrors(kardexValidationErrors);

    // Validate vitals
    const vitalsValidationErrors = validateVitals(vitals);
    setVitalsErrors(vitalsValidationErrors);

    return kardexValidationErrors.length === 0 && vitalsValidationErrors.length === 0;
  }, [kardex, vitals]);

  const handleSubmitForReview = useCallback(async () => {
    // Validate form before submission
    if (!validateForm()) {
      setError('Por favor complete todos los campos requeridos antes de enviar.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // First save the current data
      if (!isUsingRealBackend()) {
        // Mock mode: save and update status
        console.log('[Mock] Submitting visit for review:', shiftId);
        await simulateNetworkDelay();

        mockVisitStore[shiftId] = {
          id: shiftId,
          status: 'SUBMITTED',
          kardex,
          vitalsRecorded: vitals,
          medicationsAdministered: medications,
          tasksCompleted: tasks,
        };
      } else {
        // Real backend: save data first
        const updateData = {
          id: shiftId,
          kardex: JSON.stringify(kardex),
          vitalsRecorded: JSON.stringify(vitals),
          medicationsAdministered: JSON.stringify(medications),
          tasksCompleted: JSON.stringify(tasks),
        };

        await (client.models as any).Visit?.update(updateData);
      }

      // Then submit for review
      const result = await submitVisit(shiftId);

      if (result.success) {
        setSuccessMessage('¡Visita enviada para revisión exitosamente!');
        setVisitStatus('SUBMITTED');
        
        // Wait a moment to show success message, then navigate back
        setTimeout(() => {
          onSubmitSuccess();
        }, 1500);
      } else {
        setError(result.error || 'Error al enviar la visita para revisión');
      }
    } catch (err) {
      console.error('Error submitting visit:', err);
      setError('Error al enviar la visita para revisión. Por favor intente de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  }, [shiftId, kardex, vitals, medications, tasks, validateForm, onSubmitSuccess]);

  // ============================================================================
  // Check if form is complete for submission
  // ============================================================================

  const isFormComplete = useCallback((): boolean => {
    // Check required KARDEX fields
    if (!kardex.generalObservations || kardex.generalObservations.trim() === '') {
      return false;
    }

    // Check required vitals
    if (!vitals.sys || vitals.sys <= 0) return false;
    if (!vitals.dia || vitals.dia <= 0) return false;
    if (!vitals.spo2 || vitals.spo2 <= 0 || vitals.spo2 > 100) return false;
    if (!vitals.hr || vitals.hr <= 0) return false;

    return true;
  }, [kardex, vitals]);

  // ============================================================================
  // Render Loading State
  // ============================================================================

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <SpinnerIcon />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Cargando Documentación
            </h3>
            <p className="text-sm text-slate-500 text-center">
              Preparando el formulario de documentación clínica...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Render Form
  // ============================================================================

  const isReadOnly = visitStatus === 'SUBMITTED' || visitStatus === 'APPROVED';

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto py-8">
      <div className="bg-slate-100 rounded-2xl shadow-2xl max-w-5xl w-full mx-4 my-auto">
        {/* ================================================================== */}
        {/* Header */}
        {/* ================================================================== */}
        <div className="bg-white rounded-t-2xl border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-indigo-600"><DocumentIcon /></span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Documentación de Visita
                </h2>
                <p className="text-sm text-slate-500">
                  Paciente: <span className="font-medium text-slate-700">{patientName}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Status Badge */}
              <StatusBadge status={visitStatus} />
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Cerrar"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* Rejection Reason Banner */}
          {visitStatus === 'REJECTED' && rejectionReason && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <span className="text-red-500 mt-0.5"><AlertIcon /></span>
              <div>
                <p className="text-sm font-medium text-red-800">Visita Rechazada</p>
                <p className="text-sm text-red-700 mt-1">{rejectionReason}</p>
                <p className="text-xs text-red-600 mt-2">
                  Por favor corrija la documentación y envíe nuevamente para revisión.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ================================================================== */}
        {/* Messages */}
        {/* ================================================================== */}
        {(error || successMessage) && (
          <div className="px-6 pt-4">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <span className="text-red-500"><AlertIcon /></span>
                <div>
                  <p className="text-sm font-medium text-red-800">Error</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}
            {successMessage && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                <span className="text-green-500"><CheckIcon /></span>
                <div>
                  <p className="text-sm font-medium text-green-800">Éxito</p>
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================== */}
        {/* Form Content */}
        {/* ================================================================== */}
        <div className="p-6">
          <KardexForm
            kardex={kardex}
            vitals={vitals}
            medications={medications}
            tasks={tasks}
            onKardexChange={setKardex}
            onVitalsChange={setVitals}
            onMedicationsChange={setMedications}
            onTasksChange={setTasks}
            disabled={isReadOnly}
            vitalsErrors={vitalsErrors}
          />
        </div>

        {/* ================================================================== */}
        {/* Footer Actions */}
        {/* ================================================================== */}
        <div className="bg-white rounded-b-2xl border-t border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left side - Backend indicator */}
            <div className="text-xs text-slate-400">
              {isUsingRealBackend() ? '🟢 Conectado al Backend' : '🟡 Modo de Desarrollo'}
            </div>

            {/* Right side - Action buttons */}
            <div className="flex items-center gap-3">
              {/* Cancel Button */}
              <button
                onClick={onClose}
                disabled={isSaving || isSubmitting}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>

              {/* Save Button (only for editable visits) */}
              {!isReadOnly && (
                <button
                  onClick={handleSave}
                  disabled={isSaving || isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <SpinnerIcon />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <SaveIcon />
                      Guardar Borrador
                    </>
                  )}
                </button>
              )}

              {/* Submit Button (only for editable visits) */}
              {!isReadOnly && (
                <button
                  onClick={handleSubmitForReview}
                  disabled={isSaving || isSubmitting || !isFormComplete()}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isFormComplete()
                      ? 'text-white bg-indigo-600 hover:bg-indigo-700'
                      : 'text-slate-400 bg-slate-200 cursor-not-allowed'
                  }`}
                  title={!isFormComplete() ? 'Complete todos los campos requeridos' : 'Enviar para revisión'}
                >
                  {isSubmitting ? (
                    <>
                      <SpinnerIcon />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <SendIcon />
                      Enviar para Revisión
                    </>
                  )}
                </button>
              )}

              {/* Read-only message for submitted/approved visits */}
              {isReadOnly && (
                <div className="text-sm text-slate-500 italic">
                  {visitStatus === 'SUBMITTED' 
                    ? 'Esta visita está pendiente de aprobación'
                    : 'Esta visita ha sido aprobada y no puede ser modificada'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Status Badge Component
// ============================================================================

interface StatusBadgeProps {
  status: VisitStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = {
    DRAFT: {
      label: 'Borrador',
      bgColor: 'bg-slate-100',
      textColor: 'text-slate-700',
      dotColor: 'bg-slate-400',
    },
    SUBMITTED: {
      label: 'Pendiente de Aprobación',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      dotColor: 'bg-yellow-500',
    },
    REJECTED: {
      label: 'Rechazada',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      dotColor: 'bg-red-500',
    },
    APPROVED: {
      label: 'Aprobada',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      dotColor: 'bg-green-500',
    },
  };

  const { label, bgColor, textColor, dotColor } = config[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      {label}
    </span>
  );
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Simulates network delay for mock mode.
 */
async function simulateNetworkDelay(minMs: number = 300, maxMs: number = 600): Promise<void> {
  const delay = Math.random() * (maxMs - minMs) + minMs;
  await new Promise(resolve => setTimeout(resolve, delay));
}

export default VisitDocumentationForm;
