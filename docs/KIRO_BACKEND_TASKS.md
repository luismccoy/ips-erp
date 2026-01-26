# Kiro Backend Tasks - Production Auth Setup

**Date:** 2026-01-26  
**From:** Clawd (EC2 Coordinator)  
**To:** Kiro (Backend/AWS Specialist)  
**Priority:** HIGH - Production Auth Blocking

---

## Context

I've fixed the frontend auth hook (`src/hooks/useAuth.ts`) to properly read user roles from **Cognito Groups** instead of a non-existent `custom:role` attribute. I also added a `SuperAdmin` group for platform administrators.

**Your mission:** Set up the production test users in Cognito and seed the Tenant data in DynamoDB so we can test the full production authentication flow.

---

## Task 1: Add SuperAdmin Group to Cognito

The auth config (`amplify/auth/resource.ts`) now includes `SuperAdmin` group, but it needs to be deployed.

```bash
# From the ERP project root
cd ~/projects/ERP

# Pull latest changes first
git pull origin main

# Deploy the auth changes
npx ampx sandbox  # if using sandbox
# OR trigger Amplify deployment by pushing (already done)
```

**Verify the group exists:**
```bash
aws cognito-idp list-groups \
  --user-pool-id us-east-1_q9ZtCLtQr \
  --region us-east-1
```

Expected groups: `SuperAdmin`, `Admin`, `Nurse`, `Family`

If `SuperAdmin` doesn't exist after deploy, create it manually:
```bash
aws cognito-idp create-group \
  --user-pool-id us-east-1_q9ZtCLtQr \
  --group-name SuperAdmin \
  --description "Platform administrators with full access" \
  --precedence 0 \
  --region us-east-1
```

---

## Task 2: Create Production Test Users

**User Pool ID:** `us-east-1_q9ZtCLtQr`  
**Region:** `us-east-1`

### 2.1 SuperAdmin (Luis - Platform Owner)

```bash
USER_POOL_ID="us-east-1_q9ZtCLtQr"
REGION="us-east-1"

# Create user
aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username "superadmin@ipserp.com" \
  --user-attributes \
    Name=email,Value=superadmin@ipserp.com \
    Name=email_verified,Value=true \
  --temporary-password "TempPass123!" \
  --message-action SUPPRESS \
  --region $REGION

# Set permanent password
aws cognito-idp admin-set-user-password \
  --user-pool-id $USER_POOL_ID \
  --username "superadmin@ipserp.com" \
  --password "SuperAdmin123!@" \
  --permanent \
  --region $REGION

# Add to SuperAdmin group
aws cognito-idp admin-add-user-to-group \
  --user-pool-id $USER_POOL_ID \
  --username "superadmin@ipserp.com" \
  --group-name "SuperAdmin" \
  --region $REGION
```

### 2.2 Admin (IPS Business Owner - Clínica Vida)

```bash
# Create user with tenantId
aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username "admin@clinica-vida.com" \
  --user-attributes \
    Name=email,Value=admin@clinica-vida.com \
    Name=email_verified,Value=true \
    Name=custom:tenantId,Value=tenant-vida-01 \
  --temporary-password "TempPass123!" \
  --message-action SUPPRESS \
  --region $REGION

# Set permanent password
aws cognito-idp admin-set-user-password \
  --user-pool-id $USER_POOL_ID \
  --username "admin@clinica-vida.com" \
  --password "AdminVida123!@" \
  --permanent \
  --region $REGION

# Add to Admin group
aws cognito-idp admin-add-user-to-group \
  --user-pool-id $USER_POOL_ID \
  --username "admin@clinica-vida.com" \
  --group-name "Admin" \
  --region $REGION
```

### 2.3 Admin (Second IPS - Multi-tenant Test)

```bash
# Create second admin for different tenant
aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username "admin@clinica-salud.com" \
  --user-attributes \
    Name=email,Value=admin@clinica-salud.com \
    Name=email_verified,Value=true \
    Name=custom:tenantId,Value=tenant-salud-01 \
  --temporary-password "TempPass123!" \
  --message-action SUPPRESS \
  --region $REGION

aws cognito-idp admin-set-user-password \
  --user-pool-id $USER_POOL_ID \
  --username "admin@clinica-salud.com" \
  --password "AdminSalud123!@" \
  --permanent \
  --region $REGION

aws cognito-idp admin-add-user-to-group \
  --user-pool-id $USER_POOL_ID \
  --username "admin@clinica-salud.com" \
  --group-name "Admin" \
  --region $REGION
```

### 2.4 Nurse (Healthcare Worker)

```bash
aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username "maria.nurse@clinica-vida.com" \
  --user-attributes \
    Name=email,Value=maria.nurse@clinica-vida.com \
    Name=email_verified,Value=true \
    Name=custom:tenantId,Value=tenant-vida-01 \
  --temporary-password "TempPass123!" \
  --message-action SUPPRESS \
  --region $REGION

aws cognito-idp admin-set-user-password \
  --user-pool-id $USER_POOL_ID \
  --username "maria.nurse@clinica-vida.com" \
  --password "NurseMaria123!@" \
  --permanent \
  --region $REGION

aws cognito-idp admin-add-user-to-group \
  --user-pool-id $USER_POOL_ID \
  --username "maria.nurse@clinica-vida.com" \
  --group-name "Nurse" \
  --region $REGION
```

### 2.5 Family (Patient Family Member)

```bash
aws cognito-idp admin-create-user \
  --user-pool-id $USER_POOL_ID \
  --username "carlos.familia@gmail.com" \
  --user-attributes \
    Name=email,Value=carlos.familia@gmail.com \
    Name=email_verified,Value=true \
    Name=custom:tenantId,Value=tenant-vida-01 \
  --temporary-password "TempPass123!" \
  --message-action SUPPRESS \
  --region $REGION

aws cognito-idp admin-set-user-password \
  --user-pool-id $USER_POOL_ID \
  --username "carlos.familia@gmail.com" \
  --password "FamiliaCarlos123!@" \
  --permanent \
  --region $REGION

aws cognito-idp admin-add-user-to-group \
  --user-pool-id $USER_POOL_ID \
  --username "carlos.familia@gmail.com" \
  --group-name "Family" \
  --region $REGION
```

---

## Task 3: Seed Tenant Data in DynamoDB

Find the Tenant table name:
```bash
aws dynamodb list-tables --region us-east-1 | grep -i tenant
```

It should be something like: `Tenant-XXXXXXXX-main`

### 3.1 Create Tenant: Clínica Vida en Casa

```bash
TENANT_TABLE="Tenant-XXXXXXXX-main"  # Replace with actual table name

aws dynamodb put-item \
  --table-name $TENANT_TABLE \
  --item '{
    "id": {"S": "tenant-vida-01"},
    "name": {"S": "Clínica Vida en Casa S.A.S"},
    "nit": {"S": "900.123.456-1"},
    "createdAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"},
    "updatedAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}
  }' \
  --region us-east-1
```

### 3.2 Create Tenant: IPS Salud Integral

```bash
aws dynamodb put-item \
  --table-name $TENANT_TABLE \
  --item '{
    "id": {"S": "tenant-salud-01"},
    "name": {"S": "IPS Salud Integral"},
    "nit": {"S": "900.789.012-3"},
    "createdAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"},
    "updatedAt": {"S": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"}
  }' \
  --region us-east-1
```

---

## Task 4: Verify Everything

### List all users:
```bash
aws cognito-idp list-users \
  --user-pool-id us-east-1_q9ZtCLtQr \
  --region us-east-1 \
  --query 'Users[*].[Username,UserStatus,Enabled]' \
  --output table
```

### Check user groups:
```bash
aws cognito-idp admin-list-groups-for-user \
  --user-pool-id us-east-1_q9ZtCLtQr \
  --username "superadmin@ipserp.com" \
  --region us-east-1
```

### Verify tenants in DynamoDB:
```bash
aws dynamodb scan \
  --table-name $TENANT_TABLE \
  --region us-east-1 \
  --query 'Items[*].{id:id.S,name:name.S}' \
  --output table
```

---

## Task 5: Test Authentication

After setup, test login at: https://main.d2wwgecog8smmr.amplifyapp.com

**Test Matrix:**

| User | Password | Expected Role | Expected Tenant |
|------|----------|---------------|-----------------|
| superadmin@ipserp.com | SuperAdmin123!@ | superadmin | null (platform-wide) |
| admin@clinica-vida.com | AdminVida123!@ | admin | Clínica Vida en Casa |
| admin@clinica-salud.com | AdminSalud123!@ | admin | IPS Salud Integral |
| maria.nurse@clinica-vida.com | NurseMaria123!@ | nurse | Clínica Vida en Casa |
| carlos.familia@gmail.com | FamiliaCarlos123!@ | family | Clínica Vida en Casa |

---

## Handoff Notes

Once complete:
1. Update `docs/TEAM_HANDOFF.md` with completion status
2. Commit any backend changes to git
3. Let Clawd know via the handoff doc so I can test the frontend integration

**Questions?** Document them in `docs/TEAM_HANDOFF.md` and I'll address them.

---

*Generated by Clawd - EC2 Coordinator*
