/**
 * Inventory Status Transformation Utilities
 * 
 * This module provides bidirectional transformation functions between GraphQL enum format
 * and frontend display format for InventoryItem status values.
 * 
 * **Why Two Formats?**
 * - GraphQL enums cannot contain hyphens (syntax constraint)
 * - Backend uses: IN_STOCK, LOW_STOCK, OUT_OF_STOCK
 * - Frontend expects: in-stock, low-stock, out-of-stock (user-friendly)
 * 
 * **When to Use:**
 * - Use `graphqlToFrontend()` when reading data from real backend
 * - Use `frontendToGraphQL()` when sending mutations to real backend
 * - Use safe variants (`*Safe()`) when handling nullable values
 * - No transformation needed for mock backend (already uses lowercase)
 * 
 * @module inventory-transforms
 */

/**
 * GraphQL enum format (backend)
 * 
 * GraphQL enums cannot contain hyphens, must use uppercase with underscores.
 * This is the format used by AWS AppSync and stored in DynamoDB.
 */
export type GraphQLInventoryStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

/**
 * Frontend display format (UI)
 * 
 * User-friendly lowercase with hyphens for readability.
 * This is the format used in React components and displayed to users.
 */
export type FrontendInventoryStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

/**
 * Mapping from GraphQL format to Frontend format
 * 
 * @internal
 */
const STATUS_MAP: Record<GraphQLInventoryStatus, FrontendInventoryStatus> = {
  'IN_STOCK': 'in-stock',
  'LOW_STOCK': 'low-stock',
  'OUT_OF_STOCK': 'out-of-stock'
};

/**
 * Reverse mapping from Frontend format to GraphQL format
 * 
 * @internal
 */
const REVERSE_STATUS_MAP: Record<FrontendInventoryStatus, GraphQLInventoryStatus> = {
  'in-stock': 'IN_STOCK',
  'low-stock': 'LOW_STOCK',
  'out-of-stock': 'OUT_OF_STOCK'
};

/**
 * Type guard for GraphQL enum values
 * 
 * Validates that a value is a valid GraphQL inventory status.
 * Enables TypeScript type narrowing for safer code.
 * 
 * @param value - Value to check
 * @returns true if value is a valid GraphQL inventory status
 * 
 * @example
 * ```typescript
 * const status: unknown = 'IN_STOCK';
 * if (isGraphQLInventoryStatus(status)) {
 *   // TypeScript now knows status is GraphQLInventoryStatus
 *   const frontend = graphqlToFrontend(status);
 * }
 * ```
 */
export function isGraphQLInventoryStatus(value: unknown): value is GraphQLInventoryStatus {
  return typeof value === 'string' && 
         (value === 'IN_STOCK' || value === 'LOW_STOCK' || value === 'OUT_OF_STOCK');
}

/**
 * Type guard for frontend display values
 * 
 * Validates that a value is a valid frontend inventory status.
 * Enables TypeScript type narrowing for safer code.
 * 
 * @param value - Value to check
 * @returns true if value is a valid frontend inventory status
 * 
 * @example
 * ```typescript
 * const status: unknown = 'in-stock';
 * if (isFrontendInventoryStatus(status)) {
 *   // TypeScript now knows status is FrontendInventoryStatus
 *   const graphql = frontendToGraphQL(status);
 * }
 * ```
 */
export function isFrontendInventoryStatus(value: unknown): value is FrontendInventoryStatus {
  return typeof value === 'string' && 
         (value === 'in-stock' || value === 'low-stock' || value === 'out-of-stock');
}

/**
 * Converts GraphQL enum format to frontend display format
 * 
 * Use this function when reading data from the real backend (AWS AppSync).
 * The backend returns uppercase with underscores, but the frontend expects
 * lowercase with hyphens for display.
 * 
 * @param status - GraphQL status (IN_STOCK, LOW_STOCK, OUT_OF_STOCK)
 * @returns Frontend status (in-stock, low-stock, out-of-stock)
 * @throws Error if status is not a valid GraphQL inventory status
 * 
 * @example
 * ```typescript
 * // Reading from backend
 * const response = await client.models.InventoryItem.list();
 * const items = response.data.map(item => ({
 *   ...item,
 *   status: graphqlToFrontend(item.status)
 * }));
 * ```
 * 
 * @example
 * ```typescript
 * graphqlToFrontend('IN_STOCK')    // Returns: 'in-stock'
 * graphqlToFrontend('LOW_STOCK')   // Returns: 'low-stock'
 * graphqlToFrontend('OUT_OF_STOCK') // Returns: 'out-of-stock'
 * graphqlToFrontend('INVALID')     // Throws: Error
 * ```
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

/**
 * Converts frontend display format to GraphQL enum format
 * 
 * Use this function when sending mutations to the real backend (AWS AppSync).
 * The frontend uses lowercase with hyphens, but the backend expects
 * uppercase with underscores.
 * 
 * @param status - Frontend status (in-stock, low-stock, out-of-stock)
 * @returns GraphQL status (IN_STOCK, LOW_STOCK, OUT_OF_STOCK)
 * @throws Error if status is not a valid frontend inventory status
 * 
 * @example
 * ```typescript
 * // Sending mutation to backend
 * await client.models.InventoryItem.create({
 *   ...itemData,
 *   status: frontendToGraphQL(formStatus)
 * });
 * ```
 * 
 * @example
 * ```typescript
 * frontendToGraphQL('in-stock')    // Returns: 'IN_STOCK'
 * frontendToGraphQL('low-stock')   // Returns: 'LOW_STOCK'
 * frontendToGraphQL('out-of-stock') // Returns: 'OUT_OF_STOCK'
 * frontendToGraphQL('invalid')     // Throws: Error
 * ```
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

/**
 * Safe transformation from GraphQL to frontend format with null handling
 * 
 * Use this function when the status value might be null or undefined.
 * Returns null instead of throwing an error for null/undefined inputs.
 * 
 * @param status - GraphQL status or null/undefined
 * @returns Frontend status or null if input is null/undefined
 * @throws Error if status is invalid (but not null/undefined)
 * 
 * @example
 * ```typescript
 * // Handling optional status fields
 * const items = response.data.map(item => ({
 *   ...item,
 *   status: graphqlToFrontendSafe(item.status)
 * }));
 * ```
 * 
 * @example
 * ```typescript
 * graphqlToFrontendSafe('IN_STOCK')   // Returns: 'in-stock'
 * graphqlToFrontendSafe(null)         // Returns: null
 * graphqlToFrontendSafe(undefined)    // Returns: null
 * graphqlToFrontendSafe('INVALID')    // Throws: Error
 * ```
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
 * Safe transformation from frontend to GraphQL format with null handling
 * 
 * Use this function when the status value might be null or undefined.
 * Returns null instead of throwing an error for null/undefined inputs.
 * 
 * @param status - Frontend status or null/undefined
 * @returns GraphQL status or null if input is null/undefined
 * @throws Error if status is invalid (but not null/undefined)
 * 
 * @example
 * ```typescript
 * // Handling optional form fields
 * await client.models.InventoryItem.update({
 *   id: itemId,
 *   status: frontendToGraphQLSafe(formData.status)
 * });
 * ```
 * 
 * @example
 * ```typescript
 * frontendToGraphQLSafe('in-stock')   // Returns: 'IN_STOCK'
 * frontendToGraphQLSafe(null)         // Returns: null
 * frontendToGraphQLSafe(undefined)    // Returns: null
 * frontendToGraphQLSafe('invalid')    // Throws: Error
 * ```
 */
export function frontendToGraphQLSafe(
  status: FrontendInventoryStatus | null | undefined
): GraphQLInventoryStatus | null {
  if (status === null || status === undefined) {
    return null;
  }
  return frontendToGraphQL(status);
}
