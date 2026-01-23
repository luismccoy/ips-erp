# Requirements Document

## Introduction

This feature implements transformation functions to convert between GraphQL enum format and frontend display format for InventoryItem status values. The backend uses GraphQL standard enum values (uppercase with underscores: `IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`) while the frontend expects lowercase with hyphens (`in-stock`, `low-stock`, `out-of-stock`). This mismatch will cause runtime errors when the real backend is enabled.

## Glossary

- **GraphQL_Enum_Format**: Uppercase with underscores (e.g., `IN_STOCK`)
- **Frontend_Display_Format**: Lowercase with hyphens (e.g., `in-stock`)
- **Transformation_Function**: A utility function that converts between formats
- **Type_Guard**: A TypeScript function that validates enum values at runtime
- **Mock_Backend**: Development mode using local mock data (already uses lowercase)
- **Real_Backend**: Production mode using AWS AppSync GraphQL API (uses uppercase)

## Requirements

### Requirement 1: Create Transformation Utility Module

**User Story:** As a developer, I want a centralized utility module for status transformations, so that conversion logic is reusable and maintainable.

#### Acceptance Criteria

1. THE System SHALL create a new file at `src/utils/inventory-transforms.ts`
2. THE Transformation_Module SHALL export functions for bidirectional conversion
3. THE Transformation_Module SHALL include TypeScript type definitions
4. THE Transformation_Module SHALL handle all three status values: IN_STOCK, LOW_STOCK, OUT_OF_STOCK

### Requirement 2: GraphQL to Frontend Transformation

**User Story:** As a developer, I want to convert GraphQL enum values to frontend format, so that the UI displays user-friendly status labels.

#### Acceptance Criteria

1. WHEN a GraphQL enum value is provided, THE System SHALL convert it to Frontend_Display_Format
2. THE System SHALL convert `IN_STOCK` to `in-stock`
3. THE System SHALL convert `LOW_STOCK` to `low-stock`
4. THE System SHALL convert `OUT_OF_STOCK` to `out-of-stock`
5. WHEN an invalid value is provided, THE System SHALL throw a descriptive error
6. THE Transformation_Function SHALL preserve type safety with TypeScript

### Requirement 3: Frontend to GraphQL Transformation

**User Story:** As a developer, I want to convert frontend form values to GraphQL format, so that mutations send correctly formatted data to the backend.

#### Acceptance Criteria

1. WHEN a Frontend_Display_Format value is provided, THE System SHALL convert it to GraphQL_Enum_Format
2. THE System SHALL convert `in-stock` to `IN_STOCK`
3. THE System SHALL convert `low-stock` to `LOW_STOCK`
4. THE System SHALL convert `out-of-stock` to `OUT_OF_STOCK`
5. WHEN an invalid value is provided, THE System SHALL throw a descriptive error
6. THE Transformation_Function SHALL preserve type safety with TypeScript

### Requirement 4: Type Guards for Enum Validation

**User Story:** As a developer, I want runtime validation for enum values, so that invalid data is caught early with clear error messages.

#### Acceptance Criteria

1. THE System SHALL provide a Type_Guard function for GraphQL enum values
2. THE System SHALL provide a Type_Guard function for Frontend display values
3. WHEN a Type_Guard receives a valid value, THE System SHALL return true
4. WHEN a Type_Guard receives an invalid value, THE System SHALL return false
5. THE Type_Guard SHALL work with TypeScript type narrowing

### Requirement 5: Update InventoryDashboard Component

**User Story:** As a user viewing the inventory dashboard, I want to see status labels in lowercase with hyphens, so that the interface is consistent and readable.

#### Acceptance Criteria

1. WHEN InventoryDashboard fetches data from Real_Backend, THE System SHALL transform status values to Frontend_Display_Format
2. WHEN InventoryDashboard submits mutations to Real_Backend, THE System SHALL transform status values to GraphQL_Enum_Format
3. WHEN InventoryDashboard uses Mock_Backend, THE System SHALL handle lowercase values without errors
4. THE Component SHALL display status badges with correct styling for each status
5. THE Component SHALL maintain existing functionality without breaking changes

### Requirement 6: Update AdminDashboard Component

**User Story:** As an admin viewing the dashboard, I want inventory status to display correctly, so that I can monitor stock levels accurately.

#### Acceptance Criteria

1. WHEN AdminDashboard fetches inventory data from Real_Backend, THE System SHALL transform status values to Frontend_Display_Format
2. WHEN AdminDashboard displays inventory items, THE System SHALL show user-friendly status labels
3. WHEN AdminDashboard uses Mock_Backend, THE System SHALL handle lowercase values without errors
4. THE Component SHALL maintain existing functionality without breaking changes

### Requirement 7: Backward Compatibility with Mock Backend

**User Story:** As a developer, I want the transformation functions to work with both mock and real backends, so that development and production environments are consistent.

#### Acceptance Criteria

1. WHEN Mock_Backend provides lowercase status values, THE System SHALL handle them without transformation
2. WHEN Real_Backend provides uppercase status values, THE System SHALL transform them to lowercase
3. THE System SHALL detect which backend is active using `isUsingRealBackend()` function
4. THE Transformation_Functions SHALL not break existing mock data functionality
5. THE System SHALL maintain type safety across both backend modes

### Requirement 8: TypeScript Type Safety

**User Story:** As a developer, I want full TypeScript support for status transformations, so that type errors are caught at compile time.

#### Acceptance Criteria

1. THE System SHALL define TypeScript types for GraphQL enum format
2. THE System SHALL define TypeScript types for Frontend display format
3. THE Transformation_Functions SHALL have explicit input and output types
4. THE System SHALL compile without TypeScript errors
5. THE System SHALL provide IntelliSense support for enum values

### Requirement 9: Documentation and Code Comments

**User Story:** As a developer, I want clear documentation for transformation functions, so that I understand how to use them correctly.

#### Acceptance Criteria

1. THE Transformation_Module SHALL include JSDoc comments for all exported functions
2. THE System SHALL document the transformation pattern in `src/types.ts`
3. THE Documentation SHALL include usage examples for both directions
4. THE Documentation SHALL explain when to use each transformation function
5. THE Documentation SHALL note the GraphQL enum constraint (no hyphens allowed)

### Requirement 10: Error Handling and Validation

**User Story:** As a developer, I want clear error messages when invalid status values are provided, so that I can debug issues quickly.

#### Acceptance Criteria

1. WHEN an invalid GraphQL enum value is provided, THE System SHALL throw an error with the invalid value
2. WHEN an invalid Frontend display value is provided, THE System SHALL throw an error with the invalid value
3. THE Error_Messages SHALL list all valid values for the format
4. THE System SHALL validate enum values before transformation
5. THE Error_Handling SHALL not crash the application
