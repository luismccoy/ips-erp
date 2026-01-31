# Technical Handoff Document - IPS ERP Backend
**Date:** January 27, 2026  
**From:** Kiro (AI Assistant)  
**To:** Clawdbot (AI Assistant)  
**Project:** IPS ERP - Home Care Management System

---

## Executive Summary

This document provides a complete technical handoff of the IPS ERP backend system, including recent Phase 21 bug fixes (KIRO tasks), Phase 19 security enhancements, and the critical AWS resource tagging strategy that protects all infrastructure from automatic deletion.

---

## Latest Deployment: Phase 21 - Bug Fixes (KIRO Tasks)

**Commit:** `95c439e`  
**Branch:** `main`  
**Deployment Status:** ✅ LIVE  
**Build:** #103 (triggered, pending completion)

### KIRO-003: Notification Authorization Fix (P1)

**Problem:** `listNotifications` returned `Unauthorized` errors for ADMIN/NURSE users.

**Solution:** Added `create` and `delete` permissions to Notification model authorization in `amplify/data/resource.ts`:
```typescript
.authorization(allow => [
  allow.ownerDefinedIn('tenantId'),
  allow.groups(['ADMIN', 'NURSE']).to(['create', 'read', 'update', 'delete'])
])
```

### KIRO-004: Session Stability Fix (P1)

**Problem:** Random logouts during extended use due to token expiry.

**Solution:** Added to `src/hooks/useAuth.ts`:
- Hub auth event listener (signedIn, signedOut, tokenRefresh, tokenRefresh_failure)
- Proactive session refresh every 10 minutes
- Proper cleanup on unmount

### KIRO-005: Deprecated Meta Tag Fix (P2)

**Problem:** Browser warning about deprecated `apple-mobile-web-app-capable`.

**Solution:** Changed to `mobile-web-app-capable` in `index.html` line 12.

---

## Previous Deployment: Phase 19 - Security Enhancements

**Commit:** `0949f6f`  
**Branch:** `main`  
**Deployment Status:** ✅ LIVE

### 1. createNurseWithValidation Mutation

**Purpose:** Secure nurse creation with Colombian document validation

**Location:** `amplify/functions/create-nurse-validated/handler.ts`

**GraphQL Schema:**
```graphql
createNurseWithValidation(
  tenantId: String!
  name: String!
  email: AWSEmail!
  documentType: String!      # CC, CE, PA, TI
  documentNumber: String!    # Colombian ID format
  role: String!              # ADMIN, NURSE, COORDINATOR
  skills: [String]
): Nurse
```

**Validation Rules:**
- Document types: CC (Cédula), CE (Cédula Extranjería), PA (Pasaporte), TI (Tarjeta Identidad)
- CC/TI: 6-10 digits only
- CE: 6-12 alphanumeric
- PA: 6-15 alphanumeric
- Email format validation
- Duplicate document check within tenant

**Error Codes:**
| Code | Spanish Message |
|------|-----------------|
| INVALID_DOCUMENT_TYPE | Tipo de documento inválido |
| INVALID_DOCUMENT_FORMAT | Formato de documento inválido para tipo {type} |
| DUPLICATE_DOCUMENT | Ya existe un enfermero con este documento |
| MISSING_REQUIRED_FIELD | Campo requerido faltante: {field} |

### 2. Family Access Rate Limiting

**Purpose:** Prevent brute-force attacks on Family Portal access codes

**Location:** `amplify/functions/verify-family-access/handler.ts`

**Rate Limiting Configuration:**
- **Max Attempts:** 5 failed attempts
- **Lockout Duration:** 15 minutes (900 seconds)
- **Tracking Key:** `patientId:accessCode` combination

**Behavior:**
1. First 4 failed attempts: Returns remaining attempts count
2. 5th failed attempt: Triggers 15-minute lockout
3. During lockout: Returns lockout message with remaining time
4. After lockout expires: Counter resets automatically

**Security Audit Logging:**
All failed attempts and lockouts are logged to `AuditLog` table:
```typescript
{
  tenantId: string,
  action: 'FAMILY_ACCESS_FAILED' | 'FAMILY_ACCESS_LOCKED',
  entityType: 'Patient',
  entityId: patientId,
  performedBy: 'FAMILY_PORTAL',
  details: JSON.stringify({
    reason: string,
    attemptCount: number,
    lockoutUntil?: number
  })
}
```

**Spanish Error Messages:**
- `"Código de acceso incorrecto. Intentos restantes: X"`
- `"Demasiados intentos fallidos. Cuenta bloqueada por X minutos."`
- `"Paciente no encontrado"`

### 3. Subscription Authorization (Verified)

**Models with correct subscription permissions:**
- `Shift` - NURSE group has read access for `onUpdateShift`
- `Notification` - Explicit group permissions for ADMIN/NURSE

---

## AWS Resource Tagging Strategy

### Critical Requirement

**ALL AWS resources MUST be tagged to prevent Spring cleaning deletion.**

Amazon's automated Spring cleaning process runs nightly and deletes untagged resources. Without proper tags, the entire production system would be deleted.

### Required Tags

Every resource must have these two tags:

| Tag Key | Tag Value | Purpose |
|---------|-----------|---------|
| `auto-delete` | `no` | Prevents Spring cleaning deletion |
| `application` | `EPS` | Application identifier for tracking |

### Implementation

**Location:** `amplify/backend.ts`

```typescript
import { Tags } from 'aws-cdk-lib';

const backend = defineBackend({
  auth,
  data,
  // ... Lambda functions
});

// Apply tags to ALL resources
Tags.of(backend.stack).add('auto-delete', 'no');
Tags.of(backend.stack).add('application', 'EPS');
```

### Tagged Resources

| Resource Type | Count | Status |
|---------------|-------|--------|
| CloudFormation Stacks | 35 | ✅ Tagged |
| DynamoDB Tables | 11 | ✅ Tagged |
| Lambda Functions | 11 | ✅ Tagged |
| Cognito User Pool | 1 | ✅ Tagged |
| AppSync API | 1 | ✅ Tagged |
| IAM Roles | 26+ | ✅ Tagged |
| S3 Buckets | 2 | ✅ Tagged |
| Amplify Hosting App | 1 | ✅ Tagged |

### Verification

Run after every deployment:
```bash
.local-tests/verify-tags.sh
```

For Amplify app (tagged separately):
```bash
.local-tests/tag-amplify-app.sh d2wwgecog8smmr
```

### If Tags Are Missing

**EMERGENCY PROCEDURE:**
1. Immediately add tags via AWS Console
2. Redeploy backend: `npx ampx sandbox --once`
3. Re-run verification script
4. Document incident

---

## Backend Architecture Overview

### Lambda Functions (11 total)

| Function | Timeout | Purpose |
|----------|---------|---------|
| `rips-validator` | 30s | Colombian RIPS compliance validation |
| `glosa-defender` | 60s | AI-powered billing defense letters |
| `roster-architect` | 60s | AI-powered shift assignment |
| `create-visit-draft` | 30s | Create DRAFT visit from shift |
| `submit-visit` | 30s | Submit visit for approval |
| `reject-visit` | 30s | Admin rejects visit |
| `approve-visit` | 30s | Admin approves visit (immutable) |
| `list-approved-visit-summaries` | 30s | Family-safe visit list |
| `verify-family-access` | 30s | Rate-limited access verification |
| `create-nurse-validated` | 30s | Validated nurse creation |

### DynamoDB Tables (11 total)

- `Tenant` - Multi-tenant isolation
- `Patient` - Patient records with accessCode
- `Nurse` - Staff with document validation
- `Shift` - Scheduled visits
- `Visit` - Visit state machine (DRAFT→SUBMITTED→APPROVED)
- `BillingRecord` - Colombian invoicing with AI fields
- `InventoryItem` - Medical supplies
- `Notification` - User notifications
- `AuditLog` - Immutable audit trail
- `VitalSigns` - Patient vitals
- `PatientAssessment` - Clinical assessments

### GraphQL Endpoint

```
https://ga4dwdcapvg5ziixpgipcvmfbe.appsync-api.us-east-1.amazonaws.com/graphql
```

### Frontend URL

```
https://main.d2wwgecog8smmr.amplifyapp.com
```

---

## Deployment Commands

### Standard Deployment
```bash
export AWS_REGION=us-east-1
npx ampx sandbox --once
```

### AWS Credentials (if expired)
```bash
ada credentials update --account=747680064475 --role=Admin --provider=isengard --once
eval $(ada credentials export --account=747680064475 --role=Admin --export)
export ISENGARD_PRODUCTION_ACCOUNT=false
export AWS_DEFAULT_REGION=us-east-1
```

Or use alias: `awsc`

### Git Workflow
```bash
git add <files>
git commit -m "feat(phaseX): description"
git push origin main  # Triggers Amplify build
```

---

## File Structure Rules

### Target: ~20 files in amplify/

Current count: ~26 files (acceptable)

### Allowed Files
- `amplify/backend.ts` - Main backend config
- `amplify/auth/resource.ts` - Cognito config
- `amplify/data/resource.ts` - GraphQL schema
- `amplify/functions/*/handler.ts` - Lambda code
- `amplify/functions/*/resource.ts` - Lambda config
- `amplify/functions/*/package.json` - Dependencies

### Forbidden
- ❌ Test files (*.test.ts, *.spec.ts)
- ❌ Utils/helpers directories
- ❌ Multiple documentation files
- ❌ Scripts in amplify/

### Documentation
- Single source: `docs/API_DOCUMENTATION.md`
- Test scripts: `.local-tests/` (not synced with git)

---

## Test Users

| Email | Role | Tenant | Password |
|-------|------|--------|----------|
| admin@ips.com | ADMIN | IPS-001 | TempPass123! |
| nurse@ips.com | NURSE | IPS-001 | TempPass123! |
| family@ips.com | FAMILY | IPS-001 | TempPass123! |

---

## Monitoring

### CloudWatch Dashboard
```
https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=IPS-ERP-Production-Dashboard
```

### Amplify Console
```
https://console.aws.amazon.com/amplify/home?region=us-east-1#/d2wwgecog8smmr
```

### SNS Alerts Topic
```
arn:aws:sns:us-east-1:747680064475:IPS-ERP-Alerts
```

---

## Key Files to Review

1. **Schema:** `amplify/data/resource.ts` - All models and queries
2. **Backend:** `amplify/backend.ts` - Resource registration and tags
3. **Rate Limiting:** `amplify/functions/verify-family-access/handler.ts`
4. **Nurse Validation:** `amplify/functions/create-nurse-validated/handler.ts`
5. **Documentation:** `docs/API_DOCUMENTATION.md` - Phase 19 section
6. **Tasks:** `docs/KIRO_BACKEND_TASKS.md` - Remaining work

---

## Remaining Backend Tasks

See `docs/KIRO_BACKEND_TASKS.md` for:
- Task 3.1: Route optimization Lambda
- Task 3.2: Glosa Defender frontend connection
- Task 4.x: Audit and compliance features

**KIRO Task Queue Status:** ✅ EMPTY (all tasks completed)

See `tasks/queue.json` for current task status across both IDEs.

---

## Contact

- **AWS Account:** 747680064475
- **Region:** us-east-1
- **Project Owner:** Luis (Platform Owner)

---

*Last Updated: January 27, 2026 (Phase 21 - KIRO Bug Fixes)*
