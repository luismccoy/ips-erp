# 📚 KIRO - Documentation & Testing Rules

**MANDATORY READING - Follow These Rules to Avoid File Bloat**

---

## 🚫 WHAT NOT TO CREATE

### ❌ NEVER Create These Files:

#### Testing Files (DON'T CREATE):
- ❌ `tests/` directory
- ❌ `*.test.ts` files
- ❌ `*.spec.ts` files
- ❌ `jest.config.js`
- ❌ `mocha.config.js`
- ❌ `test-utils.ts`
- ❌ `setupTests.ts`
- ❌ `mock-*.ts` (frontend already has mocks)
- ❌ `scripts/run-tests.sh`
- ❌ `scripts/test-lambda.sh`

**Why?** Amplify has built-in testing. Use AppSync console and Lambda test events.

#### Documentation Files (DON'T CREATE):
- ❌ `docs/AUTH_GUIDE.md`
- ❌ `docs/DATA_MODEL_GUIDE.md`
- ❌ `docs/LAMBDA_GUIDE.md`
- ❌ `docs/DEPLOYMENT_GUIDE.md`
- ❌ `README-*.md` (per feature)
- ❌ `CHANGELOG.md`
- ❌ `API_REFERENCE_*.md` (per model)

**Why?** One file (`docs/API_DOCUMENTATION.md`) is enough.

#### Utility/Helper Files (DON'T CREATE):
- ❌ `utils/` directory
- ❌ `helpers/` directory
- ❌ `lib/` directory
- ❌ `common/` directory
- ❌ `shared/` directory
- ❌ `types.ts` (outside Lambda functions)
- ❌ `constants.ts`
- ❌ `config.ts`

**Why?** Keep logic in main resource files. Don't over-engineer.

#### Script Files (DON'T CREATE):
- ❌ `scripts/deploy.sh`
- ❌ `scripts/seed-data.sh`
- ❌ `scripts/setup.sh`
- ❌ `scripts/migrate.sh`
- ❌ `scripts/backup.sh`
- ❌ Any `.sh` or `.js` script files

**Why?** Amplify CLI handles all deployment. No scripts needed.

---

## ✅ WHAT TO CREATE (ONLY THESE)

### Documentation: ONE File Only

**File:** `docs/API_DOCUMENTATION.md`

**Structure:**
```markdown
# IPS ERP - Backend API Documentation

Last Updated: [Date]

## Authentication

### Sign Up
[How to create user]

### Sign In
[How to authenticate]

### User Groups
- Admin: [permissions]
- Nurse: [permissions]
- Family: [permissions]

---

## Data Models

### Tenant
GraphQL Type: `Tenant`
Fields: [list fields]
Authorization: [who can access]

Example Query:
```graphql
[query example]
```

### Patient
[Same structure]

[Repeat for all 7 models]

---

## Lambda Functions

### Roster Architect
Endpoint: [how to invoke]
Input: [example JSON]
Output: [example JSON]
Authorization: Admin only

### Billing Validator
[Same structure]

### RIPS Generator
[Same structure]

---

## Subscriptions

### Shift Updates
[How to subscribe]

### Inventory Alerts
[How to subscribe]

---

## Error Codes

| Code | Message | Cause | Solution |
|------|---------|-------|----------|
| 401 | Unauthorized | No valid JWT | Sign in again |
| 403 | Forbidden | Wrong tenant | Check user tenantId |
[etc.]
```

**Update This File After Each Phase Completion**

---

## 🧪 TESTING APPROACH

### Phase 1: Authentication Testing

**Tool:** AWS Cognito Console

**Test Cases:**
1. Create user with tenantId
   - Go to Cognito User Pool
   - Create user manually
   - Add `custom:tenantId` attribute
   - Verify user created
   
2. Sign in and get JWT
   - Use Amplify library in frontend
   - Check JWT contains `custom:tenantId`
   - Verify token valid

3. Test user groups
   - Assign user to Admin group
   - Verify group membership
   - Check JWT includes groups claim

**Documentation:**
Update `docs/API_DOCUMENTATION.md` → Authentication section

**Success:** ✅ Users can sign in, JWT includes tenantId

---

### Phase 2: Data Models Testing

**Tool:** AppSync Console (GraphQL Playground)

**Test Cases:**
1. Create Tenant
   ```graphql
   mutation CreateTenant {
     createTenant(input: {
       id: "ips-test"
       name: "Test IPS"
       nit: "900.000.000-1"
     }) {
       id name
     }
   }
   ```
   - Run in AppSync console
   - Verify tenant created
   - Check DynamoDB table

2. Create Patient (with tenant isolation)
   ```graphql
   mutation CreatePatient {
     createPatient(input: {
       name: "Test Patient"
       tenantId: "ips-test"
       diagnosis: "Test"
     }) {
       id name tenantId
     }
   }
   ```
   - Run as user with `tenantId=ips-test`
   - Verify patient created
   - Try accessing as different tenant → should fail

3. Test Authorization
   - Sign in as User A (tenant: ips-test)
   - Query patients → should only see ips-test patients
   - Sign in as User B (tenant: ips-other)
   - Query patients → should only see ips-other patients

**Repeat for all 7 models**

**Documentation:**
Update `docs/API_DOCUMENTATION.md` → Data Models section for each model

**Success:** ✅ All models queryable, authorization works

---

### Phase 3-5: Lambda Functions Testing

**Tool:** Lambda Console (Test Events)

**For Each Lambda:**

1. Create Test Event
   ```json
   {
     "tenantId": "ips-test",
     "input": { /* function-specific data */ }
   }
   ```

2. Invoke Lambda
   - Click "Test" in Lambda console
   - Review execution logs
   - Check CloudWatch for errors
   - Verify response format

3. Test Integration
   - Invoke via AppSync (if triggered by GraphQL)
   - OR invoke directly via AWS SDK
   - Verify end-to-end flow

**Example: Roster Architect**
```json
// Test Event
{
  "tenantId": "ips-test",
  "date": "2026-01-27",
  "nurses": [
    { "id": "n1", "name": "Maria", "baseLocation": {"lat": 4.6, "lng": -74} }
  ],
  "patients": [
    { "id": "p1", "name": "Roberto", "geoLocation": {"lat": 4.7, "lng": -74.1} }
  ]
}

// Expected Output
{
  "assignments": [
    { "nurseId": "n1", "shifts": [...] }
  ]
}
```

**Check:**
- ✅ Lambda executes without timeout
- ✅ Response matches expected format
- ✅ CloudWatch logs clean
- ✅ Claude API called successfully (if applicable)

**Documentation:**
Update `docs/API_DOCUMENTATION.md` → Lambda Functions section

**Success:** ✅ Lambda works, performance acceptable

---

### Phase 6: Storage Testing

**Tool:** S3 Console + AppSync

**Test Cases:**

1. Upload File
   ```graphql
   mutation UploadDocument {
     uploadDocument(input: {
       tenantId: "ips-test"
       category: "prescriptions"
       fileName: "test.pdf"
     }) {
       url
     }
   }
   ```
   - Get signed URL
   - Upload file via frontend
   - Verify file in S3 bucket

2. Test Tenant Isolation
   - Upload as tenant A
   - Try to access as tenant B
   - Should be blocked

3. Test Signed URLs
   - Generate download URL
   - Verify URL works
   - Wait for expiry (e.g., 1 hour)
   - Verify URL expired

**Documentation:**
Update `docs/API_DOCUMENTATION.md` → Storage section

**Success:** ✅ Files stored securely, isolation works

---

## 📝 HOW TO UPDATE API DOCUMENTATION

### After Each Model Added:

1. Open `docs/API_DOCUMENTATION.md`
2. Find "Data Models" section
3. Add new model entry:

```markdown
### [ModelName]

**GraphQL Type:** `[ModelName]`

**Fields:**
- `id`: String (auto-generated)
- `tenantId`: String (required for isolation)
- `[field]`: [type] - [description]
[list all fields]

**Authorization:**
- Read: Authenticated users in same tenant
- Create/Update/Delete: [specific role if applicable]

**Relationships:**
- [Related models and how they connect]

**Example Query:**
```graphql
query ListModelName {
  list[ModelName](filter: {tenantId: {eq: "ips-test"}}) {
    items {
      id
      [key fields]
    }
  }
}
```

**Example Mutation:**
```graphql
mutation Create[ModelName] {
  create[ModelName](input: {
    tenantId: "ips-test"
    [required fields]
  }) {
    id
  }
}
```
```

**That's it. One entry per model. Keep it concise.**

---

### After Each Lambda Function Added:

1. Open `docs/API_DOCUMENTATION.md`
2. Find "Lambda Functions" section
3. Add entry:

```markdown
### [Function Name]

**Purpose:** [What it does in one sentence]

**Invocation:** [How to call it - AppSync mutation? Direct invoke?]

**Authorization:** [Who can call it]

**Input Schema:**
```json
{
  "tenantId": "string (required)",
  "[param]": "[type] - [description]"
}
```

**Output Schema:**
```json
{
  "[result]": "[type] - [description]"
}
```

**Example:**
```json
// Input
{ ... }

// Output
{ ... }
```

**Error Handling:**
- 400: [Invalid input scenarios]
- 500: [Server error scenarios]

**Performance:**
- Typical execution time: [X seconds]
- Timeout: [Y seconds]
```

---

## 🔍 TESTING CHECKLIST (Use This Every Phase)

### Before Committing Code:

- [ ] Code runs in `npx ampx sandbox` without errors
- [ ] Manual test completed in AppSync/Lambda console
- [ ] CloudWatch logs reviewed (no errors)
- [ ] Response format matches expected schema
- [ ] Authorization rules tested (cross-tenant blocked)
- [ ] Performance acceptable (queries <2s, lambdas <10s)
- [ ] `docs/API_DOCUMENTATION.md` updated
- [ ] Progress checkbox marked in `KIRO_IMPLEMENTATION_GUIDE.md`

**If any checkbox ❌, don't commit yet. Fix first.**

---

## 🎯 SIMPLE TESTING WORKFLOW

```
┌─────────────────────────────────────────────────┐
│  1. Write Code in resource.ts files            │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  2. Test Locally: npx ampx sandbox             │
│     - Open AppSync console (http://localhost)  │
│     - Run GraphQL queries manually             │
│     - Check terminal for errors                │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  3. Deploy to Dev: npx ampx deploy --branch dev│
│     - Push to GitHub develop branch            │
│     - Auto-deploys via CI/CD                   │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  4. Test in AWS Console                        │
│     - AppSync: Test GraphQL operations        │
│     - Lambda: Test with sample events          │
│     - CloudWatch: Review logs                  │
│     - Cognito: Test user creation              │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  5. Document: Update API_DOCUMENTATION.md      │
│     - Add new operations                       │
│     - Include examples                         │
│     - Note any limitations                     │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│  6. Mark Complete in Implementation Guide      │
│     - Check off completed tasks                │
│     - Update progress tracking                 │
└─────────────────────────────────────────────────┘
```

**No test frameworks. No scripts. Just manual testing + documentation.**

---

## 🚨 RED FLAGS - Stop if You See:

### File Bloat Indicators:
- More than 15 files in `amplify/` directory
- Any `tests/` directory appears
- Any `scripts/` directory with `.sh` files
- Multiple README files
- `utils/` or `helpers/` directories

**ACTION:** Delete extra files immediately. Re-read this document.

### Over-Engineering Indicators:
- Abstract base classes for resources
- Factory patterns for Lambda creation
- Dependency injection containers
- Complex type hierarchies
- Config management libraries

**ACTION:** Keep it simple. Amplify resources don't need fancy patterns.

### Documentation Bloat:
- More than 1 API documentation file
- Separate guides per feature
- Auto-generated docs
- Swagger/OpenAPI specs

**ACTION:** One file. `docs/API_DOCUMENTATION.md`. That's enough.

---

## ✅ GOOD EXAMPLES

### Good File Structure:
```
amplify/
├── auth/resource.ts (150 lines)
├── data/resource.ts (400 lines - all 7 models)
├── storage/resource.ts (50 lines)
└── functions/
    ├── roster-architect/
    │   ├── handler.ts (200 lines)
    │   └── resource.ts (30 lines)
    ├── billing-validator/
    │   ├── handler.ts (150 lines)
    │   └── resource.ts (30 lines)
    └── rips-generator/
        ├── handler.ts (180 lines)
        └── resource.ts (30 lines)

Total: 10 files, ~1,220 lines
```

### Good Documentation:
```markdown
# API Documentation (1 file, ~500 lines)

## Auth (50 lines)
## Data Models (250 lines - ~35 lines per model)
## Lambda Functions (150 lines - 50 per function)
## Errors (50 lines)
```

---

## 💡 TESTING TIPS

### Use AWS Console Tools:
1. **AppSync Console:** Best for GraphQL testing
   - Queries → Test list operations
   - Mutations → Test create/update/delete
   - Subscriptions → Test real-time updates

2. **Lambda Console:** Best for function testing
   - Create test events
   - Monitor execution time
   - Review logs inline

3. **CloudWatch Logs:** Best for debugging
   - Filter by error level
   - Search for specific messages
   - Set up log insights queries

4. **Cognito Console:** Best for auth testing
   - Create test users
   - Check JWT tokens
   - Verify user attributes

**These tools are built-in and free. Use them.**

---

## 📊 DOCUMENTATION UPDATE SCHEDULE

**After Each Phase:**
- Phase 1 complete → Update Auth section (20 lines)
- Phase 2 complete → Update Data Models (250 lines)
- Phase 3 complete → Update Roster Architect (50 lines)
- Phase 4 complete → Update Billing Validator (50 lines)
- Phase 5 complete → Update RIPS Generator (50 lines)
- Phase 6 complete → Update Storage section (30 lines)

**Total by end:** One ~500 line markdown file with everything.

**DO NOT** create separate files for each section.

---

## 🎯 FINAL REMINDER

### The Goal:
Build a working AWS backend with:
- ✅ ~10 files total
- ✅ 1 documentation file
- ✅ 0 test files
- ✅ 0 script files
- ✅ Clean, simple, maintainable

### The Anti-Goal:
Avoid creating:
- ❌ 50+ files
- ❌ Complex testing frameworks
- ❌ Multiple documentation files
- ❌ Utility libraries
- ❌ Over-engineered abstractions

**KISS Principle: Keep It Simple, Stupid**

---

**Remember: Less is more. Ship working code, not file hierarchies.**

**Last Updated:** January 21, 2026
---
inclusion: always
---
<!------------------------------------------------------------------------------------
   Add rules to this file or a short description and have Kiro refine them for you.
   
   Learn about inclusion modes: https://kiro.dev/docs/steering/#inclusion-modes
-------------------------------------------------------------------------------------> 