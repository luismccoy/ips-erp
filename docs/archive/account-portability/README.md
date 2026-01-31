# IPS-ERP AWS Account Portability Guide

> **Goal**: Enable full system recovery in a brand-new AWS account using only this repository, documented prerequisites, and known external dependencies.

## Overview

This documentation ensures that if the current AWS account becomes unreachable (credential loss, account suspension, org restructure), the entire IPS-ERP stack can be redeployed to a new AWS account with:

- **Minimal downtime** (< 4 hours for infrastructure, variable for data restoration)
- **No missing dependencies** (all requirements documented)
- **No tribal knowledge** (every step is scripted or documented)

---

## Quick Links

| Document | Purpose |
|----------|---------|
| [Runbook: Account Loss](./runbook-account-loss.md) | Step-by-step disaster recovery |
| [External Dependencies](./external-dependencies.md) | Third-party integration inventory |
| [Parameters & Secrets](./parameters-and-secrets.md) | Config matrix and secret inventory |
| [System Inventory](../../manifests/system-inventory.json) | Machine-readable component list |

---

## 🆕 New Account Bootstrap Checklist

Before deploying IPS-ERP to a new AWS account:

- [ ] **AWS Account Setup**
  - [ ] Create new AWS account (or receive sandbox assignment)
  - [ ] Enable MFA on root account
  - [ ] Create IAM admin user (avoid using root)
  - [ ] Configure AWS CLI with credentials
  - [ ] Verify region: `us-east-1`

- [ ] **Required Tool Versions** (see `.tool-versions`)
  - [ ] Node.js 18.x or 20.x
  - [ ] npm 9.x+
  - [ ] AWS CLI v2
  - [ ] Git 2.x+

- [ ] **Bedrock Model Access**
  - [ ] Navigate to Amazon Bedrock → Model access
  - [ ] Request access to: `anthropic.claude-3-5-sonnet-20240620-v1:0`
  - [ ] Wait for approval (usually instant for Anthropic models)

- [ ] **CDK Bootstrap**
  - [ ] Run: `npx cdk bootstrap aws://ACCOUNT_ID/us-east-1`

- [ ] **Run Bootstrap Script**
  ```bash
  ./scripts/bootstrap-new-account.sh
  ```

---

## 🚀 Full Redeploy Checklist

After bootstrap, deploy the full stack:

- [ ] **Clone Repository**
  ```bash
  git clone https://github.com/luiscoy/ips-erp.git
  cd ips-erp
  ```

- [ ] **Install Dependencies**
  ```bash
  npm install --legacy-peer-deps
  ```

- [ ] **Create Amplify App** (choose one method)
  
  **Option A: Amplify Console (Recommended for production)**
  1. Go to AWS Amplify Console
  2. Click "New app" → "Host web app"
  3. Connect GitHub repository
  4. Select branch (main for production)
  5. Let Amplify detect build settings from `amplify.yml`
  
  **Option B: CLI Sandbox (Development)**
  ```bash
  npx ampx sandbox
  ```

- [ ] **Verify Deployment**
  ```bash
  ./scripts/validate-deployment.sh
  ```

- [ ] **Create Initial Admin User**
  ```bash
  # Via AWS CLI
  aws cognito-idp admin-create-user \
    --user-pool-id <USER_POOL_ID> \
    --username admin@company.com \
    --user-attributes Name=email,Value=admin@company.com \
    --temporary-password TempPass123!
  
  # Add to Admin group
  aws cognito-idp admin-add-user-to-group \
    --user-pool-id <USER_POOL_ID> \
    --username admin@company.com \
    --group-name Admin
  ```

---

## 💾 Data Restore Checklist

If migrating data from old account:

- [ ] **Export Data from Old Account** (if accessible)
  ```bash
  ./scripts/backup-export.sh --env production
  ```

- [ ] **Transfer Backup Files**
  - Copy backup manifest and data files to new account S3 or local
  - Verify integrity with checksums

- [ ] **Import Data to New Account**
  ```bash
  ./scripts/restore-import.sh --manifest backup-manifest.json
  ```

- [ ] **Verify Data Integrity**
  - [ ] Check record counts match
  - [ ] Spot-check critical records (Tenants, Patients, Nurses)
  - [ ] Verify relationships are intact

- [ ] **User Migration**
  - Export user list from old Cognito (usernames/emails only)
  - Create users in new Cognito with temporary passwords
  - Send password reset emails to all users

---

## 🔄 Cutover Checklist

When switching traffic to new deployment:

- [ ] **DNS (if using custom domain)**
  - [ ] Update Route53 or external DNS to point to new Amplify URL
  - [ ] Verify SSL certificate is valid
  - [ ] Test HTTPS access

- [ ] **Notify Users**
  - [ ] Send maintenance notification
  - [ ] Provide new URL if changed
  - [ ] Instruct on password reset if needed

- [ ] **Update GitHub Secrets**
  - [ ] `AWS_ACCESS_KEY_ID` → New account credentials
  - [ ] `AWS_SECRET_ACCESS_KEY` → New account credentials
  - [ ] `AMPLIFY_APP_ID_PROD` → New Amplify app ID
  - [ ] `AWS_REGION` → Verify us-east-1

- [ ] **Disable Old Deployment**
  - [ ] Stop old Amplify app builds
  - [ ] Remove old backend (optional, for cleanup)

---

## ✅ Validation Checklist

After deployment, verify everything works:

- [ ] **Frontend Access**
  - [ ] Landing page loads
  - [ ] Can navigate to login
  - [ ] No console errors

- [ ] **Authentication**
  - [ ] Can create new user (signup)
  - [ ] Can login with existing user
  - [ ] Correct group assignment (Admin/Nurse/Family)

- [ ] **API Operations**
  - [ ] GraphQL queries work (list patients, nurses, etc.)
  - [ ] GraphQL mutations work (create shift, etc.)
  - [ ] Tenant isolation working

- [ ] **AI Features**
  - [ ] Roster generation works (`generateRoster`)
  - [ ] RIPS validation works (`validateRIPS`)
  - [ ] Glosa defense works (`generateGlosaDefense`)

- [ ] **Run Automated Validation**
  ```bash
  ./scripts/validate-deployment.sh
  ```

---

## 🔐 Security Notes

1. **Never commit secrets** - All credentials are in environment variables or GitHub Secrets
2. **amplify_outputs.json is gitignored** - Generated per-environment
3. **Rotate credentials after migration** - Treat old credentials as compromised
4. **Review IAM policies** - Ensure least-privilege in new account

---

## Support

For issues with this runbook:
1. Check GitHub Issues: `https://github.com/luiscoy/ips-erp/issues`
2. Review AWS Amplify docs: `https://docs.amplify.aws`
3. Contact: Luis Coy (project owner)
