# 🚀 KIRO IDE BACKEND SUPER PROMPT
## IPS-ERP Healthcare Home Care Management System

**Date**: 2026-01-27  
**Stack**: AWS Amplify Gen 2, AppSync GraphQL, DynamoDB, Lambda, Cognito, Bedrock  
**Repo**: `~/projects/ERP` (or clone from GitHub)

---

## 🎯 MISSION BRIEFING

You are a senior backend engineer working on **IPS-ERP**, a multi-tenant healthcare ERP for Colombian home care providers. Your mission tonight is to tackle the remaining backend tasks in priority order.

**The frontend is 100% complete. The backend needs your expertise.**

---

## 📋 TONIGHT'S TASK QUEUE (Priority Order)

### 🔴 TASK 1: Nurse.cognitoSub Identity Validation (P1 - 3 hours)
**Status**: NOT STARTED  
**Risk**: Medium (allows orphaned identity mappings)

**Problem**: The `Nurse` model has a `cognitoSub` field but it's not validated during creation. Any user could create a Nurse record with a fake `cognitoSub`.

**Files to Modify**:
- `amplify/data/resource.ts` (add custom mutation)
- `amplify/functions/` (create new function)

**Implementation Options**:

**Option A (Recommended): Custom Mutation with Validation**
```typescript
// In amplify/data/resource.ts - add custom mutation
createNurseWithValidation: a.mutation()
    .arguments({
        name: a.string().required(),
        email: a.string(),
        role: a.enum(['ADMIN', 'NURSE', 'COORDINATOR']),
        skills: a.string().array(),
    })
    .returns(a.ref('Nurse'))
    .authorization(allow => [allow.authenticated()])
    .handler(a.handler.function('create-nurse-validated'))
```

Create `amplify/functions/create-nurse-validated/`:
```typescript
// handler.ts
export const handler = async (event) => {
    const { identity } = event;
    const tenantId = identity.claims['custom:tenantId'];
    const cognitoSub = identity.sub; // REAL identity from JWT
    
    // Verify caller is ADMIN in their tenant
    const groups = identity.claims['cognito:groups'] || [];
    if (!groups.includes('Admin') && !groups.includes('SuperAdmin')) {
        throw new Error('Only admins can create nurses');
    }
    
    // Create nurse with validated cognitoSub
    const nurse = {
        id: crypto.randomUUID(),
        tenantId,
        cognitoSub, // Guaranteed to match real identity
        name: event.arguments.name,
        email: event.arguments.email,
        role: event.arguments.role || 'NURSE',
        skills: event.arguments.skills || [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    
    await ddbClient.send(new PutCommand({
        TableName: process.env.NURSE_TABLE,
        Item: nurse,
        ConditionExpression: 'attribute_not_exists(cognitoSub)', // Prevent duplicates
    }));
    
    return nurse;
};
```

**Acceptance Criteria**:
- [ ] Custom mutation `createNurseWithValidation` exists
- [ ] Lambda validates `identity.sub` matches cognitoSub
- [ ] Only Admin/SuperAdmin can create nurses
- [ ] Duplicate cognitoSub prevention
- [ ] TypeScript compiles cleanly

---

### 🟡 TASK 2: Subscription Authorization Security (P2 - 2 hours)
**Status**: NOT STARTED  
**Risk**: HIGH (potential data leakage across tenants)

**Problem**: Real-time subscriptions may bypass tenant isolation.

**Files to Audit**:
- `amplify/data/resource.ts` (all models with subscriptions)
- `src/components/AdminDashboard.tsx` (uses subscriptions)

**Verification Steps**:
1. Find all `.onCreate()`, `.onUpdate()`, `.onDelete()` subscription usage
2. Verify each subscription filters by `tenantId`
3. Test with two different tenant JWTs

**Fix if Needed**:
```typescript
// Ensure Notification model has tenant-scoped subscriptions
Notification: a.model({
    tenantId: a.id().required(),
    // ...
}).authorization(allow => [
    allow.ownerDefinedIn('tenantId').identityClaim('custom:tenantId'),
])
```

**Acceptance Criteria**:
- [ ] Audit report of all subscription usage
- [ ] Confirmation that tenant filtering is enforced
- [ ] Fix applied if any leakage found

---

### 🟡 TASK 3: Family Portal Rate Limiting (P2 - 4 hours)
**Status**: NOT STARTED  
**Risk**: Medium (brute force vulnerability)

**Problem**: `verify-family-access` Lambda has no rate limiting on failed attempts.

**File**: `amplify/functions/verify-family-access/handler.ts`

**Implementation**:
```typescript
// Add at top of handler
const RATE_LIMIT_TABLE = process.env.RATE_LIMIT_TABLE;
const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

// Check rate limit before verification
const rateLimitKey = `family-access:${patientId}:${clientIp}`;
const attempts = await getRateLimitCount(rateLimitKey);

if (attempts >= MAX_ATTEMPTS) {
    // Log to AuditLog
    await logSecurityEvent({
        action: 'FAMILY_ACCESS_BLOCKED',
        patientId,
        reason: 'Rate limit exceeded',
    });
    throw new Error('Too many failed attempts. Try again later.');
}

// On failed attempt
if (!accessCodeValid) {
    await incrementRateLimit(rateLimitKey, LOCKOUT_MINUTES);
    await logSecurityEvent({
        action: 'FAMILY_ACCESS_FAILED',
        patientId,
    });
}

// On success - clear rate limit
await clearRateLimit(rateLimitKey);
```

**Acceptance Criteria**:
- [ ] Rate limiting implemented (5 attempts, 15 min lockout)
- [ ] Failed attempts logged to AuditLog
- [ ] Security events captured

---

### 🟠 TASK 4: RIPS Validator AI Enhancement (P3 - 4 hours)
**Status**: Basic validation only, no AI  
**Risk**: Low (enhancement)

**Problem**: `rips-validator` only does field validation, doesn't use AI like `glosa-defender`.

**Files**:
- `amplify/functions/rips-validator/handler.ts`
- `amplify/functions/rips-validator/resource.ts`
- Copy `ai-client.ts` from `roster-architect/`

**Enhancement**:
```typescript
// Add AI validation in handler.ts
import { AIClient } from './ai-client';

const aiClient = new AIClient();

// After basic field validation passes
const aiValidation = await aiClient.invokeModel({
    modelId: process.env.MODEL_ID,
    prompt: `
        You are a Colombian RIPS compliance expert.
        Validate this billing record for Resolución 2275/2023 compliance:
        
        ${JSON.stringify(billingRecord)}
        
        Check for:
        1. Valid CUPS codes
        2. Matching ICD-10 diagnosis codes
        3. Required fields for home care (código servicio 05)
        4. Date consistency
        5. Authorization number format
        
        Return JSON: { valid: boolean, issues: string[], suggestions: string[] }
    `,
    maxTokens: 1000,
});
```

**Acceptance Criteria**:
- [ ] AI client added to rips-validator
- [ ] Bedrock MODEL_ID in resource.ts environment
- [ ] Returns compliance issues and suggestions
- [ ] Handles AI errors gracefully (fallback to basic validation)

---

### 🔵 TASK 5: Database GSI Optimization (P4 - 3 hours)
**Status**: NOT STARTED  
**Risk**: Medium (requires deployment)

**Problem**: Several queries use expensive table scans instead of GSI queries.

**File**: `amplify/data/resource.ts`

**Add These GSIs**:
```typescript
// Visit - query pending reviews by tenant
Visit: a.model({
    // ... existing fields
}).secondaryIndexes(index => [
    index('tenantId')
        .sortKeys(['status'])
        .name('byTenantStatus'),
])

// Shift - query by nurse schedule
Shift: a.model({
    // ... existing fields  
}).secondaryIndexes(index => [
    index('nurseId')
        .sortKeys(['scheduledTime'])
        .name('byNurseSchedule'),
])

// Notification - query unread by user
Notification: a.model({
    // ... existing fields
}).secondaryIndexes(index => [
    index('userId')
        .sortKeys(['read'])
        .name('byUserReadStatus'),
])
```

**Acceptance Criteria**:
- [ ] 3 new GSIs added
- [ ] Deploys successfully with `npx ampx sandbox`
- [ ] Document migration notes if needed

---

### 🟣 TASK 6: Offline Sync Backend Support (P5 - 3 hours)
**Status**: NOT STARTED (Phase 2 of Offline Spec)  
**Risk**: Low

**Reference**: `docs/OFFLINE_SYNC_SPEC.md` Section 9.1 Phase 2

**Tasks**:
1. Ensure all models have `_version`, `_lastChangedAt`, `_deleted` fields (Amplify DataStore requirement)
2. Configure conflict resolution strategy in backend
3. Add `@model` timestamps

**File**: `amplify/data/resource.ts`

```typescript
// Amplify Gen 2 handles versioning automatically when using DataStore
// Verify models support optimistic locking

// Add to each model that needs offline sync:
Visit: a.model({
    // ... fields
    _version: a.integer(), // Auto-managed by DataStore
    _lastChangedAt: a.integer(), // Auto-managed
}).authorization(/* ... */)
```

**Acceptance Criteria**:
- [ ] Models support DataStore versioning
- [ ] Conflict resolution documented
- [ ] Test offline → online sync flow

---

## 🛠️ ENVIRONMENT SETUP

```bash
# 1. Navigate to project
cd ~/projects/ERP

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Check AWS credentials
aws sts get-caller-identity

# 4. Set region
export AWS_REGION=us-east-1

# 5. Start sandbox (deploys backend)
npx ampx sandbox

# 6. Run TypeScript check
npx tsc --noEmit
```

---

## 📁 KEY FILE LOCATIONS

```
amplify/
├── backend.ts                 # Main backend definition
├── auth/resource.ts           # Cognito configuration
├── data/resource.ts           # GraphQL schema (⭐ MAIN FILE)
└── functions/
    ├── roster-architect/      # AI scheduling (reference for AI pattern)
    ├── rips-validator/        # RIPS validation (needs AI enhancement)
    ├── glosa-defender/        # AI billing defense (reference)
    ├── verify-family-access/  # Family portal (needs rate limiting)
    ├── create-visit-draft/    # Visit workflow
    ├── submit-visit/          # Visit workflow
    ├── reject-visit/          # Visit workflow
    ├── approve-visit/         # Visit workflow
    └── list-approved-visit-summaries/  # Family queries

docs/
├── KIRO_BACKEND_TASKS.md      # Full task list with status
├── OFFLINE_SYNC_SPEC.md       # Offline architecture spec
├── EXTERNAL_INTEGRATIONS_SPEC.md  # RIPS/MIPRES compliance
└── API_DOCUMENTATION.md       # GraphQL API docs
```

---

## ✅ COMMIT GUIDELINES

```bash
# Use conventional commits
git commit -m "feat(auth): add Nurse identity validation mutation"
git commit -m "fix(security): add rate limiting to family access"
git commit -m "perf(db): add GSI for Visit status queries"

# Push after each task completion
git push origin main
```

---

## 🚨 IMPORTANT NOTES

1. **DO NOT modify frontend files** (in `src/components/`) unless specifically needed for backend integration
2. **Always run `npx tsc --noEmit`** before committing
3. **Test with sandbox** before pushing: `npx ampx sandbox --once`
4. **Bedrock model access** must be enabled in AWS Console for AI functions
5. **Memory issues on EC2** - if build fails, it's infra not code. Push and let Amplify CI/CD build.

---

## 📊 PROGRESS TRACKING

After completing each task, update `docs/KIRO_BACKEND_TASKS.md`:
```markdown
### 1.2 Nurse.cognitoSub Identity Mapping
**Status**: ✅ COMPLETED (2026-01-27)
**Resolution**: Created custom mutation with Lambda validation
**Commit**: abc1234
```

---

## 🎯 SUCCESS CRITERIA

By end of session:
- [ ] Task 1 (Nurse validation) - MUST COMPLETE
- [ ] Task 2 (Subscription audit) - MUST COMPLETE  
- [ ] Task 3 (Rate limiting) - HIGH PRIORITY
- [ ] Task 4 (RIPS AI) - IF TIME PERMITS
- [ ] Task 5 (GSIs) - IF TIME PERMITS
- [ ] Task 6 (Offline) - IF TIME PERMITS

**Minimum viable**: Tasks 1-3 completed and pushed.

---

## 💬 COORDINATION

- **Clawd** (EC2 agent): Handles audits, deployments, git operations
- **Antigravity** (Mac): Frontend UX work
- **Kiro** (You): Backend infrastructure, Lambda, GraphQL

When done, push to `main` and notify: "Kiro backend tasks complete, ready for integration testing."

---

**GO BUILD! 🚀**
