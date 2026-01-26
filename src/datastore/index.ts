/**
 * DataStore Module - Offline-First Data Layer
 * 
 * Provides offline-capable data access for the IPS-ERP Nurse App.
 * 
 * Usage:
 * ```typescript
 * import { 
 *   initializeDataStore, 
 *   setUserContext,
 *   getSyncState,
 *   subscribeSyncState 
 * } from '../datastore';
 * 
 * // On login
 * setUserContext(nurseId, tenantId);
 * await initializeDataStore();
 * 
 * // Subscribe to sync state
 * const unsubscribe = subscribeSyncState(state => {
 *   console.log('Sync state:', state);
 * });
 * ```
 * 
 * @see docs/OFFLINE_SYNC_SPEC.md
 */

// Configuration
export {
  DataStore,
  configureDataStore,
  initializeDataStore,
  clearDataStore,
  stopDataStore,
  setUserContext,
  clearUserContext,
  getCurrentNurseId,
  getCurrentTenantId,
  type SyncStatus,
  type SyncMetadata,
  type SyncError,
} from './config';

// Models
export {
  type OfflineVisit,
  type OfflinePatient,
  type OfflineShift,
  type OfflineVitalSigns,
  type OfflinePatientAssessment,
  type OfflineMetadata,
  type ModelOperationResult,
  type BatchOperationResult,
  generateOfflineId,
  isOfflineId,
} from './models';

// Sync Service
export {
  getSyncState,
  subscribeSyncState,
  registerPendingMutation,
  markMutationSynced,
  markMutationFailed,
  getPendingMutations,
  clearSyncError,
  clearAllSyncErrors,
  forceSyncRefresh,
  retryFailedMutations,
  initializeSyncService,
  cleanupSyncService,
  getShiftSyncDateRange,
  getVitalSignsSyncDateRange,
} from './syncService';
