# Production Data Integrity Audit

## Overview
This document outlines data integrity risks and recommendations for the healthcare ERP system, focusing on GraphQL schemas, form validation, data persistence, and sync mechanisms.

## Schema Analysis

### Core Models
1. Visit Model
   - **Required Fields**: ✓
     - id (ID!)
     - patientId (ID!)
     - nurseId (ID!)
     - tenantId (ID!)
     - status (String!)
     - createdAt (AWSDateTime!)
     - updatedAt (AWSDateTime!)
   
   - **Optional Fields**: ✓
     - kardex (String)
     - vitalsRecorded (String)
     - medicationsAdministered (String)
     - tasksCompleted (String)
     - assessment (PatientAssessment @hasOne)
     - rejectionReason (String)

2. PatientAssessment Model
   - **Required Fields**: ✓
     - id (ID!)
     - patientId (ID!)
     - nurseId (ID!)
     - tenantId (ID!)
     - assessedAt (AWSDateTime!)
     - createdAt (AWSDateTime!)
     - updatedAt (AWSDateTime!)

   - **Optional but Structured Fields**: ✓
     - visitId (ID) - potential referential integrity concern
     - nested score objects (all fields required when parent is present)

## Validation Gaps

### 1. Referential Integrity
#### Risks
- No explicit foreign key constraints in GraphQL schema
- visitId in PatientAssessment can be orphaned
- No cascade delete behavior defined

#### Recommendations
1. Implement application-level foreign key checks:
```typescript
// Before creating PatientAssessment
const visitExists = await API.graphql({
  query: getVisit,
  variables: { id: visitId }
});
if (!visitExists.data.getVisit) {
  throw new Error('Invalid visit reference');
}
```

2. Add bi-directional sync for Visit-Assessment relationship
3. Implement cleanup jobs for orphaned assessments

### 2. Data Type Validation

#### Risks
- String fields like 'status' lack enumeration constraints
- No validation on JSON-string fields (kardex, vitalsRecorded, etc.)
- Score fields allow invalid ranges

#### Recommendations
1. Add enums for constrained fields:
```graphql
enum VisitStatus {
  DRAFT
  SUBMITTED
  APPROVED
  REJECTED
  COMPLETED
}

type Visit {
  status: VisitStatus!
  # ...
}
```

2. Implement JSON schema validation for structured string fields:
```typescript
const kardexSchema = {
  type: 'object',
  required: ['timestamp', 'entries'],
  properties: {
    timestamp: { type: 'string', format: 'date-time' },
    entries: {
      type: 'array',
      items: {
        type: 'object',
        required: ['type', 'value'],
        properties: {
          type: { type: 'string' },
          value: { type: 'string' }
        }
      }
    }
  }
};
```

3. Add range validations for all score fields:
```graphql
input GlasgowScoreInput {
  eye: Int! @range(min: 1, max: 4)
  verbal: Int! @range(min: 1, max: 5)
  motor: Int! @range(min: 1, max: 6)
}
```

### 3. Optimistic Updates & Rollback

#### Risks
- No version control on critical fields
- Race conditions possible during concurrent updates
- No audit trail for changes

#### Recommendations
1. Implement version numbers:
```graphql
type Visit {
  # ...
  version: Int!
}
```

2. Add optimistic locking:
```typescript
const updateVisit = async (id: string, data: any, version: number) => {
  try {
    const result = await API.graphql({
      query: updateVisitMutation,
      variables: {
        input: {
          id,
          ...data,
          expectedVersion: version
        }
      }
    });
    return result.data.updateVisit;
  } catch (err) {
    if (err.message.includes('Version mismatch')) {
      // Handle conflict - retry or show error
    }
    throw err;
  }
};
```

3. Implement change tracking:
```graphql
type VisitHistory {
  id: ID!
  visitId: ID!
  field: String!
  oldValue: String
  newValue: String
  changedBy: ID!
  changedAt: AWSDateTime!
}
```

### 4. Offline Data Sync

#### Risks
- Potential data loss during sync conflicts
- No clear conflict resolution strategy
- Missing offline data validation

#### Recommendations
1. Implement DataStore with conflict resolution:
```typescript
const schema = {
  name: 'Visit',
  fields: {
    id: { type: 'ID', isRequired: true },
    // ...
  },
  syncable: true,
  conflictHandler: {
    type: 'AUTOMERGE',
    resolver: (data: any, server: any) => {
      // Custom merge logic
      return {
        ...server,
        localOnlyFields: data.localOnlyFields
      };
    }
  }
};
```

2. Add offline validation:
```typescript
const validateOfflineData = async (data: any) => {
  // Basic validation that can run offline
  const validationRules = {
    required: ['patientId', 'nurseId', 'status'],
    ranges: {
      'assessment.glasgowScore.eye': [1, 4],
      // ...
    }
  };
  
  // Run validations
  const errors = [];
  // ... validation logic
  return errors;
};
```

3. Implement sync queue monitoring:
```typescript
DataStore.observe(Visit).subscribe(msg => {
  if (msg.opType === 'INSERT' || msg.opType === 'UPDATE') {
    // Log sync operations
    console.log('Sync operation:', msg);
    // Monitor for failures
    if (msg.element.syncError) {
      // Handle sync error
    }
  }
});
```

## Critical Fixes Needed

1. **High Priority**
   - Add version control to Visit and Assessment models
   - Implement required field validation at API Gateway level
   - Add referential integrity checks for Visit-Assessment relationship

2. **Medium Priority**
   - Create JSON schemas for structured string fields
   - Implement offline validation rules
   - Add audit logging for critical operations

3. **Low Priority**
   - Add field-level encryption for sensitive data
   - Implement soft delete
   - Add data quality metrics collection

## Implementation Plan

1. **Immediate Actions (Week 1)**
```typescript
// Add versions and validation
const visitSchema = /* GraphQL */ `
  type Visit @model @auth(rules: [{allow: private}]) {
    id: ID!
    version: Int!
    # ... existing fields
    _lastModified: AWSTimestamp!
    _deleted: Boolean
  }
`;
```

2. **Short Term (Week 2-3)**
- Implement validation middleware
- Add conflict resolution handlers
- Set up audit logging

3. **Long Term (Month 1+)**
- Implement automated testing for data integrity
- Set up monitoring and alerts
- Create data recovery procedures

## Monitoring Recommendations

1. Set up CloudWatch alarms for:
   - Failed sync operations
   - Validation errors
   - Orphaned records
   - Concurrent update conflicts

2. Regular audit reports for:
   - Data quality metrics
   - Sync success rates
   - Error patterns
   - Usage patterns

## Next Steps

1. Review and prioritize recommendations
2. Create detailed implementation tickets
3. Set up monitoring baseline
4. Begin with high-priority fixes