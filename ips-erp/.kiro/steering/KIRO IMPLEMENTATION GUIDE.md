# 🎯 KIRO IMPLEMENTATION GUIDE
## Backend Development Steering Document

**READ THIS FIRST - ALWAYS FOLLOW THESE RULES**

---

## ⚠️ CRITICAL RULES FOR KIRO

### 🚫 DO NOT CREATE:
- ❌ Test script files (use built-in Amplify testing)
- ❌ Deployment scripts (Amplify handles this)
- ❌ Mock data generators (frontend already has this)
- ❌ Utility helper files (keep logic in main resources)
- ❌ Configuration wrapper files (use Amplify's built-in config)
- ❌ Setup/initialization scripts (Amplify CLI handles this)

### ✅ ONLY CREATE FILES IN THESE DIRECTORIES:
```
amplify/
├── auth/
│   └── resource.ts           ✅ ONE FILE - Cognito config
├── data/
│   └── resource.ts           ✅ ONE FILE - All models here
├── storage/
│   └── resource.ts           ✅ ONE FILE - S3 config
└── functions/
    ├── roster-architect/
    │   ├── handler.ts        ✅ Main Lambda logic
    │   └── resource.ts       ✅ Lambda config
    ├── billing-validator/
    │   ├── handler.ts        ✅ Main Lambda logic
    │   └── resource.ts       ✅ Lambda config
    └── rips-generator/
        ├── handler.ts        ✅ Main Lambda logic
        └── resource.ts       ✅ Lambda config
```

**That's it. ~10 files total. Nothing more.**

---

## 📋 IMPLEMENTATION PHASES

### PHASE 1: Authentication (Week 1)
**Goal:** Users can sign in with tenant isolation

**File to Edit:** `amplify/auth/resource.ts`

**Tasks:**
- [x] Configure Cognito User Pool
- [x] Add custom attribute: `tenantId` (String, mutable)
- [x] Create user groups: Admin, Nurse, Family
- [x] Set password policy (min 8 chars, require special char)
- [x] Enable email verification
- [x] Configure JWT token claims to include tenantId

**Testing Checklist:**
- [ ] Can create user with tenantId attribute
- [ ] JWT token contains `custom:tenantId` claim
- [ ] User can sign in and get valid token
- [ ] User can be assigned to groups

**Deployment:**
```bash
npx ampx sandbox  # Test locally first
npx ampx deploy --branch develop  # Deploy to dev
```

**Success Criteria:** 
✅ Can create users via Amplify console
✅ JWT includes tenantId claim
✅ No errors in CloudWatch logs

---

### PHASE 2: Data Models (Week 1-2)
**Goal:** All 7 models defined with multi-tenant isolation

**File to Edit:** `amplify/data/resource.ts`

**Models to Define (in order):**
1. [x] Tenant (base model, no tenantId needed)
2. [x] Patient (with tenantId)
3. [x] Nurse (with tenantId)
4. [x] Shift (with tenantId)
5. [x] Inventory (with tenantId)
6. [x] VitalSigns (with tenantId)
7. [x] BillingRecord (with tenantId)

**Authorization Pattern (apply to ALL models except Tenant):**
```typescript
.authorization(allow => [
  allow.authenticated()
    .to(['read', 'create', 'update', 'delete'])
    .identityClaim('custom:tenantId')
])
```

**Testing Checklist:**
- [x] Schema validates without errors
- [x] Can create sample records via AppSync console
- [x] Authorization rules work (users only see own tenant data)
- [x] Relationships work (Patient → Shift → VitalSigns)
- [x] Queries filtered by tenantId automatically

**Deployment:**
```bash
npx ampx sandbox  # Test locally
npx ampx deploy --branch develop
```

**Success Criteria:**
✅ All models appear in AppSync console
✅ Can CRUD records for each model
✅ Cross-tenant access blocked
✅ No schema errors

---

### PHASE 3: Lambda - Roster Architect (Week 2)
**Goal:** AI-powered nurse scheduling works

**Files to Edit:**
- `amplify/functions/roster-architect/handler.ts`
- `amplify/functions/roster-architect/resource.ts`

**Implementation Steps:**
1. [ ] Define input/output TypeScript types
2. [ ] Implement Claude API integration
3. [ ] Add route optimization algorithm
4. [ ] Calculate travel times between patients
5. [ ] Balance workload across nurses
6. [ ] Generate shift assignments

**Environment Variables Needed:**
```typescript
ANTHROPIC_API_KEY=sk-ant-xxx  // Add via Amplify Console
```

**Testing Checklist:**
- [ ] Can invoke Lambda with sample data
- [ ] Claude API responds successfully
- [ ] Generated schedule is valid
- [ ] Travel times calculated correctly
- [ ] Nurse constraints respected
- [ ] CloudWatch logs show execution trace

**Deployment:**
```bash
npx ampx sandbox  # Test locally with mocked Anthropic
npx ampx deploy --branch develop
```

**Success Criteria:**
✅ Lambda executes without timeout
✅ Returns valid shift assignments
✅ Travel time optimization works
✅ CloudWatch logs clean

---

### PHASE 4: Lambda - Billing Validator (Week 3)
**Goal:** RIPS validation and glosa defense

**Files to Edit:**
- `amplify/functions/billing-validator/handler.ts`
- `amplify/functions/billing-validator/resource.ts`

**Implementation Steps:**
1. [ ] Validate CUPS codes
2. [ ] Validate ICD-10 codes
3. [ ] Check EPS coverage
4. [ ] Generate glosa defense using Claude API
5. [ ] Return validation results

**Testing Checklist:**
- [ ] Valid RIPS data passes
- [ ] Invalid codes caught
- [ ] Glosa defense generated
- [ ] Spanish language output correct

**Success Criteria:**
✅ Catches RIPS errors
✅ Generates defense text
✅ Performance <2s response time

---

### PHASE 5: Lambda - RIPS Generator (Week 3)
**Goal:** Create compliant RIPS files

**Files to Edit:**
- `amplify/functions/rips-generator/handler.ts`
- `amplify/functions/rips-generator/resource.ts`

**Implementation Steps:**
1. [ ] Query billing records
2. [ ] Format to RIPS XML/CSV
3. [ ] Upload to S3
4. [ ] Return download URL

**Testing Checklist:**
- [ ] Generated file validates against RIPS schema
- [ ] File uploaded to S3 successfully
- [ ] URL accessible with proper permissions

**Success Criteria:**
✅ Valid RIPS file created
✅ Colombian encoding (UTF-8)
✅ EPS can process file

---

### PHASE 6: Storage (Week 4)
**Goal:** Secure document storage

**File to Edit:** `amplify/storage/resource.ts`

**Implementation:**
- [ ] Configure S3 bucket
- [ ] Set up folder structure: `{tenantId}/{category}/`
- [ ] Add access rules (users only access own tenant folders)
- [ ] Generate signed URLs for downloads

**Testing Checklist:**
- [ ] Can upload files
- [ ] Tenant isolation works
- [ ] Signed URLs expire correctly

**Success Criteria:**
✅ Files stored securely
✅ Cross-tenant access blocked

---

### PHASE 7: Enhanced Kardex Features (Week 5)
**Goal:** Digital nursing documentation system (Kardex-inspired enhancements)

**Background:** Kardex is a nursing documentation system used as a quick-reference tool during patient care. It contains medications, care plans, alerts, and shift notes. We're adding digital Kardex features to improve nurse workflow and handoff communication.

**File to Edit:** `amplify/data/resource.ts`

**Tasks:**

#### 7.1 Enhance Shift Model
- [ ] Add `arrivedAt?: AWSDateTime` - Actual arrival time at patient home
- [ ] Add `departedAt?: AWSDateTime` - Actual departure time
- [ ] Add `handoffNotes?: String` - Notes for next nurse on route
- [ ] Add `urgentAlerts?: [String]` - Critical flags (allergies, precautions)
- [ ] Add `tasksCompleted?: [String]` - Array of completed task IDs
- [ ] Add `familyPresent?: Boolean` - Whether family was home during visit

#### 7.2 Add ShiftNote Model
New model for detailed nursing documentation:

```typescript
ShiftNote: a.model({
    tenantId: a.id().required(),
    tenant: a.belongsTo('Tenant', 'tenantId'),
    
    shiftId: a.id().required(),
    shift: a.belongsTo('Shift', 'shiftId'),
    
    timestamp: a.datetime().required(),
    note: a.string().required(),
    category: a.enum(['Clinical', 'Administrative', 'Handoff']),
    
    authorId: a.id().required(),  // nurseId
    author: a.belongsTo('Nurse', 'authorId'),
}).authorization(allow => [
    allow.authenticated()
        .to(['read', 'create', 'update', 'delete'])
        .identityClaim('custom:tenantId')
])
```

#### 7.3 Add PatientAlert Model
For persistent alerts that appear every shift:

```typescript
PatientAlert: a.model({
    tenantId: a.id().required(),
    tenant: a.belongsTo('Tenant', 'tenantId'),
    
    patientId: a.id().required(),
    patient: a.belongsTo('Patient', 'patientId'),
    
    alertType: a.enum(['Allergy', 'Precaution', 'FallRisk', 'Infection', 'Other']),
    description: a.string().required(),
    severity: a.enum(['Critical', 'Warning', 'Info']),
    active: a.boolean().required(),
    
    createdBy: a.id(),  // adminId or nurseId
}).authorization(allow => [
    allow.authenticated()
        .to(['read', 'create', 'update', 'delete'])
        .identityClaim('custom:tenantId')
])
```

#### 7.4 Update Frontend Integration Layer
Add new functions in `src/services/integration-layer.ts`:

```typescript
// Get handoff notes for next nurse
async function getHandoffNotes(patientId: string): Promise<ShiftNote[]>

// Get active alerts for patient
async function getPatientAlerts(patientId: string): Promise<PatientAlert[]>

// Record shift arrival/departure
async function updateShiftTiming(shiftId: string, data: {
    arrivedAt?: string,
    departedAt?: string
}): Promise<void>

// Add clinical note during shift
async function addShiftNote(data: {
    shiftId: string,
    note: string,
    category: 'Clinical' | 'Administrative' | 'Handoff'
}): Promise<ShiftNote>
```

**Testing Checklist:**
- [ ] Nurse can add handoff notes during shift
- [ ] Next nurse sees previous handoff notes
- [ ] Alerts display prominently in nurse dashboard
- [ ] Timing tracking works (arrived/departed)
- [ ] Clinical notes categorized correctly
- [ ] Family presence flag captured

**Deployment:**
```bash
npx ampx sandbox  # Test locally
npx ampx deploy --branch develop
```

**Success Criteria:**
✅ Enhanced Shift model with Kardex fields deployed
✅ ShiftNote model for detailed documentation
✅ PatientAlert model for persistent warnings
✅ Nurse dashboard shows alerts and previous notes
✅ Handoff communication improved
✅ CloudWatch logs clean

**UI Enhancement Goals (Phase 7):**

Enhanced Nurse Dashboard View:
```
📱 Today's Shifts - Maria Rodriguez
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 URGENT ALERTS
├─ Roberto Gomez: Penicillin allergy
└─ Ana Martinez: Fall risk - use walker

─────────────────────────────────

📍 Shift 1 of 5 - 09:00 AM
Roberto Gomez
📍 Calle 100 #15-20 (15 min away)

⚠️ ALERTS
└─ 🔴 Allergy: Penicillin

📋 TASKS TO COMPLETE
├─ ☐ Vital Signs
├─ ☐ Medication: Lisinopril 10mg
└─ ☐ Wound dressing change

📝 LAST VISIT (Jan 19)
└─ "BP elevated at 150/95. Adjusted position 
    during reading. Family requests call 
    before next visit."

💬 HANDOFF NOTES FROM PREVIOUS NURSE
└─ "Patient prefers morning visits. Keep 
    blinds closed during exam (light sensitive)."

⏰ [ARRIVE] [START VISIT]
```

**Rationale for Phase 7:**

**Why add this:**
1. **Nurse workflow improvement** - Digital Kardex reduces paperwork
2. **Handoff communication** - Critical for home care continuity
3. **Patient safety** - Alerts prevent medication errors
4. **Regulatory compliance** - Better documentation for audits
5. **Family communication** - Transparent care tracking

**Why Phase 7 (not earlier):**
- Core functionality (Phases 1-6) must work first
- Kardex features are enhancements, not MVP requirements
- Can iterate based on nurse feedback after beta

---

## 🧪 TESTING STRATEGY

### After Each Phase:

#### 1. Local Testing (Sandbox)
```bash
npx ampx sandbox
```
- Test in local environment
- Use Amplify console to manually test
- Check CloudWatch logs

#### 2. Deploy to Dev
```bash
npx ampx deploy --branch develop
```
- Push to GitHub develop branch
- Auto-deploys to dev environment
- Share dev URL with team for testing

#### 3. Verify in AppSync Console
- Run GraphQL queries manually
- Test authorization rules
- Verify data isolation

#### 4. Document Results
Update this file with:
- ✅ What works
- ❌ What needs fixing
- 📝 Notes for frontend team

### DO NOT CREATE:
- ❌ Test runner scripts
- ❌ Mock data seed files
- ❌ Testing utility libraries
- ❌ Jest/Mocha test files

**Use Amplify's built-in testing. That's it.**

---

## 📊 PROGRESS TRACKING

### Week 1
- [x] Phase 1: Auth complete
- [x] Phase 2: Data models complete
- [ ] Deployed to dev environment
- [ ] Frontend team notified

### Week 2
- [ ] Phase 3: Roster Architect complete
- [ ] Lambda tested with sample data
- [ ] CloudWatch logs reviewed
- [ ] Performance acceptable

### Week 3
- [ ] Phase 4: Billing Validator complete
- [ ] Phase 5: RIPS Generator complete
- [ ] All Lambdas integrated
- [ ] End-to-end testing

### Week 4
- [ ] Phase 6: Storage complete
- [ ] Full backend operational
- [ ] Documentation updated
- [ ] Ready for Kardex enhancements

### Week 5
- [ ] Phase 7: Kardex enhancements complete
- [ ] ShiftNote model tested
- [ ] PatientAlert model tested
- [ ] Nurse dashboard shows alerts
- [ ] Handoff notes working
- [ ] Timing tracking functional

### Week 6
- [ ] Frontend integration complete
- [ ] User acceptance testing (UAT)
- [ ] Bug fixes and refinements
- [ ] Performance optimization

### Week 7
- [ ] Beta testing with first IPS
- [ ] Production deployment preparation
- [ ] Training materials created
- [ ] Go-live readiness confirmed

---

## 🚨 WHEN THINGS GO WRONG

### Error: "Schema validation failed"
**Fix:** Check `amplify/data/resource.ts` syntax
**Don't:** Create helper files to "fix" it

### Error: "Lambda timeout"
**Fix:** Increase timeout in `resource.ts`, optimize code
**Don't:** Create wrapper scripts

### Error: "Authorization denied"
**Fix:** Check JWT claims, verify auth rules
**Don't:** Create auth middleware files

### Error: "DynamoDB query slow"
**Fix:** Add indexes in data model
**Don't:** Create query optimization scripts

**RULE: Fix problems in the original file, don't create new files.**

---

## 📝 DOCUMENTATION REQUIREMENTS

### After Completing Each Phase:
Update `docs/API_DOCUMENTATION.md` with:
1. GraphQL operations available
2. Example queries/mutations
3. Authorization requirements
4. Error responses

**Format:**
```markdown
## List Patients
Query: `listPatients`
Auth: Requires authenticated user
Filters: Automatically by user's tenantId
Returns: Array of Patient objects

Example:
[query example]
```

### DO NOT CREATE:
- ❌ Separate API docs per model
- ❌ Postman collections
- ❌ OpenAPI spec generators
- ❌ API testing frameworks

**One file. `docs/API_DOCUMENTATION.md`. Update it as you go.**

---

## ✅ DEFINITION OF DONE

Each phase is complete when:
1. ✅ Code merged to `develop` branch
2. ✅ Deployed to dev environment
3. ✅ Manually tested in AppSync/Lambda console
4. ✅ CloudWatch logs clean (no errors)
5. ✅ `docs/API_DOCUMENTATION.md` updated
6. ✅ This steering doc checkboxes marked

**No phase is done until ALL 6 criteria met.**

---

## 🎯 FINAL DELIVERABLE

By end of Week 4, you will have:

**Files Created (~10 total):**
- `amplify/auth/resource.ts`
- `amplify/data/resource.ts`
- `amplify/storage/resource.ts`
- `amplify/functions/roster-architect/handler.ts`
- `amplify/functions/roster-architect/resource.ts`
- `amplify/functions/billing-validator/handler.ts`
- `amplify/functions/billing-validator/resource.ts`
- `amplify/functions/rips-generator/handler.ts`
- `amplify/functions/rips-generator/resource.ts`
- `docs/API_DOCUMENTATION.md` (updated)

**Working System:**
- ✅ Multi-tenant authentication
- ✅ 7 core data models with RLS (Phase 2)
- ✅ 2 enhanced models for Kardex (Phase 7)
- ✅ 3 AI-powered Lambda functions
- ✅ Secure file storage
- ✅ Real-time subscriptions
- ✅ Digital nursing documentation (Kardex)
- ✅ Deployed to dev environment

**No Extra Files. No Scripts. Clean and Simple.**

---

## 🔄 WORKFLOW REMINDER

**Daily:**
1. Pull latest from develop: `git pull origin develop`
2. Work on current phase files ONLY
3. Test in sandbox: `npx ampx sandbox`
4. Commit: `git commit -m "feat: add patient model"`
5. Push: `git push origin develop`
6. Verify auto-deploy to dev

**Weekly:**
1. Review completed phases
2. Update progress checkboxes
3. Update API documentation
4. Sync with frontend team

**KEEP IT SIMPLE. STAY FOCUSED. SHIP CODE.**

---

**Last Updated:** January 21, 2026  
**Current Phase:** Phase 2 Complete - Data Models  
**Target Completion:** February 18, 2026---
inclusion: always
---
<!------------------------------------------------------------------------------------
   Add rules to this file or a short description and have Kiro refine them for you.
   
   Learn about inclusion modes: https://kiro.dev/docs/steering/#inclusion-modes
-------------------------------------------------------------------------------------> 