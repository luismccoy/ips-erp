# Implementation Plan: Workflow Compliance Frontend

## Overview

This implementation plan connects the React frontend to the Phase 9 backend Lambda functions for the Visit Workflow Compliance system. The plan follows incremental steps, building from shared types and utilities to component-specific implementations.

## Tasks

- [x] 1. Create shared types and utilities for workflow compliance
  - [x] 1.1 Create TypeScript interfaces for Visit, KARDEX, and workflow types in `src/types/workflow.ts`
    - Define VisitStatus, KardexData, VitalsData, MedicationAdminData, TaskCompletionData
    - Define Visit, VisitSummary, NotificationItem interfaces
    - Export all types for use across components
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 1.2 Create workflow API helper functions in `src/api/workflow-api.ts`
    - Implement createVisitDraft(shiftId) wrapper
    - Implement submitVisit(shiftId) wrapper
    - Implement approveVisit(shiftId) wrapper
    - Implement rejectVisit(shiftId, reason) wrapper
    - Implement listApprovedVisitSummaries(patientId) wrapper
    - Handle real/mock backend toggle using isUsingRealBackend()
    - _Requirements: 9.1, 9.2_

  - [ ]* 1.3 Write property test for backend toggle client selection
    - **Property 26: Backend Toggle Client Selection**
    - **Validates: Requirements 9.1, 9.2**

- [x] 2. Implement NotificationBell component
  - [x] 2.1 Create `src/components/NotificationBell.tsx` component
    - Fetch unread notifications on mount
    - Display badge with unread count
    - Render dropdown with notification list
    - Style success notifications (VISIT_APPROVED) and warning notifications (VISIT_REJECTED)
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 2.2 Implement notification click and dismiss handlers
    - Navigate to rejected visit on VISIT_REJECTED click
    - Mark notification as read on dismiss
    - Update unread count after dismiss
    - _Requirements: 4.4, 4.5_

  - [ ]* 2.3 Write property test for notification type display
    - **Property 11: Notification Type Display**
    - **Validates: Requirements 4.2, 4.3**

  - [ ]* 2.4 Write property test for notification dismissal
    - **Property 13: Notification Dismissal**
    - **Validates: Requirements 4.5**

- [x] 3. Checkpoint - Verify shared utilities and NotificationBell
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement KardexForm component
  - [x] 4.1 Create `src/components/KardexForm.tsx` component
    - Render form sections: general observations, skin condition, mobility, nutrition, pain level, mental status, environmental safety, caregiver support, internal notes
    - Implement controlled inputs with onChange callbacks
    - Support disabled state for read-only mode
    - _Requirements: 2.1_

  - [x] 4.2 Implement vitals input section within KardexForm
    - Add inputs for sys, dia, spo2, hr, temperature, weight
    - Validate required fields (sys, dia, spo2, hr)
    - Display validation errors inline
    - _Requirements: 2.2, 2.6_

  - [x] 4.3 Implement medication administration section
    - Add dynamic list for medication entries
    - Capture medicationName, dosage, route, administeredAt
    - Support add/remove medication entries
    - _Requirements: 2.3_

  - [x] 4.4 Implement task completion section
    - Add dynamic list for completed tasks
    - Capture taskDescription, completedAt, notes
    - Support add/remove task entries
    - _Requirements: 2.4_

  - [ ]* 4.5 Write property test for vitals validation completeness
    - **Property 5: Vitals Validation Completeness**
    - **Validates: Requirements 2.2, 2.6**

- [x] 5. Implement VisitDocumentationForm component
  - [x] 5.1 Create `src/components/VisitDocumentationForm.tsx` component
    - Accept shiftId, patientId, patientName props
    - Fetch existing visit draft if exists
    - Render KardexForm with current data
    - Display loading state during fetch
    - _Requirements: 1.3, 9.5_

  - [x] 5.2 Implement save functionality
    - Save KARDEX data to Visit record
    - Maintain DRAFT status on save
    - Display success/error feedback
    - _Requirements: 2.5_

  - [x] 5.3 Implement submit for review functionality
    - Enable "Submit for Review" button when form is complete
    - Call submitVisit mutation on click
    - Display confirmation on success
    - Navigate back to shift list
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ]* 5.4 Write property test for KARDEX save preserves draft status
    - **Property 6: KARDEX Save Preserves Draft Status**
    - **Validates: Requirements 2.5**

  - [ ]* 5.5 Write property test for submit button enablement
    - **Property 7: Submit Button Enablement**
    - **Validates: Requirements 3.1**

- [x] 6. Checkpoint - Verify KardexForm and VisitDocumentationForm
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Update SimpleNurseApp with workflow integration
  - [x] 7.1 Add documentation button to completed shifts
    - Display "Start Documentation" for completed shifts without visit
    - Display "Continue Documentation" for shifts with DRAFT visit
    - Call createVisitDraft on "Start Documentation" click
    - Navigate to VisitDocumentationForm on success
    - _Requirements: 1.1, 1.2, 1.5_

  - [x] 7.2 Add visit status display to shift cards
    - Show "Pending Approval" badge for SUBMITTED visits
    - Show "Rejected" badge with reason for REJECTED visits
    - Show "Approved" badge for APPROVED visits
    - Enable editing for REJECTED visits
    - _Requirements: 3.4, 3.6_

  - [x] 7.3 Integrate NotificationBell in header
    - Add NotificationBell component to header
    - Pass current user ID
    - Handle notification click navigation
    - _Requirements: 4.1_

  - [ ]* 7.4 Write property test for documentation button state
    - **Property 1: Documentation Button State**
    - **Validates: Requirements 1.1, 1.5**

  - [ ]* 7.5 Write property test for submitted visit read-only rendering
    - **Property 9: Submitted Visit Read-Only Rendering**
    - **Validates: Requirements 3.4**

- [x] 8. Checkpoint - Verify SimpleNurseApp workflow integration
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement PendingReviewsPanel component
  - [x] 9.1 Create `src/components/PendingReviewsPanel.tsx` component
    - Fetch all SUBMITTED visits for tenant
    - Display list with nurse name, patient name, visit date, submission timestamp
    - Sort by submittedAt ascending (oldest first)
    - Display empty state when no pending visits
    - _Requirements: 5.1, 5.2, 5.4, 5.5_

  - [x] 9.2 Implement visit detail view
    - Display full KARDEX documentation on visit click
    - Show vitals, medications, tasks
    - Display "Approve" and "Reject" buttons
    - _Requirements: 5.3, 6.1, 7.1_

  - [ ]* 9.3 Write property test for pending reviews filter
    - **Property 14: Pending Reviews Filter**
    - **Validates: Requirements 5.1**

  - [ ]* 9.4 Write property test for pending visits sort order
    - **Property 16: Pending Visits Sort Order**
    - **Validates: Requirements 5.5**

- [x] 10. Implement ApprovalModal and RejectionModal components
  - [x] 10.1 Create `src/components/ApprovalModal.tsx` component
    - Display visit summary for confirmation
    - Call approveVisit mutation on confirm
    - Display loading state during mutation
    - Close modal and refresh list on success
    - _Requirements: 6.2, 6.3_

  - [x] 10.2 Create `src/components/RejectionModal.tsx` component
    - Display visit summary and reason input
    - Validate reason is not empty
    - Call rejectVisit mutation with reason on confirm
    - Display loading state during mutation
    - Close modal and refresh list on success
    - _Requirements: 7.2, 7.3, 7.4, 7.5_

  - [ ]* 10.3 Write property test for rejection reason required
    - **Property 20: Rejection Reason Required**
    - **Validates: Requirements 7.5**

  - [ ]* 10.4 Write property test for pending list update after admin action
    - **Property 21: Pending List Update After Admin Action**
    - **Validates: Requirements 6.3, 7.4**

- [x] 11. Update AdminDashboard with workflow integration
  - [x] 11.1 Add "Pending Reviews" navigation item
    - Add new NavItem for "Pending Reviews" view
    - Set view state to 'pending-reviews' on click
    - _Requirements: 5.1_

  - [x] 11.2 Integrate PendingReviewsPanel in AdminDashboard
    - Render PendingReviewsPanel when view is 'pending-reviews'
    - Pass tenantId from context
    - _Requirements: 5.1_

  - [x] 11.3 Integrate NotificationBell in header
    - Add NotificationBell component to admin header
    - Show VISIT_PENDING_REVIEW notifications
    - _Requirements: 4.1_

  - [ ]* 11.4 Write property test for admin action buttons visibility
    - **Property 17: Admin Action Buttons Visibility**
    - **Validates: Requirements 6.1, 7.1**

- [x] 12. Checkpoint - Verify AdminDashboard workflow integration
  - Ensure all tests pass, ask the user if questions arise.

- [x] 13. Update FamilyPortal with approved visits
  - [x] 13.1 Replace vitals history with approved visit summaries
    - Call listApprovedVisitSummariesForFamily on mount
    - Display visit date, nurse name, overall status
    - Sort by visitDate descending (most recent first)
    - Display empty state when no approved visits
    - _Requirements: 8.1, 8.2, 8.5, 8.6_

  - [x] 13.2 Implement visit summary detail view
    - Display sanitized summary on visit click
    - Show key activities and next visit date
    - Ensure no raw vitals or internal notes displayed
    - _Requirements: 8.3, 8.4_

  - [ ]* 13.3 Write property test for family data sanitization
    - **Property 24: Family Data Sanitization**
    - **Validates: Requirements 8.3**

  - [ ]* 13.4 Write property test for family visits sort order
    - **Property 25: Family Visits Sort Order**
    - **Validates: Requirements 8.6**

- [x] 14. Implement error handling and loading states
  - [x] 14.1 Add loading state components
    - Create reusable LoadingSpinner component
    - Add loading states to all async operations
    - _Requirements: 9.5_

  - [x] 14.2 Add error handling with retry
    - Create reusable ErrorDisplay component with retry button
    - Handle network, auth, validation, and server errors
    - Implement retry logic for failed operations
    - _Requirements: 9.4, 9.6_

  - [ ]* 14.3 Write property test for loading state display
    - **Property 27: Loading State Display**
    - **Validates: Requirements 9.5**

  - [ ]* 14.4 Write property test for error retry option
    - **Property 28: Error Retry Option**
    - **Validates: Requirements 9.6**

- [x] 15. Update mock client for development mode
  - [x] 15.1 Add Visit model to mock client
    - Add Visit to StoreType and MockClient interface
    - Implement CRUD operations for Visit
    - Add mock data for testing
    - _Requirements: 9.2_

  - [x] 15.2 Add workflow mutations to mock client
    - Implement createVisitDraftFromShift mock
    - Implement submitVisit mock
    - Implement approveVisit mock
    - Implement rejectVisit mock
    - Implement listApprovedVisitSummariesForFamily mock
    - _Requirements: 9.2_

- [x] 16. Final checkpoint - Full integration testing
  - Ensure all tests pass, ask the user if questions arise.
  - Verify nurse workflow: create draft → fill KARDEX → submit
  - Verify admin workflow: review → approve/reject
  - Verify family workflow: view approved summaries only
  - Test with both real backend and mock mode

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- All components must respect the `VITE_USE_REAL_BACKEND` environment variable
