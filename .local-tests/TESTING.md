# IPS ERP — E2E & Operations Testing

## Where to Run

All E2E and operations scripts run on the **Ubuntu EC2 instance**, not locally.

```bash
ssh ubuntu-dev
cd /home/ubuntu/projects/ERP
```

The instance has AWS credentials (`iamadmin` on `747680064475`), Playwright with Chromium, and Python 3 pre-installed.

## When to Run

### After Every Amplify Deploy

Amplify resets two things on every deploy:

1. **Cognito auth flows** — removes `ADMIN_USER_PASSWORD_AUTH`, breaking programmatic login
2. **AppSync resolver auth functions** — overwrites group-based VTL templates with empty pass-throughs

Run the post-deploy fix immediately after any successful Amplify build:

```bash
bash .local-tests/post-deploy.sh
```

This runs three steps: Cognito fix → AppSync resolver fix → API health check.

### After Code Changes

Run the full E2E suite to verify nothing broke:

```bash
node .local-tests/e2e-full-workflow.cjs
```

### Before Merging to Main

Run the full suite. All 20 tests should pass with 0 failures.

## How to Run

### 1. Post-Deploy Fix (required after every Amplify deploy)

```bash
bash .local-tests/post-deploy.sh
```

What it does:
- Re-enables `ADMIN_USER_PASSWORD_AUTH` on Cognito client `2evujd9dbsveotssutkp4u6436`
- Patches all AppSync auth0 resolver functions with proper `staticGroupRoles` VTL templates
- Runs API health check against all 8 data models

### 2. Full Workflow E2E Test (primary test suite)

```bash
node .local-tests/e2e-full-workflow.cjs
```

Tests three personas against production (`main.d2wwgecog8smmr.amplifyapp.com`):

| Persona | Tests | What's Verified |
|---------|-------|-----------------|
| Admin   | 10    | Dashboard, patients, shifts, inventory, billing, audit, roster, "Nuevo" button, GraphQL errors, logout |
| Nurse   | 6     | SimpleNurseApp renders, patients/shifts readable, billing denied (RBAC), GraphQL errors, logout |
| Family  | 4     | Access code form renders, billing denied (RBAC), auth denials working, no unexpected errors |

Expected result: **20 PASS, 0 FAIL, 0 WARN**

Screenshots saved to `.local-tests/screenshots/`.

### 3. AppSync Resolver Fix (standalone)

```bash
python3 .local-tests/fix-all-resolvers.py          # Apply fixes
python3 .local-tests/fix-all-resolvers.py --dry-run # Preview only
```

Scans all ~400 AppSync functions, finds auth0 functions with empty request templates, patches them with correct group-based VTL. Covers all 11 models with proper CRUD permissions from `amplify/data/resource.ts`.

### 4. API Health Check (standalone)

```bash
python3 .local-tests/api-health-check.py
```

Authenticates as admin and runs a GraphQL list query against each model to verify the API is responding.

### 5. Cognito User List

```bash
python3 .local-tests/list-cognito-users.py
```

Lists all Cognito users with their groups and custom attributes.

## Test Credentials

| Role   | Email             | Password   | Cognito Group | Tenant            |
|--------|-------------------|------------|---------------|-------------------|
| Admin  | admin@ips.com     | Admin123!  | Admin         | tenant-bogota-01  |
| Nurse  | nurse@ips.com     | Nurse123!  | Nurse         | tenant-bogota-01  |
| Family | family@ips.com    | Family123! | Family        | tenant-bogota-01  |

## Infrastructure References

| Resource       | ID / URL |
|----------------|----------|
| Amplify App    | `d2wwgecog8smmr` — `https://main.d2wwgecog8smmr.amplifyapp.com` |
| AppSync API    | `fxeusr7wzfchtkr7kamke3qnwq` |
| Cognito Pool   | `us-east-1_q9ZtCLtQr` |
| Cognito Client | `2evujd9dbsveotssutkp4u6436` |
| Region         | `us-east-1` |

## Troubleshooting

**Tests fail with "NotAuthorizedException"**
→ Cognito auth flows were reset. Run `bash .local-tests/post-deploy.sh`.

**Tests fail with "Not Authorized to access X"**
→ AppSync resolvers were reset. Run `python3 .local-tests/fix-all-resolvers.py`.

**AWS credentials expired**
→ On Ubuntu: credentials are long-lived IAM user, shouldn't expire.
→ On local Mac: run `awsc`.

**Playwright not found**
→ On Ubuntu: `npm install` in `/home/ubuntu/projects/ERP/.local-tests/` then `npx playwright install chromium`.

**Screenshots directory missing**
→ `mkdir -p .local-tests/screenshots`
