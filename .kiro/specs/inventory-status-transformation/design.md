# Design Document

## 1. System Architecture

### 1.1 Module Structure

The transformation system consists of a single utility module that provides bidirectional conversion between GraphQL enum format and frontend display format.

```
src/utils/inventory-transforms.ts
├── Type Definitions
│   ├── GraphQLInventoryStatus (type)
│   └── FrontendInventoryStatus (type)
├── Type Guards
│   ├── isGraphQLInventoryStatus()
│   └── isFrontendInventoryStatus()
└── Transformation Functions
    ├── graphqlToFrontend()
    └── frontendToGraphQL()
```

### 1.2 Data Flow

```
Backend (GraphQL)          Transformation Layer          Frontend (UI)
─────────────────          ────────────────────          ─────────────
IN_STOCK              →    graphqlToFrontend()    →      in-stock
LOW_STOCK             →    graphqlToFrontend()    →      low-stock
OUT_OF_STOCK          →    graphqlToFrontend()    →      out-of-stock

in-stock              ←    frontendToGraphQL()    ←      Form Input
low-stock             ←    frontendToGraphQL()    ←      User Selection
out-of-stock          ←    frontendToGraphQL()    ←      Status Update
```

### 1.3 Integration Points

**Components Requiring Updates:**
1. `InventoryDashboard.tsx` - Primary inventory management interface
2. `AdminDashboard.tsx` - Dashboard inventory statistics display

**Backend Detection:**
- Use `isUsingRealBackend()` from `amplify-utils.ts` to determine transformation necessity
- Mock backend already uses lowercase format (no transformation needed)
- Real backend uses GraphQL standard (transformation required)

## 2. Technical Design

### 2.1 Type Definitions

```typescript
/**
 * GraphQL enum format (backend)
 * GraphQL enums cannot contain hyphens, must use uppercase with underscores
 */
export type GraphQLInventoryStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

/**
 * Frontend display format (UI)
 * User-friendly lowercase with hyphens for readability
 */
export type FrontendInventoryStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

/**
 * Mapping between formats
 */
const STATUS_MAP: Record<GraphQLInventoryStatus, FrontendInventoryStatus> = {
  'IN_STOCK': 'in-stock',
  'LOW_STOCK': 'low-stock',
  'OUT_OF_STOCK': 'out-of-stock'
};

const REVERSE_STATUS_MAP: Record<FrontendInventoryStatus, GraphQLInventoryStatus> = {
  'in-stock': 'IN_STOCK',
  'low-stock': 'LOW_STOCK',
  'out-of-stock': 'OUT_OF_STOCK'
};
```

### 2.2 Type Guards

Type guards provide runtime validation and enable TypeScript type narrowing.

```typescript
/**
 * Type guard for GraphQL enum values
 * @param value - Value to check
 * @returns true if value is a valid GraphQL inventory status
 */
export function isGraphQLInventoryStatus(value: unknown): value is GraphQLInventoryStatus {
  return typeof value === 'string' && 
         (value === 'IN_STOCK' || value === 'LOW_STOCK' || value === 'OUT_OF_STOCK');
}

/**
 * Type guard for frontend display values
 * @param value - Value to check
 * @returns true if value is a valid frontend inventory status
 */
export function isFrontendInventoryStatus(value: unknown): value is FrontendInventoryStatus {
  return typeof value === 'string' && 
         (value === 'in-stock' || value === 'low-stock' || value === 'out-of-stock');
}
```

### 2.3 Transformation Functions

#### 2.3.1 GraphQL to Frontend

```typescript
/**
 * Converts GraphQL enum format to frontend display format
 * @param status - GraphQL status (IN_STOCK, LOW_STOCK, OUT_OF_STOCK)
 * @returns Frontend status (in-stock, low-stock, out-of-stock)
 * @throws Error if status is invalid
 * 
 * @example
 * graphqlToFrontend('IN_STOCK') // Returns: 'in-stock'
 * graphqlToFrontend('LOW_STOCK') // Returns: 'low-stock'
 */
export function graphqlToFrontend(status: GraphQLInventoryStatus): FrontendInventoryStatus {
  if (!isGraphQLInventoryStatus(status)) {
    throw new Error(
      `Invalid GraphQL inventory status: "${status}". ` +
      `Valid values: IN_STOCK, LOW_STOCK, OUT_OF_STOCK`
    );
  }
  return STATUS_MAP[status];
}
```

#### 2.3.2 Frontend to GraphQL

```typescript
/**
 * Converts frontend display format to GraphQL enum format
 * @param status - Frontend status (in-stock, low-stock, out-of-stock)
 * @returns GraphQL status (IN_STOCK, LOW_STOCK, OUT_OF_STOCK)
 * @throws Error if status is invalid
 * 
 * @example
 * frontendToGraphQL('in-stock') // Returns: 'IN_STOCK'
 * frontendToGraphQL('low-stock') // Returns: 'LOW_STOCK'
 */
export function frontendToGraphQL(status: FrontendInventoryStatus): GraphQLInventoryStatus {
  if (!isFrontendInventoryStatus(status)) {
    throw new Error(
      `Invalid frontend inventory status: "${status}". ` +
      `Valid values: in-stock, low-stock, out-of-stock`
    );
  }
  return REVERSE_STATUS_MAP[status];
}
```

### 2.4 Null/Undefined Handling

Both transformation functions should handle null/undefined gracefully:

```typescript
/**
 * Safe transformation with null handling
 * @param status - GraphQL status or null/undefined
 * @returns Frontend status or null if input is null/undefined
 */
export function graphqlToFrontendSafe(
  status: GraphQLInventoryStatus | null | undefined
): FrontendInventoryStatus | null {
  if (status === null || status === undefined) {
    return null;
  }
  return graphqlToFrontend(status);
}

/**
 * Safe transformation with null handling
 * @param status - Frontend status or null/undefined
 * @returns GraphQL status or null if input is null/undefined
 */
export function frontendToGraphQLSafe(
  status: FrontendInventoryStatus | null | undefined
): GraphQLInventoryStatus | null {
  if (status === null || status === undefined) {
    return null;
  }
  return frontendToGraphQL(status);
}
```

## 3. Component Integration

### 3.1 InventoryDashboard.tsx

**Transformation Points:**

1. **Data Fetching (Read):**
```typescript
// After fetching from real backend
const response = await client.models.InventoryItem.list();
const transformedData = response.data.map(item => ({
  ...item,
  status: graphqlToFrontendSafe(item.status)
}));
```

2. **Mutations (Write):**
```typescript
// Before sending to backend
await client.models.InventoryItem.create({
  ...itemData,
  status: frontendToGraphQLSafe(formStatus)
});
```

3. **Mock Backend Compatibility:**
```typescript
if (!isUsingRealBackend()) {
  // Mock data already uses lowercase format
  const { INVENTORY } = await import('../data/mock-data');
  setItems(INVENTORY);
} else {
  // Real backend needs transformation
  const response = await client.models.InventoryItem.list();
  const transformed = response.data.map(item => ({
    ...item,
    status: graphqlToFrontendSafe(item.status)
  }));
  setItems(transformed);
}
```

### 3.2 AdminDashboard.tsx

**Transformation Points:**

1. **Dashboard Statistics:**
```typescript
// Fetch inventory with transformation
const inventoryRes = await client.models.InventoryItem.list();
const transformedInventory = inventoryRes.data.map(item => ({
  ...item,
  status: graphqlToFrontendSafe(item.status)
}));

// Calculate low stock items
const lowStockItems = transformedInventory.filter(
  item => item.status === 'low-stock' || item.status === 'out-of-stock'
);
```

### 3.3 Type Updates in src/types.ts

Update the InventoryItem type to document the transformation pattern:

```typescript
export type InventoryItem = {
  id: string;
  tenantId?: string;
  name: string;
  sku?: string | null;
  quantity: number;
  unit?: string | null;
  reorderLevel: number;
  expiryDate?: string | null;
  
  /**
   * Inventory status
   * 
   * Backend (GraphQL): IN_STOCK | LOW_STOCK | OUT_OF_STOCK
   * Frontend (Display): in-stock | low-stock | out-of-stock
   * 
   * Use transformation functions from src/utils/inventory-transforms.ts:
   * - graphqlToFrontend() when reading from backend
   * - frontendToGraphQL() when writing to backend
   * 
   * Note: Mock backend already uses lowercase format (no transformation needed)
   */
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | null;
  
  createdAt: string;
  updatedAt: string;
};
```

## 4. Error Handling Strategy

### 4.1 Validation Errors

```typescript
try {
  const frontendStatus = graphqlToFrontend(backendStatus);
} catch (error) {
  console.error('Status transformation failed:', error);
  // Fallback to safe default
  const frontendStatus = 'in-stock';
}
```

### 4.2 Logging

```typescript
// Development mode logging
if (process.env.NODE_ENV === 'development') {
  console.log('Transforming status:', {
    input: backendStatus,
    output: frontendStatus,
    backend: isUsingRealBackend() ? 'real' : 'mock'
  });
}
```

## 5. Testing Strategy

### 5.1 Unit Tests (Not Implemented - Per Project Rules)

While unit tests are not created per project rules, the transformation functions should be manually tested with:

1. **Valid inputs:** All three status values in both directions
2. **Invalid inputs:** Unexpected strings, null, undefined
3. **Type guards:** Validation with valid and invalid values
4. **Edge cases:** Empty strings, numbers, objects

### 5.2 Integration Testing

Manual testing checklist:

1. **Mock Backend Mode:**
   - Verify inventory displays correctly with lowercase status
   - Verify no transformation errors in console
   - Verify status badges render correctly

2. **Real Backend Mode:**
   - Verify GraphQL returns uppercase status
   - Verify transformation to lowercase for display
   - Verify mutations send uppercase to backend
   - Verify status badges render correctly

3. **Component Testing:**
   - InventoryDashboard: List view, add item, update stock
   - AdminDashboard: Dashboard statistics, inventory count

## 6. Performance Considerations

### 6.1 Transformation Overhead

- Transformations are O(1) operations (simple map lookups)
- Minimal performance impact even with large datasets
- No async operations required

### 6.2 Memoization (Optional)

For large lists, consider memoizing transformed data:

```typescript
import { useMemo } from 'react';

const transformedInventory = useMemo(() => {
  return inventory.map(item => ({
    ...item,
    status: graphqlToFrontendSafe(item.status)
  }));
}, [inventory]);
```

## 7. Backward Compatibility

### 7.1 Mock Backend

- Mock data already uses lowercase format
- No transformation needed in mock mode
- Components check `isUsingRealBackend()` before transforming

### 7.2 Migration Path

No data migration required:
- Backend schema already uses GraphQL standard (IN_STOCK, LOW_STOCK, OUT_OF_STOCK)
- Frontend transformation is purely presentational
- Existing mock data continues to work unchanged

## 8. Documentation Requirements

### 8.1 Code Comments

All exported functions must include:
- JSDoc comments with description
- Parameter types and descriptions
- Return type and description
- Usage examples
- Error conditions

### 8.2 Type Documentation

Update `src/types.ts` with:
- Explanation of dual format system
- Reference to transformation functions
- Usage examples for developers

## 9. Future Enhancements

### 9.1 Extensibility

The transformation pattern can be extended to other enums:
- ShiftStatus (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- BillingStatus (PENDING, PAID, CANCELED, GLOSED)
- VisitStatus (DRAFT, SUBMITTED, REJECTED, APPROVED)

### 9.2 Centralized Enum Management

Consider creating a generic enum transformation utility:

```typescript
function createEnumTransformer<T extends string, U extends string>(
  mapping: Record<T, U>
) {
  return {
    forward: (value: T) => mapping[value],
    reverse: (value: U) => Object.entries(mapping).find(([_, v]) => v === value)?.[0]
  };
}
```

## 10. Correctness Properties

### Property 1: Bidirectional Consistency

**Statement:** For any valid GraphQL status, transforming to frontend and back to GraphQL must return the original value.

**Formal:** `∀s ∈ GraphQLInventoryStatus: frontendToGraphQL(graphqlToFrontend(s)) = s`

**Test Strategy:** Verify all three status values round-trip correctly.

### Property 2: Inverse Consistency

**Statement:** For any valid frontend status, transforming to GraphQL and back to frontend must return the original value.

**Formal:** `∀s ∈ FrontendInventoryStatus: graphqlToFrontend(frontendToGraphQL(s)) = s`

**Test Strategy:** Verify all three status values round-trip correctly in reverse direction.

### Property 3: Type Safety

**Statement:** Transformation functions must only accept valid enum values and reject invalid inputs.

**Formal:** 
- `isGraphQLInventoryStatus(s) = false ⟹ graphqlToFrontend(s) throws Error`
- `isFrontendInventoryStatus(s) = false ⟹ frontendToGraphQL(s) throws Error`

**Test Strategy:** Verify error handling with invalid inputs (empty string, numbers, objects, null).

### Property 4: Null Safety

**Statement:** Safe transformation functions must handle null/undefined without throwing errors.

**Formal:**
- `graphqlToFrontendSafe(null) = null`
- `graphqlToFrontendSafe(undefined) = null`
- `frontendToGraphQLSafe(null) = null`
- `frontendToGraphQLSafe(undefined) = null`

**Test Strategy:** Verify null/undefined handling in safe transformation functions.

### Property 5: Backend Mode Consistency

**Statement:** Components must only transform when using real backend, not mock backend.

**Formal:** `isUsingRealBackend() = false ⟹ no transformation applied`

**Test Strategy:** Verify components check backend mode before applying transformations.

## 11. Implementation Notes

### 11.1 File Organization

```
src/
├── utils/
│   └── inventory-transforms.ts  (NEW - transformation functions)
├── types.ts                     (UPDATE - add documentation)
└── components/
    ├── InventoryDashboard.tsx   (UPDATE - add transformations)
    └── AdminDashboard.tsx       (UPDATE - add transformations)
```

### 11.2 Import Pattern

```typescript
// In components
import { 
  graphqlToFrontend, 
  frontendToGraphQL,
  graphqlToFrontendSafe,
  frontendToGraphQLSafe 
} from '../utils/inventory-transforms';
```

### 11.3 TypeScript Configuration

Ensure strict mode is enabled in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

This design ensures type-safe, maintainable, and performant status transformations across the application.
