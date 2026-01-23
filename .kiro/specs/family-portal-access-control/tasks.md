# Implementation Plan: Family Portal Access Control

## Overview

This implementation plan converts the Family Portal Access Control design into discrete coding tasks. The approach prioritizes security by implementing server-side validation first, then updating the frontend to use the secure authentication flow. All tasks build incrementally, with checkpoints to ensure correctness before proceeding.

The implementation modifies 1 Lambda function and 2 frontend components, maintaining the minimal file count principle. No new Lambda functions or DynamoDB tables are created.

## Tasks

- [ ] 1. Set up Lambda dependencies and utilities
  - Install bcryptjs package in listApprovedVisitSummaries Lambda
  - Create access code generation utility function (6-8 chars, alphanumeric)
  - Create access code validation utility function (bcrypt.compare wrapper)
  - _Requirements: 1.3, 1.5, 2.1_

- [ ] 2. Implement server-side access code validation in Lambda
  - [ ] 2.1 Update Lambda handler signature to accept documentId and accessCode
    - Modify event.arguments to include documentId and accessCode
    - Extract ipAddress and userAgent from event.request.headers
    - _Requirements: 2.1, 2.2, 4.3_
  
  - [ ] 2.2 Implement patient lookup by documentId with tenantId filtering
    - Query Patient table using documentId GSI
    - Filter results by tenantId for multi-tenant isolation
    - Handle case where patient not found (return null)
    - _Requirements: 2.2, 7.1_
  
  - [ ] 2.3 Implement access code hash verification
    - Use bcrypt.compare() to validate submitted code against stored hash
    - Handle null/undefined accessCode field gracefully
    - Return boolean result (valid/invalid)
    - _Requirements: 1.5, 2.1, 10.5_
  
  - [ ] 2.4 Update Lambda to return generic error messages
    - Replace specific error messages with generic "Invalid credentials"
    - Ensure no information leakage about patient existence
    - Return consistent error format for all failure cases
    - _Requirements: 2.3, 8.3_

- [ ] 3. Implement rate limiting logic in Lambda
  - [ ] 3.1 Create rate limit check function
    - Query AuditLog table for failed attempts from IP in last 15 minutes
    - Count failed attempts (filter by action = "FAMILY_PORTAL_AUTH_FAILURE")
    - Return true if under limit (< 5), false if blocked
    - _Requirements: 5.1, 5.5_
  
  - [ ] 3.2 Implement rate limit enforcement
    - Call rate limit check before authentication
    - Return RATE_LIMIT_EXCEEDED error if blocked
    - Include remainingAttempts in error response
    - _Requirements: 5.1, 5.2, 5.6_
  
  - [ ] 3.3 Track failed attempts in AuditLog
    - Create AuditLog entry on each failed authentication
    - Include ipAddress, userAgent, timestamp
    - Set severity = "HIGH" when rate limit triggered
    - _Requirements: 4.1, 4.4, 5.4_

- [ ] 4. Implement audit logging for all access attempts
  - [ ] 4.1 Create audit log helper function
    - Accept parameters: patientId, tenantId, success, ipAddress, userAgent, details
    - Generate AuditLog entry with all required fields
    - Set action = "FAMILY_PORTAL_AUTH_SUCCESS" or "FAMILY_PORTAL_AUTH_FAILURE"
    - _Requirements: 4.1, 4.2, 4.6_
  
  - [ ] 4.2 Log successful authentication attempts
    - Call audit log helper on successful validation
    - Include patient ID and visit count in details
    - Set severity = "LOW" for successful attempts
    - _Requirements: 4.1, 4.3_
  
  - [ ] 4.3 Log failed authentication attempts
    - Call audit log helper on validation failure
    - Include failure reason in details (without revealing sensitive info)
    - Set severity = "MEDIUM" for normal failures, "HIGH" for rate limit
    - _Requirements: 4.2, 4.4_

- [ ] 5. Update GraphQL schema for new authentication flow
  - Modify listApprovedVisitSummariesForFamily query arguments
  - Add documentId: a.string().required()
  - Add accessCode: a.string().required()
  - Keep patientId as optional (for backward compatibility)
  - Deploy schema changes to sandbox
  - _Requirements: 2.1, 2.2_

- [ ] 6. Checkpoint - Test Lambda authentication flow
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Update FamilyPortal.tsx component
  - [ ] 7.1 Add state management for authentication
    - Add useState for documentId, accessCode, authError, isLoading
    - Add useState for session management (authenticated, sessionExpiry)
    - Remove mock access code (1234) logic
    - _Requirements: 3.1, 3.5_
  
  - [ ] 7.2 Implement authentication form UI
    - Add input field for patient document ID (cédula)
    - Update access code input field
    - Add loading spinner during authentication
    - Add Spanish labels and placeholders
    - _Requirements: 3.1, 8.1, 8.2_
  
  - [ ] 7.3 Implement authentication handler
    - Call listApprovedVisitSummariesForFamily with documentId and accessCode
    - Handle success: set authenticated state, store patient data
    - Handle errors: display Spanish error messages
    - Handle rate limit: show 30-minute wait message
    - _Requirements: 3.2, 3.3, 3.4, 8.3_
  
  - [ ] 7.4 Implement session timeout logic
    - Set 30-minute timer on successful authentication
    - Clear session on timeout
    - Show notification before redirecting to login
    - _Requirements: 3.5, 3.6, 8.4_
  
  - [ ] 7.5 Add logout functionality
    - Create logout button
    - Clear authenticated state and patient data
    - Return to login screen
    - _Requirements: 8.6_

- [ ] 8. Update PatientDashboard.tsx for access code management
  - [ ] 8.1 Create access code generation utility
    - Generate random 6-8 character alphanumeric code
    - Ensure at least 1 uppercase, 1 lowercase, 1 number
    - Hash code with bcrypt (cost factor 10)
    - _Requirements: 1.1, 1.3, 1.5_
  
  - [ ] 8.2 Add access code generation button to patient form
    - Add "Generar Código de Acceso" button
    - Show button only for Admin role
    - Disable button if patient has no documentId
    - _Requirements: 1.1, 9.1_
  
  - [ ] 8.3 Implement access code display modal
    - Show generated code in large, readable font
    - Add copy-to-clipboard button with visual confirmation
    - Display patient documentId for reference
    - Add print button for phone-based sharing
    - Show instructions for sharing with family
    - _Requirements: 1.6, 9.1, 9.2, 9.3, 9.4, 9.6_
  
  - [ ] 8.4 Implement access code regeneration
    - Add "Regenerar Código" button in patient edit form
    - Show confirmation dialog warning old code will be invalidated
    - Generate new code and update Patient.accessCode
    - Create AuditLog entry for regeneration
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [ ] 8.5 Display access code metadata
    - Show access code generation date (from Patient.updatedAt)
    - Add indicator if patient has no access code
    - Prompt Admin to generate code for patients without one
    - _Requirements: 6.3, 10.2_

- [ ] 9. Checkpoint - Test frontend authentication flow
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement backward compatibility handling
  - [ ] 10.1 Handle patients with null accessCode
    - Update Lambda to check for null/undefined accessCode field
    - Return specific error message for patients without codes
    - Suggest contacting Admin in error message
    - _Requirements: 10.1, 10.5_
  
  - [ ] 10.2 Add migration prompt in Admin Dashboard
    - Show notification for patients without access codes
    - Provide bulk action to generate codes for all patients
    - Track migration progress
    - _Requirements: 10.2, 10.4_

- [ ]* 11. Write property-based tests for access code validation
  - [ ]* 11.1 Property 1: Access code uniqueness within tenant
    - Generate 1000 random access codes for different patients in same tenant
    - Hash all codes with bcrypt
    - Verify no hash collisions
    - **Property 1: Access code uniqueness within tenant**
    - **Validates: Requirements 1.4**
  
  - [ ]* 11.2 Property 3: Rate limit enforcement
    - Simulate 10 failed attempts from same IP within 15 minutes
    - Verify first 5 attempts processed, next 5 rejected
    - Verify 30-minute block applied after 5th failure
    - **Property 3: Rate limit enforcement**
    - **Validates: Requirements 5.1, 5.2, 5.3**
  
  - [ ]* 11.3 Property 5: Multi-tenant isolation
    - Create patients in Tenant A and Tenant B with same document IDs
    - Generate access codes for both patients
    - Attempt cross-tenant authentication
    - Verify all cross-tenant attempts fail
    - **Property 5: Multi-tenant isolation**
    - **Validates: Requirements 7.1, 7.2, 7.5**
  
  - [ ]* 11.4 Property 6: Access code hash verification
    - Generate 100 random access codes
    - Hash with bcrypt, store in database
    - Verify bcrypt.compare() returns true for correct codes
    - Verify bcrypt.compare() returns false for incorrect codes
    - **Property 6: Access code hash verification**
    - **Validates: Requirements 1.5, 2.1**
  
  - [ ]* 11.5 Property 7: Approved visits only
    - Create visits with all statuses (DRAFT, SUBMITTED, REJECTED, APPROVED)
    - Authenticate as family member
    - Verify only APPROVED visits returned
    - **Property 7: Approved visits only**
    - **Validates: Requirements 2.4**
  
  - [ ]* 11.6 Property 8: Generic error messages
    - Generate authentication attempts with invalid document IDs, invalid codes, non-existent patients
    - Verify all error messages are generic
    - Verify error messages don't reveal patient existence
    - **Property 8: Generic error messages**
    - **Validates: Requirements 2.3, 8.3**
  
  - [ ]* 11.7 Property 10: Access code regeneration invalidation
    - Generate access code for patient
    - Authenticate successfully with code
    - Regenerate access code
    - Attempt authentication with old code
    - Verify old code rejected, new code accepted
    - **Property 10: Access code regeneration invalidation**
    - **Validates: Requirements 6.1, 6.2**

- [ ]* 12. Write unit tests for Lambda functions
  - [ ]* 12.1 Test access code generation utility
    - Test 6-8 character length
    - Test alphanumeric characters only
    - Test at least 1 uppercase, 1 lowercase, 1 number
    - _Requirements: 1.3_
  
  - [ ]* 12.2 Test access code validation
    - Test bcrypt.compare with valid codes
    - Test bcrypt.compare with invalid codes
    - Test null/undefined accessCode handling
    - _Requirements: 1.5, 2.1, 10.1_
  
  - [ ]* 12.3 Test rate limit logic
    - Test under limit (< 5 attempts)
    - Test at limit (= 5 attempts)
    - Test over limit (> 5 attempts)
    - Test 30-minute block expiration
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ]* 12.4 Test audit logging
    - Test successful authentication logging
    - Test failed authentication logging
    - Test rate limit event logging
    - Test all required fields populated
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ]* 12.5 Test multi-tenant isolation
    - Test tenantId filtering in patient lookup
    - Test cross-tenant access prevention
    - _Requirements: 7.1, 7.2_

- [ ]* 13. Write unit tests for frontend components
  - [ ]* 13.1 Test FamilyPortal authentication form
    - Test form validation (required fields)
    - Test loading state during authentication
    - Test error message display
    - Test session timeout
    - _Requirements: 3.1, 3.4, 3.5, 8.2_
  
  - [ ]* 13.2 Test PatientDashboard access code generation
    - Test code generation button visibility (Admin only)
    - Test modal display with generated code
    - Test copy-to-clipboard functionality
    - Test regeneration confirmation dialog
    - _Requirements: 1.1, 9.1, 9.2, 6.1_

- [ ]* 14. Write integration tests
  - [ ]* 14.1 Test end-to-end authentication flow
    - Admin generates access code for patient
    - Family member authenticates with documentId + code
    - Verify approved visits displayed
    - Verify audit log created
    - _Requirements: 1.1, 2.1, 2.4, 4.1_
  
  - [ ]* 14.2 Test rate limiting integration
    - Simulate 5 failed attempts from same IP
    - Verify 6th attempt blocked
    - Wait 30 minutes (or mock time)
    - Verify attempts resume
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ]* 14.3 Test access code lifecycle
    - Generate code
    - Authenticate successfully
    - Regenerate code
    - Verify old code invalid
    - Authenticate with new code
    - _Requirements: 6.1, 6.2_

- [ ] 15. Update API documentation
  - Document new authentication flow in docs/API_DOCUMENTATION.md
  - Add Phase 13 section with Lambda changes
  - Document access code generation process
  - Document rate limiting behavior
  - Add troubleshooting guide for common errors
  - Include Spanish error message translations
  - _Requirements: All_

- [ ] 16. Final checkpoint - Deploy and verify
  - Deploy Lambda changes to sandbox
  - Deploy frontend changes to Amplify
  - Test with real users (Admin, Family)
  - Verify audit logs in DynamoDB
  - Verify rate limiting works
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (100 iterations each)
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end workflows
- All tests should be tagged with feature name and property/requirement numbers
- Lambda modifications maintain existing file structure (no new functions)
- Frontend changes use existing components (no new files)
- Total new files: 0 (only modifications to existing files)

