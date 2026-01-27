/**
 * Offline Assessment Service
 * 
 * Provides offline-capable clinical assessment operations:
 * - Record clinical scales (Glasgow, Pain, Braden, Morse)
 * - Auto-save with offline queue
 * - Query assessment history by patient
 * 
 * Assessments are CRITICAL data - nurse measurements are authoritative.
 * Conflict resolution always preserves local (nurse) data.
 * 
 * @see docs/OFFLINE_SYNC_SPEC.md - Section 4: Models Requiring Offline Support
 */

import type {
  OfflinePatientAssessment,
  CreateAssessmentInput,
  ServiceResult,
  ServiceOptions,
  PendingMutation,
  MutationResult,
} from './types';
import type {
  PatientAssessment,
  GlasgowScore,
  BradenScore,
  MorseScore,
  AssessmentAlert,
} from '../../types/clinical-scales';
import {
  enqueueMutation,
  registerExecutor,
} from './queueManager';

// ============================================================================
// CONSTANTS
// ============================================================================

/** Retention period for local assessments (14 days per spec) */
const ASSESSMENT_RETENTION_DAYS = 14;

// Alert thresholds
const PAIN_SEVERE_MIN = 7;
const PAIN_MODERATE_MIN = 4;

// ============================================================================
// ALERT THRESHOLDS
// ============================================================================

/**
 * Generate alerts based on assessment scores
 */
function generateAlerts(assessment: Partial<CreateAssessmentInput>): AssessmentAlert[] {
  const alerts: AssessmentAlert[] = [];
  
  // Glasgow Coma Scale alerts
  if (assessment.glasgowScore) {
    const total = assessment.glasgowScore.total;
    if (total <= 8) {
      alerts.push({
        scale: 'Glasgow',
        level: 'CRITICAL',
        message: `GCS ${total}: Lesión severa - Requiere atención inmediata`,
      });
    } else if (total <= 12) {
      alerts.push({
        scale: 'Glasgow',
        level: 'WARNING',
        message: `GCS ${total}: Lesión moderada - Monitorear de cerca`,
      });
    }
  }
  
  // Pain Scale alerts
  if (assessment.painScore !== undefined && assessment.painScore !== null) {
    const score = assessment.painScore;
    if (score >= 8) {
      alerts.push({
        scale: 'Dolor (EVA)',
        level: 'CRITICAL',
        message: `EVA ${score}/10: Dolor severo - Requiere intervención`,
      });
    } else if (score >= PAIN_MODERATE_MIN) {
      alerts.push({
        scale: 'Dolor (EVA)',
        level: 'WARNING',
        message: `EVA ${score}/10: Dolor moderado - Considerar analgesia`,
      });
    }
  }
  
  // Braden Scale alerts (lower = higher risk)
  if (assessment.bradenScore) {
    const total = 
      assessment.bradenScore.sensoryPerception +
      assessment.bradenScore.moisture +
      assessment.bradenScore.activity +
      assessment.bradenScore.mobility +
      assessment.bradenScore.nutrition +
      assessment.bradenScore.frictionShear;
    
    if (total <= 12) {
      alerts.push({
        scale: 'Braden',
        level: 'CRITICAL',
        message: `Braden ${total}: Riesgo MUY ALTO de úlceras por presión`,
      });
    } else if (total <= 14) {
      alerts.push({
        scale: 'Braden',
        level: 'WARNING',
        message: `Braden ${total}: Riesgo moderado de úlceras por presión`,
      });
    }
  }
  
  // Morse Fall Scale alerts
  if (assessment.morse) {
    const total =
      assessment.morse.historyOfFalling +
      assessment.morse.secondaryDiagnosis +
      assessment.morse.ambulatoryAid +
      assessment.morse.ivHeparinLock +
      assessment.morse.gait +
      assessment.morse.mentalStatus;
    
    if (total >= 45) {
      alerts.push({
        scale: 'Morse',
        level: 'CRITICAL',
        message: `Morse ${total}: Riesgo ALTO de caídas - Medidas de prevención requeridas`,
      });
    } else if (total >= 25) {
      alerts.push({
        scale: 'Morse',
        level: 'WARNING',
        message: `Morse ${total}: Riesgo bajo de caídas - Monitorear`,
      });
    }
  }
  
  return alerts;
}

// ============================================================================
// LOCAL CACHE
// ============================================================================

/** In-memory cache of assessments keyed by ID */
const assessmentCache = new Map<string, OfflinePatientAssessment>();

/** Index by patient ID for efficient queries */
const assessmentsByPatient = new Map<string, Set<string>>();

/** Listeners for assessment changes */
type AssessmentListener = (assessment: OfflinePatientAssessment) => void;
const assessmentListeners = new Map<string, Set<AssessmentListener>>();

/**
 * Generate an offline ID for new assessments
 */
function generateOfflineId(): string {
  return `offline-assessment-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Add assessment to patient index
 */
function indexByPatient(assessment: OfflinePatientAssessment): void {
  let patientAssessments = assessmentsByPatient.get(assessment.patientId);
  if (!patientAssessments) {
    patientAssessments = new Set();
    assessmentsByPatient.set(assessment.patientId, patientAssessments);
  }
  patientAssessments.add(assessment.id);
}

/**
 * Remove assessment from patient index
 */
function removeFromPatientIndex(assessment: OfflinePatientAssessment): void {
  const patientAssessments = assessmentsByPatient.get(assessment.patientId);
  if (patientAssessments) {
    patientAssessments.delete(assessment.id);
    if (patientAssessments.size === 0) {
      assessmentsByPatient.delete(assessment.patientId);
    }
  }
}

/**
 * Notify listeners of assessment change
 */
function notifyAssessmentChange(assessment: OfflinePatientAssessment): void {
  // Notify specific assessment listeners
  const listeners = assessmentListeners.get(assessment.id);
  if (listeners) {
    listeners.forEach(listener => listener(assessment));
  }
  
  // Notify patient-level listeners
  const patientListeners = assessmentListeners.get(`patient:${assessment.patientId}`);
  if (patientListeners) {
    patientListeners.forEach(listener => listener(assessment));
  }
  
  // Notify "all" listeners
  const allListeners = assessmentListeners.get('*');
  if (allListeners) {
    allListeners.forEach(listener => listener(assessment));
  }
}

/**
 * Subscribe to assessment changes for a patient
 */
export function subscribeToPatientAssessments(
  patientId: string,
  listener: AssessmentListener
): () => void {
  const key = `patient:${patientId}`;
  let listeners = assessmentListeners.get(key);
  if (!listeners) {
    listeners = new Set();
    assessmentListeners.set(key, listeners);
  }
  listeners.add(listener);
  
  return () => {
    listeners?.delete(listener);
    if (listeners?.size === 0) {
      assessmentListeners.delete(key);
    }
  };
}

/**
 * Subscribe to all assessment changes
 */
export function subscribeToAllAssessments(listener: AssessmentListener): () => void {
  let listeners = assessmentListeners.get('*');
  if (!listeners) {
    listeners = new Set();
    assessmentListeners.set('*', listeners);
  }
  listeners.add(listener);
  
  return () => {
    listeners?.delete(listener);
    if (listeners?.size === 0) {
      assessmentListeners.delete('*');
    }
  };
}

// ============================================================================
// ASSESSMENT OPERATIONS
// ============================================================================

/**
 * Create a clinical assessment
 * 
 * Offline behavior:
 * - Creates local record immediately
 * - Generates alerts based on scores
 * - Queues mutation for sync
 */
export async function createAssessment(
  input: CreateAssessmentInput,
  options: ServiceOptions = {}
): Promise<ServiceResult<OfflinePatientAssessment>> {
  const { skipOptimistic = false } = options;
  
  // Validate that at least one scale is provided
  if (!input.glasgow && input.painScale === undefined && !input.braden && !input.morse) {
    return {
      success: false,
      data: null,
      error: new Error('Al menos una escala de evaluación es requerida'),
      source: 'cache',
      pendingSync: false,
    };
  }
  
  // Validate Glasgow if provided
  if (input.glasgow) {
    const { eye, verbal, motor, total } = input.glasgow;
    const calculatedTotal = eye + verbal + motor;
    
    if (eye < 1 || eye > 4) {
      return {
        success: false,
        data: null,
        error: new Error('Glasgow: Apertura ocular inválida (1-4)'),
        source: 'cache',
        pendingSync: false,
      };
    }
    
    if (verbal < 1 || verbal > 5) {
      return {
        success: false,
        data: null,
        error: new Error('Glasgow: Respuesta verbal inválida (1-5)'),
        source: 'cache',
        pendingSync: false,
      };
    }
    
    if (motor < 1 || motor > 6) {
      return {
        success: false,
        data: null,
        error: new Error('Glasgow: Respuesta motora inválida (1-6)'),
        source: 'cache',
        pendingSync: false,
      };
    }
    
    if (total !== calculatedTotal) {
      // Auto-correct the total
      input.glasgow = { ...input.glasgow, total: calculatedTotal };
    }
  }
  
  // Validate Pain Scale if provided (0-10)
  if (input.painScale !== undefined && (input.painScale < 0 || input.painScale > 10)) {
    return {
      success: false,
      data: null,
      error: new Error('Escala de dolor: Puntaje inválido (0-10)'),
      source: 'cache',
      pendingSync: false,
    };
  }
  
  // Generate alerts
  const alerts = generateAlerts(input);
  
  // Create assessment record
  const now = new Date().toISOString();
  const assessmentId = generateOfflineId();
  
  // Map input fields to PatientAssessment property names
  const newAssessment: OfflinePatientAssessment = {
    id: assessmentId,
    tenantId: input.tenantId,
    patientId: input.patientId,
    nurseId: input.nurseId,
    visitId: input.visitId,
    assessedAt: now,
    glasgowScore: input.glasgow,
    painScore: input.painScale,
    bradenScore: input.braden,
    morseScore: input.morse,
    alerts,
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
    _syncStatus: 'pending',
    _localVersion: 1,
    _createdOffline: true,
  };
  
  // Apply optimistic update
  if (!skipOptimistic) {
    assessmentCache.set(assessmentId, newAssessment);
    indexByPatient(newAssessment);
    notifyAssessmentChange(newAssessment);
  }
  
  // Queue for sync
  const mutationId = enqueueMutation('PatientAssessment', 'create', {
    ...newAssessment,
    localId: assessmentId,
  });
  
  newAssessment._pendingMutationId = mutationId;
  assessmentCache.set(assessmentId, newAssessment);
  
  return {
    success: true,
    data: newAssessment,
    source: 'optimistic',
    pendingSync: true,
    mutationId,
  };
}

/**
 * Update existing assessment
 */
export async function updateAssessment(
  id: string,
  updates: Partial<Omit<CreateAssessmentInput, 'patientId' | 'nurseId' | 'tenantId'>>,
  options: ServiceOptions = {}
): Promise<ServiceResult<OfflinePatientAssessment>> {
  const { skipOptimistic = false } = options;
  
  const existingAssessment = assessmentCache.get(id);
  
  if (!existingAssessment) {
    return {
      success: false,
      data: null,
      error: new Error(`Assessment ${id} not found in local cache`),
      source: 'cache',
      pendingSync: false,
    };
  }
  
  // Generate new alerts based on updated scores
  // Map input field names (glasgow, painScale, braden, morse) to PatientAssessment field names
  const assessmentData: Partial<CreateAssessmentInput> = {
    glasgow: updates.glasgow ?? existingAssessment.glasgowScore ?? undefined,
    painScale: updates.painScale ?? existingAssessment.painScore ?? undefined,
    braden: updates.braden ?? existingAssessment.bradenScore ?? undefined,
    morse: updates.morse ?? existingAssessment.morseScore ?? undefined,
  };
  const alerts = generateAlerts(assessmentData);
  
  // Create updated record
  const now = new Date().toISOString();
  const updatedAssessment: OfflinePatientAssessment = {
    ...existingAssessment,
    glasgowScore: updates.glasgow ?? existingAssessment.glasgowScore,
    painScore: updates.painScale ?? existingAssessment.painScore,
    bradenScore: updates.braden ?? existingAssessment.bradenScore,
    morseScore: updates.morse ?? existingAssessment.morseScore,
    alerts,
    notes: updates.notes ?? existingAssessment.notes,
    updatedAt: now,
    _syncStatus: 'pending',
    _localVersion: (existingAssessment._localVersion || 0) + 1,
  };
  
  // Apply optimistic update
  if (!skipOptimistic) {
    assessmentCache.set(id, updatedAssessment);
    notifyAssessmentChange(updatedAssessment);
  }
  
  // Queue for sync
  const mutationId = enqueueMutation('PatientAssessment', 'update', {
    id,
    ...updates,
    alerts,
    _localVersion: updatedAssessment._localVersion,
  });
  
  updatedAssessment._pendingMutationId = mutationId;
  assessmentCache.set(id, updatedAssessment);
  
  return {
    success: true,
    data: updatedAssessment,
    source: 'optimistic',
    pendingSync: true,
    mutationId,
  };
}

/**
 * Get assessment by ID
 */
export function getAssessment(id: string): OfflinePatientAssessment | undefined {
  return assessmentCache.get(id);
}

/**
 * Get all assessments for a patient
 */
export function getAssessmentsByPatient(patientId: string): OfflinePatientAssessment[] {
  const assessmentIds = assessmentsByPatient.get(patientId);
  if (!assessmentIds) return [];
  
  return Array.from(assessmentIds)
    .map(id => assessmentCache.get(id))
    .filter((a): a is OfflinePatientAssessment => a !== undefined)
    .sort((a, b) => new Date(b.assessedAt).getTime() - new Date(a.assessedAt).getTime());
}

/**
 * Get recent assessments for a patient
 */
export function getRecentAssessments(
  patientId: string,
  count: number = 10
): OfflinePatientAssessment[] {
  return getAssessmentsByPatient(patientId).slice(0, count);
}

/**
 * Get latest assessment for a patient
 */
export function getLatestAssessment(patientId: string): OfflinePatientAssessment | undefined {
  const assessments = getAssessmentsByPatient(patientId);
  return assessments.length > 0 ? assessments[0] : undefined;
}

/**
 * Get assessments for a specific visit
 */
export function getAssessmentsByVisit(visitId: string): OfflinePatientAssessment[] {
  return Array.from(assessmentCache.values())
    .filter(a => a.visitId === visitId)
    .sort((a, b) => new Date(b.assessedAt).getTime() - new Date(a.assessedAt).getTime());
}

/**
 * Get pending (unsynced) assessments
 */
export function getPendingAssessments(): OfflinePatientAssessment[] {
  return Array.from(assessmentCache.values()).filter(a => a._syncStatus === 'pending');
}

/**
 * Get assessments with critical alerts
 */
export function getCriticalAssessments(): OfflinePatientAssessment[] {
  return Array.from(assessmentCache.values()).filter(a => 
    a.alerts?.some(alert => alert.level === 'CRITICAL')
  );
}

/**
 * Get assessments with any alerts
 */
export function getAssessmentsWithAlerts(): OfflinePatientAssessment[] {
  return Array.from(assessmentCache.values()).filter(a => 
    a.alerts && a.alerts.length > 0
  );
}

// ============================================================================
// NETWORK OPERATIONS (Stubs - integrate with actual Amplify client)
// ============================================================================

/**
 * Create assessment on network
 * TODO: Integrate with Amplify Gen 2 client
 */
async function createAssessmentOnNetwork(
  input: OfflinePatientAssessment
): Promise<PatientAssessment> {
  throw new Error('Network create not implemented - integrate with Amplify client');
}

/**
 * Update assessment on network
 * TODO: Integrate with Amplify Gen 2 client
 */
async function updateAssessmentOnNetwork(
  id: string,
  input: Partial<PatientAssessment>
): Promise<PatientAssessment> {
  throw new Error('Network update not implemented - integrate with Amplify client');
}

// ============================================================================
// MUTATION EXECUTOR
// ============================================================================

/**
 * Execute an assessment mutation (called by queue manager)
 */
async function executeAssessmentMutation(mutation: PendingMutation): Promise<MutationResult> {
  const { operation, data } = mutation;
  
  try {
    if (operation === 'create') {
      const input = data as OfflinePatientAssessment & { localId: string };
      const result = await createAssessmentOnNetwork(input);
      
      // Update local cache with server response
      const localId = input.localId;
      if (localId && assessmentCache.has(localId)) {
        const localAssessment = assessmentCache.get(localId)!;
        removeFromPatientIndex(localAssessment);
        assessmentCache.delete(localId);
        
        const syncedAssessment: OfflinePatientAssessment = {
          ...localAssessment,
          ...result,
          _syncStatus: 'synced',
          _pendingMutationId: undefined,
        };
        assessmentCache.set(result.id, syncedAssessment);
        indexByPatient(syncedAssessment);
        notifyAssessmentChange(syncedAssessment);
      }
      
      return { success: true, data: result, retryable: false };
    }
    
    if (operation === 'update') {
      const input = data as { id: string } & Partial<PatientAssessment>;
      const result = await updateAssessmentOnNetwork(input.id, input);
      
      // Update local cache
      const cachedAssessment = assessmentCache.get(input.id);
      if (cachedAssessment) {
        const syncedAssessment: OfflinePatientAssessment = {
          ...cachedAssessment,
          ...result,
          _syncStatus: 'synced',
          _pendingMutationId: undefined,
        };
        assessmentCache.set(input.id, syncedAssessment);
        notifyAssessmentChange(syncedAssessment);
      }
      
      return { success: true, data: result, retryable: false };
    }
    
    return {
      success: false,
      error: new Error(`Unknown operation: ${operation}`),
      retryable: false,
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    
    // Determine if retryable
    const isNetworkError = err.message.includes('Network') || 
                          err.message.includes('timeout') ||
                          err.message.includes('Failed to fetch');
    
    const isAuthError = err.message.includes('Unauthorized') ||
                       err.message.includes('Token');
    
    return {
      success: false,
      error: err,
      retryable: isNetworkError && !isAuthError,
    };
  }
}

// ============================================================================
// CACHE MANAGEMENT
// ============================================================================

/**
 * Clean up old assessments beyond retention period
 */
export function cleanupOldAssessments(): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - ASSESSMENT_RETENTION_DAYS);
  
  let removedCount = 0;
  
  for (const [id, assessment] of assessmentCache.entries()) {
    // Only cleanup synced records
    if (assessment._syncStatus !== 'synced') continue;
    
    const assessedDate = new Date(assessment.assessedAt);
    if (assessedDate < cutoffDate) {
      removeFromPatientIndex(assessment);
      assessmentCache.delete(id);
      removedCount++;
    }
  }
  
  if (removedCount > 0) {
    console.log(`🧹 Cleaned up ${removedCount} old assessment records`);
  }
  
  return removedCount;
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the assessment service
 */
export function initializeAssessmentService(): void {
  registerExecutor('PatientAssessment', executeAssessmentMutation);
  console.log('✅ Assessment service initialized');
}

/**
 * Clear assessment cache (call on logout)
 */
export function clearAssessmentCache(): void {
  assessmentCache.clear();
  assessmentsByPatient.clear();
  assessmentListeners.clear();
  console.log('🧹 Assessment cache cleared');
}

/**
 * Populate assessment cache from external data
 */
export function populateAssessmentCache(assessments: PatientAssessment[]): void {
  for (const a of assessments) {
    const offlineAssessment: OfflinePatientAssessment = {
      ...a,
      _syncStatus: 'synced',
      _localVersion: 1,
      _createdOffline: false,
    };
    assessmentCache.set(a.id, offlineAssessment);
    indexByPatient(offlineAssessment);
  }
  console.log(`📥 Populated assessment cache with ${assessments.length} records`);
}
