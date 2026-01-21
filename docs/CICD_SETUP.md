# CI/CD Setup Guide

This guide walks you through setting up the complete CI/CD pipeline for IPS ERP using AWS Amplify.

## Prerequisites

- [ ] AWS Account with appropriate permissions
- [ ] GitHub account
- [ ] Git installed locally
- [ ] AWS CLI installed (optional, for GitHub Actions)

---

## Option 1: AWS Amplify Native CI/CD (Recommended)

### Step 1: Initialize Git Repository

```bash
# Run the initialization script
./scripts/init-git.sh

# This creates:
# - main branch (production)
# - staging branch (pre-production)
# - develop branch (development)
```

### Step 2: Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository: `ips-erp`
3. **Do NOT** initialize with README, .gitignore, or license
4. Copy the repository URL

### Step 3: Connect Local Repository to GitHub

```bash
# Add GitHub as remote
git remote add origin https://github.com/YOUR_USERNAME/ips-erp.git

# Push all branches
./scripts/push-all-branches.sh
```

### Step 4: Configure Branch Protection Rules

Go to your GitHub repository → Settings → Branches

#### For `main` branch:
- [x] Require pull request before merging
- [x] Require approvals (1+)
- [x] Require status checks to pass
  - Select: `lint-and-test`
- [x] Require conversation resolution before merging

#### For `staging` branch:
- [x] Require pull request before merging
- [x] Require status checks to pass

#### For `develop` branch:
- [x] Require pull request before merging

### Step 5: Set Up AWS Amplify App

#### 5.1 Create Amplify App

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click **New app** → **Host web app**
3. Select **GitHub** as source
4. Authorize AWS Amplify to access your GitHub account
5. Select repository: `ips-erp`
6. Select branch: `main`

#### 5.2 Configure Build Settings

Amplify should auto-detect `amplify.yml`. Verify it shows:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
```

#### 5.3 Add Environment Variables (for Production)

In the Amplify Console:
1. Go to your app → **Environment variables**
2. Add the following:

```
VITE_API_URL = https://api.ips-erp.com
VITE_ENABLE_ANALYTICS = true
VITE_ENABLE_MOCK_DATA = false
VITE_APP_NAME = IPS ERP
```

#### 5.4 Connect Additional Branches

1. In Amplify Console → **App settings** → **Branch management**
2. Click **Connect branch**
3. Select `staging` → Configure environment variables for staging
4. Repeat for `develop`

**Environment Variables for Staging:**
```
VITE_API_URL = https://staging-api.ips-erp.com
VITE_ENABLE_ANALYTICS = true
VITE_ENABLE_MOCK_DATA = false
VITE_APP_NAME = IPS ERP (Staging)
```

**Environment Variables for Develop:**
```
VITE_API_URL = https://dev-api.ips-erp.com
VITE_ENABLE_ANALYTICS = false
VITE_ENABLE_MOCK_DATA = true
VITE_APP_NAME = IPS ERP (Dev)
```

### Step 6: Enable PR Previews

1. In Amplify Console → **App settings** → **Previews**
2. Enable **Pull request previews**
3. Select branches: `develop`, `staging`
4. Click **Enable**

Now every PR will get a preview URL!

### Step 7: Configure Custom Domain (Production Only)

1. In Amplify Console → **Domain management**
2. Click **Add domain**
3. Enter: `ips-erp.com`
4. Follow DNS configuration steps in your domain registrar
5. Amplify will automatically provision SSL certificate

---

## Option 2: GitHub Actions + AWS Amplify

If you need more control over the CI/CD pipeline:

### Step 1-4: Same as Option 1

### Step 5: Create AWS IAM User for GitHub Actions

1. Go to AWS IAM Console
2. Create new user: `github-actions-ips-erp`
3. Attach policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "amplify:StartJob",
        "amplify:GetJob",
        "amplify:ListJobs"
      ],
      "Resource": "*"
    }
  ]
}
```

4. Create access key → Save credentials securely

### Step 6: Configure GitHub Secrets

Go to GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

```
AWS_ACCESS_KEY_ID = <from IAM user>
AWS_SECRET_ACCESS_KEY = <from IAM user>
AWS_REGION = us-east-1  (or your preferred region)

AMPLIFY_APP_ID_DEV = <get from Amplify Console>
AMPLIFY_APP_ID_STAGING = <get from Amplify Console>
AMPLIFY_APP_ID_PROD = <get from Amplify Console>
```

### Step 7: Enable GitHub Actions

The workflows are already created in `.github/workflows/`:
- `test.yml` - Runs on all PRs
- `deploy.yml` - Deploys on push to develop/staging/main

Push to GitHub and workflows will activate automatically!

---

## Verification Checklist

After setup, verify:

- [ ] All three branches deployed to Amplify
- [ ] Environment variables configured correctly
- [ ] Branch protection rules active
- [ ] PR previews enabled
- [ ] Custom domain connected (production)
- [ ] GitHub Actions passing (if using Option 2)
- [ ] Test deployment: Make a change, push to `develop`, verify auto-deploy

---

## Troubleshooting

### Build Fails with "npm ci" Error

**Solution:** Ensure `package-lock.json` is committed to repository.

### Environment Variables Not Applying

**Solution:** Restart the Amplify build. Variables only apply on new builds.

### GitHub Actions Can't Trigger Amplify

**Solution:** Verify IAM permissions and Amplify App IDs in secrets.

### Branch Not Auto-Deploying

**Solution:** Check Amplify Console → App settings → Build settings. Ensure branch is connected.

---

## Next Steps

1. [Read Deployment Workflow](./DEPLOYMENT.md)
2. Test the entire flow: Create feature branch → PR to develop → Merge → Verify auto-deploy
3. Set up monitoring and alerts in CloudWatch

