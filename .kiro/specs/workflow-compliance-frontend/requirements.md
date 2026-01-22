# Requirements Document

## Introduction

This document defines the requirements for integrating the Visit Workflow Compliance system into the IPS ERP frontend. The backend (Phase 9) has implemented a visit state machine with Lambda functions for state transitions, audit logging, and family-safe data visibility. This phase connects the React frontend components to these backend services, enabling nurses to document visits, admins to approve/reject them, and families to view approved summaries.

## Glossary

- **Visit**: A clinical documentation record created from a completed shift, following the state machine: DRAFT → SUBMITTED → REJECTED/APPROVED
- **KARDEX**: Structured clinical notes used in Colombian healthcare (IPS) for documenting patient care
- **Shift**: A scheduled work assignment for a nurse with a specific patient
- **Tenant**: A home care agency (IPS) in the multi-tenant SaaS system
- **Visit_State_Machine**: The workflow enforcing visit lifecycle transitions
- **Nurse_Dashboard**: The frontend component where nurses manage their shifts and visits
- **Admin_Dashboard**: The frontend component where admins review and approve/reject visits
- **Family_Portal**: The frontend component where family members view approved visit summaries
- **GraphQL_Client**: The Amplify-generated client for executing queries and mutations

## Requirements

### Requirement 1: Nurse Visit Draft Creation

**User Story:** As a nurse, I want to create a visit draft from a completed shift, so that I can document the clinical care I provided.

#### Acceptance Criteria

1. WHEN a nurse views a completed shift THEN the Nurse_Dashboard SHALL display a "Start Documentation" button
2. WHEN a nurse clicks "Start Documentation" on a completed shift THEN the System SHALL call the createVisitDraftFromShift mutation with the shiftId
3. WHEN the createVisitDraftFromShift mutation succeeds THEN the Nurse_Dashboard SHALL navigate to the visit documentation form
4. IF the createVisitDraftFromShift mutation fails THEN the Nurse_Dashboard SHALL display an error message with the failure reason
5. WHEN a visit draft already exists for a shift THEN the Nurse_Dashboard SHALL display "Continue Documentation" instead of "Start Documentation"

### Requirement 2: Nurse KARDEX Documentation

**User Story:** As a nurse, I want to fill out the KARDEX clinical documentation, so that I can record vitals, medications, tasks, and clinical notes for the patient visit.

#### Acceptance Criteria

1. WHEN a nurse opens a DRAFT visit THEN the System SHALL display the KARDEX documentation form with sections for vitals, medications, tasks, and clinical notes
2. WHEN a nurse enters vital signs THEN the System SHALL validate that required fields (temperature, bloodPressure, heartRate, oxygenSaturation) are provided
3. WHEN a nurse records medication administration THEN the System SHALL capture medicationName, dosage, route, and administeredAt timestamp
4. WHEN a nurse marks tasks as completed THEN the System SHALL record taskName, completedAt timestamp, and optional notes
5. WHEN a nurse saves the KARDEX THEN the System SHALL update the Visit record while maintaining DRAFT status
6. IF validation fails on any KARDEX field THEN the System SHALL highlight the invalid field and display a specific error message

### Requirement 3: Nurse Visit Submission

**User Story:** As a nurse, I want to submit a completed visit for admin review, so that my documentation can be approved and become part of the official record.

#### Acceptance Criteria

1. WHEN a nurse has completed the KARDEX documentation THEN the Nurse_Dashboard SHALL enable a "Submit for Review" button
2. WHEN a nurse clicks "Submit for Review" THEN the System SHALL call the submitVisit mutation with the visitId
3. WHEN the submitVisit mutation succeeds THEN the Nurse_Dashboard SHALL display a confirmation message and update the visit status to SUBMITTED
4. WHEN a visit is in SUBMITTED status THEN the Nurse_Dashboard SHALL display the visit as read-only with "Pending Approval" badge
5. IF the submitVisit mutation fails THEN the Nurse_Dashboard SHALL display an error message and keep the visit editable
6. WHEN a nurse views a REJECTED visit THEN the Nurse_Dashboard SHALL display the rejection reason and enable editing

### Requirement 4: Nurse Notification Handling

**User Story:** As a nurse, I want to receive notifications when my visits are approved or rejected, so that I can take appropriate action.

#### Acceptance Criteria

1. WHEN a nurse logs into the Nurse_Dashboard THEN the System SHALL fetch and display unread notifications
2. WHEN a visit is approved THEN the Nurse_Dashboard SHALL display a success notification with the visit details
3. WHEN a visit is rejected THEN the Nurse_Dashboard SHALL display a warning notification with the rejection reason
4. WHEN a nurse clicks on a rejection notification THEN the Nurse_Dashboard SHALL navigate to the rejected visit for correction
5. WHEN a nurse dismisses a notification THEN the System SHALL mark it as read

### Requirement 5: Admin Pending Visits Review

**User Story:** As an admin, I want to see all visits pending my review, so that I can approve or reject nurse documentation in a timely manner.

#### Acceptance Criteria

1. WHEN an admin opens the Admin_Dashboard THEN the System SHALL display a "Pending Reviews" section with all SUBMITTED visits
2. WHEN displaying pending visits THEN the Admin_Dashboard SHALL show nurse name, patient name, visit date, and submission timestamp
3. WHEN an admin clicks on a pending visit THEN the Admin_Dashboard SHALL display the full KARDEX documentation for review
4. WHEN there are no pending visits THEN the Admin_Dashboard SHALL display an empty state message
5. THE Admin_Dashboard SHALL sort pending visits by submission timestamp (oldest first)

### Requirement 6: Admin Visit Approval

**User Story:** As an admin, I want to approve a visit after reviewing the documentation, so that it becomes part of the official record and visible to family members.

#### Acceptance Criteria

1. WHEN an admin reviews a SUBMITTED visit THEN the Admin_Dashboard SHALL display an "Approve" button
2. WHEN an admin clicks "Approve" THEN the System SHALL call the approveVisit mutation with the visitId
3. WHEN the approveVisit mutation succeeds THEN the Admin_Dashboard SHALL display a success message and remove the visit from pending list
4. WHEN a visit is approved THEN the System SHALL create an audit log entry and notification for the nurse
5. IF the approveVisit mutation fails THEN the Admin_Dashboard SHALL display an error message and keep the visit in pending state

### Requirement 7: Admin Visit Rejection

**User Story:** As an admin, I want to reject a visit with a reason, so that the nurse can correct the documentation and resubmit.

#### Acceptance Criteria

1. WHEN an admin reviews a SUBMITTED visit THEN the Admin_Dashboard SHALL display a "Reject" button
2. WHEN an admin clicks "Reject" THEN the Admin_Dashboard SHALL display a modal requiring a rejection reason
3. WHEN an admin submits a rejection with a reason THEN the System SHALL call the rejectVisit mutation with visitId and reason
4. WHEN the rejectVisit mutation succeeds THEN the Admin_Dashboard SHALL display a confirmation and remove the visit from pending list
5. IF the admin attempts to reject without providing a reason THEN the Admin_Dashboard SHALL display a validation error
6. WHEN a visit is rejected THEN the System SHALL create an audit log entry and notification for the nurse

### Requirement 8: Family Approved Visits View

**User Story:** As a family member, I want to view approved visit summaries for my relative, so that I can stay informed about their care without seeing raw clinical data.

#### Acceptance Criteria

1. WHEN a family member opens the Family_Portal THEN the System SHALL call listApprovedVisitSummariesForFamily query
2. WHEN displaying approved visits THEN the Family_Portal SHALL show visit date, nurse name, and high-level care summary
3. THE Family_Portal SHALL NOT display raw vitals, internal clinical notes, or medication details
4. WHEN a family member selects a visit THEN the Family_Portal SHALL display the sanitized visit summary
5. WHEN there are no approved visits THEN the Family_Portal SHALL display an appropriate empty state message
6. THE Family_Portal SHALL sort visits by date (most recent first)

### Requirement 9: Real Backend Integration

**User Story:** As a developer, I want all workflow components to use the real backend when configured, so that the application works with production data.

#### Acceptance Criteria

1. WHEN VITE_USE_REAL_BACKEND is true THEN all workflow components SHALL use the GraphQL_Client to call real mutations and queries
2. WHEN VITE_USE_REAL_BACKEND is false THEN all workflow components SHALL use mock data for development
3. THE System SHALL extract tenantId from Cognito claims for all backend calls
4. THE System SHALL handle authentication errors by redirecting to login
5. THE System SHALL display loading states while backend calls are in progress
6. IF a backend call fails THEN the System SHALL display a user-friendly error message with retry option
