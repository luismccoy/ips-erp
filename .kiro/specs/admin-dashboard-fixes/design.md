# Admin Dashboard Logic Fixes - Design

## Architecture Overview
This phase focuses on schema updates, authorization fixes, and Lambda improvements to resolve Admin Dashboard logic gaps.

## Component Design

### 1. Schema Updates (amplify/data/resource.ts)

#### 1.1 BillingRecord Model Enhancement
```typescript
BillingRecord: a.model({
  // ... existing fields
  
  // AI Persistence Fields
  ripsValidationResult: a.json(),           // Stores validateRIPS JSON output
  glosaDefenseText: a.string(),             // Stores glosaDefender markdown
  glosaDefenseGeneratedAt: a.datetime(),    // Timestamp of AI generation
})
.authorization(allow => [
  allow.ownerDefinedIn('tenantId').identityClaim('custom:tenantId'),
  allow.groups(['ADMIN']).to(['create', 'read', 'update', 'delete'])
])
```

**Rationale:**
- `ripsValidationResult` as JSON allows flexible storage of validation details
- `glosaDefenseText` stores markdown-formatted rebuttal letters
- `glosaDefenseGeneratedAt` tracks when AI output was created
- Maintains backward compatibility with existing BillingRecord fields

#### 1.2 InventoryItem Authorization Fix
```typescript
InventoryItem: a.model({
  // ... existing fields
})
.authorization(allow => [
  allow.ownerDefinedIn('tenantId').identityClaim('custom:tenantId'),
  allow.groups(['ADMIN']).to(['create', 'read', 'update', 'delete']),
  allow.groups(['NURSE']).to(['read'])  // Nurses can view inventory
])
```

**Rationale:**
- Explicit ADMIN group authorization for write operations
- Maintains tenant isolation via ownerDefinedIn
- Nurses retain read-only access for operational needs

#### 1.3 Shift Model Authorization Enhancement
```typescript
Shift: a.model({
  // ... existing fields
})
.authorization(allow => [
  allow.ownerDefinedIn('tenantId').identityClaim('custom:tenantId'),
  allow.groups(['ADMIN']).to(['create', 'read', 'update', 'delete']),
  allow.groups(['NURSE']).to(['read'])  // Nurses view their shifts
])
```

### 2. Lambda Function Updates

#### 2.1 rejectVisit Lambda Enhancement
**File:** `amplify/functions/reject-visit/handler.ts`

**Current Issue:** Race condition causes rejected visits to persist in pending list

**Solution:**
```typescript
// Use consistent read and immediate return of updated item
const updateCommand = new UpdateCommand({
  TableName: process.env.VISIT_TABLE_NAME,
  Key: { id: visitId },
  UpdateExpression: 'SET #status = :rejected, rejectionReason = :reason, rejectedAt = :timestamp',
  ExpressionAttributeNames: { '#status': 'status' },
  ExpressionAttributeValues: {
    ':rejected': 'REJECTED',
    ':reason': rejectionReason,
    ':timestamp': new Date().toISOString()
  },
  ReturnValues: 'ALL_NEW',  // Return updated item immediately
  ConsistentRead: true       // Strong consistency
});

const result = await docClient.send(updateCommand);
return result.Attributes;  // Return updated Visit object
```

**Key Changes:**
- Use `ReturnValues: 'ALL_NEW'` to get updated item
- Enable strong consistency for immediate visibility
- Return complete Visit object with status=REJECTED
- Add `rejectedAt` timestamp for audit trail

#### 2.2 validateRIPS Lambda Enhancement
**File:** `amplify/functions/rips-validator/handler.ts`

**New Behavior:** Save validation results to BillingRecord

```typescript
// After AI validation
const validationResult = await validateRIPSWithAI(billingData);

// Save to BillingRecord
const updateCommand = new UpdateCommand({
  TableName: process.env.BILLING_RECORD_TABLE_NAME,
  Key: { id: billingRecordId },
  UpdateExpression: 'SET ripsValidationResult = :result',
  ExpressionAttributeValues: {
    ':result': validationResult
  }
});

await docClient.send(updateCommand);
return validationResult;
```

#### 2.3 glosaDefender Lambda Enhancement
**File:** `amplify/functions/glosa-defender/handler.ts`

**New Behavior:** Save defense text to BillingRecord

```typescript
// After AI generation
const defenseText = await generateGlosaDefense(glosaData);

// Save to BillingRecord
const updateCommand = new UpdateCommand({
  TableName: process.env.BILLING_RECORD_TABLE_NAME,
  Key: { id: billingRecordId },
  UpdateExpression: 'SET glosaDefenseText = :text, glosaDefenseGeneratedAt = :timestamp',
  ExpressionAttributeValues: {
    ':text': defenseText,
    ':timestamp': new Date().toISOString()
  }
});

await docClient.send(updateCommand);
return defenseText;
```

### 3. Test User Creation Script

**File:** `.local-tests/create-test-users.sh` (already exists, needs update)

```bash
#!/bin/bash
# Create permanent test personas

USER_POOL_ID=$(aws cognito-idp list-user-pools --max-results 10 | jq -r '.UserPools[] | select(.Name | contains("amplify")) | .Id')

# Admin User
aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username admin.test@ips.com \
  --user-attributes \
    Name=email,Value=admin.test@ips.com \
    Name=custom:tenantId,Value=IPS-001 \
    Name=custom:role,Value=ADMIN \
  --temporary-password "TempPass123!" \
  --message-action SUPPRESS

# Nurse User
aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username nurse.maria@ips.com \
  --user-attributes \
    Name=email,Value=nurse.maria@ips.com \
    Name=custom:tenantId,Value=IPS-001 \
    Name=custom:role,Value=NURSE \
  --temporary-password "TempPass123!" \
  --message-action SUPPRESS

# Family User
aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username family.perez@ips.com \
  --user-attributes \
    Name=email,Value=family.perez@ips.com \
    Name=custom:role,Value=FAMILY \
  --temporary-password "TempPass123!" \
  --message-action SUPPRESS
```

### 4. Subscription Filter Enhancement

**File:** `amplify/data/resource.ts`

Ensure Visit subscriptions filter out REJECTED status:

```typescript
// In Visit model subscriptions
.onCreate({
  filter: {
    and: [
      { tenantId: { eq: '$context.identity.claims.custom:tenantId' } },
      { status: { eq: 'SUBMITTED' } }  // Only SUBMITTED visits
    ]
  }
})
```

## Data Flow Diagrams

### AI Output Persistence Flow
```
Admin clicks "Validate RIPS"
  ↓
Frontend calls validateRIPS Lambda
  ↓
Lambda validates with AI
  ↓
Lambda saves result to BillingRecord.ripsValidationResult
  ↓
Lambda returns result to frontend
  ↓
Frontend displays result (can be retrieved later)
```

### Visit Rejection Flow
```
Admin clicks "Reject" on pending visit
  ↓
Frontend calls rejectVisit mutation
  ↓
Lambda updates Visit status to REJECTED (strong consistency)
  ↓
Lambda returns updated Visit object
  ↓
Frontend removes visit from pending list (optimistic update)
  ↓
Subscription filter prevents REJECTED visits from appearing
  ↓
Nurse receives notification of rejection
```

## Security Considerations

### Authorization Matrix
| Model | Admin | Nurse | Family |
|-------|-------|-------|--------|
| BillingRecord | CRUD | - | - |
| InventoryItem | CRUD | R | - |
| Shift | CRUD | R | - |
| Visit | CRUD | CRU | R (approved only) |

### Tenant Isolation
- All models enforce `ownerDefinedIn('tenantId')`
- Lambda functions validate `custom:tenantId` claim
- Cross-tenant access blocked at authorization layer

## Performance Considerations

### DynamoDB Optimization
- Use `ReturnValues: 'ALL_NEW'` to avoid extra read operations
- Strong consistency only where needed (rejectVisit)
- Batch operations for test data creation

### Lambda Cold Start
- Existing Lambdas already optimized
- No new Lambda functions required
- Reuse existing DynamoDB connections

## Testing Strategy

### Unit Tests (Manual via AppSync Console)
1. Test BillingRecord AI field updates
2. Test InventoryItem CRUD by Admin
3. Test Visit rejection consistency
4. Test Shift creation by Admin

### Integration Tests (Automated Script)
1. Create test users
2. Populate test data (patients, shifts, visits)
3. Execute full workflow (create → submit → reject → approve)
4. Verify AI outputs persist
5. Verify authorization rules

### End-to-End Tests (Manual)
1. Login as admin.test@ips.com
2. Test all Admin Dashboard modules
3. Verify data persistence across page refreshes
4. Test multi-tenant isolation

## Rollback Plan

### If Deployment Fails
1. Revert schema changes: `git revert <commit>`
2. Redeploy previous version: `npx ampx sandbox --once`
3. Verify existing functionality intact

### If Authorization Issues
1. Temporarily grant broader permissions
2. Debug with CloudWatch Logs
3. Fix authorization rules
4. Redeploy with corrected rules

## Success Criteria

### Technical
- ✅ Schema updated with 3 new BillingRecord fields
- ✅ Authorization rules allow Admin write access
- ✅ rejectVisit returns updated Visit object
- ✅ AI outputs persist to database
- ✅ Test users created and functional

### User Experience
- ✅ Rejected visits disappear immediately
- ✅ AI outputs survive page refresh
- ✅ Inventory can be edited by Admin
- ✅ Shifts can be created by Admin
- ✅ No stale data in pending reviews

### Operational
- ✅ File count ≤ 20 in amplify/
- ✅ Zero downtime deployment
- ✅ All changes documented
- ✅ Test scripts in .local-tests/
- ✅ Backward compatible with existing data
