// Update the imports at the top
import React, { useState, useEffect, useCallback } from 'react';
import { generateClient } from 'aws-amplify/data';
import { isUsingRealBackend, client, getUserId, getTenantId } from '../amplify-utils';
import { KardexForm } from './KardexForm';
import { AssessmentForm } from './clinical/AssessmentForm';
import { createVisitDraft, submitVisit, simulateNetworkDelay } from '../api/workflow-api';
import type {
  VisitDocumentationFormProps,
  KardexData,
  VitalsData,
  MedicationAdminData,
  TaskCompletionData,
  VisitStatus,
  PatientAssessment,
} from '../types/workflow';
import {
  EMPTY_KARDEX,
  EMPTY_VITALS,
  validateKardex,
  validateVitals,
} from '../types/workflow';

// ... [Keep all the existing imports, icons, and mock store code] ...

export const VisitDocumentationForm: React.FC<VisitDocumentationFormProps> = ({
  shiftId,
  patientId,
  patientName,
  onClose,
  onSubmitSuccess,
}) => {
  // ============================================================================
  // State
  // ============================================================================

  // Form data state (existing)
  const [kardex, setKardex] = useState<KardexData>(EMPTY_KARDEX);
  const [vitals, setVitals] = useState<VitalsData>(EMPTY_VITALS);
  const [medications, setMedications] = useState<MedicationAdminData[]>([]);
  const [tasks, setTasks] = useState<TaskCompletionData[]>([]);

  // NEW: Clinical Assessment state
  const [visitAssessment, setVisitAssessment] = useState<Partial<PatientAssessment> | null>(null);
  
  // SENTINEL FIX #2: Track initial state for unsaved changes detection
  const [initialKardex, setInitialKardex] = useState<KardexData>(EMPTY_KARDEX);
  const [initialVitals, setInitialVitals] = useState<VitalsData>(EMPTY_VITALS);
  const [initialMedications, setInitialMedications] = useState<MedicationAdminData[]>([]);
  const [initialTasks, setInitialTasks] = useState<TaskCompletionData[]>([]);
  const [initialAssessment, setInitialAssessment] = useState<Partial<PatientAssessment> | null>(null);

  // Visit state (existing)
  const [_visitId, setVisitId] = useState<string | null>(null);
  const [visitStatus, setVisitStatus] = useState<VisitStatus>('DRAFT');
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  // NEW: Active section state
  const [activeSection, setActiveSection] = useState<'kardex' | 'scales'>('kardex');

  // UI state (existing)
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Validation state (existing)
  const [vitalsErrors, setVitalsErrors] = useState<string[]>([]);
  const [_kardexErrors, setKardexErrors] = useState<string[]>([]);

  // ============================================================================
  // Fetch Existing Visit Draft (Updated to include assessment)
  // ============================================================================

  useEffect(() => {
    const fetchVisitDraft = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!isUsingRealBackend()) {
          console.log('[Mock] Fetching visit draft for shift:', shiftId);
          await simulateNetworkDelay();

          const existingVisit = mockVisitStore[shiftId];
          if (existingVisit) {
            setVisitId(existingVisit.id);
            setVisitStatus(existingVisit.status);
            const loadedKardex = existingVisit.kardex || EMPTY_KARDEX;
            const loadedVitals = existingVisit.vitalsRecorded || EMPTY_VITALS;
            const loadedMeds = existingVisit.medicationsAdministered || [];
            const loadedTasks = existingVisit.tasksCompleted || [];
            const loadedAssessment = existingVisit.assessment || null;
            
            setKardex(loadedKardex);
            setVitals(loadedVitals);
            setMedications(loadedMeds);
            setTasks(loadedTasks);
            setVisitAssessment(loadedAssessment);
            
            // Save initial state
            setInitialKardex(loadedKardex);
            setInitialVitals(loadedVitals);
            setInitialMedications(loadedMeds);
            setInitialTasks(loadedTasks);
            setInitialAssessment(loadedAssessment);
          } else {
            // Create new draft in mock store
            const newVisit = {
              id: shiftId,
              status: 'DRAFT' as VisitStatus,
              kardex: EMPTY_KARDEX,
              vitalsRecorded: EMPTY_VITALS,
              medicationsAdministered: [],
              tasksCompleted: [],
              assessment: null,
            };
            mockVisitStore[shiftId] = newVisit;
            setVisitId(shiftId);
            setVisitStatus('DRAFT');
          }
        } else {
          // Real backend: try to fetch existing visit and assessment
          const response = await (client.models as any).Visit?.get({ id: shiftId });
          
          if (response?.data) {
            const visit = response.data;
            setVisitId(visit.id);
            setVisitStatus(visit.status || 'DRAFT');
            setRejectionReason(visit.rejectionReason || null);
            
            // Parse KARDEX data
            let loadedKardex = EMPTY_KARDEX;
            if (visit.kardex) {
              loadedKardex = typeof visit.kardex === 'string' 
                ? JSON.parse(visit.kardex) 
                : visit.kardex;
              setKardex(loadedKardex);
            }
            
            // Parse vitals data
            let loadedVitals = EMPTY_VITALS;
            if (visit.vitalsRecorded) {
              loadedVitals = typeof visit.vitalsRecorded === 'string'
                ? JSON.parse(visit.vitalsRecorded)
                : visit.vitalsRecorded;
              setVitals(loadedVitals);
            }
            
            // Parse medications
            let loadedMeds: MedicationAdminData[] = [];
            if (visit.medicationsAdministered) {
              loadedMeds = typeof visit.medicationsAdministered === 'string'
                ? JSON.parse(visit.medicationsAdministered)
                : visit.medicationsAdministered;
              setMedications(loadedMeds || []);
            }
            
            // Parse tasks
            let loadedTasks: TaskCompletionData[] = [];
            if (visit.tasksCompleted) {
              loadedTasks = typeof visit.tasksCompleted === 'string'
                ? JSON.parse(visit.tasksCompleted)
                : visit.tasksCompleted;
              setTasks(loadedTasks || []);
            }

            // NEW: Fetch linked assessment
            if (visit.assessment?.id) {
              const assessmentResponse = await client.models.PatientAssessment.get({
                id: visit.assessment.id
              });
              if (assessmentResponse?.data) {
                setVisitAssessment(assessmentResponse.data);
                setInitialAssessment(assessmentResponse.data);
              }
            }
            
            // Save initial state
            setInitialKardex(loadedKardex);
            setInitialVitals(loadedVitals);
            setInitialMedications(loadedMeds || []);
            setInitialTasks(loadedTasks || []);
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
  // Unsaved Changes Detection (Updated)
  // ============================================================================

  const hasUnsavedChanges = useCallback((): boolean => {
    const kardexChanged = JSON.stringify(kardex) !== JSON.stringify(initialKardex);
    const vitalsChanged = JSON.stringify(vitals) !== JSON.stringify(initialVitals);
    const medsChanged = JSON.stringify(medications) !== JSON.stringify(initialMedications);
    const tasksChanged = JSON.stringify(tasks) !== JSON.stringify(initialTasks);
    const assessmentChanged = JSON.stringify(visitAssessment) !== JSON.stringify(initialAssessment);

    return kardexChanged || vitalsChanged || medsChanged || tasksChanged || assessmentChanged;
  }, [kardex, vitals, medications, tasks, visitAssessment, initialKardex, initialVitals, initialMedications, initialTasks, initialAssessment]);

  // ============================================================================
  // Save Functionality (Updated to include assessment)
  // ============================================================================

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (!isUsingRealBackend()) {
        console.log('[Mock] Saving visit draft for shift:', shiftId);
        await simulateNetworkDelay();

        mockVisitStore[shiftId] = {
          id: shiftId,
          status: 'DRAFT',
          kardex,
          vitalsRecorded: vitals,
          medicationsAdministered: medications,
          tasksCompleted: tasks,
          assessment: visitAssessment,
        };

        // Update initial state
        setInitialKardex(kardex);
        setInitialVitals(vitals);
        setInitialMedications(medications);
        setInitialTasks(tasks);
        setInitialAssessment(visitAssessment);

        setSuccessMessage('Documentación guardada exitosamente');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        // Real backend: update visit record and create/update assessment
        const updateData = {
          id: shiftId,
          kardex: JSON.stringify(kardex),
          vitalsRecorded: JSON.stringify(vitals),
          medicationsAdministered: JSON.stringify(medications),
          tasksCompleted: JSON.stringify(tasks),
        };

        // Save visit data
        const visitResponse = await (client.models as any).Visit?.update(updateData);

        // Save assessment if it exists
        if (visitAssessment) {
          const assessmentData = {
            ...visitAssessment,
            visitId: shiftId,
            updatedAt: new Date().toISOString(),
          };

          if (visitAssessment.id) {
            // Update existing assessment
            await client.models.PatientAssessment.update(assessmentData);
          } else {
            // Create new assessment
            await client.models.PatientAssessment.create(assessmentData);
          }
        }

        // Update initial state after successful save
        setInitialKardex(kardex);
        setInitialVitals(vitals);
        setInitialMedications(medications);
        setInitialTasks(tasks);
        setInitialAssessment(visitAssessment);

        setSuccessMessage('Documentación guardada exitosamente');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error('Error saving visit:', err);
      setError('Error al guardar la documentación. Por favor intente de nuevo.');
    } finally {
      setIsSaving(false);
    }
  }, [shiftId, kardex, vitals, medications, tasks, visitAssessment]);

  // ============================================================================
  // Form Validation (Updated to require Morse scale)
  // ============================================================================

  const validateForm = useCallback((): boolean => {
    // Validate KARDEX
    const kardexValidationErrors = validateKardex(kardex);
    setKardexErrors(kardexValidationErrors);

    // Validate vitals
    const vitalsValidationErrors = validateVitals(vitals);
    setVitalsErrors(vitalsValidationErrors);

    // Validate Morse Fall Risk (required by Resolución 3100)
    if (!visitAssessment?.morseScore?.total) {
      setError('La escala de Morse (riesgo de caídas) es obligatoria según Resolución 3100');
      return false;
    }

    return kardexValidationErrors.length === 0 && vitalsValidationErrors.length === 0;
  }, [kardex, vitals, visitAssessment]);

  // ============================================================================
  // Form Completion Check (Updated)
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

    // Check Morse Fall Risk (required by Resolución 3100)
    if (!visitAssessment?.morseScore?.total) {
      return false;
    }

    return true;
  }, [kardex, vitals, visitAssessment]);

  // ============================================================================
  // Assessment Submit Handler
  // ============================================================================

  const handleAssessmentSubmit = async (assessment: Partial<PatientAssessment>) => {
    setVisitAssessment(assessment);
    
    // Auto-save when assessment is updated
    await handleSave();
  };

  // ============================================================================
  // Render Loading State (Keep existing code)
  // ============================================================================

  if (isLoading) {
    // ... [Keep existing loading state JSX] ...
  }

  // ============================================================================
  // Render Form (Updated with tabs)
  // ============================================================================

  const isReadOnly = visitStatus === 'SUBMITTED' || visitStatus === 'APPROVED';

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto py-8">
      <div className="bg-slate-100 rounded-2xl shadow-2xl max-w-5xl w-full mx-4 my-auto">
        {/* Header */}
        {/* ... [Keep existing header JSX] ... */}

        {/* Messages */}
        {/* ... [Keep existing messages JSX] ... */}

        {/* Form Content with Tabs */}
        <div className="p-6">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8" aria-label="Sections">
              <button
                onClick={() => setActiveSection('kardex')}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeSection === 'kardex'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                KARDEX
              </button>
              <button
                onClick={() => setActiveSection('scales')}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeSection === 'scales'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                Escalas Clínicas
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeSection === 'kardex' ? (
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
          ) : (
            <AssessmentForm
              patientId={patientId}
              nurseId={getUserId()}
              tenantId={getTenantId()}
              existingAssessment={visitAssessment}
              onSubmit={handleAssessmentSubmit}
              disabled={isReadOnly}
            />
          )}
        </div>

        {/* Footer Actions */}
        {/* ... [Keep existing footer JSX] ... */}
      </div>
    </div>
  );
};

// ... [Keep existing utility functions and exports] ...