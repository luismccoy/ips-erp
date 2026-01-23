# Design Document: Route Optimizer Lambda

## Overview

The Route Optimizer Lambda is a serverless function that optimizes nurse shift routes by calculating geographic distances and reordering shifts to minimize total travel distance. The system uses the Haversine distance formula for accurate great-circle distance calculations and applies a greedy nearest-neighbor algorithm for route optimization.

This feature integrates with the existing Admin Roster workflow, allowing administrators to optimize daily schedules with a single button click. The Lambda function processes shift data, validates coordinates, calculates optimal routes, and returns detailed metrics including distance savings and leg-by-leg breakdowns.

**Key Design Principles:**
- **Serverless Architecture:** Lambda function with 30-second timeout for scalability
- **Pure Computation:** No external API dependencies (Google Maps, etc.)
- **Deterministic Algorithm:** Greedy nearest-neighbor ensures consistent results
- **Multi-Tenant Isolation:** All operations filtered by tenantId
- **Audit Compliance:** All optimization requests logged immutably

## Architecture

### System Components

```
┌─────────────────┐
│  Admin Roster   │
│   (Frontend)    │
└────────┬────────┘
         │ 1. Trigger optimization
         │    (shift data + tenantId)
         ▼
┌─────────────────────────────────┐
│  Route Optimizer Lambda         │
│  ┌───────────────────────────┐  │
│  │ 1. Validate Input         │  │
│  │ 2. Filter by tenantId     │  │
│  │ 3. Calculate Distances    │  │
│  │ 4. Optimize Route         │  │
│  │ 5. Generate Metrics       │  │
│  │ 6. Create Audit Log       │  │
│  └───────────────────────────┘  │
└────────┬────────────────────────┘
         │ 2. Return optimized route
         │    + distance metrics
         ▼
┌─────────────────┐
│  Admin Roster   │
│  (Display)      │
└─────────────────┘
         │
         │ 3. Log audit entry
         ▼
┌─────────────────┐
│   DynamoDB      │
│  (AuditLog)     │
└─────────────────┘
```

### Data Flow

1. **Input:** Admin clicks "Optimizar Rutas" → Frontend sends shift array with coordinates
2. **Validation:** Lambda validates required fields and filters by tenantId
3. **Distance Calculation:** Haversine formula computes distances between all shift pairs
4. **Optimization:** Greedy nearest-neighbor algorithm reorders shifts
5. **Metrics Generation:** Calculate total distance, savings percentage, leg distances
6. **Audit Logging:** Create immutable audit log entry with optimization details
7. **Output:** Return optimized route with metrics to frontend

## Components and Interfaces

### Lambda Function: routeOptimizerLambda

**Purpose:** Calculate optimal shift ordering based on geographic proximity

**Input Schema:**
```typescript
interface OptimizeRouteInput {
  tenantId: string;           // Multi-tenant isolation
  userId: string;             // Admin user triggering optimization
  shifts: ShiftLocation[];    // Array of shifts with coordinates
}

interface ShiftLocation {
  shiftId: string;
  nurseId: string;
  patientId: string;
  locationLat: number;        // Decimal degrees (-90 to 90)
  locationLng: number;        // Decimal degrees (-180 to 180)
  scheduledTime: string;      // ISO 8601 timestamp
}
```

**Output Schema:**
```typescript
interface OptimizeRouteOutput {
  success: boolean;
  optimizedRoute: OptimizedShift[];
  metrics: RouteMetrics;
  excludedShifts: ShiftLocation[];  // Shifts with missing coordinates
  error?: string;
}

interface OptimizedShift {
  shiftId: string;
  nurseId: string;
  patientId: string;
  locationLat: number;
  locationLng: number;
  scheduledTime: string;
  distanceToNext: number;     // Kilometers to next shift (0 for last)
}

interface RouteMetrics {
  totalDistance: number;       // Optimized route total (km)
  originalDistance: number;    // Original order total (km)
  distanceSaved: number;       // Absolute savings (km)
  percentageSaved: number;     // Percentage improvement
  shiftsOptimized: number;     // Number of shifts in optimized route
  shiftsExcluded: number;      // Number of shifts without coordinates
}
```

**Error Handling:**
- Invalid coordinates → Exclude shift, log warning
- Empty input → Return empty route with success=true
- Single shift → Return unchanged with success=true
- Timeout → Return partial result with error indicator
- Unexpected error → Return error response with descriptive message

### Haversine Distance Calculator

**Purpose:** Calculate great-circle distance between two geographic points

**Formula:**
```
a = sin²(Δφ/2) + cos(φ1) × cos(φ2) × sin²(Δλ/2)
c = 2 × atan2(√a, √(1−a))
d = R × c

Where:
  φ = latitude in radians
  λ = longitude in radians
  R = Earth's radius (6371 km)
  d = distance in kilometers
```

**Implementation:**
```typescript
function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  
  // Convert degrees to radians
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;
  
  // Haversine formula
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  // Round to 2 decimal places
  return Math.round(distance * 100) / 100;
}
```

### Greedy Nearest-Neighbor Algorithm

**Purpose:** Optimize route by selecting closest unvisited shift at each step

**Algorithm:**
```typescript
function optimizeRoute(shifts: ShiftLocation[]): OptimizedShift[] {
  if (shifts.length <= 1) return shifts;
  
  const optimized: OptimizedShift[] = [];
  const unvisited = new Set(shifts.map((_, i) => i));
  
  // Start with first shift
  let currentIndex = 0;
  unvisited.delete(currentIndex);
  
  while (unvisited.size > 0) {
    const current = shifts[currentIndex];
    let nearestIndex = -1;
    let minDistance = Infinity;
    
    // Find nearest unvisited shift
    for (const index of unvisited) {
      const distance = haversineDistance(
        current.locationLat, current.locationLng,
        shifts[index].locationLat, shifts[index].locationLng
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = index;
      }
    }
    
    // Add current shift with distance to next
    optimized.push({
      ...current,
      distanceToNext: minDistance
    });
    
    // Move to nearest shift
    currentIndex = nearestIndex;
    unvisited.delete(nearestIndex);
  }
  
  // Add final shift with distanceToNext = 0
  optimized.push({
    ...shifts[currentIndex],
    distanceToNext: 0
  });
  
  return optimized;
}
```

**Time Complexity:** O(n²) where n = number of shifts
**Space Complexity:** O(n) for unvisited set and optimized array

### Frontend Integration: AdminRoster.tsx

**Current State:**
```typescript
// Line ~450 in AdminRoster.tsx
<button
  onClick={() => alert('Optimización de rutas en desarrollo')}
  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
>
  Optimizar Rutas
</button>
```

**Updated Implementation:**
```typescript
const [isOptimizing, setIsOptimizing] = useState(false);
const [optimizationResult, setOptimizationResult] = useState<OptimizeRouteOutput | null>(null);

const handleOptimizeRoutes = async () => {
  setIsOptimizing(true);
  setOptimizationResult(null);
  
  try {
    // Prepare shift data with coordinates
    const shiftsWithLocations = shifts
      .filter(s => s.nurse?.locationLat && s.nurse?.locationLng)
      .map(s => ({
        shiftId: s.id,
        nurseId: s.nurseId,
        patientId: s.patientId,
        locationLat: s.nurse.locationLat,
        locationLng: s.nurse.locationLng,
        scheduledTime: s.scheduledTime
      }));
    
    // Invoke Lambda via AppSync custom query
    const result = await client.queries.optimizeRoute({
      tenantId: currentUser.tenantId,
      userId: currentUser.id,
      shifts: shiftsWithLocations
    });
    
    setOptimizationResult(result.data);
    
    // Display success message with metrics
    if (result.data.success) {
      alert(`Ruta optimizada! Distancia ahorrada: ${result.data.metrics.distanceSaved.toFixed(2)} km (${result.data.metrics.percentageSaved.toFixed(1)}%)`);
    }
  } catch (error) {
    console.error('Route optimization failed:', error);
    alert('Error al optimizar rutas. Por favor intente nuevamente.');
  } finally {
    setIsOptimizing(false);
  }
};

// Updated button
<button
  onClick={handleOptimizeRoutes}
  disabled={isOptimizing || shifts.length === 0}
  className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
>
  {isOptimizing ? 'Optimizando...' : 'Optimizar Rutas'}
</button>

// Display optimization results
{optimizationResult && (
  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
    <h4 className="font-semibold text-green-800">Ruta Optimizada</h4>
    <p>Distancia total: {optimizationResult.metrics.totalDistance.toFixed(2)} km</p>
    <p>Distancia original: {optimizationResult.metrics.originalDistance.toFixed(2)} km</p>
    <p>Ahorro: {optimizationResult.metrics.distanceSaved.toFixed(2)} km ({optimizationResult.metrics.percentageSaved.toFixed(1)}%)</p>
    {optimizationResult.excludedShifts.length > 0 && (
      <p className="text-yellow-600 mt-2">
        {optimizationResult.excludedShifts.length} turnos excluidos (sin coordenadas)
      </p>
    )}
  </div>
)}
```

## Data Models

### Existing Models (No Changes Required)

**Nurse Model:**
```typescript
type Nurse @model @auth(rules: [
  { allow: groups, groups: ["ADMIN"], operations: [create, read, update, delete] },
  { allow: groups, groups: ["NURSE"], operations: [read] }
]) {
  id: ID!
  tenantId: String! @index(name: "byTenantId")
  name: String!
  email: String!
  phone: String
  specialization: String
  locationLat: Float    // Used for route optimization
  locationLng: Float    // Used for route optimization
  role: NurseRole!
  isActive: Boolean!
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
}
```

**Shift Model:**
```typescript
type Shift @model @auth(rules: [
  { allow: groups, groups: ["ADMIN"], operations: [create, read, update, delete] },
  { allow: groups, groups: ["NURSE"], operations: [read] }
]) {
  id: ID!
  tenantId: String! @index(name: "byTenantId")
  nurseId: String!
  patientId: String!
  scheduledTime: AWSDateTime!
  duration: Int!
  status: ShiftStatus! @index(name: "byStatus")
  notes: String
  createdAt: AWSDateTime!
  updatedAt: AWSDateTime!
  
  // Relationships
  nurse: Nurse @hasOne
  patient: Patient @hasOne
}
```

**AuditLog Model:**
```typescript
type AuditLog @model @auth(rules: [
  { allow: groups, groups: ["ADMIN"], operations: [read] }
]) {
  id: ID!
  tenantId: String! @index(name: "byTenantId")
  userId: String!
  action: String! @index(name: "byAction")
  entityType: String!
  entityId: String
  details: AWSJSON
  timestamp: AWSDateTime!
}
```

### Custom Query Definition

**GraphQL Schema Addition:**
```graphql
type Query {
  optimizeRoute(input: OptimizeRouteInput!): OptimizeRouteOutput
    @function(name: "routeOptimizerLambda")
    @auth(rules: [{ allow: groups, groups: ["ADMIN"] }])
}

input OptimizeRouteInput {
  tenantId: String!
  userId: String!
  shifts: [ShiftLocationInput!]!
}

input ShiftLocationInput {
  shiftId: ID!
  nurseId: ID!
  patientId: ID!
  locationLat: Float!
  locationLng: Float!
  scheduledTime: AWSDateTime!
}

type OptimizeRouteOutput {
  success: Boolean!
  optimizedRoute: [OptimizedShift!]!
  metrics: RouteMetrics!
  excludedShifts: [ShiftLocationOutput!]!
  error: String
}

type OptimizedShift {
  shiftId: ID!
  nurseId: ID!
  patientId: ID!
  locationLat: Float!
  locationLng: Float!
  scheduledTime: AWSDateTime!
  distanceToNext: Float!
}

type RouteMetrics {
  totalDistance: Float!
  originalDistance: Float!
  distanceSaved: Float!
  percentageSaved: Float!
  shiftsOptimized: Int!
  shiftsExcluded: Int!
}

type ShiftLocationOutput {
  shiftId: ID!
  nurseId: ID!
  patientId: ID!
  locationLat: Float!
  locationLng: Float!
  scheduledTime: AWSDateTime!
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies:
- **Property 1.3** (output structure) subsumes **8.1, 8.2, 8.3, 8.5** (all test output format)
- **Property 1.2** (greedy algorithm) subsumes **7.2** (nearest neighbor selection)
- **Property 7.2** is redundant with **1.2** (both test greedy selection logic)

The following properties provide unique validation value and will be implemented:

### Property 1: Haversine Distance Calculation

*For any* two valid geographic coordinate pairs (lat1, lng1) and (lat2, lng2), the calculated distance using the Haversine formula should match the expected great-circle distance within 0.01 km tolerance.

**Validates: Requirements 1.1, 6.1, 6.3**

**Test Strategy:** Generate random coordinate pairs, calculate distance using the implementation, and compare against a reference Haversine implementation. Verify results are rounded to 2 decimal places.

### Property 2: Greedy Nearest-Neighbor Selection

*For any* set of shift locations, at each step of the optimization algorithm, the next shift selected should be the unvisited shift with the minimum distance from the current location.

**Validates: Requirements 1.2, 7.2**

**Test Strategy:** Generate random shift arrays, run optimization, and verify that at each step the selected shift is indeed the nearest unvisited one by recalculating distances.

### Property 3: Complete Route Coverage

*For any* input array of shifts, the optimized route should contain all shifts exactly once (no duplicates, no omissions).

**Validates: Requirements 1.3, 7.3**

**Test Strategy:** Generate random shift arrays, run optimization, and verify that the output contains the same set of shift IDs as the input (using set equality).

### Property 4: Output Structure Completeness

*For any* successful optimization, the output should contain an optimized route array, complete metrics (totalDistance, originalDistance, distanceSaved, percentageSaved), and an excludedShifts array.

**Validates: Requirements 1.3, 8.1, 8.2, 8.3, 8.5**

**Test Strategy:** Generate random shift arrays, run optimization, and verify that all required fields are present in the output with correct types.

### Property 5: Multi-Tenant Isolation

*For any* optimization request with a specific tenantId, only shifts matching that tenantId should be included in the optimized route.

**Validates: Requirements 1.4**

**Test Strategy:** Generate shifts with mixed tenantIds, run optimization with a specific tenantId, and verify that all shifts in the optimized route have the matching tenantId.

### Property 6: Invalid Coordinate Exclusion

*For any* shift with missing or out-of-range coordinates (lat not in [-90, 90] or lng not in [-180, 180]), that shift should be excluded from optimization and appear in the excludedShifts array.

**Validates: Requirements 1.5, 3.2**

**Test Strategy:** Generate shifts with a mix of valid and invalid coordinates, run optimization, and verify that invalid shifts are excluded and returned separately.

### Property 7: Required Field Validation

*For any* shift missing required fields (shiftId, nurseId, patientId, locationLat, locationLng), that shift should be excluded from optimization.

**Validates: Requirements 3.1**

**Test Strategy:** Generate shifts with missing required fields, run optimization, and verify that incomplete shifts are excluded.

### Property 8: Error Response Format

*For any* optimization that encounters an error, the response should have success=false and include a descriptive error message.

**Validates: Requirements 3.5**

**Test Strategy:** Simulate various error conditions (invalid input, null data, etc.) and verify that error responses have the correct format.

### Property 9: Audit Log Creation on Request

*For any* optimization request, an AuditLog entry with action type "ROUTE_OPTIMIZATION_REQUESTED" should be created with tenantId, userId, and timestamp.

**Validates: Requirements 4.1, 4.4**

**Test Strategy:** Run optimization requests and verify that audit logs are created with all required fields.

### Property 10: Audit Log Creation on Success

*For any* successful optimization, an AuditLog entry with action type "ROUTE_OPTIMIZATION_COMPLETED" should be created with optimization metrics in the details field.

**Validates: Requirements 4.2, 4.4**

**Test Strategy:** Run successful optimizations and verify that completion audit logs contain metrics (totalDistance, distanceSaved, etc.).

### Property 11: Audit Log Creation on Failure

*For any* failed optimization, an AuditLog entry with action type "ROUTE_OPTIMIZATION_FAILED" should be created with error details in the details field.

**Validates: Requirements 4.3, 4.4**

**Test Strategy:** Simulate optimization failures and verify that failure audit logs contain error information.

### Property 12: Algorithm Starts from First Shift

*For any* input array of shifts, the first shift in the optimized route should be the first shift from the input array.

**Validates: Requirements 7.1**

**Test Strategy:** Generate random shift arrays, run optimization, and verify that the first shift in the output matches the first shift in the input.

### Property 13: Deterministic Tie-Breaking

*For any* scenario where multiple shifts have equal distances from the current location, the algorithm should consistently select the first one encountered (deterministic behavior).

**Validates: Requirements 7.4**

**Test Strategy:** Create shift arrays with intentionally equal distances, run optimization multiple times, and verify that the same shift is selected each time.

### Property 14: Percentage Savings Calculation

*For any* optimization result, the percentageSaved should be calculated as ((originalDistance - totalDistance) / originalDistance) * 100, rounded to 2 decimal places.

**Validates: Requirements 8.4**

**Test Strategy:** Generate random shift arrays, run optimization, and verify that the percentage calculation is correct by recalculating it independently.

### Edge Case Examples

These are specific scenarios that should be tested as concrete examples rather than properties:

**Example 1: Empty Input**
- Input: Empty shift array
- Expected: success=true, empty optimizedRoute, metrics with all zeros
- **Validates: Requirements 3.3**

**Example 2: Single Shift**
- Input: Array with one shift
- Expected: success=true, optimizedRoute with that shift, distanceToNext=0
- **Validates: Requirements 3.4**

**Example 3: Identical Coordinates**
- Input: Two shifts with identical lat/lng
- Expected: Distance between them should be 0.00 km
- **Validates: Requirements 6.4**

## Error Handling

### Input Validation Errors

**Missing Required Fields:**
- Detect: Check for null/undefined shiftId, nurseId, patientId, locationLat, locationLng
- Action: Exclude shift from optimization, add to excludedShifts array
- Log: Warning level with shift details

**Invalid Coordinates:**
- Detect: lat not in [-90, 90] or lng not in [-180, 180]
- Action: Exclude shift from optimization, add to excludedShifts array
- Log: Warning level with coordinate values

**Invalid TenantId:**
- Detect: tenantId is null, undefined, or empty string
- Action: Return error response with success=false
- Log: Error level with request details

### Runtime Errors

**Timeout:**
- Detect: Lambda execution exceeds 30 seconds
- Action: Return partial result with error indicator
- Log: Error level with partial optimization state

**Unexpected Errors:**
- Detect: Uncaught exceptions during optimization
- Action: Return error response with descriptive message
- Log: Error level with stack trace

**DynamoDB Errors:**
- Detect: Audit log creation fails
- Action: Continue with optimization, log error separately
- Log: Error level with DynamoDB error details

### Error Response Format

All errors should return this structure:
```typescript
{
  success: false,
  optimizedRoute: [],
  metrics: {
    totalDistance: 0,
    originalDistance: 0,
    distanceSaved: 0,
    percentageSaved: 0,
    shiftsOptimized: 0,
    shiftsExcluded: 0
  },
  excludedShifts: [],
  error: "Descriptive error message"
}
```

## Testing Strategy

### Dual Testing Approach

The Route Optimizer Lambda requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests:**
- Specific examples: empty input, single shift, identical coordinates
- Edge cases: boundary coordinates (±90 lat, ±180 lng)
- Error conditions: missing fields, invalid coordinates, null inputs
- Integration: DynamoDB audit log creation

**Property-Based Tests:**
- Universal properties: Haversine accuracy, greedy selection, route coverage
- Randomized inputs: Generate 100+ random shift arrays per test
- Invariant verification: Multi-tenant isolation, output structure
- Algorithm correctness: Nearest-neighbor selection at each step

### Property Test Configuration

**Library:** fast-check (TypeScript property-based testing library)

**Configuration:**
- Minimum 100 iterations per property test
- Seed-based reproducibility for debugging
- Shrinking enabled for minimal failing examples

**Test Tags:**
Each property test must include a comment referencing the design property:
```typescript
// Feature: route-optimizer-lambda, Property 1: Haversine Distance Calculation
test('haversine distance matches reference implementation', () => {
  fc.assert(
    fc.property(
      fc.tuple(fc.float(-90, 90), fc.float(-180, 180)),
      fc.tuple(fc.float(-90, 90), fc.float(-180, 180)),
      ([lat1, lng1], [lat2, lng2]) => {
        const calculated = haversineDistance(lat1, lng1, lat2, lng2);
        const reference = referenceHaversine(lat1, lng1, lat2, lng2);
        return Math.abs(calculated - reference) < 0.01;
      }
    ),
    { numRuns: 100 }
  );
});
```

### Test Data Generation

**Coordinate Generators:**
- Valid latitude: -90 to 90 (decimal degrees)
- Valid longitude: -180 to 180 (decimal degrees)
- Invalid coordinates: null, undefined, out-of-range values

**Shift Generators:**
- Random shift arrays: 0 to 50 shifts
- Mixed tenants: 2-5 different tenantIds
- Missing fields: randomly omit required fields
- Invalid coordinates: randomly inject invalid values

**Distance Scenarios:**
- Short distances: < 1 km (same neighborhood)
- Medium distances: 1-50 km (same city)
- Long distances: 50-500 km (different cities)
- Equal distances: intentionally create ties for determinism testing

### Integration Testing

**Lambda Invocation:**
- Test via AppSync custom query
- Verify authentication (Admin group only)
- Verify multi-tenant isolation at API level

**DynamoDB Audit Logs:**
- Verify audit log creation for all optimization requests
- Verify audit log structure and required fields
- Verify tenant isolation in audit logs

**Frontend Integration:**
- Test "Optimizar Rutas" button click
- Verify loading state display
- Verify results rendering with metrics
- Verify error message display

### Performance Testing

**Benchmarks:**
- 10 shifts: < 1 second
- 25 shifts: < 2 seconds
- 50 shifts: < 5 seconds

**Load Testing:**
- Concurrent requests: 10 simultaneous optimizations
- Memory usage: < 512 MB per invocation
- Cold start: < 3 seconds

### Test Coverage Goals

- **Unit Tests:** 80% code coverage minimum
- **Property Tests:** All 14 properties implemented
- **Edge Cases:** All 3 examples tested
- **Integration Tests:** End-to-end workflow verified
- **Performance Tests:** All benchmarks met
