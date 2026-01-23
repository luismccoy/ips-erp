# Implementation Plan: Route Optimizer Lambda

## Overview

This implementation plan breaks down the Route Optimizer Lambda feature into discrete coding tasks. The feature consists of a serverless Lambda function that optimizes nurse shift routes using geo-spatial calculations, frontend integration in the Admin Roster component, and comprehensive testing.

The implementation follows a bottom-up approach: core algorithms first (Haversine distance, greedy optimization), then Lambda function with audit logging, GraphQL schema updates, frontend integration, and finally comprehensive testing.

## Tasks

- [ ] 1. Implement core distance calculation algorithm
  - [ ] 1.1 Create Haversine distance calculator function
    - Implement formula: a = sin²(Δφ/2) + cos(φ1) × cos(φ2) × sin²(Δλ/2)
    - Use Earth's radius: 6371 km
    - Convert decimal degrees to radians
    - Round results to 2 decimal places
    - _Requirements: 1.1, 6.1, 6.3, 6.4_
  
  - [ ]* 1.2 Write property test for Haversine distance calculation
    - **Property 1: Haversine Distance Calculation**
    - **Validates: Requirements 1.1, 6.1, 6.3**
    - Generate 100+ random coordinate pairs
    - Compare against reference implementation
    - Verify 0.01 km tolerance
    - Test edge case: identical coordinates return 0.00 km
  
  - [ ]* 1.3 Write unit tests for distance calculator edge cases
    - Test boundary coordinates (±90 lat, ±180 lng)
    - Test identical coordinates (Example 3)
    - Test antipodal points (maximum distance)
    - Test equator and prime meridian crossings
    - _Requirements: 6.4_

- [ ] 2. Implement greedy nearest-neighbor optimization algorithm
  - [ ] 2.1 Create route optimizer function
    - Accept array of ShiftLocation objects
    - Start from first shift in array
    - Select nearest unvisited shift at each step
    - Calculate distanceToNext for each shift
    - Return OptimizedShift array
    - _Requirements: 1.2, 7.1, 7.3, 7.4_
  
  - [ ]* 2.2 Write property test for greedy selection logic
    - **Property 2: Greedy Nearest-Neighbor Selection**
    - **Validates: Requirements 1.2, 7.2**
    - Generate random shift arrays
    - Verify nearest unvisited shift selected at each step
    - Recalculate distances to validate selection
  
  - [ ]* 2.3 Write property test for complete route coverage
    - **Property 3: Complete Route Coverage**
    - **Validates: Requirements 1.3, 7.3**
    - Generate random shift arrays
    - Verify all input shifts appear in output exactly once
    - Use set equality for validation
  
  - [ ]* 2.4 Write property test for algorithm starting point
    - **Property 12: Algorithm Starts from First Shift**
    - **Validates: Requirements 7.1**
    - Generate random shift arrays
    - Verify first shift in output matches first shift in input
  
  - [ ]* 2.5 Write property test for deterministic tie-breaking
    - **Property 13: Deterministic Tie-Breaking**
    - **Validates: Requirements 7.4**
    - Create shifts with intentionally equal distances
    - Run optimization multiple times
    - Verify same shift selected consistently

- [ ] 3. Implement input validation and filtering
  - [ ] 3.1 Create input validator function
    - Validate required fields (shiftId, nurseId, patientId, locationLat, locationLng)
    - Validate coordinate ranges (lat: -90 to 90, lng: -180 to 180)
    - Filter by tenantId for multi-tenant isolation
    - Separate valid and invalid shifts
    - Return ValidatedInput object
    - _Requirements: 1.4, 1.5, 3.1, 3.2_
  
  - [ ]* 3.2 Write property test for required field validation
    - **Property 7: Required Field Validation**
    - **Validates: Requirements 3.1**
    - Generate shifts with missing required fields
    - Verify incomplete shifts are excluded
  
  - [ ]* 3.3 Write property test for invalid coordinate exclusion
    - **Property 6: Invalid Coordinate Exclusion**
    - **Validates: Requirements 1.5, 3.2**
    - Generate shifts with out-of-range coordinates
    - Verify invalid shifts excluded and returned separately
  
  - [ ]* 3.4 Write property test for multi-tenant isolation
    - **Property 5: Multi-Tenant Isolation**
    - **Validates: Requirements 1.4**
    - Generate shifts with mixed tenantIds
    - Verify only matching tenantId shifts included

- [ ] 4. Implement metrics calculation
  - [ ] 4.1 Create metrics calculator function
    - Calculate total distance for optimized route
    - Calculate total distance for original order
    - Calculate absolute distance saved
    - Calculate percentage saved
    - Count shifts optimized and excluded
    - Return RouteMetrics object
    - _Requirements: 1.3, 8.4_
  
  - [ ]* 4.2 Write property test for percentage savings calculation
    - **Property 14: Percentage Savings Calculation**
    - **Validates: Requirements 8.4**
    - Generate random shift arrays
    - Verify percentage = ((original - optimized) / original) * 100
    - Verify rounding to 2 decimal places

- [ ] 5. Checkpoint - Ensure core algorithms pass all tests
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement Lambda function handler
  - [ ] 6.1 Create routeOptimizerLambda handler
    - Extract tenantId and userId from event
    - Parse input shifts from event body
    - Call input validator
    - Handle empty input (Example 1)
    - Handle single shift (Example 2)
    - Call route optimizer for valid shifts
    - Call metrics calculator
    - Return OptimizeRouteOutput
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.3, 3.4_
  
  - [ ]* 6.2 Write property test for output structure completeness
    - **Property 4: Output Structure Completeness**
    - **Validates: Requirements 1.3, 8.1, 8.2, 8.3, 8.5**
    - Generate random shift arrays
    - Verify all required output fields present
    - Verify correct types for all fields
  
  - [ ]* 6.3 Write unit tests for edge cases
    - Test empty input (Example 1)
    - Test single shift (Example 2)
    - Test all shifts excluded (invalid coordinates)
    - _Requirements: 3.3, 3.4_

- [ ] 7. Implement error handling
  - [ ] 7.1 Add error handling to Lambda handler
    - Wrap optimization in try-catch
    - Handle validation errors
    - Handle runtime errors
    - Return error response with descriptive message
    - Set success=false on errors
    - _Requirements: 3.5_
  
  - [ ]* 7.2 Write property test for error response format
    - **Property 8: Error Response Format**
    - **Validates: Requirements 3.5**
    - Simulate various error conditions
    - Verify error responses have success=false
    - Verify descriptive error messages included

- [ ] 8. Implement audit logging
  - [ ] 8.1 Create audit logger utility
    - Function to create AuditLog entries in DynamoDB
    - Include tenantId, userId, action, timestamp, details
    - Handle DynamoDB errors gracefully
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ] 8.2 Add audit logging to Lambda handler
    - Log "ROUTE_OPTIMIZATION_REQUESTED" on invocation
    - Log "ROUTE_OPTIMIZATION_COMPLETED" on success with metrics
    - Log "ROUTE_OPTIMIZATION_FAILED" on error with details
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ]* 8.3 Write property test for audit log creation on request
    - **Property 9: Audit Log Creation on Request**
    - **Validates: Requirements 4.1, 4.4**
    - Run optimization requests
    - Verify audit logs created with required fields
  
  - [ ]* 8.4 Write property test for audit log creation on success
    - **Property 10: Audit Log Creation on Success**
    - **Validates: Requirements 4.2, 4.4**
    - Run successful optimizations
    - Verify completion logs contain metrics
  
  - [ ]* 8.5 Write property test for audit log creation on failure
    - **Property 11: Audit Log Creation on Failure**
    - **Validates: Requirements 4.3, 4.4**
    - Simulate optimization failures
    - Verify failure logs contain error details

- [ ] 9. Checkpoint - Ensure Lambda function passes all tests
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Update GraphQL schema
  - [ ] 10.1 Add custom query definition to data/resource.ts
    - Define OptimizeRouteInput type
    - Define OptimizeRouteOutput type
    - Define ShiftLocationInput type
    - Define OptimizedShift type
    - Define RouteMetrics type
    - Define ShiftLocationOutput type
    - Add optimizeRoute query with @function directive
    - Add @auth rule (ADMIN group only)
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [ ] 10.2 Create Lambda resource configuration
    - Create amplify/functions/route-optimizer/resource.ts
    - Configure 30-second timeout
    - Configure 512 MB memory
    - Grant DynamoDB permissions for AuditLog table
    - Set environment variables (AUDITLOG_TABLE_NAME)
    - _Requirements: 2.3_

- [ ] 11. Implement frontend integration
  - [ ] 11.1 Update AdminRoster.tsx with optimization logic
    - Add state for isOptimizing and optimizationResult
    - Implement handleOptimizeRoutes function
    - Filter shifts with valid coordinates
    - Invoke optimizeRoute custom query via AppSync
    - Handle loading state
    - Handle success with metrics display
    - Handle errors with user-friendly messages
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ] 11.2 Update "Optimizar Rutas" button
    - Replace alert with handleOptimizeRoutes call
    - Add disabled state (isOptimizing or no shifts)
    - Show loading text during optimization
    - _Requirements: 5.1, 5.2_
  
  - [ ] 11.3 Add optimization results display
    - Create results card with metrics
    - Show total distance, original distance, savings
    - Show percentage saved
    - Show warning for excluded shifts
    - Use green color scheme for success
    - _Requirements: 5.3, 5.5_

- [ ] 12. Deploy and test Lambda function
  - [ ] 12.1 Deploy backend changes
    - Run `npx ampx sandbox --once` to deploy schema and Lambda
    - Verify Lambda function created in AWS Console
    - Verify custom query available in AppSync
    - Verify DynamoDB permissions granted
  
  - [ ] 12.2 Test Lambda via AppSync Console
    - Test with valid shift data (10 shifts)
    - Test with empty input
    - Test with single shift
    - Test with invalid coordinates
    - Test with mixed tenantIds
    - Verify audit logs created in DynamoDB
  
  - [ ] 12.3 Test frontend integration
    - Click "Optimizar Rutas" button
    - Verify loading state displays
    - Verify results display with metrics
    - Verify error handling for failures
    - Test with no shifts (button disabled)

- [ ] 13. Final checkpoint - End-to-end testing
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Update documentation
  - [ ] 14.1 Add Phase 13 section to API_DOCUMENTATION.md
    - Document optimizeRoute custom query
    - Document input/output schemas
    - Document Lambda function behavior
    - Document frontend integration
    - Document testing procedures
    - Include example requests and responses

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Lambda function uses DynamoDB SDK directly (no Amplify client)
- Frontend integration uses AppSync custom query
- All operations respect multi-tenant isolation
- Audit logging is mandatory for compliance
