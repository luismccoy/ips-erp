/**
 * DataStore Models Re-export
 * 
 * This module provides a clean interface to DataStore models
 * for offline-first data access in the Nurse App.
 * 
 * Usage:
 * ```typescript
 * import { VisitModel, PatientModel, ShiftModel } from '../datastore/models';
 * 
 * // Query offline-first
 * const visits = await VisitModel.query(v => v.nurseId.eq(nurseId));
 * 
 * // Create with automatic sync
 * const newVisit = await VisitModel.save(visitData);
 * ```
 * 
 * @see docs/OFFLINE_SYNC_SPEC.md - Section 4: Models Requiring Offline Support
 */

import { DataStore } from '@aws-amplify/datastore';
import type { Schema } from '../../amplify/data/resource';

// Import types from our types files
import type {
  Patient as PatientType,
  Shift as ShiftType,
  VitalSigns as VitalSignsType,
  Nurse as NurseType,
} from '../types';

import type { Visit as VisitType } from '../types/workflow';
import type { PatientAssessment as PatientAssessmentType } from '../types/clinical-scales';

// Note: In Amplify Gen 2, DataStore models are generated differently
// This file provides a wrapper interface for consistent offline access

/**
 * Local sync status extension for offline tracking
 */
export interface OfflineMetadata {
  _syncStatus: 'synced' | 'pending' | 'error';
  _localVersion: number;
  _createdOffline?: boolean;
  _lastSyncAttempt?: string;
  _syncError?: string;
}

/**
 * Visit model with offline metadata
 * Priority: CRITICAL - Core nursing documentation
 * 
 * Extends the base Visit type with offline tracking metadata.
 * The base Visit type is defined in types/workflow.ts
 */
export interface OfflineVisit extends VisitType, Partial<OfflineMetadata> {
  // All fields inherited from VisitType
  // Only offline metadata added
}

/**
 * Patient model with offline metadata
 * Priority: HIGH - Read-only for nurses
 */
export interface OfflinePatient extends PatientType, Partial<OfflineMetadata> {
  id: string;
  tenantId: string;
  name: string;
  documentId: string;
}

/**
 * Shift model with offline metadata
 * Priority: HIGH - Read-only for nurses
 */
export interface OfflineShift extends ShiftType, Partial<OfflineMetadata> {
  id: string;
  tenantId?: string;
  nurseId: string;
  patientId?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | null;
}

/**
 * VitalSigns model with offline metadata
 * Priority: CRITICAL - Nurse creates these offline
 */
export interface OfflineVitalSigns extends VitalSignsType, Partial<OfflineMetadata> {
  id: string;
  tenantId: string;
  patientId: string;
}

/**
 * PatientAssessment model with offline metadata
 * Priority: CRITICAL - Nurse creates these offline
 */
export interface OfflinePatientAssessment extends PatientAssessmentType, Partial<OfflineMetadata> {
  id: string;
  tenantId: string;
  patientId: string;
  nurseId: string;
}

/**
 * Generate a UUID for offline record creation
 */
export function generateOfflineId(): string {
  return 'offline-' + crypto.randomUUID();
}

/**
 * Check if an ID was created offline
 */
export function isOfflineId(id: string): boolean {
  return id.startsWith('offline-');
}

/**
 * Model operation results
 */
export interface ModelOperationResult<T> {
  data: T | null;
  error: Error | null;
  source: 'local' | 'network' | 'optimistic';
}

/**
 * Batch operation result
 */
export interface BatchOperationResult<T> {
  successful: T[];
  failed: Array<{ item: T; error: Error }>;
}
