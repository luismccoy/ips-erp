/**
 * Workflow API Helper Functions
 * 
 * Wrapper functions for the Visit Workflow Compliance GraphQL operations.
 * These functions handle the real/mock backend toggle and provide typed interfaces
 * for the workflow state machine operations.
 * 
 * Requirements: 9.1, 9.2
 * 
 * GraphQL Operations:
 * - createVisitDraftFromShift: Creates a DRAFT visit from a completed shift
 * - submitVisit: Transitions DRAFT/REJECTED → SUBMITTED
 * - approveVisit: Transitions SUBMITTED → APPROVED (admin only)
 * - rejectVisit: Transitions SUBMITTED → REJECTED (admin only)
 * - listApprovedVisitSummariesForFamily: Queries approved visit summaries for family view
 */

import { generateClient } from 'aws-amplify/data';
import { isUsingRealBackend } from '../amplify-utils';
import type { VisitSummary } from '../types/workflow';

// ============================================================================
// GraphQL Operation Definitions
// ============================================================================

/**
 * Mutation to create a visit draft from a completed shift.
 * Returns the created visit ID (same as shiftId due to 1:1 relationship).
 */
const createVisitDraftFromShiftMutation = /* GraphQL */ `
  mutation CreateVisitDraftFromShift($shiftId: ID!) {
    createVisitDraftFromShift(shiftId: $shiftId)
  }
`;

/**
 * Mutation to submit a visit for admin review.
 * Transitions visit from DRAFT or REJECTED to SUBMITTED status.
 */
const submitVisitMutation = /* GraphQL */ `
  mutation SubmitVisit($shiftId: ID!) {
    submitVisit(shiftId: $shiftId)
  }
`;

/**
 * Mutation to approve a submitted visit.
 * Transitions visit from SUBMITTED to APPROVED status.
 * Only admins can perform this action.
 */
const approveVisitMutation = /* GraphQL */ `
  mutation ApproveVisit($shiftId: ID!) {
    approveVisit(shiftId: $shiftId)
  }
`;

/**
 * Mutation to reject a submitted visit with a reason.
 * Transitions visit from SUBMITTED to REJECTED status.
 * Only admins can perform this action.
 */
const rejectVisitMutation = /* GraphQL */ `
  mutation RejectVisit($shiftId: ID!, $reason: String!) {
    rejectVisit(shiftId: $shiftId, reason: $reason)
  }
`;

/**
 * Query to list approved visit summaries for family members.
 * Returns sanitized visit data without sensitive clinical information.
 */
const listApprovedVisitSummariesQuery = /* GraphQL */ `
  query ListApprovedVisitSummariesForFamily($patientId: ID!) {
    listApprovedVisitSummariesForFamily(patientId: $patientId) {
      visitDate
      nurseName
      duration
      overallStatus
      keyActivities
      nextVisitDate
    }
  }
`;

// ============================================================================
// Response Types
// ============================================================================

/**
 * Response type for workflow mutations.
 */
export interface WorkflowMutationResponse {
  success: boolean;
  data?: string;
  error?: string;
}

/**
 * Response type for listing approved visit summaries.
 */
export interface ListApprovedVisitSummariesResponse {
  success: boolean;
  data?: VisitSummary[];
  error?: string;
}

// ============================================================================
// Mock Data for Development Mode
// ============================================================================

/**
 * Mock visit summaries for development mode.
 */
const MOCK_VISIT_SUMMARIES: VisitSummary[] = [
  {
    visitDate: '2026-01-20',
    nurseName: 'Maria Rodriguez',
    duration: 45,
    overallStatus: 'Paciente estable, signos vitales normales',
    keyActivities: ['Control de signos vitales', 'Administración de medicamentos', 'Curación de herida'],
    nextVisitDate: '2026-01-22'
  },
  {
    visitDate: '2026-01-18',
    nurseName: 'Maria Rodriguez',
    duration: 60,
    overallStatus: 'Mejoría en movilidad, continuar terapia',
    keyActivities: ['Terapia física', 'Control de dolor', 'Educación al cuidador'],
    nextVisitDate: '2026-01-20'
  },
  {
    visitDate: '2026-01-15',
    nurseName: 'Pedro Claver',
    duration: 50,
    overallStatus: 'Evaluación inicial completada',
    keyActivities: ['Evaluación integral', 'Plan de cuidados establecido', 'Coordinación con médico tratante'],
    nextVisitDate: '2026-01-18'
  }
];

// ============================================================================
// API Helper Functions
// ============================================================================

/**
 * Creates a visit draft from a completed shift.
 * 
 * This function initiates the visit documentation workflow by creating a DRAFT
 * visit record linked to the specified shift. The visit ID will be the same as
 * the shiftId (1:1 relationship).
 * 
 * @param shiftId - The ID of the completed shift to create a visit draft for
 * @returns Promise with success status and visit ID or error message
 * 
 * @example
 * const result = await createVisitDraft('shift-123');
 * if (result.success) {
 *   console.log('Visit draft created:', result.data);
 * } else {
 *   console.error('Failed:', result.error);
 * }
 */
export async function createVisitDraft(shiftId: string): Promise<WorkflowMutationResponse> {
  if (!isUsingRealBackend()) {
    // Mock mode: simulate successful draft creation
    console.log('[Mock] Creating visit draft for shift:', shiftId);
    await simulateNetworkDelay();
    return {
      success: true,
      data: shiftId // Visit ID is same as shift ID
    };
  }

  try {
    const client = generateClient({ authMode: 'userPool' });
    const response = await client.graphql({
      query: createVisitDraftFromShiftMutation,
      variables: { shiftId }
    });

    const result = (response as any).data?.createVisitDraftFromShift;
    
    if (result) {
      return {
        success: true,
        data: result
      };
    } else {
      return {
        success: false,
        error: 'No response from createVisitDraftFromShift mutation'
      };
    }
  } catch (error) {
    console.error('Error creating visit draft:', error);
    return {
      success: false,
      error: extractErrorMessage(error)
    };
  }
}

/**
 * Submits a visit for admin review.
 * 
 * This function transitions a visit from DRAFT or REJECTED status to SUBMITTED.
 * Once submitted, the visit becomes read-only for the nurse until approved or rejected.
 * 
 * @param shiftId - The ID of the shift/visit to submit
 * @returns Promise with success status or error message
 * 
 * @example
 * const result = await submitVisit('shift-123');
 * if (result.success) {
 *   console.log('Visit submitted for review');
 * }
 */
export async function submitVisit(shiftId: string): Promise<WorkflowMutationResponse> {
  if (!isUsingRealBackend()) {
    // Mock mode: simulate successful submission
    console.log('[Mock] Submitting visit for shift:', shiftId);
    await simulateNetworkDelay();
    return {
      success: true,
      data: 'Visit submitted successfully'
    };
  }

  try {
    const client = generateClient({ authMode: 'userPool' });
    const response = await client.graphql({
      query: submitVisitMutation,
      variables: { shiftId }
    });

    const result = (response as any).data?.submitVisit;
    
    if (result) {
      return {
        success: true,
        data: result
      };
    } else {
      return {
        success: false,
        error: 'No response from submitVisit mutation'
      };
    }
  } catch (error) {
    console.error('Error submitting visit:', error);
    return {
      success: false,
      error: extractErrorMessage(error)
    };
  }
}

/**
 * Approves a submitted visit.
 * 
 * This function transitions a visit from SUBMITTED to APPROVED status.
 * Only users with admin role can perform this action.
 * Once approved, the visit becomes immutable and visible to family members.
 * 
 * @param shiftId - The ID of the shift/visit to approve
 * @returns Promise with success status or error message
 * 
 * @example
 * const result = await approveVisit('shift-123');
 * if (result.success) {
 *   console.log('Visit approved');
 * }
 */
export async function approveVisit(shiftId: string): Promise<WorkflowMutationResponse> {
  if (!isUsingRealBackend()) {
    // Mock mode: simulate successful approval
    console.log('[Mock] Approving visit for shift:', shiftId);
    await simulateNetworkDelay();
    return {
      success: true,
      data: 'Visit approved successfully'
    };
  }

  try {
    const client = generateClient({ authMode: 'userPool' });
    const response = await client.graphql({
      query: approveVisitMutation,
      variables: { shiftId }
    });

    const result = (response as any).data?.approveVisit;
    
    if (result) {
      return {
        success: true,
        data: result
      };
    } else {
      return {
        success: false,
        error: 'No response from approveVisit mutation'
      };
    }
  } catch (error) {
    console.error('Error approving visit:', error);
    return {
      success: false,
      error: extractErrorMessage(error)
    };
  }
}

/**
 * Rejects a submitted visit with a reason.
 * 
 * This function transitions a visit from SUBMITTED to REJECTED status.
 * Only users with admin role can perform this action.
 * The rejection reason is required and will be displayed to the nurse.
 * 
 * @param shiftId - The ID of the shift/visit to reject
 * @param reason - The reason for rejection (required, cannot be empty)
 * @returns Promise with success status or error message
 * 
 * @example
 * const result = await rejectVisit('shift-123', 'Incomplete vital signs documentation');
 * if (result.success) {
 *   console.log('Visit rejected');
 * }
 */
export async function rejectVisit(shiftId: string, reason: string): Promise<WorkflowMutationResponse> {
  // Validate reason is not empty
  if (!reason || reason.trim() === '') {
    return {
      success: false,
      error: 'Rejection reason is required'
    };
  }

  if (!isUsingRealBackend()) {
    // Mock mode: simulate successful rejection
    console.log('[Mock] Rejecting visit for shift:', shiftId, 'Reason:', reason);
    await simulateNetworkDelay();
    return {
      success: true,
      data: 'Visit rejected successfully'
    };
  }

  try {
    const client = generateClient({ authMode: 'userPool' });
    const response = await client.graphql({
      query: rejectVisitMutation,
      variables: { shiftId, reason: reason.trim() }
    });

    const result = (response as any).data?.rejectVisit;
    
    if (result) {
      return {
        success: true,
        data: result
      };
    } else {
      return {
        success: false,
        error: 'No response from rejectVisit mutation'
      };
    }
  } catch (error) {
    console.error('Error rejecting visit:', error);
    return {
      success: false,
      error: extractErrorMessage(error)
    };
  }
}

/**
 * Lists approved visit summaries for a patient (family view).
 * 
 * This function retrieves sanitized visit summaries that are safe for family
 * members to view. Only APPROVED visits are returned, and sensitive clinical
 * data (raw vitals, internal notes, medication details) is excluded.
 * 
 * @param patientId - The ID of the patient to get visit summaries for
 * @returns Promise with success status and array of visit summaries or error message
 * 
 * @example
 * const result = await listApprovedVisitSummaries('patient-123');
 * if (result.success && result.data) {
 *   result.data.forEach(summary => {
 *     console.log(`Visit on ${summary.visitDate} by ${summary.nurseName}`);
 *   });
 * }
 */
export async function listApprovedVisitSummaries(patientId: string): Promise<ListApprovedVisitSummariesResponse> {
  if (!isUsingRealBackend()) {
    // Mock mode: return mock visit summaries
    console.log('[Mock] Listing approved visit summaries for patient:', patientId);
    await simulateNetworkDelay();
    return {
      success: true,
      data: MOCK_VISIT_SUMMARIES
    };
  }

  try {
    const client = generateClient({ authMode: 'userPool' });
    const response = await client.graphql({
      query: listApprovedVisitSummariesQuery,
      variables: { patientId }
    });

    const result = (response as any).data?.listApprovedVisitSummariesForFamily;
    
    if (result) {
      // Parse the result if it's a JSON string
      const summaries = typeof result === 'string' ? JSON.parse(result) : result;
      return {
        success: true,
        data: Array.isArray(summaries) ? summaries : []
      };
    } else {
      return {
        success: true,
        data: []
      };
    }
  } catch (error) {
    console.error('Error listing approved visit summaries:', error);
    return {
      success: false,
      error: extractErrorMessage(error)
    };
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Simulates network delay for mock mode.
 * Provides realistic UX during development.
 */
export async function simulateNetworkDelay(minMs: number = 300, maxMs: number = 800): Promise<void> {
  const delay = Math.random() * (maxMs - minMs) + minMs;
  await new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Extracts a user-friendly error message from various error types.
 */
function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Check for GraphQL errors
    if ('errors' in error && Array.isArray((error as any).errors)) {
      const graphqlErrors = (error as any).errors;
      if (graphqlErrors.length > 0) {
        return graphqlErrors.map((e: any) => e.message).join('; ');
      }
    }
    return error.message;
  }
  
  if (typeof error === 'object' && error !== null) {
    // Handle Amplify GraphQL error format
    if ('errors' in error && Array.isArray((error as any).errors)) {
      const errors = (error as any).errors;
      if (errors.length > 0) {
        return errors.map((e: any) => e.message || String(e)).join('; ');
      }
    }
    // Handle error with message property
    if ('message' in error) {
      return String((error as any).message);
    }
  }
  
  return String(error);
}

// ============================================================================
// Re-export for convenience
// ============================================================================

export { isUsingRealBackend };
