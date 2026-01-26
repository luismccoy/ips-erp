/**
 * Sync Service for DataStore Offline Support
 * 
 * Provides:
 * - Sync status tracking
 * - Pending mutation management
 * - Background sync orchestration
 * - Error recovery and retry logic
 * 
 * @see docs/OFFLINE_SYNC_SPEC.md - Section 5: Sync Strategy
 */

import { DataStore, Predicates } from '@aws-amplify/datastore';
import type { SyncStatus, SyncError, SyncMetadata } from './config';
import { getCurrentNurseId, getCurrentTenantId } from './config';

// ============================================
// SYNC STATE MANAGEMENT
// ============================================

// Internal state
let syncState: SyncMetadata = {
  lastSyncTime: null,
  pendingMutations: 0,
  isSyncing: false,
  errors: [],
};

// Subscribers for state changes
type SyncStateListener = (state: SyncMetadata) => void;
const listeners: Set<SyncStateListener> = new Set();

/**
 * Get current sync state
 */
export function getSyncState(): SyncMetadata {
  return { ...syncState };
}

/**
 * Subscribe to sync state changes
 */
export function subscribeSyncState(listener: SyncStateListener): () => void {
  listeners.add(listener);
  // Immediately call with current state
  listener(getSyncState());
  
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Update sync state and notify listeners
 */
function updateSyncState(updates: Partial<SyncMetadata>): void {
  syncState = { ...syncState, ...updates };
  listeners.forEach(listener => listener(getSyncState()));
}

// ============================================
// SYNC STATUS TRACKING
// ============================================

// Track pending mutations in IndexedDB-like structure
const pendingMutationsMap = new Map<string, {
  modelName: string;
  operation: 'create' | 'update' | 'delete';
  data: unknown;
  createdAt: string;
  retryCount: number;
}>();

/**
 * Register a pending mutation (called before DataStore operation)
 */
export function registerPendingMutation(
  id: string,
  modelName: string,
  operation: 'create' | 'update' | 'delete',
  data: unknown
): void {
  pendingMutationsMap.set(id, {
    modelName,
    operation,
    data,
    createdAt: new Date().toISOString(),
    retryCount: 0,
  });
  
  updateSyncState({
    pendingMutations: pendingMutationsMap.size,
  });
  
  console.log(`📝 Registered pending mutation: ${modelName} ${operation}`, id);
}

/**
 * Mark a mutation as synced (called after successful sync)
 */
export function markMutationSynced(id: string): void {
  if (pendingMutationsMap.delete(id)) {
    updateSyncState({
      pendingMutations: pendingMutationsMap.size,
      lastSyncTime: new Date().toISOString(),
    });
    console.log(`✅ Mutation synced:`, id);
  }
}

/**
 * Mark a mutation as failed
 */
export function markMutationFailed(id: string, error: Error): void {
  const mutation = pendingMutationsMap.get(id);
  if (mutation) {
    mutation.retryCount++;
    
    const syncError: SyncError = {
      id,
      modelName: mutation.modelName,
      operation: mutation.operation,
      message: error.message,
      timestamp: new Date().toISOString(),
      retryCount: mutation.retryCount,
    };
    
    updateSyncState({
      errors: [...syncState.errors.slice(-9), syncError], // Keep last 10 errors
    });
    
    console.error(`❌ Mutation failed:`, id, error.message);
  }
}

/**
 * Get all pending mutations
 */
export function getPendingMutations(): Array<{
  id: string;
  modelName: string;
  operation: string;
  createdAt: string;
  retryCount: number;
}> {
  return Array.from(pendingMutationsMap.entries()).map(([id, data]) => ({
    id,
    modelName: data.modelName,
    operation: data.operation,
    createdAt: data.createdAt,
    retryCount: data.retryCount,
  }));
}

/**
 * Clear a specific error from the error list
 */
export function clearSyncError(errorId: string): void {
  updateSyncState({
    errors: syncState.errors.filter(e => e.id !== errorId),
  });
}

/**
 * Clear all sync errors
 */
export function clearAllSyncErrors(): void {
  updateSyncState({ errors: [] });
}

// ============================================
// DATASTORE SYNC OBSERVATION
// ============================================

let syncSubscription: { unsubscribe: () => void } | null = null;

/**
 * Start observing DataStore sync events
 */
export function startSyncObservation(): void {
  if (syncSubscription) {
    console.warn('Sync observation already started');
    return;
  }

  // Hub is used in Amplify for sync events
  // In Gen 2, we use DataStore.observeQuery for model observations
  console.log('👀 Started sync observation');
  
  // Update syncing state based on network
  const handleOnline = () => {
    console.log('🌐 Network online - sync will resume');
    updateSyncState({ isSyncing: true });
    
    // After a short delay, check if sync completed
    setTimeout(() => {
      if (pendingMutationsMap.size === 0) {
        updateSyncState({ isSyncing: false });
      }
    }, 5000);
  };
  
  const handleOffline = () => {
    console.log('📴 Network offline - sync paused');
    updateSyncState({ isSyncing: false });
  };
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  syncSubscription = {
    unsubscribe: () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    },
  };
}

/**
 * Stop observing DataStore sync events
 */
export function stopSyncObservation(): void {
  if (syncSubscription) {
    syncSubscription.unsubscribe();
    syncSubscription = null;
    console.log('🛑 Stopped sync observation');
  }
}

// ============================================
// MANUAL SYNC TRIGGERS
// ============================================

/**
 * Force a sync refresh
 * Useful when user pulls-to-refresh or wants to ensure latest data
 */
export async function forceSyncRefresh(): Promise<void> {
  if (!navigator.onLine) {
    console.warn('Cannot force sync while offline');
    return;
  }
  
  updateSyncState({ isSyncing: true });
  
  try {
    // In DataStore, stopping and starting forces a resync
    await DataStore.stop();
    await DataStore.start();
    
    updateSyncState({
      lastSyncTime: new Date().toISOString(),
      isSyncing: false,
    });
    
    console.log('🔄 Force sync completed');
  } catch (error) {
    console.error('Force sync failed:', error);
    updateSyncState({ isSyncing: false });
    throw error;
  }
}

/**
 * Retry failed mutations
 * Attempts to re-sync mutations that previously failed
 */
export async function retryFailedMutations(): Promise<{
  retried: number;
  failed: number;
}> {
  const failedIds = syncState.errors.map(e => e.id);
  let retried = 0;
  let failed = 0;
  
  for (const id of failedIds) {
    const mutation = pendingMutationsMap.get(id);
    if (mutation && mutation.retryCount < 5) {
      // Force DataStore to retry by triggering a sync
      // The actual retry happens automatically, we just track it
      clearSyncError(id);
      retried++;
    } else {
      failed++;
    }
  }
  
  if (retried > 0) {
    await forceSyncRefresh();
  }
  
  return { retried, failed };
}

// ============================================
// SELECTIVE SYNC HELPERS
// ============================================

/**
 * Get the date range for selective sync
 * Per spec: today + next 7 days for shifts
 */
export function getShiftSyncDateRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

/**
 * Get the date range for vital signs sync
 * Per spec: last 30 days
 */
export function getVitalSignsSyncDateRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 30);
  
  return {
    start: start.toISOString(),
    end: now.toISOString(),
  };
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize the sync service
 * Call after DataStore is configured and started
 */
export function initializeSyncService(): void {
  startSyncObservation();
  
  // Set initial sync state based on network
  updateSyncState({
    isSyncing: navigator.onLine,
    lastSyncTime: null,
    pendingMutations: 0,
    errors: [],
  });
  
  console.log('🔧 Sync service initialized');
}

/**
 * Cleanup sync service
 * Call on logout or app shutdown
 */
export function cleanupSyncService(): void {
  stopSyncObservation();
  pendingMutationsMap.clear();
  updateSyncState({
    lastSyncTime: null,
    pendingMutations: 0,
    isSyncing: false,
    errors: [],
  });
  listeners.clear();
  
  console.log('🧹 Sync service cleaned up');
}
