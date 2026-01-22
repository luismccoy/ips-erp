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