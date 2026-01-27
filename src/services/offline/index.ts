/**
 * Offline Service Layer
 * 
 * Provides offline-capable services for the IPS-ERP Nurse App.
 * 
 * Features:
 * - Offline-first data operations with optimistic updates
 * - Automatic sync queue with retry logic
 * - Integration with DataStore hooks from Phase 2
 * 
 * Usage:
 * ```typescript
 * import {
 *   initializeOfflineServices,
 *   visitService,
 *   vitalsService,
 *   assessmentService,
 *   queueManager,
 * } from './services/offline';
 * 
 * // Initialize on app startup
 * initializeOfflineServices();
 * 
 * // Create a visit (works offline)
 * const result = await visitService.createVisitDraft({
 *   shiftId: 'shift-123',
 *   patientId: 'patient-456',
 *   nurseId: 'nurse-789',
 *   tenantId: 'tenant-abc',
 * });
 * 
 * if (result.pendingSync) {
 *   console.log('Will sync when online');
 * }
 * ```
 * 
 * @see docs/OFFLINE_SYNC_SPEC.md - Phase 3: Offline Service Layer
 */

// ============================================================================
// TYPES
// ============================================================================

export type {
  // Sync types
  SyncStatus,
  MutationOperation,
  OfflineModelName,
  
  // Queue types
  PendingMutation,
  MutationResult,
  QueueStats,
  
  // Metadata types
  OfflineMetadata,
  WithOfflineMetadata,
  
  // Service types
  ServiceResult,
  ServiceOptions,
  
  // Visit types
  CreateVisitInput,
  UpdateVisitInput,
  CompleteVisitInput,
  OfflineVisit,
  
  // Vitals types
  VitalSigns,
  RecordVitalsInput,
  OfflineVitalSigns,
  
  // Assessment types
  CreateAssessmentInput,
  OfflinePatientAssessment,
  
  // Conflict types
  ConflictData,
  ConflictResolution,
  ConflictHandler,
} from './types';

// ============================================================================
// QUEUE MANAGER
// ============================================================================

export {
  // Initialization
  initializeQueueManager,
  cleanupQueueManager,
  
  // Queue operations
  enqueueMutation,
  dequeueMutation,
  getMutation,
  getPendingMutations,
  getRetryableMutations,
  getFailedMutations,
  getQueueStats,
  clearQueue,
  clearFailedMutations,
  
  // Sync processing
  processQueue,
  isQueueProcessing,
  registerExecutor,
  
  // Subscription
  subscribeToQueue,
  
  // Network listener
  setupNetworkListener,
} from './queueManager';

// ============================================================================
// VISIT SERVICE
// ============================================================================

import * as visitServiceModule from './visitService';

export const visitService = {
  // Operations
  createVisitDraft: visitServiceModule.createVisitDraft,
  updateVisit: visitServiceModule.updateVisit,
  submitVisit: visitServiceModule.submitVisit,
  
  // Queries
  getVisit: visitServiceModule.getVisit,
  getAllCachedVisits: visitServiceModule.getAllCachedVisits,
  getVisitsByNurse: visitServiceModule.getVisitsByNurse,
  getVisitsByPatient: visitServiceModule.getVisitsByPatient,
  getPendingVisits: visitServiceModule.getPendingVisits,
  
  // Subscriptions
  subscribeToVisit: visitServiceModule.subscribeToVisit,
  subscribeToAllVisits: visitServiceModule.subscribeToAllVisits,
  
  // Cache management
  populateVisitCache: visitServiceModule.populateVisitCache,
  clearVisitCache: visitServiceModule.clearVisitCache,
  
  // Initialization
  initialize: visitServiceModule.initializeVisitService,
};

// Also export individual functions for tree-shaking
export {
  createVisitDraft,
  updateVisit,
  submitVisit,
  getVisit,
  getAllCachedVisits,
  getVisitsByNurse,
  getVisitsByPatient,
  getPendingVisits,
  subscribeToVisit,
  subscribeToAllVisits,
  populateVisitCache,
  clearVisitCache,
  initializeVisitService,
} from './visitService';

// ============================================================================
// VITALS SERVICE
// ============================================================================

import * as vitalsServiceModule from './vitalsService';

export const vitalsService = {
  // Operations
  recordVitals: vitalsServiceModule.recordVitals,
  updateVitals: vitalsServiceModule.updateVitals,
  
  // Queries
  getVitals: vitalsServiceModule.getVitals,
  getVitalsByPatient: vitalsServiceModule.getVitalsByPatient,
  getRecentVitals: vitalsServiceModule.getRecentVitals,
  getLatestVitals: vitalsServiceModule.getLatestVitals,
  getVitalsByVisit: vitalsServiceModule.getVitalsByVisit,
  getPendingVitals: vitalsServiceModule.getPendingVitals,
  getVitalsInRange: vitalsServiceModule.getVitalsInRange,
  
  // Subscriptions
  subscribeToPatientVitals: vitalsServiceModule.subscribeToPatientVitals,
  subscribeToAllVitals: vitalsServiceModule.subscribeToAllVitals,
  
  // Cache management
  populateVitalsCache: vitalsServiceModule.populateVitalsCache,
  clearVitalsCache: vitalsServiceModule.clearVitalsCache,
  cleanupOldVitals: vitalsServiceModule.cleanupOldVitals,
  
  // Initialization
  initialize: vitalsServiceModule.initializeVitalsService,
};

// Also export individual functions for tree-shaking
export {
  recordVitals,
  updateVitals,
  getVitals,
  getVitalsByPatient,
  getRecentVitals,
  getLatestVitals,
  getVitalsByVisit,
  getPendingVitals,
  getVitalsInRange,
  subscribeToPatientVitals,
  subscribeToAllVitals,
  populateVitalsCache,
  clearVitalsCache,
  cleanupOldVitals,
  initializeVitalsService,
} from './vitalsService';

// ============================================================================
// ASSESSMENT SERVICE
// ============================================================================

import * as assessmentServiceModule from './assessmentService';

export const assessmentService = {
  // Operations
  createAssessment: assessmentServiceModule.createAssessment,
  updateAssessment: assessmentServiceModule.updateAssessment,
  
  // Queries
  getAssessment: assessmentServiceModule.getAssessment,
  getAssessmentsByPatient: assessmentServiceModule.getAssessmentsByPatient,
  getRecentAssessments: assessmentServiceModule.getRecentAssessments,
  getLatestAssessment: assessmentServiceModule.getLatestAssessment,
  getAssessmentsByVisit: assessmentServiceModule.getAssessmentsByVisit,
  getPendingAssessments: assessmentServiceModule.getPendingAssessments,
  getCriticalAssessments: assessmentServiceModule.getCriticalAssessments,
  getAssessmentsWithAlerts: assessmentServiceModule.getAssessmentsWithAlerts,
  
  // Subscriptions
  subscribeToPatientAssessments: assessmentServiceModule.subscribeToPatientAssessments,
  subscribeToAllAssessments: assessmentServiceModule.subscribeToAllAssessments,
  
  // Cache management
  populateAssessmentCache: assessmentServiceModule.populateAssessmentCache,
  clearAssessmentCache: assessmentServiceModule.clearAssessmentCache,
  cleanupOldAssessments: assessmentServiceModule.cleanupOldAssessments,
  
  // Initialization
  initialize: assessmentServiceModule.initializeAssessmentService,
};

// Also export individual functions for tree-shaking
export {
  createAssessment,
  updateAssessment,
  getAssessment,
  getAssessmentsByPatient,
  getRecentAssessments,
  getLatestAssessment,
  getAssessmentsByVisit,
  getPendingAssessments,
  getCriticalAssessments,
  getAssessmentsWithAlerts,
  subscribeToPatientAssessments,
  subscribeToAllAssessments,
  populateAssessmentCache,
  clearAssessmentCache,
  cleanupOldAssessments,
  initializeAssessmentService,
} from './assessmentService';

// ============================================================================
// UNIFIED INITIALIZATION
// ============================================================================

/**
 * Initialize all offline services
 * Call on app startup after authentication
 */
export function initializeOfflineServices(): void {
  console.log('🚀 Initializing offline services...');
  
  // Initialize queue manager first
  initializeQueueManager();
  
  // Initialize individual services (registers mutation executors)
  visitService.initialize();
  vitalsService.initialize();
  assessmentService.initialize();
  
  // Setup network listener for automatic sync
  setupNetworkListener();
  
  console.log('✅ Offline services initialized');
}

/**
 * Cleanup all offline services
 * Call on logout
 */
export function cleanupOfflineServices(): void {
  console.log('🧹 Cleaning up offline services...');
  
  // Clear service caches
  visitService.clearVisitCache();
  vitalsService.clearVitalsCache();
  assessmentService.clearAssessmentCache();
  
  // Cleanup queue manager
  cleanupQueueManager();
  
  console.log('✅ Offline services cleaned up');
}

/**
 * Get combined pending count across all services
 */
export function getTotalPendingCount(): number {
  return (
    visitService.getPendingVisits().length +
    vitalsService.getPendingVitals().length +
    assessmentService.getPendingAssessments().length
  );
}

/**
 * Run cleanup on old data across all services
 * Call periodically (e.g., daily)
 */
export function runDataCleanup(): { vitals: number; assessments: number } {
  console.log('🧹 Running data cleanup...');
  
  const vitals = vitalsService.cleanupOldVitals();
  const assessments = assessmentService.cleanupOldAssessments();
  
  console.log(`🧹 Cleanup complete: ${vitals} vitals, ${assessments} assessments removed`);
  
  return { vitals, assessments };
}

// Import queue manager functions for re-export
import { initializeQueueManager, cleanupQueueManager, setupNetworkListener } from './queueManager';
