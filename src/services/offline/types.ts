/**
 * Offline Service Layer Types
 * 
 * Shared types for offline-capable services.
 * 
 * @see docs/OFFLINE_SYNC_SPEC.md - Phase 3: Offline Service Layer
 */

import type { Visit, VitalsData, KardexData, MedicationAdminData, TaskCompletionData } from '../../types/workflow';
import type { PatientAssessment, GlasgowScore, BradenScore, MorseScore } from '../../types/clinical-scales';

// ============================================================================
// SYNC STATUS TYPES
// ============================================================================

/**
 * Sync status for offline records
 */
export type SyncStatus = 'synced' | 'pending' | 'error' | 'conflict';

/**
 * Operation types for mutations
 */
export type MutationOperation = 'create' | 'update' | 'delete';

/**
 * Model names supported by offline services
 */
export type OfflineModelName = 'Visit' | 'VitalSigns' | 'PatientAssessment';

// ============================================================================
// MUTATION QUEUE TYPES
// ============================================================================

/**
 * Pending mutation in the queue
 */
export interface PendingMutation<T = unknown> {
  /** Unique mutation ID */
  id: string;
  /** Model name being mutated */
  modelName: OfflineModelName;
  /** Type of operation */
  operation: MutationOperation;
  /** The data to be synced */
  data: T;
  /** ISO timestamp when mutation was created */
  createdAt: string;
  /** Number of retry attempts */
  retryCount: number;
  /** Last error message if failed */
  lastError?: string;
  /** ISO timestamp of last retry attempt */
  lastRetryAt?: string;
  /** Priority (lower = higher priority) */
  priority: number;
}

/**
 * Mutation execution result
 */
export interface MutationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: Error;
  retryable: boolean;
}

/**
 * Queue statistics
 */
export interface QueueStats {
  totalPending: number;
  byModel: Record<OfflineModelName, number>;
  byOperation: Record<MutationOperation, number>;
  oldestMutation: string | null;
  errorCount: number;
}

// ============================================================================
// OFFLINE RECORD METADATA
// ============================================================================

/**
 * Metadata added to records for offline tracking
 */
export interface OfflineMetadata {
  /** Current sync status */
  _syncStatus: SyncStatus;
  /** Local version number (increments on each local edit) */
  _localVersion: number;
  /** Whether record was created offline */
  _createdOffline: boolean;
  /** ISO timestamp of last sync attempt */
  _lastSyncAttempt?: string;
  /** Last sync error message */
  _syncError?: string;
  /** Pending mutation ID if queued */
  _pendingMutationId?: string;
}

/**
 * Combines a base type with offline metadata
 */
export type WithOfflineMetadata<T> = T & Partial<OfflineMetadata>;

// ============================================================================
// SERVICE OPERATION TYPES
// ============================================================================

/**
 * Result of a service operation
 */
export interface ServiceResult<T> {
  /** Whether operation succeeded (may be optimistic) */
  success: boolean;
  /** The resulting data */
  data: T | null;
  /** Error if operation failed */
  error?: Error;
  /** Source of the data */
  source: 'network' | 'cache' | 'optimistic';
  /** Whether result is pending sync */
  pendingSync: boolean;
  /** Mutation ID if queued for sync */
  mutationId?: string;
}

/**
 * Options for service operations
 */
export interface ServiceOptions {
  /** Force network request even if offline */
  forceNetwork?: boolean;
  /** Skip optimistic update */
  skipOptimistic?: boolean;
  /** Timeout in milliseconds */
  timeout?: number;
}

// ============================================================================
// VISIT SERVICE TYPES
// ============================================================================

/**
 * Input for creating a new visit draft
 */
export interface CreateVisitInput {
  shiftId: string;
  patientId: string;
  nurseId: string;
  tenantId: string;
}

/**
 * Input for updating visit clinical data
 */
export interface UpdateVisitInput {
  id: string;
  kardex?: Partial<KardexData>;
  vitalsRecorded?: VitalsData;
  medicationsAdministered?: MedicationAdminData[];
  tasksCompleted?: TaskCompletionData[];
}

/**
 * Input for completing/submitting a visit
 */
export interface CompleteVisitInput {
  id: string;
  kardex: KardexData;
  vitalsRecorded: VitalsData;
  medicationsAdministered?: MedicationAdminData[];
  tasksCompleted?: TaskCompletionData[];
}

/**
 * Visit with offline metadata
 */
export type OfflineVisit = WithOfflineMetadata<Visit>;

// ============================================================================
// VITALS SERVICE TYPES
// ============================================================================

/**
 * VitalSigns record structure
 */
export interface VitalSigns {
  id: string;
  tenantId: string;
  patientId: string;
  nurseId: string;
  visitId?: string;
  date: string;
  sys: number;
  dia: number;
  spo2: number;
  hr: number;
  temperature?: number;
  weight?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Input for recording vitals
 */
export interface RecordVitalsInput {
  patientId: string;
  nurseId: string;
  tenantId: string;
  visitId?: string;
  vitals: VitalsData;
  notes?: string;
}

/**
 * VitalSigns with offline metadata
 */
export type OfflineVitalSigns = WithOfflineMetadata<VitalSigns>;

// ============================================================================
// ASSESSMENT SERVICE TYPES
// ============================================================================

/**
 * Input for creating a clinical assessment.
 * Uses short field names for convenience - mapped to PatientAssessment on creation.
 */
export interface CreateAssessmentInput {
  patientId: string;
  nurseId: string;
  tenantId: string;
  visitId?: string;
  /** Glasgow Coma Scale (consciousness) */
  glasgow?: GlasgowScore;
  /** Pain intensity (0-10) */
  painScale?: number;
  /** Braden Scale (pressure ulcer risk) */
  braden?: BradenScore;
  /** Morse Fall Scale (fall risk) */
  morse?: MorseScore;
  notes?: string;
}

/**
 * PatientAssessment with offline metadata
 */
export type OfflinePatientAssessment = WithOfflineMetadata<PatientAssessment>;

// ============================================================================
// CONFLICT RESOLUTION TYPES
// ============================================================================

/**
 * Conflict data for resolution
 */
export interface ConflictData<T> {
  localData: T;
  remoteData: T;
  field?: string;
  localTimestamp: string;
  remoteTimestamp: string;
}

/**
 * Conflict resolution strategy
 */
export type ConflictResolution = 'local' | 'remote' | 'merge' | 'manual';

/**
 * Conflict handler function
 */
export type ConflictHandler<T> = (conflict: ConflictData<T>) => Promise<{
  resolution: ConflictResolution;
  resolvedData?: T;
}>;
