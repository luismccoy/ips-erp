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
**Status:** Schema deployed and tested (Phase 2 complete)

**Goal:** Implement 2 critical Lambda functions for AI-powered operations

**Tasks:**
1. Implement RIPS Validator function (Colombian compliance)
2. Implement Glosa Defender function (AI billing defense)
3. Add custom queries to data/resource.ts
4. Test functions in AWS console (Lambda, CloudWatch)
5. Update API_DOCUMENTATION.md with function details
6. Commit Phase 3 completion

**File Count Target:** 7 → 10 files (3 new files allowed)

**New Files:**
- `amplify/functions/rips-validator/handler.ts`
- `amplify/functions/rips-validator/resource.ts`
- `amplify/functions/glosa-defender/handler.ts`
- `amplify/functions/glosa-defender/resource.ts`

**Note:** Roster Architect already exists from Phase 2, may need enhancement