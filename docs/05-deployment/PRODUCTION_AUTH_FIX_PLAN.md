# Production Authentication Fix Plan

**Date:** 2026-01-26  
**Status:** Planning  
**Priority:** CRITICAL

---

## Current Issues

### 1. Role Detection Bug (useAuth.ts)
The hook reads `custom:role` attribute which doesn't exist. Cognito uses **Groups** for roles.

**Fix:** Use `fetchAuthSession()` to read `cognito:groups` from JWT.

### 2. Missing SuperAdmin Role
Current hierarchy only has Admin (business owner), Nurse, Family.
Need SuperAdmin for platform administrators like Luis.

### 3. No Test Users Seeded
Cognito user pool `us-east-1_q9ZtCLtQr` has no production test users.

---

## User Hierarchy (Target State)

```
SuperAdmin (Luis)
│   └── Can manage ALL tenants, view platform analytics, manage admins
│
├── Admin (IPS Business Owner - e.g., Dr. Alejandra)
│   │   └── Manages ONE tenant: their IPS clinic
│   │   └── custom:tenantId = "tenant-bogota-01"
│   │
│   ├── Nurse (Maria Rodriguez)
│   │   └── Belongs to same tenant
│   │   └── Sees only their assigned shifts/patients
│   │
│   └── Patient → Family (Carlos Santos)
│       └── Linked to specific patient
│       └── Read-only access to patient data
│
└── Admin (Another IPS Owner - different tenant)
    └── custom:tenantId = "tenant-medellin-01"
    └── Completely isolated data
```

---

## Implementation Tasks

### Task 1: Fix useAuth.ts - Read Groups from JWT

```typescript
import { fetchAuthSession } from 'aws-amplify/auth';

async function checkUser() {
  const currentUser = await getCurrentUser();
  const session = await fetchAuthSession();
  const attributes = await fetchUserAttributes();
  
  // Get groups from JWT token
  const groups = session.tokens?.accessToken?.payload['cognito:groups'] as string[] || [];
  
  // Determine role from group membership (priority order)
  let userRole: 'superadmin' | 'admin' | 'nurse' | 'family' | null = null;
  if (groups.includes('SuperAdmin')) userRole = 'superadmin';
  else if (groups.includes('Admin')) userRole = 'admin';
  else if (groups.includes('Nurse')) userRole = 'nurse';
  else if (groups.includes('Family')) userRole = 'family';
  
  const tenantId = attributes['custom:tenantId'] || '';
  
  setUser(currentUser);
  setRole(userRole);
  setTenant(tenantId ? await fetchTenant(tenantId) : null);
}
```

### Task 2: Add SuperAdmin Group to Cognito

Update `amplify/auth/resource.ts`:
```typescript
groups: ['SuperAdmin', 'Admin', 'Nurse', 'Family'],
```

Deploy: `npx ampx sandbox` or push to trigger Amplify build.

### Task 3: Create Production Test Users

**Users to create in Cognito:**

| Email | Password | Group | TenantId | Purpose |
|-------|----------|-------|----------|---------|
| superadmin@ipserp.com | Test123!@ | SuperAdmin | (none) | Platform admin (Luis) |
| admin@clinica-vida.com | Test123!@ | Admin | tenant-vida-01 | IPS Owner test |
| admin@clinica-salud.com | Test123!@ | Admin | tenant-salud-01 | Second IPS (multi-tenant test) |
| maria.nurse@clinica-vida.com | Test123!@ | Nurse | tenant-vida-01 | Nurse for Clínica Vida |
| carlos.family@gmail.com | Test123!@ | Family | tenant-vida-01 | Family member test |

**AWS CLI commands to create users:**
```bash
USER_POOL_ID="us-east-1_q9ZtCLtQr"

# Create SuperAdmin
aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username "superadmin@ipserp.com" \
  --user-attributes Name=email,Value=superadmin@ipserp.com Name=email_verified,Value=true \
  --temporary-password "TempPass123!" \
  --message-action SUPPRESS

aws cognito-idp admin-set-user-password \
  --user-pool-id $USER_POOL_ID \
  --username "superadmin@ipserp.com" \
  --password "Test123!@" \
  --permanent

aws cognito-idp admin-add-user-to-group \
  --user-pool-id $USER_POOL_ID \
  --username "superadmin@ipserp.com" \
  --group-name "SuperAdmin"

# Create Admin (IPS Owner)
aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username "admin@clinica-vida.com" \
  --user-attributes Name=email,Value=admin@clinica-vida.com Name=email_verified,Value=true Name=custom:tenantId,Value=tenant-vida-01 \
  --temporary-password "TempPass123!" \
  --message-action SUPPRESS

aws cognito-idp admin-set-user-password \
  --user-pool-id $USER_POOL_ID \
  --username "admin@clinica-vida.com" \
  --password "Test123!@" \
  --permanent

aws cognito-idp admin-add-user-to-group \
  --user-pool-id $USER_POOL_ID \
  --username "admin@clinica-vida.com" \
  --group-name "Admin"

# Repeat for Nurse and Family users...
```

### Task 4: Seed Tenant Data in DynamoDB

Create tenant records that match the test users:
```typescript
// tenant-vida-01
{
  id: "tenant-vida-01",
  name: "Clínica Vida en Casa",
  nit: "900.123.456-1"
}

// tenant-salud-01  
{
  id: "tenant-salud-01",
  name: "IPS Salud Integral",
  nit: "900.789.012-3"
}
```

### Task 5: Update App Types

Add 'superadmin' to role types:
```typescript
// src/types/index.ts
export type UserRole = 'superadmin' | 'admin' | 'nurse' | 'family';
```

### Task 6: SuperAdmin Dashboard View

Create a platform-wide view for SuperAdmin:
- List all tenants
- View platform metrics
- Manage admin users
- System configuration

---

## Test Matrix

| Test Case | User | Expected Behavior |
|-----------|------|-------------------|
| SuperAdmin login | superadmin@ipserp.com | Sees all tenants, platform metrics |
| Admin login | admin@clinica-vida.com | Sees only tenant-vida-01 data |
| Multi-tenant isolation | Both admins | Each sees only their data |
| Nurse login | maria.nurse@clinica-vida.com | Sees only assigned shifts |
| Family login | carlos.family@gmail.com | Sees only linked patient |
| Cross-tenant attempt | Admin tries other tenant | Access denied |

---

## Deployment Order

1. ✅ Update auth config (add SuperAdmin group)
2. ✅ Fix useAuth.ts (read from groups)
3. ✅ Update types
4. ⏳ Deploy to Amplify
5. ⏳ Create Cognito test users (via AWS Console or CLI)
6. ⏳ Seed DynamoDB tenant data
7. ⏳ Test each role workflow
8. ⏳ Document final credentials

---

## Notes

- Luis needs AWS Console access to create Cognito users (EC2 doesn't have cognito-idp permissions)
- Or: Create a Lambda/script that seeds users (with proper IAM)
- Family portal uses access code (1234) in demo - needs real auth for production
