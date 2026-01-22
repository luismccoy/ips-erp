---
inclusion: always
---

# IPS ERP Backend Implementation Guide

## Core Principles
- **Minimal Files:** Target ~10 files in amplify/ directory
- **Amplify Does the Work:** Let Amplify Gen 2 handle infrastructure
- **Test Automation:** Use scripts for automated testing (exception to no-scripts rule)
- **Single Documentation:** Update only docs/API_DOCUMENTATION.md

## Allowed Files
### In amplify/
- `backend.ts` - Main backend config
- `auth/resource.ts` - Cognito configuration
- `data/resource.ts` - GraphQL schema (all models here)
- `functions/*/handler.ts` - Lambda function code
- `functions/*/resource.ts` - Lambda configuration

### In scripts/ (Testing Only)
- `test-backend.sh` - Automated backend testing script
- Helper scripts for deployment/testing automation

### In docs/
- `API_DOCUMENTATION.md` - Single source of API truth

## Forbidden
- ❌ Test files (*.test.ts, *.spec.ts) in amplify/
- ❌ Utils/helpers directories in amplify/
- ❌ Multiple documentation files
- ❌ Unnecessary abstractions

## Current Phase: Phase 3 - Lambda Functions
**Status:** ✅ COMPLETE

**Completed Tasks:**
1. ✅ Implemented RIPS Validator function (Colombian compliance)
2. ✅ Implemented Glosa Defender function (AI billing defense)
3. ✅ Added custom queries to data/resource.ts
4. ✅ Deployed and tested functions in AWS
5. ✅ Updated API_DOCUMENTATION.md with function details
6. ✅ Committed Phase 3 completion

**Results:**
- File count: 10/10 TypeScript files (target achieved)
- Lambda functions deployed: 3 (rips-validator, glosa-defender, roster-architect)
- All automated tests passed (7/7)
- GraphQL endpoint: Active and configured
- Test scripts moved to .local-tests/ (not synced with git)

**Lambda Functions:**
- `rips-validator` - 30s timeout, validates Colombian RIPS compliance
- `glosa-defender` - 60s timeout, AI-powered billing defense letters
- `roster-architect` - 60s timeout, AI-powered shift assignment

**Next Phase:** Phase 4 - Frontend Integration

## Phase 4: Frontend Integration
**Status:** ✅ COMPLETE

**Goal:** Connect React frontend to real AWS Amplify backend, replacing mock data with live GraphQL queries.

**Completed Tasks:**
1. ✅ Updated `src/amplify-utils.ts` with environment-based backend selection
2. ✅ Updated `src/hooks/useAuth.ts` with real Cognito authentication
3. ✅ Updated `src/hooks/useApiCall.ts` with GraphQL wrapper
4. ✅ Added `VITE_USE_REAL_BACKEND` environment variable
5. ✅ Updated `.env.example` and `.env.development` with backend toggle
6. ✅ Updated API_DOCUMENTATION.md with comprehensive integration guide

**Results:**
- Environment-based backend selection (mock or real)
- Real Cognito authentication support
- GraphQL queries, mutations, and subscriptions ready
- Lambda function integration documented
- Multi-tenant data isolation maintained
- Component integration examples provided

**Key Features:**
- **Mock Mode:** Development with instant responses, no AWS credentials
- **Real Backend Mode:** Production-ready with Cognito + AppSync + DynamoDB
- **Seamless Toggle:** Switch between modes with environment variable
- **Type Safety:** Full TypeScript support with generated Schema types
- **Real-Time:** AppSync subscriptions for live updates

**Integration Examples:**
- Admin Roster → `generateRoster` Lambda
- RIPS Validator → `validateRIPS` Lambda
- Inventory Dashboard → Real-time GraphQL subscriptions
- Authentication → Cognito with custom attributes

**Next Phase:** Phase 5 - Production Deployment (when ready)

## Phase 5: Production Deployment
**Status:** ✅ COMPLETE

**Goal:** Deploy backend to production environment with monitoring, optimize performance, and prepare for real-world usage.

**Completed Tasks:**
1. ✅ Environment configuration review (staging & production)
2. ✅ Automated deployment validation script
3. ✅ CloudWatch dashboard created (4 widgets)
4. ✅ CloudWatch alarms configured (9 alarms total)
5. ✅ SNS topic for alerts created
6. ✅ Security audit completed
7. ✅ Performance benchmarks documented
8. ✅ Deployment report generated

**Results:**
- Backend validated and production-ready
- CloudWatch dashboard: IPS-ERP-Production-Dashboard
- Monitoring alarms: 3 Lambda error + 3 Lambda throttle + 3 DynamoDB throttle
- SNS topic: arn:aws:sns:us-east-1:747680064475:IPS-ERP-Alerts
- Automated scripts: deploy-phase5.sh, create-cloudwatch-dashboards.sh, create-cloudwatch-alarms.sh
- All scripts moved to .local-tests/ (not synced with git)

**Monitoring Setup:**
- Lambda invocations, errors, and duration tracked
- DynamoDB capacity units monitored
- Alarms trigger on errors and throttling
- SNS notifications ready for email subscriptions

**Security Audit:**
- Cognito MFA configuration verified
- Password policy enforced (min 8 characters)
- DynamoDB encryption status checked
- Multi-tenant isolation confirmed

**Performance Metrics:**
- 14 DynamoDB tables operational
- 3 Lambda functions deployed and tested
- GraphQL API responding
- Backend ready for production load

**Next Phase:** Production Operations & Continuous Improvement

## Phase 6: Frontend Deployment
**Status:** ✅ COMPLETE

**Goal:** Deploy React frontend to AWS Amplify Hosting with real backend enabled.

**Completed Tasks:**
1. ✅ Enabled real backend in `.env.development` (VITE_USE_REAL_BACKEND=true)
2. ✅ Created Amplify Hosting app (d2wwgecog8smmr)
3. ✅ Configured main branch for deployment
4. ✅ Set up environment variables for production
5. ✅ Created deployment automation scripts
6. ✅ Documented GitHub connection process

**Results:**
- Amplify App ID: d2wwgecog8smmr
- Frontend URL: https://main.d2wwgecog8smmr.amplifyapp.com
- Real backend enabled (connects to Cognito + AppSync + DynamoDB)
- Automatic deployments ready (after GitHub connection)
- Build configuration: amplify.yml (React + Vite)

**Deployment Options:**
1. **GitHub CI/CD:** Connect repository in Amplify Console for automatic deployments
2. **Manual:** Build locally and upload dist folder
3. **CLI:** Use aws amplify create-deployment with zip upload

**Environment Variables:**
- VITE_USE_REAL_BACKEND=true (production)
- Amplify auto-injects AWS config from amplify_outputs.json

**Next Steps:**
1. Connect GitHub repository in Amplify Console
2. Push code to trigger automatic deployment
3. Create test users in Cognito
4. Test end-to-end flow with real backend

**Next Phase:** User Onboarding & Production Operations

## Phase 7: Go-Live Execution
**Status:** ✅ COMPLETE

**Goal:** Execute final deployment steps, create test users, and verify full-stack operation.

**Completed Tasks:**
1. ✅ Pushed code to GitHub repository
2. ✅ Created 3 test users in Cognito (admin, nurse, family)
3. ✅ Verified all backend resources operational
4. ✅ Confirmed Amplify app deployment status
5. ✅ Generated go-live report with all access URLs
6. ✅ Updated API_DOCUMENTATION.md with go-live section
7. ✅ Documented testing procedures and troubleshooting

**Results:**
- Code pushed to GitHub: https://github.com/luismccoy/ips-erp
- Test users created with temporary passwords
- All backend resources verified (Lambda, DynamoDB, AppSync)
- Go-live report generated: .local-tests/go-live-report-20260121-201129.txt
- Complete documentation in docs/API_DOCUMENTATION.md

**Test Users:**
- admin@ips.com (Admin role) - Password: TempPass123!
- nurse@ips.com (Nurse role) - Password: TempPass123!
- family@ips.com (Family role) - Password: TempPass123!

**Access URLs:**
- Frontend: https://main.d2wwgecog8smmr.amplifyapp.com
- Amplify Console: https://console.aws.amazon.com/amplify/home?region=us-east-1#/d2wwgecog8smmr
- CloudWatch Dashboard: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=IPS-ERP-Production-Dashboard

**Remaining Manual Steps:**
1. Connect GitHub in Amplify Console for automatic deployments
2. Subscribe to SNS alerts for monitoring
3. Test end-to-end flow with real users
4. Onboard first production tenant

**Next Phase:** Phase 8 - Complete Frontend Integration

## Phase 8: Complete Frontend Integration
**Status:** ✅ COMPLETE

**Goal:** Remove all hardcoded mock data imports from components and ensure they properly use the backend toggle system.

**Problem Identified:**
After Phase 7 deployment, users still saw mock data even with `VITE_USE_REAL_BACKEND=true` because 3 components were hardcoded to import mock data directly, bypassing the environment variable:
- `AdminDashboard.tsx` - Imported `PATIENTS, INVENTORY, SHIFTS` from mock-data
- `SimpleNurseApp.tsx` - Imported `SHIFTS, PATIENTS` from mock-data
- `FamilyPortal.tsx` - Imported `PATIENTS, VITALS_HISTORY` from mock-data

**Completed Tasks:**
1. ✅ Refactored `AdminDashboard.tsx` to fetch data dynamically
   - Added state management for patients, shifts, inventory
   - Implemented loading states for all views (Dashboard, Audit, Inventory, Roster)
   - Added empty states when no data exists
   - Dynamic imports for mock data only when needed

2. ✅ Refactored `SimpleNurseApp.tsx` to fetch data dynamically
   - Added state management for shifts and patients
   - Implemented loading states
   - Added empty states for no shifts
   - Shows backend status indicator (Live Data vs Mock Data)
   - Calculates completion rate dynamically

3. ✅ Refactored `FamilyPortal.tsx` to fetch data dynamically
   - Added state management for patients and vitals
   - Implemented loading states
   - Added empty states for no patients/vitals
   - Handles null selectedPatient case
   - Dynamic imports for mock data only when needed

4. ✅ Fixed TypeScript compilation errors
   - Added VitalSigns model to mock client interface
   - Fixed property name mismatches (scheduledTime, reorderLevel)
   - Added type assertions for mock/real client compatibility
   - Resolved all Build #9-11 failures

5. ✅ Successfully deployed Build #12
   - All TypeScript compilation errors resolved
   - Frontend now properly respects VITE_USE_REAL_BACKEND
   - Components show empty states when no data exists
   - Loading states implemented across all refactored components

**Technical Implementation:**
- Removed direct imports from `mock-data.ts`
- Used dynamic imports: `await import('../data/mock-data')` only when `!isUsingRealBackend()`
- Added `useState` and `useEffect` hooks for data fetching
- Implemented proper error handling and loading states
- Used type assertions `(client.models.X as any)` for mock/real client compatibility
- Added VitalSigns to mock client StoreType, LISTENERS, and MockClient interface

**Build History:**
- Build #9: ❌ FAILED - Type mismatches
- Build #10: ❌ FAILED - Model name mismatches
- Build #11: ❌ FAILED - VitalSigns not in mock client
- Build #12: ✅ SUCCEEDED - All issues resolved

**Results:**
- All 3 components now properly respect `VITE_USE_REAL_BACKEND` environment variable
- Components show empty states when connected to real backend with no data
- Loading states provide better UX during data fetching
- Mock data only loaded when explicitly in mock mode (better tree-shaking)
- No more hardcoded mock data bypassing the backend toggle
- Frontend successfully deployed and operational

**Components Already Using Real Backend (No Changes Needed):**
- ✅ AdminRoster.tsx
- ✅ EvidenceGenerator.tsx
- ✅ InventoryDashboard.tsx
- ✅ NurseDashboard.tsx
- ✅ PatientDashboard.tsx
- ✅ StaffManagement.tsx

**Commits:**
1. `feat(phase8): refactor components to use real backend instead of hardcoded mock data`
   - Files: AdminDashboard.tsx, SimpleNurseApp.tsx, FamilyPortal.tsx
   - Changes: 454 insertions, 117 deletions

2. `fix(phase8): add VitalSigns model to mock client interface`
   - Files: src/mock-client.ts
   - Changes: 11 insertions, 3 deletions

**Deployment:**
- Frontend URL: https://main.d2wwgecog8smmr.amplifyapp.com
- Build #12: ✅ SUCCEEDED
- All components operational with real backend toggle

**Next Phase:** Production Operations & Data Population


## Phase 9: Workflow Compliance (Visit State Machine)
**Status:** ✅ COMPLETE

**Goal:** Implement visit state machine with admin approval workflow, audit logging, and family-safe data visibility.

**Completed Tasks:**
1. ✅ Updated GraphQL schema with Visit, AuditLog, Notification models
2. ✅ Added KARDEX, MedicationAdmin, TaskCompletion, VisitSummary custom types
3. ✅ Implemented createVisitDraftFromShift Lambda (DRAFT creation)
4. ✅ Implemented submitVisit Lambda (DRAFT/REJECTED → SUBMITTED)
5. ✅ Implemented rejectVisit Lambda (SUBMITTED → REJECTED)
6. ✅ Implemented approveVisit Lambda (SUBMITTED → APPROVED, immutable)
7. ✅ Implemented listApprovedVisitSummariesForFamily query
8. ✅ Added audit logging for all state transitions
9. ✅ Added notifications for workflow events
10. ✅ Deployed and validated in AppSync Console
11. ✅ Fixed QueryCommand → ScanCommand in submitVisit Lambda
12. ✅ Tested complete workflow: DRAFT → SUBMITTED → APPROVED
13. ✅ Tested rejection workflow: SUBMITTED → REJECTED → SUBMITTED
14. ✅ Verified audit trail (3 entries per workflow)
15. ✅ Verified notification system (nurse + family notifications)
16. ✅ Tested all 6 state machine invariants
17. ✅ Tested multi-tenant isolation
18. ✅ Tested KARDEX validation
19. ✅ Updated API_DOCUMENTATION.md with comprehensive test results

**Results:**
- 5 new Lambda functions deployed and tested
- Visit state machine enforced (DRAFT → SUBMITTED → REJECTED/APPROVED)
- 1:1 Shift-Visit relationship enforced (Visit.id = shiftId)
- Admin approval workflow with rejection handling
- Family-safe data visibility (approved visits only)
- Immutable audit trail for all state transitions
- Multi-recipient notifications
- All tests passed ✅

**Lambda Functions:**
- `createvisitdraftlambda` - Creates DRAFT visit from completed shift
- `submitvisitlambda` - Transitions DRAFT/REJECTED → SUBMITTED
- `rejectvisitlambda` - Admin rejects visit (SUBMITTED → REJECTED)
- `approvevisitlambda` - Admin approves visit (SUBMITTED → APPROVED)
- `listapprovedvisitsummari` - Family query for approved visits only

**Key Features:**
- ✅ DynamoDB SDK integration (no Amplify client dependencies)
- ✅ Type-safe handlers with Schema types
- ✅ Identity extraction with type assertions
- ✅ Tenant isolation enforced
- ✅ Role-based authorization (Nurse.role = ADMIN)
- ✅ State machine validation
- ✅ Audit logging with JSON details
- ✅ Multi-recipient notifications

**Invariants Enforced:**
- INV-V1: Cannot update APPROVED visit ✅
- INV-V2: Only assigned nurse can create/submit ✅
- INV-V3: Only admin can approve/reject ✅
- INV-V4: Rejection reason required ✅
- INV-V5: Cannot skip states ✅
- INV-V6: 1:1 Shift-Visit relationship ✅
- INV-F1-F3: Family cannot see unapproved visits ✅

**Test Results:**
- Complete approval workflow: ✅ Passed
- Rejection and resubmit workflow: ✅ Passed
- Audit trail verification: ✅ 3 entries per workflow
- Notification system: ✅ Nurse + family notifications
- State machine invariants: ✅ All 6 tested and enforced
- Multi-tenant isolation: ✅ Cross-tenant access blocked
- KARDEX validation: ✅ Required fields enforced

**AppSync Endpoint:** https://ga4dwdcapvg5ziixpgipcvmfbe.appsync-api.us-east-1.amazonaws.com/graphql

**Spec Location:** `.kiro/specs/workflow-compliance/`

**Next Phase:** Frontend Integration for Workflow Compliance (Phase 10)
