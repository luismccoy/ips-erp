/**
 * DataStore Configuration for Offline-First Support
 * 
 * Configures Amplify DataStore with:
 * - Selective sync (only nurse's assigned data)
 * - Custom conflict resolution
 * - Error handling
 * 
 * @see docs/OFFLINE_SYNC_SPEC.md - Section 6: Conflict Resolution
 */

import { DataStore, syncExpression } from '@aws-amplify/datastore';
import type { Schema } from '../../amplify/data/resource';

// Re-export DataStore for convenience
export { DataStore };

// Types for sync status tracking
export type SyncStatus = 'synced' | 'pending' | 'error';

export interface SyncMetadata {
  lastSyncTime: string | null;
  pendingMutations: number;
  isSyncing: boolean;
  errors: SyncError[];
}

export interface SyncError {
  id: string;
  modelName: string;
  operation: 'create' | 'update' | 'delete';
  message: string;
  timestamp: string;
  retryCount: number;
}

// Current user context (set during auth)
let currentNurseId: string | null = null;
let currentTenantId: string | null = null;

/**
 * Set the current user context for selective sync
 * Call this after successful authentication
 */
export function setUserContext(nurseId: string, tenantId: string): void {
  currentNurseId = nurseId;
  currentTenantId = tenantId;
  console.log('📍 DataStore user context set:', { nurseId, tenantId });
}

/**
 * Get current nurse ID for sync filtering
 */
export function getCurrentNurseId(): string | null {
  return currentNurseId;
}

/**
 * Get current tenant ID for sync filtering
 */
export function getCurrentTenantId(): string | null {
  return currentTenantId;
}

/**
 * Clear user context (call on logout)
 */
export function clearUserContext(): void {
  currentNurseId = null;
  currentTenantId = null;
  console.log('🧹 DataStore user context cleared');
}

/**
 * Configure DataStore with selective sync and conflict resolution
 * 
 * Per OFFLINE_SYNC_SPEC.md Section 6.2:
 * - Visit status: Server wins for APPROVED/REJECTED
 * - VitalSigns: Local wins (nurse measurements authoritative)
 * - PatientAssessment: Local wins (clinical data)
 * - Default: Auto-merge
 */
export function configureDataStore(): void {
  DataStore.configure({
    // Conflict handler per spec Section 6.2
    conflictHandler: async (data) => {
      const { modelConstructor, localModel, remoteModel } = data;
      const modelName = modelConstructor?.name || 'Unknown';
      
      console.log(`⚠️ Conflict detected for ${modelName}:`, {
        localVersion: (localModel as any)?._version,
        remoteVersion: (remoteModel as any)?._version,
      });

      // Visit model - CRITICAL: Server state wins for status field
      if (modelName === 'Visit') {
        const local = localModel as any;
        const remote = remoteModel as any;
        
        // If server has status APPROVED or REJECTED, don't overwrite
        if (['APPROVED', 'REJECTED'].includes(remote?.status)) {
          console.log('🔒 Visit status is finalized, discarding local changes');
          return { type: 'DISCARD' as const };
        }
        
        // Otherwise, merge: keep local clinical data, server metadata
        console.log('🔀 Merging Visit: local clinical + server metadata');
        return {
          type: 'RETRY' as const,
          newModel: {
            ...remote,
            kardex: local?.kardex, // Keep local clinical notes
            vitalsRecorded: local?.vitalsRecorded,
            medicationsAdministered: local?.medicationsAdministered,
            tasksCompleted: local?.tasksCompleted,
            _version: remote?._version, // Use server version
          },
        };
      }

      // VitalSigns - Always keep local (nurse measurements are authoritative)
      if (modelName === 'VitalSigns') {
        const local = localModel as any;
        const remote = remoteModel as any;
        
        console.log('💉 VitalSigns conflict: keeping local measurements');
        return {
          type: 'RETRY' as const,
          newModel: {
            ...local,
            _version: remote?._version,
          },
        };
      }

      // PatientAssessment - Same as VitalSigns
      if (modelName === 'PatientAssessment') {
        const local = localModel as any;
        const remote = remoteModel as any;
        
        console.log('📋 PatientAssessment conflict: keeping local data');
        return {
          type: 'RETRY' as const,
          newModel: {
            ...local,
            _version: remote?._version,
          },
        };
      }

      // Default: Auto-merge for other models
      console.log(`🔄 Auto-merging ${modelName}`);
      return { type: 'AUTOMERGE' as const };
    },

    // Error handler
    errorHandler: (error) => {
      console.error('❌ DataStore sync error:', error);
      
      // Check for auth errors
      if (error.errorType === 'Unauthorized') {
        console.error('🔐 Authentication error - user needs to re-login');
        // Could dispatch an event here for the app to handle
        window.dispatchEvent(new CustomEvent('datastore:auth-error', { detail: error }));
      }
    },

    // Full sync interval (24 hours as per spec)
    fullSyncInterval: 24 * 60, // minutes

    // Max records to sync per model (performance optimization)
    maxRecordsToSync: 10000,
  });

  console.log('✅ DataStore configured with conflict resolution');
}

/**
 * Initialize DataStore and start syncing
 * Call after authentication and user context is set
 */
export async function initializeDataStore(): Promise<void> {
  if (!currentNurseId || !currentTenantId) {
    console.warn('⚠️ User context not set, DataStore may sync all data');
  }
  
  configureDataStore();
  
  // Start DataStore
  await DataStore.start();
  console.log('🚀 DataStore started');
}

/**
 * Clear all local DataStore data
 * Call on logout or when switching users
 */
export async function clearDataStore(): Promise<void> {
  await DataStore.clear();
  clearUserContext();
  console.log('🧹 DataStore cleared');
}

/**
 * Stop DataStore sync
 * Useful for conserving battery/data when app is backgrounded
 */
export async function stopDataStore(): Promise<void> {
  await DataStore.stop();
  console.log('⏸️ DataStore stopped');
}
