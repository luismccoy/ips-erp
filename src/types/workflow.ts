/**
 * Workflow Compliance Types
 * 
 * TypeScript interfaces for the Visit Workflow Compliance system.
 * These types support the visit state machine: DRAFT → SUBMITTED → REJECTED/APPROVED
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */

// ============================================================================
// Visit Status Enum
// ============================================================================

/**
 * Visit status enum matching backend state machine.
 * Transitions: DRAFT → SUBMITTED → REJECTED/APPROVED
 * REJECTED visits can be resubmitted (REJECTED → SUBMITTED)
 */
export type VisitStatus = 'DRAFT' | 'SUBMITTED' | 'REJECTED' | 'APPROVED';

// ============================================================================
// Clinical Data Types
// ============================================================================

/**
 * Vitals data structure for recording patient vital signs.
 * Required fields: sys, dia, spo2, hr
 * Optional fields: temperature, weight
 * 
 * Validates: Requirement 2.2
 */
export interface VitalsData {
  /** Systolic blood pressure (mmHg) - REQUIRED */
  sys: number;
  /** Diastolic blood pressure (mmHg) - REQUIRED */
  dia: number;
  /** Oxygen saturation percentage (%) - REQUIRED */
  spo2: number;
  /** Heart rate (beats per minute) - REQUIRED */
  hr: number;
  /** Body temperature (°C) - Optional */
  temperature?: number;
  /** Body weight (kg) - Optional */
  weight?: number;
}

/**
 * Medication administration record.
 * Captures details of medications given during a visit.
 * 
 * Validates: Requirement 2.3
 */
export interface MedicationAdminData {
  /** Name of the medication administered */
  medicationName: string;
  /** Intended dosage as prescribed */
  intendedDosage: string;
  /** Actual dosage given */
  dosageGiven: string;
  /** Time of administration (ISO 8601 datetime) */
  time: string;
  /** Route of administration (e.g., oral, IV, IM) - Optional */
  route?: string;
  /** Additional notes about administration - Optional */
  notes?: string;
}

/**
 * Task completion record.
 * Captures details of care tasks completed during a visit.
 * 
 * Validates: Requirement 2.4
 */
export interface TaskCompletionData {
  /** Description of the completed task */
  taskDescription: string;
  /** Time of completion (ISO 8601 datetime) */
  completedAt: string;
  /** Additional notes about task completion - Optional */
  notes?: string;
}

/**
 * KARDEX data structure.
 * Structured clinical notes used in Colombian healthcare (IPS).
 * Contains comprehensive patient assessment and care documentation.
 * 
 * Validates: Requirement 2.1
 */
export interface KardexData {
  /** General clinical observations - REQUIRED */
  generalObservations: string;
  /** Assessment of patient's skin condition - Optional */
  skinCondition?: string;
  /** Patient's mobility status and limitations - Optional */
  mobilityStatus?: string;
  /** Nutrition and fluid intake assessment - Optional */
  nutritionIntake?: string;
  /** Pain level on scale of 0-10 - Optional */
  painLevel?: number;
  /** Mental/cognitive status assessment - Optional */
  mentalStatus?: string;
  /** Environmental safety assessment - Optional */
  environmentalSafety?: string;
  /** Caregiver support availability and quality - Optional */
  caregiverSupport?: string;
  /** Internal clinical notes (NOT visible to family) - Optional */
  internalNotes?: string;
}

/**
 * Empty KARDEX data structure for initializing new forms.
 * Only generalObservations is required, all other fields are optional.
 */
export const EMPTY_KARDEX: KardexData = {
  generalObservations: '',
  skinCondition: '',
  mobilityStatus: '',
  nutritionIntake: '',
  painLevel: undefined,
  mentalStatus: '',
  environmentalSafety: '',
  caregiverSupport: '',
  internalNotes: '',
};

// ============================================================================
// Visit Types
// ============================================================================

/**
 * Full visit record from backend.
 * Represents a clinical documentation record created from a completed shift.
 * Follows the state machine: DRAFT → SUBMITTED → REJECTED/APPROVED
 */
export interface Visit {
  /** Unique visit identifier (same as shiftId for 1:1 relationship) */
  id: string;
  /** Tenant (home care agency) identifier */
  tenantId: string;
  /** Associated shift identifier */
  shiftId: string;
  /** Patient identifier */
  patientId: string;
  /** Nurse identifier who created the visit */
  nurseId: string;
  /** Current visit status in the state machine */
  status: VisitStatus;
  /** KARDEX clinical documentation */
  kardex: KardexData;
  /** Recorded vital signs - Optional */
  vitalsRecorded?: VitalsData;
  /** List of medications administered - Optional */
  medicationsAdministered?: MedicationAdminData[];
  /** List of tasks completed - Optional */
  tasksCompleted?: TaskCompletionData[];
  /** Timestamp when visit was submitted for review (ISO 8601) - Optional */
  submittedAt?: string;
  /** Timestamp when visit was reviewed (ISO 8601) - Optional */
  reviewedAt?: string;
  /** Admin ID who reviewed the visit - Optional */
  reviewedBy?: string;
  /** Reason for rejection (required when status is REJECTED) - Optional */
  rejectionReason?: string;
  /** Timestamp when visit was approved (ISO 8601) - Optional */
  approvedAt?: string;
  /** Admin ID who approved the visit - Optional */
  approvedBy?: string;
  /** Record creation timestamp (ISO 8601) */
  createdAt?: string;
  /** Record last update timestamp (ISO 8601) */
  updatedAt?: string;
}

/**
 * Visit summary for family view.
 * Sanitized version of visit data that excludes sensitive clinical details.
 * Only approved visits are visible to family members.
 * 
 * Validates: Requirement 8.2, 8.3
 */
export interface VisitSummary {
  /** Date of the visit (ISO 8601 date string) */
  visitDate: string;
  /** Name of the nurse who conducted the visit */
  nurseName: string;
  /** Duration of the visit in minutes - Optional */
  duration?: number;
  /** High-level status summary (e.g., "Patient stable") - Optional */
  overallStatus?: string;
  /** List of key activities performed - Optional */
  keyActivities?: string[];
  /** Scheduled date for next visit (ISO 8601 date string) - Optional */
  nextVisitDate?: string;
}

// ============================================================================
// Notification Types
// ============================================================================

/**
 * Notification type enum for workflow events.
 */
export type NotificationType =
  | 'VISIT_APPROVED'
  | 'VISIT_REJECTED'
  | 'VISIT_PENDING_REVIEW';

/**
 * Notification item for workflow events.
 * Used to notify nurses of approval/rejection and admins of pending reviews.
 * 
 * Validates: Requirement 4.1, 4.2, 4.3
 */
export interface NotificationItem {
  /** Unique notification identifier */
  id: string;
  /** Recipient User ID */
  userId: string;
  /** Type of notification event */
  type: NotificationType;
  /** Human-readable notification message */
  message: string;
  /** ID of the related entity (e.g., visitId) */
  entityId: string;
  /** Type of the related entity (e.g., 'Visit') */
  entityType: string;
  /** Whether the notification has been read */
  read: boolean;
  /** Timestamp when notification was created (ISO 8601) */
  createdAt: string;
}

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Props for VisitDocumentationForm component.
 */
export interface VisitDocumentationFormProps {
  /** ID of the shift to document */
  shiftId: string;
  /** ID of the patient */
  patientId: string;
  /** Name of the patient for display */
  patientName: string;
  /** Callback when form is closed */
  onClose: () => void;
  /** Callback when visit is successfully submitted */
  onSubmitSuccess: () => void;
}

/**
 * State for VisitDocumentationForm component.
 */
export interface VisitFormState {
  /** KARDEX clinical documentation */
  kardex: KardexData;
  /** Vital signs data */
  vitals: VitalsData;
  /** List of medications administered */
  medications: MedicationAdminData[];
  /** List of tasks completed */
  tasks: TaskCompletionData[];
  /** Whether save operation is in progress */
  isSaving: boolean;
  /** Whether submit operation is in progress */
  isSubmitting: boolean;
  /** Error message if any operation failed */
  error: string | null;
}

/**
 * Props for KardexForm component.
 */
export interface KardexFormProps {
  /** Current KARDEX data */
  value: KardexData;
  /** Callback when KARDEX data changes */
  onChange: (kardex: KardexData) => void;
  /** Whether form is in read-only mode */
  disabled?: boolean;
}

/**
 * Props for PendingReviewsPanel component.
 */
export interface PendingReviewsPanelProps {
  /** Tenant ID for filtering visits */
  tenantId: string;
}

/**
 * Pending visit data for admin review.
 */
export interface PendingVisit {
  /** Visit ID */
  id: string;
  /** Associated shift ID */
  shiftId: string;
  /** Patient name for display */
  patientName: string;
  /** Nurse name for display */
  nurseName: string;
  /** Date of the visit */
  visitDate: string;
  /** Timestamp when submitted for review */
  submittedAt: string;
  /** KARDEX clinical documentation */
  kardex: KardexData;
  /** Recorded vital signs */
  vitals: VitalsData;
  /** List of medications administered */
  medications: MedicationAdminData[];
  /** List of tasks completed */
  tasks: TaskCompletionData[];
}

/**
 * Props for ApprovalModal component.
 */
export interface ApprovalModalProps {
  /** Visit to approve */
  visit: PendingVisit;
  /** Callback when approval is confirmed */
  onConfirm: () => Promise<void>;
  /** Callback when modal is cancelled */
  onCancel: () => void;
  /** Whether approval operation is in progress */
  isLoading: boolean;
}

/**
 * Props for RejectionModal component.
 */
export interface RejectionModalProps {
  /** Visit to reject */
  visit: PendingVisit;
  /** Callback when rejection is confirmed with reason */
  onConfirm: (reason: string) => Promise<void>;
  /** Callback when modal is cancelled */
  onCancel: () => void;
  /** Whether rejection operation is in progress */
  isLoading: boolean;
}

/**
 * Props for NotificationBell component.
 */
export interface NotificationBellProps {
  /** User ID to fetch notifications for */
  userId: string;
  /** 
   * Callback when a notification is clicked.
   * For VISIT_REJECTED notifications, the parent component should navigate to the rejected visit.
   * 
   * @param notification - The notification that was clicked
   * 
   * Validates: Requirement 4.4
   */
  onNotificationClick?: (notification: NotificationItem) => void;
}

/**
 * Props for ApprovedVisitSummary component.
 */
export interface ApprovedVisitSummaryProps {
  /** Visit summary to display */
  summary: VisitSummary;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Default empty KARDEX data for initializing forms.
 */
export const DEFAULT_KARDEX: KardexData = {
  generalObservations: '',
  skinCondition: undefined,
  mobilityStatus: undefined,
  nutritionIntake: undefined,
  painLevel: undefined,
  mentalStatus: undefined,
  environmentalSafety: undefined,
  caregiverSupport: undefined,
  internalNotes: undefined,
};

/**
 * Default empty vitals data for initializing forms.
 */
export const DEFAULT_VITALS: VitalsData = {
  sys: 0,
  dia: 0,
  spo2: 0,
  hr: 0,
  temperature: undefined,
  weight: undefined,
};

/**
 * Type guard to check if a visit is editable (DRAFT or REJECTED status).
 */
export function isVisitEditable(visit: Visit): boolean {
  return visit.status === 'DRAFT' || visit.status === 'REJECTED';
}

/**
 * Type guard to check if a visit is pending review (SUBMITTED status).
 */
export function isVisitPendingReview(visit: Visit): boolean {
  return visit.status === 'SUBMITTED';
}

/**
 * Type guard to check if a visit is finalized (APPROVED status).
 */
export function isVisitApproved(visit: Visit): boolean {
  return visit.status === 'APPROVED';
}

/**
 * Validates that required vitals fields are present and valid.
 * Returns array of field names that are invalid.
 */
export function validateVitals(vitals: Partial<VitalsData>): string[] {
  const errors: string[] = [];

  if (vitals.sys === undefined || vitals.sys <= 0) {
    errors.push('sys');
  }
  if (vitals.dia === undefined || vitals.dia <= 0) {
    errors.push('dia');
  }
  if (vitals.spo2 === undefined || vitals.spo2 <= 0 || vitals.spo2 > 100) {
    errors.push('spo2');
  }
  if (vitals.hr === undefined || vitals.hr <= 0) {
    errors.push('hr');
  }

  return errors;
}

/**
 * Validates that required KARDEX fields are present.
 * Returns array of field names that are invalid.
 */
export function validateKardex(kardex: Partial<KardexData>): string[] {
  const errors: string[] = [];

  if (!kardex.generalObservations || kardex.generalObservations.trim() === '') {
    errors.push('generalObservations');
  }

  return errors;
}
