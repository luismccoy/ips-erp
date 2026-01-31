# Runbook: AWS Account Loss Recovery

> **Incident Type**: Complete loss of access to AWS account  
> **Estimated Recovery Time**: 2-4 hours (infrastructure) + variable (data)  
> **Last Updated**: 2026-01-27

---

## ⚠️ Incident Declaration

Trigger this runbook when:
- AWS account credentials are compromised and rotated
- AWS account is suspended or terminated
- Organization restructure requires new account
- Sandbox account expires (AWS employee scenario)

---

## Phase 1: New Account Setup (30 min)

### 1.1 Create or Obtain New AWS Account

```bash
# If creating new account:
# 1. Go to https://aws.amazon.com/
# 2. Click "Create an AWS Account"
# 3. Follow signup wizard

# If using organizational account:
# 1. Request new account from AWS admin
# 2. Obtain temporary credentials or SSO access
```

### 1.2 Configure Root Security Baseline

```bash
# Enable MFA on root account (MANDATORY)
# AWS Console → IAM → Security credentials → MFA

# Create admin IAM user (avoid using root)
aws iam create-user --user-name ips-erp-admin

aws iam attach-user-policy \
  --user-name ips-erp-admin \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess

aws iam create-access-key --user-name ips-erp-admin
# Save the AccessKeyId and SecretAccessKey securely
```

### 1.3 Configure AWS CLI

```bash
# Configure credentials
aws configure
# AWS Access Key ID: <from 1.2>
# AWS Secret Access Key: <from 1.2>
# Default region name: us-east-1
# Default output format: json

# Verify identity
aws sts get-caller-identity
```

### 1.4 Create IAM Roles for Deployment

```bash
# Create Amplify service role
aws iam create-role \
  --role-name AmplifyServiceRole \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": {"Service": "amplify.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }]
  }'

aws iam attach-role-policy \
  --role-name AmplifyServiceRole \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess-Amplify
```

---

## Phase 2: Bootstrap IaC Tooling (15 min)

### 2.1 Install Required Tools

```bash
# Check Node.js version (need 18.x or 20.x)
node --version

# Install if needed (using nvm)
nvm install 18
nvm use 18

# Verify npm
npm --version

# Install AWS CDK globally
npm install -g aws-cdk

# Install Amplify CLI
npm install -g @aws-amplify/cli
```

### 2.2 Bootstrap CDK

```bash
# Get account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION=us-east-1

# Bootstrap CDK
npx cdk bootstrap aws://${ACCOUNT_ID}/${REGION}
```

### 2.3 Enable Bedrock Model Access

```bash
# This must be done via console - no CLI support
echo "ACTION REQUIRED:"
echo "1. Go to: https://console.aws.amazon.com/bedrock/home?region=us-east-1#/modelaccess"
echo "2. Click 'Manage model access'"
echo "3. Select 'Anthropic' → 'Claude 3.5 Sonnet'"
echo "4. Click 'Request model access'"
echo "5. Wait for approval (usually instant)"

# Press Enter when complete
read -p "Press Enter after enabling Bedrock model access..."
```

---

## Phase 3: Deploy Foundational Stacks (15 min)

### 3.1 Clone Repository

```bash
# Clone from GitHub
git clone https://github.com/luiscoy/ips-erp.git
cd ips-erp

# Checkout production branch
git checkout main
```

### 3.2 Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 3.3 Run Bootstrap Script

```bash
# Make executable
chmod +x scripts/bootstrap-new-account.sh

# Run bootstrap
./scripts/bootstrap-new-account.sh
```

---

## Phase 4: Deploy Application Stacks (45 min)

### 4.1 Option A: Amplify Console (Production)

```bash
echo "Deploy via Amplify Console:"
echo "1. Go to: https://console.aws.amazon.com/amplify/home?region=us-east-1"
echo "2. Click 'New app' → 'Host web app'"
echo "3. Select 'GitHub' and authorize"
echo "4. Select repository: luiscoy/ips-erp"
echo "5. Select branch: main"
echo "6. Accept auto-detected build settings (amplify.yml)"
echo "7. Click 'Save and deploy'"
echo ""
echo "Deployment takes ~10-15 minutes"
```

### 4.1 Option B: CLI Sandbox (Development)

```bash
# Start sandbox deployment
npx ampx sandbox --once

# This will:
# - Deploy Cognito User Pool
# - Deploy AppSync API
# - Deploy DynamoDB tables
# - Deploy Lambda functions
# - Generate amplify_outputs.json
```

### 4.2 Capture Deployment Outputs

```bash
# After deployment, save critical outputs
cat amplify_outputs.json | jq '{
  user_pool_id: .auth.user_pool_id,
  identity_pool_id: .auth.identity_pool_id,
  api_url: .data.url,
  region: .auth.aws_region
}' > deployment-outputs.json

echo "Save deployment-outputs.json securely!"
```

---

## Phase 5: Restore Data (Variable)

### 5.1 If Backup Exists

```bash
# Ensure backup manifest is available
ls -la backups/

# Run restore script
./scripts/restore-import.sh --manifest backups/latest-backup-manifest.json

# Verify record counts
aws dynamodb scan --table-name Tenant-<API_ID> --select COUNT
aws dynamodb scan --table-name Patient-<API_ID> --select COUNT
```

### 5.2 If No Backup (Fresh Start)

```bash
# Seed with sample data (development only)
npx ts-node scripts/seed-production-data.ts

# Or create first tenant manually via GraphQL
echo "Create initial tenant via AppSync Console or app UI"
```

### 5.3 Migrate Users

```bash
# Users cannot be migrated with passwords
# Export user list from old account (if accessible):
# aws cognito-idp list-users --user-pool-id OLD_POOL_ID > users.json

# Create users in new pool with temp passwords:
for user in $(cat users.json | jq -r '.Users[].Username'); do
  aws cognito-idp admin-create-user \
    --user-pool-id NEW_POOL_ID \
    --username $user \
    --message-action SUPPRESS
done

# Users will need to reset passwords on first login
```

---

## Phase 6: Reconnect Third-Party Integrations (30 min)

### 6.1 GitHub (CI/CD)

```bash
# Update GitHub repository secrets:
# Settings → Secrets and variables → Actions

# Required secrets:
# - AWS_ACCESS_KEY_ID
# - AWS_SECRET_ACCESS_KEY
# - AWS_REGION (us-east-1)
# - AMPLIFY_APP_ID_PROD (from new deployment)
# - AMPLIFY_APP_ID_STAGING (if applicable)
# - AMPLIFY_APP_ID_DEV (if applicable)
```

### 6.2 Custom Domain (if applicable)

```bash
# If using custom domain:
# 1. Go to Amplify Console → App → Domain management
# 2. Add custom domain
# 3. Follow DNS verification steps
# 4. Update DNS records at registrar
```

---

## Phase 7: Cutover Traffic (15 min)

### 7.1 DNS Update

```bash
# Get new Amplify URL
NEW_URL=$(aws amplify get-app --app-id APP_ID --query 'app.defaultDomain' --output text)
echo "New URL: https://main.${NEW_URL}"

# Update DNS if using custom domain
# Route53 or external registrar
```

### 7.2 Notify Users

```bash
# Send notification via preferred channel
# - Email blast
# - In-app banner (if old app accessible)
# - SMS/WhatsApp
```

---

## Phase 8: Post-Cutover Validation (30 min)

### 8.1 Run Validation Script

```bash
./scripts/validate-deployment.sh
```

### 8.2 Manual Smoke Tests

```bash
# Test checklist:
# [ ] Landing page loads
# [ ] User can sign up
# [ ] User can log in
# [ ] Admin can see dashboard
# [ ] Nurse app loads
# [ ] Family portal works
# [ ] AI roster generation works
# [ ] RIPS validation works
```

### 8.3 Monitor for Errors

```bash
# Watch CloudWatch logs
aws logs tail /aws/lambda/roster-architect --follow

# Check AppSync errors
# Amplify Console → App → Monitoring
```

---

## Phase 9: Cleanup and Documentation (Post-Recovery)

### 9.1 Document Recovery

```bash
# Create incident report
cat > docs/incidents/$(date +%Y-%m-%d)-account-recovery.md << EOF
# Account Recovery Incident - $(date +%Y-%m-%d)

## Summary
- Trigger: [Reason for account loss]
- Recovery started: [timestamp]
- Recovery completed: [timestamp]
- Total downtime: [duration]

## Actions Taken
1. [List steps performed]

## Data Loss
- [Document any data that could not be recovered]

## Lessons Learned
- [What could be improved]

## Follow-up Items
- [ ] [Action items]
EOF
```

### 9.2 Update This Runbook

```bash
# If any steps were outdated or incorrect, update this runbook
# and commit changes
git add docs/account-portability/runbook-account-loss.md
git commit -m "Update account loss runbook based on real recovery"
```

---

## Rollback Plan

If recovery fails at any phase:

1. **Phase 1-3 failure**: Start over with new account
2. **Phase 4 failure**: Check Amplify logs, fix issues, redeploy
3. **Phase 5 failure**: Data may be lost; notify stakeholders
4. **Phase 6-7 failure**: Keep old deployment running if accessible
5. **Phase 8 failure**: Roll back DNS to old deployment

---

## Emergency Contacts

| Role | Contact | Responsibility |
|------|---------|----------------|
| Project Owner | Luis Coy | Final decisions |
| AWS Support | aws.amazon.com/support | Account issues |
| GitHub Support | support.github.com | Repo access issues |

---

## Appendix: Command Reference

```bash
# Quick reference for common commands

# Check AWS identity
aws sts get-caller-identity

# List Amplify apps
aws amplify list-apps

# Get Amplify app details
aws amplify get-app --app-id APP_ID

# List Cognito user pools
aws cognito-idp list-user-pools --max-results 10

# List DynamoDB tables
aws dynamodb list-tables

# Check Lambda function
aws lambda get-function --function-name roster-architect

# Tail CloudWatch logs
aws logs tail /aws/lambda/FUNCTION_NAME --follow
```
