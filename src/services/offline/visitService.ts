/**
 * Offline Visit Service
 * 
 * Provides offline-capable visit operations:
 * - Create visit drafts from completed shifts
 * - Update visit clinical data (KARDEX, vitals, medications, tasks)
 * - Submit visits for review
 * 
 * Uses optimistic updates for UI responsiveness and queues mutations
 * for sync when offline.
 * 
 * @see docs/OFFLINE_SYNC_SPEC.md - Section 4.2: Visit Model (Critical Path)
 */

import type {
  OfflineVisit,
  CreateVisitInput,
  UpdateVisitInput,
  CompleteVisitInput,
  ServiceResult,
  ServiceOptions,
  PendingMutation,
  MutationResult,
} from './types';
import type { Visit, KardexData, VitalsData, DEFAULT_KARDEX, DEFAULT_VITALS } from '../../types/workflow';
import {
  enqueueMutation,
  dequeueMutation,
  registerExecutor,
} from './queueManager';

// ============================================================================
// LOCAL CACHE
// ============================================================================

/** In-memory cache of visits keyed by ID */
const visitCache = new Map<string, OfflineVisit>();

/** Listeners for visit changes */
type VisitListener = (visit: OfflineVisit) => void;
const visitListeners = new Map<string, Set<VisitListener>>();

/**
 * Generate an offline ID for new visits
 */
function generateOfflineId(): string {
  return `offline-visit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Notify listeners of visit change
 */
function notifyVisitChange(visit: OfflineVisit): void {
  const listeners = visitListeners.get(visit.id);
  if (listeners) {
    listeners.forEach(listener => listener(visit));
  }
  // Also notify "all" listeners
  const allListeners = visitListeners.get('*');
  if (allListeners) {
    allListeners.forEach(listener => listener(visit));
  }
}

/**
 * Subscribe to changes for a specific visit
 */
export function subscribeToVisit(visitId: string, listener: VisitListener): () => void {
  let listeners = visitListeners.get(visitId);
  if (!listeners) {
    listeners = new Set();
    visitListeners.set(visitId, listeners);
  }
  listeners.add(listener);
  
  // Immediately call with cached value if available
  const cached = visitCache.get(visitId);
  if (cached) {
    listener(cached);
  }
  
  return () => {
    listeners?.delete(listener);
    if (listeners?.size === 0) {
      visitListeners.delete(visitId);
    }
  };
}

/**
 * Subscribe to all visit changes
 */
export function subscribeToAllVisits(listener: VisitListener): () => void {
  return subscribeToVisit('*', listener);
}

// ============================================================================
// VISIT OPERATIONS
// ============================================================================

/**
 * Create a new visit draft from a completed shift
 * 
 * Offline behavior:
 * - Creates local visit immediately with optimistic data
 * - Queues mutation for sync when online
 * - Returns immediately for responsive UI
 */
export async function createVisitDraft(
  input: CreateVisitInput,
  options: ServiceOptions = {}
): Promise<ServiceResult<OfflineVisit>> {
  const { forceNetwork = false, skipOptimistic = false } = options;
  
  const isOnline = navigator.onLine;
  
  // Create optimistic visit
  const now = new Date().toISOString();
  const visitId = generateOfflineId();
  
  const optimisticVisit: OfflineVisit = {
    id: visitId,
    tenantId: input.tenantId,
    shiftId: input.shiftId,
    patientId: input.patientId,
    nurseId: input.nurseId,
    status: 'DRAFT',
    kardex: {
      generalObservations: '',
    },
    createdAt: now,
    updatedAt: now,
    _syncStatus: 'pending',
    _localVersion: 1,
    _createdOffline: true,
  };
  
  // Apply optimistic update
  if (!skipOptimistic) {
    visitCache.set(visitId, optimisticVisit);
    notifyVisitChange(optimisticVisit);
  }
  
  // If online and not forcing optimistic-only, try network
  if (isOnline && forceNetwork) {
    try {
      const networkVisit = await createVisitOnNetwork(input);
      
      // Update cache with network response
      const syncedVisit: OfflineVisit = {
        ...networkVisit,
        _syncStatus: 'synced',
        _localVersion: 1,
        _createdOffline: false,
      };
      
      // Remove optimistic entry if ID changed
      if (networkVisit.id !== visitId) {
        visitCache.delete(visitId);
      }
      visitCache.set(networkVisit.id, syncedVisit);
      notifyVisitChange(syncedVisit);
      
      return {
        success: true,
        data: syncedVisit,
        source: 'network',
        pendingSync: false,
      };
    } catch (error) {
      console.warn('Network create failed, falling back to offline:', error);
    }
  }
  
  // Queue for offline sync
  const mutationId = enqueueMutation('Visit', 'create', {
    ...input,
    localId: visitId,
  });
  
  optimisticVisit._pendingMutationId = mutationId;
  visitCache.set(visitId, optimisticVisit);
  
  return {
    success: true,
    data: optimisticVisit,
    source: 'optimistic',
    pendingSync: true,
    mutationId,
  };
}

/**
 * Update visit clinical data
 * 
 * Offline behavior:
 * - Updates local cache immediately
 * - Queues mutation for sync
 * - Merges with any pending mutations for same visit
 */
export async function updateVisit(
  input: UpdateVisitInput,
  options: ServiceOptions = {}
): Promise<ServiceResult<OfflineVisit>> {
  const { skipOptimistic = false } = options;
  
  const existingVisit = visitCache.get(input.id);
  
  if (!existingVisit) {
    return {
      success: false,
      data: null,
      error: new Error(`Visit ${input.id} not found in local cache`),
      source: 'cache',
      pendingSync: false,
    };
  }
  
  // Create updated visit
  const now = new Date().toISOString();
  const updatedVisit: OfflineVisit = {
    ...existingVisit,
    kardex: input.kardex 
      ? { ...existingVisit.kardex, ...input.kardex }
      : existingVisit.kardex,
    vitalsRecorded: input.vitalsRecorded ?? existingVisit.vitalsRecorded,
    medicationsAdministered: input.medicationsAdministered ?? existingVisit.medicationsAdministered,
    tasksCompleted: input.tasksCompleted ?? existingVisit.tasksCompleted,
    updatedAt: now,
    _syncStatus: 'pending',
    _localVersion: (existingVisit._localVersion || 0) + 1,
  };
  
  // Apply optimistic update
  if (!skipOptimistic) {
    visitCache.set(input.id, updatedVisit);
    notifyVisitChange(updatedVisit);
  }
  
  // Queue for sync
  const mutationId = enqueueMutation('Visit', 'update', {
    id: input.id,
    ...input,
    _localVersion: updatedVisit._localVersion,
  });
  
  updatedVisit._pendingMutationId = mutationId;
  visitCache.set(input.id, updatedVisit);
  
  return {
    success: true,
    data: updatedVisit,
    source: 'optimistic',
    pendingSync: true,
    mutationId,
  };
}

/**
 * Submit visit for review (complete documentation)
 * 
 * Validates all required fields before submission.
 * Status changes from DRAFT → SUBMITTED
 */
export async function submitVisit(
  input: CompleteVisitInput,
  options: ServiceOptions = {}
): Promise<ServiceResult<OfflineVisit>> {
  const { skipOptimistic = false } = options;
  
  // Validate required fields
  const validationErrors: string[] = [];
  
  if (!input.kardex.generalObservations?.trim()) {
    validationErrors.push('KARDEX: Observaciones generales requeridas');
  }
  
  if (!input.vitalsRecorded || input.vitalsRecorded.sys <= 0) {
    validationErrors.push('Signos vitales: Presión sistólica requerida');
  }
  
  if (!input.vitalsRecorded || input.vitalsRecorded.dia <= 0) {
    validationErrors.push('Signos vitales: Presión diastólica requerida');
  }
  
  if (!input.vitalsRecorded || input.vitalsRecorded.spo2 <= 0) {
    validationErrors.push('Signos vitales: SpO2 requerido');
  }
  
  if (!input.vitalsRecorded || input.vitalsRecorded.hr <= 0) {
    validationErrors.push('Signos vitales: Frecuencia cardíaca requerida');
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
  
  const existingVisit = visitCache.get(input.id);
  
  if (!existingVisit) {
    return {
      success: false,
      data: null,
      error: new Error(`Visit ${input.id} not found in local cache`),
      source: 'cache',
      pendingSync: false,
    };
  }
  
  // Check if visit can be submitted
  if (existingVisit.status !== 'DRAFT' && existingVisit.status !== 'REJECTED') {
    return {
      success: false,
      data: null,
      error: new Error(`No se puede enviar visita con estado: ${existingVisit.status}`),
      source: 'cache',
      pendingSync: false,
    };
  }
  
  // Create submitted visit
  const now = new Date().toISOString();
  const submittedVisit: OfflineVisit = {
    ...existingVisit,
    status: 'SUBMITTED',
    kardex: input.kardex,
    vitalsRecorded: input.vitalsRecorded,
    medicationsAdministered: input.medicationsAdministered || [],
    tasksCompleted: input.tasksCompleted || [],
    submittedAt: now,
    updatedAt: now,
    _syncStatus: 'pending',
    _localVersion: (existingVisit._localVersion || 0) + 1,
  };
  
  // Apply optimistic update
  if (!skipOptimistic) {
    visitCache.set(input.id, submittedVisit);
    notifyVisitChange(submittedVisit);
  }
  
  // Queue for sync
  const mutationId = enqueueMutation('Visit', 'update', {
    id: input.id,
    status: 'SUBMITTED',
    ...input,
    submittedAt: now,
    _localVersion: submittedVisit._localVersion,
  });
  
  submittedVisit._pendingMutationId = mutationId;
  visitCache.set(input.id, submittedVisit);
  
  return {
    success: true,
    data: submittedVisit,
    source: 'optimistic',
    pendingSync: true,
    mutationId,
  };
}

/**
 * Get a visit by ID (local cache first)
 */
export function getVisit(visitId: string): OfflineVisit | undefined {
  return visitCache.get(visitId);
}

/**
 * Get all cached visits
 */
export function getAllCachedVisits(): OfflineVisit[] {
  return Array.from(visitCache.values());
}

/**
 * Get visits by nurse ID
 */
export function getVisitsByNurse(nurseId: string): OfflineVisit[] {
  return Array.from(visitCache.values()).filter(v => v.nurseId === nurseId);
}

/**
 * Get visits by patient ID
 */
export function getVisitsByPatient(patientId: string): OfflineVisit[] {
  return Array.from(visitCache.values()).filter(v => v.patientId === patientId);
}

/**
 * Get pending (unsynced) visits
 */
export function getPendingVisits(): OfflineVisit[] {
  return Array.from(visitCache.values()).filter(v => v._syncStatus === 'pending');
}

// ============================================================================
// NETWORK OPERATIONS (Stubs - integrate with actual Amplify client)
// ============================================================================

/**
 * Create visit on network (actual API call)
 * TODO: Integrate with Amplify Gen 2 client
 */
async function createVisitOnNetwork(input: CreateVisitInput): Promise<Visit> {
  // This would be replaced with actual Amplify call:
  // const { data } = await client.models.Visit.create({ ...input });
  // return data;
  
  throw new Error('Network create not implemented - integrate with Amplify client');
}

/**
 * Update visit on network (actual API call)
 * TODO: Integrate with Amplify Gen 2 client
 */
async function updateVisitOnNetwork(input: UpdateVisitInput & { status?: string }): Promise<Visit> {
  // This would be replaced with actual Amplify call:
  // const { data } = await client.models.Visit.update({ ...input });
  // return data;
  
  throw new Error('Network update not implemented - integrate with Amplify client');
}

// ============================================================================
// MUTATION EXECUTOR
// ============================================================================

/**
 * Execute a visit mutation (called by queue manager)
 */
async function executeVisitMutation(mutation: PendingMutation): Promise<MutationResult> {
  const { operation, data } = mutation;
  
  try {
    if (operation === 'create') {
      const input = data as CreateVisitInput & { localId: string };
      const result = await createVisitOnNetwork(input);
      
      // Update local cache with server response
      const localId = input.localId;
      if (localId && visitCache.has(localId)) {
        const localVisit = visitCache.get(localId)!;
        visitCache.delete(localId);
        
        const syncedVisit: OfflineVisit = {
          ...localVisit,
          ...result,
          _syncStatus: 'synced',
          _pendingMutationId: undefined,
        };
        visitCache.set(result.id, syncedVisit);
        notifyVisitChange(syncedVisit);
      }
      
      return { success: true, data: result, retryable: false };
    }
    
    if (operation === 'update') {
      const input = data as UpdateVisitInput & { status?: string };
      const result = await updateVisitOnNetwork(input);
      
      // Update local cache
      const cachedVisit = visitCache.get(input.id);
      if (cachedVisit) {
        const syncedVisit: OfflineVisit = {
          ...cachedVisit,
          ...result,
          _syncStatus: 'synced',
          _pendingMutationId: undefined,
        };
        visitCache.set(input.id, syncedVisit);
        notifyVisitChange(syncedVisit);
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
// INITIALIZATION
// ============================================================================

/**
 * Initialize the visit service
 * Registers mutation executor with queue manager
 */
export function initializeVisitService(): void {
  registerExecutor('Visit', executeVisitMutation);
  console.log('✅ Visit service initialized');
}

/**
 * Clear visit cache (call on logout)
 */
export function clearVisitCache(): void {
  visitCache.clear();
  visitListeners.clear();
  console.log('🧹 Visit cache cleared');
}

/**
 * Populate visit cache from external data
 * Used to seed cache from DataStore or initial fetch
 */
export function populateVisitCache(visits: Visit[]): void {
  for (const visit of visits) {
    const offlineVisit: OfflineVisit = {
      ...visit,
      _syncStatus: 'synced',
      _localVersion: 1,
      _createdOffline: false,
    };
    visitCache.set(visit.id, offlineVisit);
  }
  console.log(`📥 Populated visit cache with ${visits.length} visits`);
}
