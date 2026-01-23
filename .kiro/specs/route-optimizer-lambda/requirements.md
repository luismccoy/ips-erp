# Requirements Document: Route Optimizer Lambda

## Introduction

The Route Optimizer Lambda is a geo-spatial optimization feature that enables Home Care Agency administrators to minimize nurse travel time and costs by automatically sorting shift assignments based on geographic proximity. This feature addresses the operational inefficiency of manual route planning, which leads to increased fuel costs, longer travel times, nurse fatigue, and reduced patient coverage.

The system uses the Haversine distance formula to calculate distances between patient locations and applies a greedy nearest-neighbor algorithm to optimize the route order. This feature is designed to integrate seamlessly with the existing Admin Roster workflow while maintaining multi-tenant isolation and audit compliance.

## Glossary

- **Route_Optimizer**: The Lambda function that calculates optimal shift ordering based on geographic proximity
- **Haversine_Distance**: Mathematical formula for calculating great-circle distance between two points on a sphere using latitude/longitude coordinates
- **Shift_Assignment**: A scheduled nurse visit to a patient with associated location coordinates
- **Optimized_Route**: A reordered sequence of shift assignments that minimizes total travel distance
- **Greedy_Nearest_Neighbor**: Algorithm that selects the closest unvisited location at each step
- **Admin_Roster**: The administrative interface where route optimization is triggered
- **Travel_Distance**: The sum of distances between consecutive shift locations in a route
- **Location_Coordinates**: Latitude and longitude values (locationLat, locationLng) stored in the Nurse model

## Requirements

### Requirement 1: Route Optimization Calculation

**User Story:** As an Admin, I want to optimize nurse shift routes based on geographic proximity, so that I can minimize travel time and costs while maximizing patient coverage.

#### Acceptance Criteria

1. WHEN an Admin requests route optimization with valid shift data, THE Route_Optimizer SHALL calculate distances between all consecutive shift locations using the Haversine_Distance formula
2. WHEN calculating optimized routes, THE Route_Optimizer SHALL apply the Greedy_Nearest_Neighbor algorithm to minimize total Travel_Distance
3. WHEN the optimization completes, THE Route_Optimizer SHALL return the reordered shift sequence with distance metrics for each leg
4. WHEN processing shift data, THE Route_Optimizer SHALL filter by tenantId to ensure multi-tenant isolation
5. WHEN optimization is requested for shifts with missing Location_Coordinates, THE Route_Optimizer SHALL exclude those shifts from optimization and return them separately

### Requirement 2: Performance and Scalability

**User Story:** As an Admin, I want route optimization to complete quickly, so that I can make real-time scheduling decisions without delays.

#### Acceptance Criteria

1. WHEN optimizing routes with up to 50 shifts, THE Route_Optimizer SHALL complete processing within 5 seconds
2. WHEN processing large shift datasets, THE Route_Optimizer SHALL use efficient data structures to minimize computational complexity
3. WHEN the Lambda function is invoked, THE Route_Optimizer SHALL have a timeout configuration of 30 seconds to handle edge cases
4. WHEN optimization fails due to timeout, THE Route_Optimizer SHALL return a partial result with an error indicator

### Requirement 3: Input Validation and Error Handling

**User Story:** As a system, I want to validate input data and handle errors gracefully, so that the optimization process is reliable and predictable.

#### Acceptance Criteria

1. WHEN the Route_Optimizer receives input data, THE Route_Optimizer SHALL validate that all required fields are present (shiftId, nurseId, patientId, locationLat, locationLng)
2. WHEN Location_Coordinates are invalid (null, undefined, or out of range), THE Route_Optimizer SHALL exclude those shifts and log a warning
3. WHEN the input contains zero shifts, THE Route_Optimizer SHALL return an empty optimized route with a success status
4. WHEN the input contains a single shift, THE Route_Optimizer SHALL return that shift without performing optimization
5. IF an unexpected error occurs during optimization, THEN THE Route_Optimizer SHALL return an error response with a descriptive message

### Requirement 4: Audit Logging and Compliance

**User Story:** As a Platform Owner, I want all route optimization requests to be logged, so that I can track system usage and ensure compliance with operational standards.

#### Acceptance Criteria

1. WHEN an Admin triggers route optimization, THE Route_Optimizer SHALL create an AuditLog entry with action type "ROUTE_OPTIMIZATION_REQUESTED"
2. WHEN optimization completes successfully, THE Route_Optimizer SHALL create an AuditLog entry with action type "ROUTE_OPTIMIZATION_COMPLETED" and include optimization metrics
3. WHEN optimization fails, THE Route_Optimizer SHALL create an AuditLog entry with action type "ROUTE_OPTIMIZATION_FAILED" and include error details
4. WHEN creating audit logs, THE Route_Optimizer SHALL include tenantId, userId, timestamp, and relevant metadata in JSON format

### Requirement 5: Frontend Integration

**User Story:** As an Admin, I want to trigger route optimization from the Admin Roster interface and see the results visually, so that I can make informed scheduling decisions.

#### Acceptance Criteria

1. WHEN an Admin clicks the "Optimizar Rutas" button, THE Admin_Roster SHALL invoke the Route_Optimizer Lambda with current shift data
2. WHEN the optimization is in progress, THE Admin_Roster SHALL display a loading indicator to inform the user
3. WHEN optimization completes successfully, THE Admin_Roster SHALL display the optimized route with distance metrics for each leg
4. WHEN optimization fails, THE Admin_Roster SHALL display an error message with actionable guidance
5. WHEN displaying optimized routes, THE Admin_Roster SHALL highlight the total distance saved compared to the original order

### Requirement 6: Distance Calculation Accuracy

**User Story:** As a system, I want to calculate distances accurately using the Haversine formula, so that route optimization produces reliable results.

#### Acceptance Criteria

1. WHEN calculating distance between two Location_Coordinates, THE Route_Optimizer SHALL use the Haversine_Distance formula with Earth's radius of 6371 kilometers
2. WHEN Location_Coordinates are provided in decimal degrees, THE Route_Optimizer SHALL convert them to radians for trigonometric calculations
3. WHEN calculating distances, THE Route_Optimizer SHALL return results in kilometers with two decimal places of precision
4. WHEN two locations have identical coordinates, THE Route_Optimizer SHALL return a distance of 0.00 kilometers

### Requirement 7: Optimization Algorithm Behavior

**User Story:** As a system, I want to use a deterministic optimization algorithm, so that route optimization produces consistent and predictable results.

#### Acceptance Criteria

1. WHEN applying the Greedy_Nearest_Neighbor algorithm, THE Route_Optimizer SHALL start from the first shift in the input array
2. WHEN selecting the next shift, THE Route_Optimizer SHALL choose the unvisited shift with the shortest distance from the current location
3. WHEN all shifts have been visited, THE Route_Optimizer SHALL return the complete optimized route
4. WHEN multiple shifts have equal distances, THE Route_Optimizer SHALL select the first one encountered to ensure deterministic behavior

### Requirement 8: Response Format and Metrics

**User Story:** As an Admin, I want to see detailed metrics about the optimized route, so that I can understand the efficiency gains.

#### Acceptance Criteria

1. WHEN optimization completes, THE Route_Optimizer SHALL return the optimized shift order as an array
2. WHEN returning results, THE Route_Optimizer SHALL include the total Travel_Distance for the optimized route
3. WHEN returning results, THE Route_Optimizer SHALL include the original total distance for comparison
4. WHEN returning results, THE Route_Optimizer SHALL calculate and include the percentage distance saved
5. WHEN returning results, THE Route_Optimizer SHALL include distance metrics for each leg of the route
