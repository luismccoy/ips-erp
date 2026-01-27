/**
 * Offline Vitals Service
 * 
 * Provides offline-capable vital signs recording:
 * - Record vitals during patient visits
 * - Auto-save with offline queue
 * - Query vitals history by patient
 * 
 * Vitals are CRITICAL data - nurse measurements are authoritative.
 * Conflict resolution always preserves local (nurse) data.
 * 
 * @see docs/OFFLINE_SYNC_SPEC.md - Section 4.2: VitalSigns Model
 */

import type {
  OfflineVitalSigns,
  VitalSigns,
  RecordVitalsInput,
  ServiceResult,
  ServiceOptions,
  PendingMutation,
  MutationResult,
} from './types';
import type { VitalsData } from '../../types/workflow';
import {
  enqueueMutation,
  dequeueMutation,
  registerExecutor,
} from './queueManager';

// ============================================================================
// CONSTANTS
// ============================================================================

/** Retention period for local vitals (30 days per spec) */
const VITALS_RETENTION_DAYS = 30;

// ============================================================================
// LOCAL CACHE
// ============================================================================

/** In-memory cache of vitals keyed by ID */
const vitalsCache = new Map<string, OfflineVitalSigns>();

/** Index by patient ID for efficient queries */
const vitalsByPatient = new Map<string, Set<string>>();

/** Listeners for vitals changes */
type VitalsListener = (vitals: OfflineVitalSigns) => void;
const vitalsListeners = new Map<string, Set<VitalsListener>>();

/**
 * Generate an offline ID for new vitals
 */
function generateOfflineId(): string {
  return `offline-vitals-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Add vitals to patient index
 */
function indexByPatient(vitals: OfflineVitalSigns): void {
  let patientVitals = vitalsByPatient.get(vitals.patientId);
  if (!patientVitals) {
    patientVitals = new Set();
    vitalsByPatient.set(vitals.patientId, patientVitals);
  }
  patientVitals.add(vitals.id);
}

/**
 * Remove vitals from patient index
 */
function removeFromPatientIndex(vitals: OfflineVitalSigns): void {
  const patientVitals = vitalsByPatient.get(vitals.patientId);
  if (patientVitals) {
    patientVitals.delete(vitals.id);
    if (patientVitals.size === 0) {
      vitalsByPatient.delete(vitals.patientId);
    }
  }
}

/**
 * Notify listeners of vitals change
 */
function notifyVitalsChange(vitals: OfflineVitalSigns): void {
  // Notify specific vitals listeners
  const listeners = vitalsListeners.get(vitals.id);
  if (listeners) {
    listeners.forEach(listener => listener(vitals));
  }
  
  // Notify patient-level listeners
  const patientListeners = vitalsListeners.get(`patient:${vitals.patientId}`);
  if (patientListeners) {
    patientListeners.forEach(listener => listener(vitals));
  }
  
  // Notify "all" listeners
  const allListeners = vitalsListeners.get('*');
  if (allListeners) {
    allListeners.forEach(listener => listener(vitals));
  }
}

/**
 * Subscribe to vitals changes for a patient
 */
export function subscribeToPatientVitals(
  patientId: string,
  listener: VitalsListener
): () => void {
  const key = `patient:${patientId}`;
  let listeners = vitalsListeners.get(key);
  if (!listeners) {
    listeners = new Set();
    vitalsListeners.set(key, listeners);
  }
  listeners.add(listener);
  
  return () => {
    listeners?.delete(listener);
    if (listeners?.size === 0) {
      vitalsListeners.delete(key);
    }
  };
}

/**
 * Subscribe to all vitals changes
 */
export function subscribeToAllVitals(listener: VitalsListener): () => void {
  let listeners = vitalsListeners.get('*');
  if (!listeners) {
    listeners = new Set();
    vitalsListeners.set('*', listeners);
  }
  listeners.add(listener);
  
  return () => {
    listeners?.delete(listener);
    if (listeners?.size === 0) {
      vitalsListeners.delete('*');
    }
  };
}

// ============================================================================
// VITALS OPERATIONS
// ============================================================================

/**
 * Record vital signs for a patient
 * 
 * Offline behavior:
 * - Creates local record immediately
 * - Queues mutation for sync
 * - Nurse measurements are always authoritative
 */
export async function recordVitals(
  input: RecordVitalsInput,
  options: ServiceOptions = {}
): Promise<ServiceResult<OfflineVitalSigns>> {
  const { skipOptimistic = false } = options;
  
  // Validate vitals
  const validationErrors: string[] = [];
  
  if (input.vitals.sys <= 0 || input.vitals.sys > 300) {
    validationErrors.push('Presión sistólica inválida (1-300 mmHg)');
  }
  
  if (input.vitals.dia <= 0 || input.vitals.dia > 200) {
    validationErrors.push('Presión diastólica inválida (1-200 mmHg)');
  }
  
  if (input.vitals.spo2 <= 0 || input.vitals.spo2 > 100) {
    validationErrors.push('SpO2 inválido (1-100%)');
  }
  
  if (input.vitals.hr <= 0 || input.vitals.hr > 300) {
    validationErrors.push('Frecuencia cardíaca inválida (1-300 bpm)');
  }
  
  if (input.vitals.temperature !== undefined && 
      (input.vitals.temperature < 30 || input.vitals.temperature > 45)) {
    validationErrors.push('Temperatura inválida (30-45°C)');
  }
  
  if (input.vitals.weight !== undefined && 
      (input.vitals.weight <= 0 || input.vitals.weight > 500)) {
    validationErrors.push('Peso inválido (1-500 kg)');
  }
  
  if (validationErrors.length > 0) {
    return {
      success: false,
      data: null,
      error: new Error(`Validación fallida:\n${validationErrors.join('\n')}`),
      source: 'cache',
      pendingSync: false,
    };
  }
  
  // Create vitals record
  const now = new Date().toISOString();
  const vitalsId = generateOfflineId();
  
  const newVitals: OfflineVitalSigns = {
    id: vitalsId,
    tenantId: input.tenantId,
    patientId: input.patientId,
    nurseId: input.nurseId,
    visitId: input.visitId,
    date: now,
    sys: input.vitals.sys,
    dia: input.vitals.dia,
    spo2: input.vitals.spo2,
    hr: input.vitals.hr,
    temperature: input.vitals.temperature,
    weight: input.vitals.weight,
    notes: input.notes,
    createdAt: now,
    updatedAt: now,
    _syncStatus: 'pending',
    _localVersion: 1,
    _createdOffline: true,
  };
  
  // Apply optimistic update
  if (!skipOptimistic) {
    vitalsCache.set(vitalsId, newVitals);
    indexByPatient(newVitals);
    notifyVitalsChange(newVitals);
  }
  
  // Queue for sync
  const mutationId = enqueueMutation('VitalSigns', 'create', {
    ...newVitals,
    localId: vitalsId,
  });
  
  newVitals._pendingMutationId = mutationId;
  vitalsCache.set(vitalsId, newVitals);
  
  return {
    success: true,
    data: newVitals,
    source: 'optimistic',
    pendingSync: true,
    mutationId,
  };
}

/**
 * Update existing vitals record
 */
export async function updateVitals(
  id: string,
  vitals: Partial<VitalsData>,
  notes?: string,
  options: ServiceOptions = {}
): Promise<ServiceResult<OfflineVitalSigns>> {
  const { skipOptimistic = false } = options;
  
  const existingVitals = vitalsCache.get(id);
  
  if (!existingVitals) {
    return {
      success: false,
      data: null,
      error: new Error(`Vitals ${id} not found in local cache`),
      source: 'cache',
      pendingSync: false,
    };
  }
  
  // Create updated record
  const now = new Date().toISOString();
  const updatedVitals: OfflineVitalSigns = {
    ...existingVitals,
    sys: vitals.sys ?? existingVitals.sys,
    dia: vitals.dia ?? existingVitals.dia,
    spo2: vitals.spo2 ?? existingVitals.spo2,
    hr: vitals.hr ?? existingVitals.hr,
    temperature: vitals.temperature ?? existingVitals.temperature,
    weight: vitals.weight ?? existingVitals.weight,
    notes: notes ?? existingVitals.notes,
    updatedAt: now,
    _syncStatus: 'pending',
    _localVersion: (existingVitals._localVersion || 0) + 1,
  };
  
  // Apply optimistic update
  if (!skipOptimistic) {
    vitalsCache.set(id, updatedVitals);
    notifyVitalsChange(updatedVitals);
  }
  
  // Queue for sync
  const mutationId = enqueueMutation('VitalSigns', 'update', {
    id,
    ...vitals,
    notes,
    _localVersion: updatedVitals._localVersion,
  });
  
  updatedVitals._pendingMutationId = mutationId;
  vitalsCache.set(id, updatedVitals);
  
  return {
    success: true,
    data: updatedVitals,
    source: 'optimistic',
    pendingSync: true,
    mutationId,
  };
}

/**
 * Get vitals by ID
 */
export function getVitals(id: string): OfflineVitalSigns | undefined {
  return vitalsCache.get(id);
}

/**
 * Get all vitals for a patient
 */
export function getVitalsByPatient(patientId: string): OfflineVitalSigns[] {
  const vitalsIds = vitalsByPatient.get(patientId);
  if (!vitalsIds) return [];
  
  return Array.from(vitalsIds)
    .map(id => vitalsCache.get(id))
    .filter((v): v is OfflineVitalSigns => v !== undefined)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get recent vitals for a patient (last N records)
 */
export function getRecentVitals(patientId: string, count: number = 10): OfflineVitalSigns[] {
  return getVitalsByPatient(patientId).slice(0, count);
}

/**
 * Get latest vitals for a patient
 */
export function getLatestVitals(patientId: string): OfflineVitalSigns | undefined {
  const vitals = getVitalsByPatient(patientId);
  return vitals.length > 0 ? vitals[0] : undefined;
}

/**
 * Get vitals for a specific visit
 */
export function getVitalsByVisit(visitId: string): OfflineVitalSigns[] {
  return Array.from(vitalsCache.values())
    .filter(v => v.visitId === visitId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get pending (unsynced) vitals
 */
export function getPendingVitals(): OfflineVitalSigns[] {
  return Array.from(vitalsCache.values()).filter(v => v._syncStatus === 'pending');
}

/**
 * Get vitals within a date range
 */
export function getVitalsInRange(
  patientId: string,
  startDate: Date,
  endDate: Date
): OfflineVitalSigns[] {
  return getVitalsByPatient(patientId).filter(v => {
    const vitalsDate = new Date(v.date);
    return vitalsDate >= startDate && vitalsDate <= endDate;
  });
}

// ============================================================================
// NETWORK OPERATIONS (Stubs - integrate with actual Amplify client)
// ============================================================================

/**
 * Create vitals on network
 * TODO: Integrate with Amplify Gen 2 client
 */
async function createVitalsOnNetwork(input: OfflineVitalSigns): Promise<VitalSigns> {
  // This would be replaced with actual Amplify call:
  // const { data } = await client.models.VitalSigns.create({ ...input });
  // return data;
  
  throw new Error('Network create not implemented - integrate with Amplify client');
}

/**
 * Update vitals on network
 * TODO: Integrate with Amplify Gen 2 client
 */
async function updateVitalsOnNetwork(
  id: string,
  input: Partial<VitalSigns>
): Promise<VitalSigns> {
  // This would be replaced with actual Amplify call:
  // const { data } = await client.models.VitalSigns.update({ id, ...input });
  // return data;
  
  throw new Error('Network update not implemented - integrate with Amplify client');
}

// ============================================================================
// MUTATION EXECUTOR
// ============================================================================

/**
 * Execute a vitals mutation (called by queue manager)
 */
async function executeVitalsMutation(mutation: PendingMutation): Promise<MutationResult> {
  const { operation, data } = mutation;
  
  try {
    if (operation === 'create') {
      const input = data as OfflineVitalSigns & { localId: string };
      const result = await createVitalsOnNetwork(input);
      
      // Update local cache with server response
      const localId = input.localId;
      if (localId && vitalsCache.has(localId)) {
        const localVitals = vitalsCache.get(localId)!;
        removeFromPatientIndex(localVitals);
        vitalsCache.delete(localId);
        
        const syncedVitals: OfflineVitalSigns = {
          ...localVitals,
          ...result,
          _syncStatus: 'synced',
          _pendingMutationId: undefined,
        };
        vitalsCache.set(result.id, syncedVitals);
        indexByPatient(syncedVitals);
        notifyVitalsChange(syncedVitals);
      }
      
      return { success: true, data: result, retryable: false };
    }
    
    if (operation === 'update') {
      const input = data as { id: string } & Partial<VitalSigns>;
      const result = await updateVitalsOnNetwork(input.id, input);
      
      // Update local cache
      const cachedVitals = vitalsCache.get(input.id);
      if (cachedVitals) {
        const syncedVitals: OfflineVitalSigns = {
          ...cachedVitals,
          ...result,
          _syncStatus: 'synced',
          _pendingMutationId: undefined,
        };
        vitalsCache.set(input.id, syncedVitals);
        notifyVitalsChange(syncedVitals);
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
 * Clean up old vitals beyond retention period
 */
export function cleanupOldVitals(): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - VITALS_RETENTION_DAYS);
  
  let removedCount = 0;
  
  for (const [id, vitals] of vitalsCache.entries()) {
    // Only cleanup synced records
    if (vitals._syncStatus !== 'synced') continue;
    
    const vitalsDate = new Date(vitals.date);
    if (vitalsDate < cutoffDate) {
      removeFromPatientIndex(vitals);
      vitalsCache.delete(id);
      removedCount++;
    }
  }
  
  if (removedCount > 0) {
    console.log(`🧹 Cleaned up ${removedCount} old vitals records`);
  }
  
  return removedCount;
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the vitals service
 */
export function initializeVitalsService(): void {
  registerExecutor('VitalSigns', executeVitalsMutation);
  console.log('✅ Vitals service initialized');
}

/**
 * Clear vitals cache (call on logout)
 */
export function clearVitalsCache(): void {
  vitalsCache.clear();
  vitalsByPatient.clear();
  vitalsListeners.clear();
  console.log('🧹 Vitals cache cleared');
}

/**
 * Populate vitals cache from external data
 */
export function populateVitalsCache(vitals: VitalSigns[]): void {
  for (const v of vitals) {
    const offlineVitals: OfflineVitalSigns = {
      ...v,
      _syncStatus: 'synced',
      _localVersion: 1,
      _createdOffline: false,
    };
    vitalsCache.set(v.id, offlineVitals);
    indexByPatient(offlineVitals);
  }
  console.log(`📥 Populated vitals cache with ${vitals.length} records`);
}
