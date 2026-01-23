# Design Document

## Overview

The Remaining Integrations feature connects two existing backend Lambda functions to their respective frontend components, enabling admins to access AI-powered billing dispute defense and Colombian RIPS compliance validation. This is a frontend-focused integration that leverages already-deployed backend infrastructure.

**Key Design Principles:**
- Minimal file modifications (only BillingDashboard.tsx and RipsValidator.tsx)
- Reuse existing Lambda functions (no new backend development)
- Consistent UX patterns with existing features
- Robust error handling with Spanish messages
- Automatic data persistence to BillingRecord

**Architecture Pattern:**
Frontend Component → GraphQL Custom Query → Lambda Function → DynamoDB Update → Response Display

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                          │
├─────────────────────────────────────────────────────────────┤
│  BillingDashboard.tsx                                       │
│  ├─ "Generar Respuesta AI" Button                          │
│  └─ Defense Letter Modal                                    │
│                                                             │
│  RipsValidator.tsx                                          │
│  ├─ Validation Form                                         │
│  └─ Validation Results Display                              │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ GraphQL Custom Queries
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   AppSync GraphQL API                       │
├─────────────────────────────────────────────────────────────┤
│  Query.glosaDefender(billingRecordId: ID!)                 │
│  Query.validateRIPS(billingRecordId: ID!)                  │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ Lambda Invocation
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Lambda Functions                         │
├─────────────────────────────────────────────────────────────┤
│  glosa-defender                                             │
│  ├─ Fetch BillingRecord from DynamoDB                      │
│  ├─ Generate AI defense letter (Bedrock)                   │
│  ├─ Update BillingRecord.glosaDefenseText                  │
│  └─ Create AuditLog entry                                   │
│                                                             │
│  validateRIPS                                               │
│  ├─ Fetch BillingRecord from DynamoDB                      │
│  ├─ Validate against RIPS standards                        │
│  ├─ Update BillingRecord.ripsValidationResult              │
│  └─ Create AuditLog entry                                   │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ DynamoDB SDK
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      DynamoDB                               │
├─────────────────────────────────────────────────────────────┤
│  BillingRecord Table                                        │
│  ├─ glosaDefenseText (String)                              │
│  ├─ glosaDefenseGeneratedAt (AWSDateTime)                  │
│  └─ ripsValidationResult (AWSJSON)                         │
│                                                             │
│  AuditLog Table                                             │
│  └─ Operation tracking                                      │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

**Glosa Rebuttal Generation Flow:**
1. Admin clicks "Generar Respuesta AI" button in BillingDashboard
2. Frontend calls `client.queries.glosaDefender({ billingRecordId })`
3. AppSync routes to glosa-defender Lambda
4. Lambda fetches BillingRecord, generates defense letter via Bedrock
5. Lambda updates BillingRecord.glosaDefenseText and glosaDefenseGeneratedAt
6. Lambda creates AuditLog entry
7. Lambda returns defense letter text
8. Frontend displays defense letter in modal with copy-to-clipboard button

**RIPS Validation Flow:**
1. Admin submits RIPS validation form in RipsValidator
2. Frontend calls `client.queries.validateRIPS({ billingRecordId })`
3. AppSync routes to validateRIPS Lambda
4. Lambda fetches BillingRecord, validates against RIPS standards
5. Lambda updates BillingRecord.ripsValidationResult
6. Lambda creates AuditLog entry
7. Lambda returns validation result (pass/fail + details)
8. Frontend displays validation results with pass/fail status

## Components and Interfaces

### Frontend Components

#### BillingDashboard.tsx

**Current State:**
- Has "Generar Respuesta AI" button
- Shows alert("Generación de respuesta AI en desarrollo")

**Required Changes:**
```typescript
// Add state management
const [isGeneratingDefense, setIsGeneratingDefense] = useState(false);
const [defenseLetterModal, setDefenseLetterModal] = useState<{
  isOpen: boolean;
  content: string;
  billingRecordId: string;
}>({ isOpen: false, content: '', billingRecordId: '' });

// Replace alert with Lambda invocation
const handleGenerateDefense = async (billingRecordId: string) => {
  setIsGeneratingDefense(true);
  try {
    const result = await client.queries.glosaDefender({ billingRecordId });
    if (result.data) {
      setDefenseLetterModal({
        isOpen: true,
        content: result.data.defenseText,
        billingRecordId
      });
    } else if (result.errors) {
      showErrorMessage(result.errors[0].message);
    }
  } catch (error) {
    showErrorMessage('Error al generar respuesta AI. Por favor intente nuevamente.');
  } finally {
    setIsGeneratingDefense(false);
  }
};

// Add modal component
<DefenseLetterModal
  isOpen={defenseLetterModal.isOpen}
  content={defenseLetterModal.content}
  onClose={() => setDefenseLetterModal({ ...defenseLetterModal, isOpen: false })}
  onCopy={() => navigator.clipboard.writeText(defenseLetterModal.content)}
/>
```

**Button State:**
```typescript
<button
  onClick={() => handleGenerateDefense(record.id)}
  disabled={isGeneratingDefense}
  className="btn-primary"
>
  {isGeneratingDefense ? (
    <>
      <Spinner size="sm" />
      <span>Generando...</span>
    </>
  ) : (
    'Generar Respuesta AI'
  )}
</button>
```

#### RipsValidator.tsx

**Current State:**
- Has validation form
- May or may not be connected to validateRIPS Lambda

**Required Changes (if not connected):**
```typescript
// Add state management
const [isValidating, setIsValidating] = useState(false);
const [validationResult, setValidationResult] = useState<{
  isValid: boolean;
  errors: string[];
  details: any;
} | null>(null);

// Connect to Lambda
const handleValidate = async (billingRecordId: string) => {
  setIsValidating(true);
  setValidationResult(null);
  try {
    const result = await client.queries.validateRIPS({ billingRecordId });
    if (result.data) {
      setValidationResult({
        isValid: result.data.isValid,
        errors: result.data.errors || [],
        details: result.data.details
      });
    } else if (result.errors) {
      showErrorMessage(result.errors[0].message);
    }
  } catch (error) {
    showErrorMessage('Error al validar RIPS. Por favor intente nuevamente.');
  } finally {
    setIsValidating(false);
  }
};
```

**Validation Results Display:**
```typescript
{validationResult && (
  <div className={`validation-result ${validationResult.isValid ? 'success' : 'error'}`}>
    <h3>{validationResult.isValid ? '✓ Validación Exitosa' : '✗ Validación Fallida'}</h3>
    {!validationResult.isValid && (
      <ul>
        {validationResult.errors.map((error, idx) => (
          <li key={idx}>{error}</li>
        ))}
      </ul>
    )}
  </div>
)}
```

### GraphQL Custom Queries

**Already Defined in Schema:**
```graphql
type Query {
  glosaDefender(billingRecordId: ID!): GlosaDefenseResult
    @function(name: "glosa-defender")
  
  validateRIPS(billingRecordId: ID!): RIPSValidationResult
    @function(name: "rips-validator")
}

type GlosaDefenseResult {
  defenseText: String!
  generatedAt: AWSDateTime!
  billingRecordId: ID!
}

type RIPSValidationResult {
  isValid: Boolean!
  errors: [String!]
  details: AWSJSON
  billingRecordId: ID!
}
```

### Lambda Function Interfaces

**glosa-defender Lambda:**
- **Input:** `{ billingRecordId: string }`
- **Output:** `{ defenseText: string, generatedAt: string, billingRecordId: string }`
- **Side Effects:** Updates BillingRecord, creates AuditLog
- **Timeout:** 60 seconds
- **Already Deployed:** ✅

**validateRIPS Lambda:**
- **Input:** `{ billingRecordId: string }`
- **Output:** `{ isValid: boolean, errors: string[], details: object, billingRecordId: string }`
- **Side Effects:** Updates BillingRecord, creates AuditLog
- **Timeout:** 30 seconds
- **Already Deployed:** ✅

## Data Models

### BillingRecord (Existing Model)

**Relevant Fields:**
```typescript
type BillingRecord {
  id: ID!
  tenantId: String!
  patientId: String!
  shiftId: String
  invoiceNumber: String
  totalValue: Float!
  status: BillingStatus!
  radicationDate: AWSDate
  
  // AI Integration Fields (Phase 12)
  ripsValidationResult: AWSJSON          // Stores validation output
  glosaDefenseText: String               // Stores defense letter
  glosaDefenseGeneratedAt: AWSDateTime   // Timestamp of generation
  
  // Legacy RIPS fields (preserved for compatibility)
  ripsAC: String
  ripsAP: String
  ripsUS: String
  ripsAF: String
  ripsAM: String
  ripsAT: String
  ripsAU: String
}
```

**No Schema Changes Required:** All necessary fields already exist from Phase 12.

### AuditLog (Existing Model)

**Relevant Fields:**
```typescript
type AuditLog {
  id: ID!
  tenantId: String!
  userId: String!
  action: String!           // "GLOSA_DEFENSE_GENERATED" | "RIPS_VALIDATION_EXECUTED"
  entityType: String!       // "BillingRecord"
  entityId: String!         // BillingRecord ID
  details: AWSJSON          // Operation-specific details
  timestamp: AWSDateTime!
}
```

**No Schema Changes Required:** Existing model supports audit logging.

### Frontend State Models

**DefenseLetterModal State:**
```typescript
interface DefenseLetterModalState {
  isOpen: boolean;
  content: string;
  billingRecordId: string;
}
```

**ValidationResult State:**
```typescript
interface ValidationResultState {
  isValid: boolean;
  errors: string[];
  details: any;
}
```

**Loading State:**
```typescript
interface LoadingState {
  isGeneratingDefense: boolean;
  isValidating: boolean;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Acceptance Criteria Testing Prework

Now I'll analyze each acceptance criterion to determine if it's testable as a property, example, or edge case.


### Property Reflection

After analyzing all acceptance criteria, I identified several areas of redundancy:

**Redundancy Group 1: Loading State Properties**
- Properties 1.3, 2.3, 3.2, 3.3 all test loading indicator display
- **Consolidation:** Combine into single property about loading state during async operations

**Redundancy Group 2: Error Handling Properties**
- Properties 1.5, 2.6, 4.2, 4.5 all test error message display
- **Consolidation:** Combine into single property about error handling and display

**Redundancy Group 3: Button State Properties**
- Properties 3.1 and 3.4 test button disable/enable during operations
- **Consolidation:** Combine into single property about button state management

**Redundancy Group 4: Lambda Invocation Properties**
- Properties 1.1, 1.2, 2.1, 2.2, 6.1 all test Lambda invocation with correct data
- **Consolidation:** Combine into single property about Lambda invocation integrity

**Redundancy Group 5: UI Consistency Properties**
- Properties 8.1, 8.2, 8.3, 8.4 all test component reuse
- **Consolidation:** These are examples, not properties - keep as integration test examples

**Properties to Remove:**
- All backend-only properties (1.7, 2.7, 5.1-5.4, 6.3, 7.1-7.5) - not frontend responsibilities
- Property 6.4 - architectural requirement, not testable behavior

**Final Property Count:** 12 unique properties (down from 40 criteria)

### Correctness Properties

**Property 1: Lambda Invocation Integrity**

*For any* billing record and any AI operation (glosa defense or RIPS validation), when the operation is triggered, the system should invoke the correct Lambda function with the billing record ID and current tenant ID.

**Validates: Requirements 1.1, 1.2, 2.1, 2.2, 6.1**

**Property 2: Loading State Consistency**

*For any* async AI operation, while the operation is in progress, the system should display a loading indicator with Spanish text and disable the trigger button.

**Validates: Requirements 1.3, 2.3, 3.1, 3.2, 3.3**

**Property 3: Button State Management**

*For any* AI operation, the trigger button should be disabled during processing and re-enabled after completion (success or failure).

**Validates: Requirements 3.1, 3.4**

**Property 4: Success Response Handling**

*For any* successful Lambda response, the system should display the results in the appropriate UI component (modal for defense letter, results panel for validation).

**Validates: Requirements 1.4, 2.4**

**Property 5: Error Response Handling**

*For any* Lambda error response, the system should display a user-friendly Spanish error message and log the error details to the console.

**Validates: Requirements 1.5, 2.6, 4.2, 4.5**

**Property 6: Defense Letter Modal Display**

*For any* successful glosa defense generation, the system should display the defense letter in a modal with copy-to-clipboard functionality.

**Validates: Requirements 1.4, 1.6**

**Property 7: Validation Results Display**

*For any* RIPS validation response, the system should display pass/fail status and, if failed, show specific compliance errors in Spanish.

**Validates: Requirements 2.4, 2.5**

**Property 8: Tenant Isolation in Requests**

*For any* Lambda invocation, the system should include the current tenant ID in the request and only display results belonging to that tenant.

**Validates: Requirements 6.1, 6.2**

**Property 9: Spanish Localization**

*For any* user-facing text (buttons, labels, messages, errors), the system should use Spanish text consistent with the rest of the application.

**Validates: Requirements 1.3, 2.3, 3.3, 4.1-4.4, 5.5, 8.5**

**Property 10: Success Message Display**

*For any* successful AI operation, the system should display a success message in Spanish confirming the operation completed.

**Validates: Requirements 5.5**

**Property 11: Network Error Handling**

*For any* network connectivity failure, the system should display "Error de conexión. Verifique su conexión a internet." and allow retry.

**Validates: Requirements 4.3** (Edge Case)

**Property 12: Timeout Handling**

*For any* Lambda operation exceeding 30 seconds, the system should display a "still processing" message, and if it times out, show "La operación tardó demasiado. Por favor intente nuevamente."

**Validates: Requirements 3.5, 4.1** (Edge Case)

## Error Handling

### Error Categories

**1. Lambda Execution Errors**
- **Timeout:** Lambda exceeds 60s (glosa-defender) or 30s (validateRIPS)
- **Validation Error:** Lambda returns validation failure (e.g., missing RIPS data)
- **Internal Error:** Lambda crashes or returns 500 error
- **Authorization Error:** User lacks permissions (403)

**2. Network Errors**
- **Connection Failure:** No internet connectivity
- **DNS Resolution:** Cannot reach AppSync endpoint
- **Request Timeout:** Network request exceeds timeout

**3. Client-Side Errors**
- **Invalid Input:** Missing billing record ID
- **State Management:** React state corruption
- **Clipboard API:** Copy-to-clipboard fails

### Error Handling Strategy

**Frontend Error Handling:**
```typescript
const handleLambdaOperation = async (
  operation: 'glosaDefender' | 'validateRIPS',
  billingRecordId: string
) => {
  try {
    const result = await client.queries[operation]({ billingRecordId });
    
    if (result.data) {
      // Success path
      return result.data;
    } else if (result.errors) {
      // GraphQL errors
      const error = result.errors[0];
      if (error.message.includes('timeout')) {
        throw new Error('La operación tardó demasiado. Por favor intente nuevamente.');
      } else if (error.message.includes('authorization')) {
        throw new Error('No tiene permisos para realizar esta operación.');
      } else {
        throw new Error(error.message);
      }
    }
  } catch (error) {
    // Network or client errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifique su conexión a internet.');
    }
    console.error(`Error in ${operation}:`, error);
    throw error;
  }
};
```

**Error Message Mapping:**
| Error Type | Spanish Message |
|------------|----------------|
| Timeout | "La operación tardó demasiado. Por favor intente nuevamente." |
| Network | "Error de conexión. Verifique su conexión a internet." |
| Authorization | "No tiene permisos para realizar esta operación." |
| Validation | (Pass through Lambda error message) |
| Generic | "Error al procesar la solicitud. Por favor intente nuevamente." |

**Error Recovery:**
- All errors allow retry (button re-enabled)
- Error messages displayed for 5 seconds, then auto-dismiss
- Console logging for debugging (includes stack trace)
- No automatic retry (user must manually retry)

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests:

**Unit Tests:** Focus on specific examples, edge cases, and error conditions
- Test specific error messages (timeout, network, authorization)
- Test clipboard copy functionality
- Test modal open/close behavior
- Test form submission with specific data

**Property Tests:** Verify universal properties across all inputs
- Test Lambda invocation with random billing records
- Test loading state consistency across operations
- Test error handling with various error types
- Test tenant isolation with random tenant IDs

**Balance:** Since this is primarily frontend integration work, unit tests will be more prevalent than property tests. Property tests should focus on data integrity and state management.

### Property-Based Testing Configuration

**Library:** fast-check (TypeScript property-based testing library)

**Configuration:**
- Minimum 100 iterations per property test
- Each test references its design document property
- Tag format: **Feature: remaining-integrations, Property {number}: {property_text}**

**Example Property Test:**
```typescript
import fc from 'fast-check';

// Feature: remaining-integrations, Property 1: Lambda Invocation Integrity
test('Lambda invocation includes billing record ID and tenant ID', () => {
  fc.assert(
    fc.property(
      fc.uuid(), // billingRecordId
      fc.uuid(), // tenantId
      async (billingRecordId, tenantId) => {
        const mockClient = createMockClient(tenantId);
        const spy = jest.spyOn(mockClient.queries, 'glosaDefender');
        
        await handleGenerateDefense(billingRecordId, mockClient);
        
        expect(spy).toHaveBeenCalledWith({
          billingRecordId,
          // tenantId is implicit in auth context
        });
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Testing Strategy

**Component Tests:**
- BillingDashboard.tsx: Test button click, modal display, loading states
- RipsValidator.tsx: Test form submission, results display, error handling

**Integration Tests:**
- Test complete glosa defense flow (button → Lambda → modal)
- Test complete RIPS validation flow (form → Lambda → results)
- Test error scenarios (timeout, network, authorization)

**Mock Strategy:**
- Mock Amplify client queries (glosaDefender, validateRIPS)
- Mock clipboard API for copy functionality
- Mock setTimeout for timeout testing

**Test Coverage Goals:**
- 90%+ line coverage for modified components
- 100% coverage for error handling paths
- All 12 correctness properties tested

### Manual Testing Checklist

**Glosa Defense Generation:**
1. Click "Generar Respuesta AI" button
2. Verify loading indicator appears
3. Verify button is disabled during processing
4. Verify modal displays defense letter on success
5. Verify copy-to-clipboard works
6. Verify error message on failure
7. Verify button re-enables after completion

**RIPS Validation:**
1. Submit validation form
2. Verify loading indicator appears
3. Verify button is disabled during processing
4. Verify results display pass/fail status
5. Verify error details shown on failure
6. Verify error message on Lambda failure
7. Verify button re-enables after completion

**Error Scenarios:**
1. Test with invalid billing record ID
2. Test with network disconnected
3. Test with expired auth token
4. Test with Lambda timeout (mock)
5. Verify all error messages in Spanish

**Multi-Tenant Testing:**
1. Login as tenant A, generate defense letter
2. Login as tenant B, verify cannot see tenant A data
3. Verify tenant ID included in all requests

### Test Data Requirements

**Mock Billing Records:**
- Valid record with all RIPS fields populated
- Valid record with missing RIPS fields (validation should fail)
- Invalid record ID (should trigger error)

**Mock Lambda Responses:**
- Successful glosa defense (with defense text)
- Successful RIPS validation (pass)
- Failed RIPS validation (with error list)
- Timeout error
- Authorization error
- Generic error

**Test Users:**
- Admin user (tenant IPS-001)
- Admin user (tenant IPS-002)
- Nurse user (should not have access)
