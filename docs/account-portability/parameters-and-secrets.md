# Parameters and Secrets Inventory

> Configuration matrix, secret inventory, and environment templates for IPS-ERP deployment.

---

## Environment Configuration Matrix

### Frontend Environment Variables

| Variable | Development | Staging | Production | Source |
|----------|-------------|---------|------------|--------|
| `VITE_API_URL` | Auto-injected | Auto-injected | Auto-injected | Amplify |
| `VITE_API_TIMEOUT` | 30000 | 30000 | 30000 | `.env.*` |
| `VITE_USE_REAL_BACKEND` | false | true | true | `.env.*` |
| `VITE_ENABLE_ANALYTICS` | false | false | true | `.env.*` |
| `VITE_ENABLE_MOCK_DATA` | true | false | false | `.env.*` |
| `VITE_APP_NAME` | "IPS ERP" | "IPS ERP" | "IPS ERP" | `.env.*` |

### Backend Environment Variables (Lambda)

| Variable | Development | Staging | Production | Source |
|----------|-------------|---------|------------|--------|
| `MODEL_ID` | anthropic.claude-3-5-sonnet-20240620-v1:0 | Same | Same | `amplify/functions/*/resource.ts` |
| `AI_RECORDINGS_S3_BUCKET` | Auto-generated | Auto-generated | Auto-generated | Amplify |
| `AWS_REGION` | us-east-1 | us-east-1 | us-east-1 | Lambda runtime |

### Amplify-Generated Outputs (amplify_outputs.json)

These are **auto-generated** per deployment. Never commit to git.

| Output | Description | Example |
|--------|-------------|---------|
| `auth.user_pool_id` | Cognito User Pool ID | us-east-1_xxxxxx |
| `auth.user_pool_client_id` | Cognito App Client ID | xxxxxxxxxx |
| `auth.identity_pool_id` | Cognito Identity Pool ID | us-east-1:xxxxxxxx-xxxx-xxxx |
| `data.url` | AppSync GraphQL endpoint | https://xxx.appsync-api.us-east-1.amazonaws.com/graphql |
| `data.aws_region` | API region | us-east-1 |

---

## Secret Inventory

### GitHub Actions Secrets

| Secret Name | Purpose | How to Obtain |
|-------------|---------|---------------|
| `AWS_ACCESS_KEY_ID` | AWS API access | IAM Console → Users → Security credentials |
| `AWS_SECRET_ACCESS_KEY` | AWS API access | IAM Console → Users → Security credentials |
| `AWS_REGION` | Deployment region | Set to `us-east-1` |
| `AMPLIFY_APP_ID_DEV` | Dev app identifier | Amplify Console → App ID |
| `AMPLIFY_APP_ID_STAGING` | Staging app identifier | Amplify Console → App ID |
| `AMPLIFY_APP_ID_PROD` | Production app identifier | Amplify Console → App ID |

### AWS Secrets Manager (Future)

Currently not used. When implemented:

| Secret Name | Purpose | Schema |
|-------------|---------|--------|
| `ips-erp/prod/api-keys` | Third-party API keys | `{"twilio": "...", "stripe": "..."}` |
| `ips-erp/prod/oauth` | OAuth credentials | `{"whatsapp_client_id": "...", "whatsapp_client_secret": "..."}` |

---

## Secret Templates

### Script to Create Empty Secrets

```bash
#!/bin/bash
# create-secrets.sh
# Run this in new AWS account to create secret placeholders

# Create secret for API keys (future use)
aws secretsmanager create-secret \
  --name ips-erp/prod/api-keys \
  --description "Third-party API keys for IPS-ERP" \
  --secret-string '{"placeholder": "replace_me"}'

# Create secret for OAuth (future use)
aws secretsmanager create-secret \
  --name ips-erp/prod/oauth \
  --description "OAuth credentials for IPS-ERP" \
  --secret-string '{"placeholder": "replace_me"}'

echo "Secrets created. Update values in AWS Secrets Manager Console."
```

### Environment File Templates

#### `.env.example` (Template)

```bash
# API Configuration
VITE_API_URL=https://api.example.com
VITE_API_TIMEOUT=30000

# Backend Configuration
# Set to 'true' to use real AWS Amplify backend, 'false' for mock data
VITE_USE_REAL_BACKEND=false

# Feature Flags
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_MOCK_DATA=true

# Brand Configuration
VITE_APP_NAME="IPS ERP"
```

#### `.env.development`

```bash
# Development Environment
VITE_API_URL=http://localhost:20002/graphql
VITE_API_TIMEOUT=30000
VITE_USE_REAL_BACKEND=false
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_MOCK_DATA=true
VITE_APP_NAME="IPS ERP [DEV]"
```

#### `.env.staging`

```bash
# Staging Environment
VITE_API_URL=https://staging-api.ips-erp.com
VITE_API_TIMEOUT=30000
VITE_USE_REAL_BACKEND=true
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_MOCK_DATA=false
VITE_APP_NAME="IPS ERP [STAGING]"
```

#### `.env.production`

```bash
# Production Environment
VITE_API_URL=https://api.ips-erp.com
VITE_API_TIMEOUT=30000
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_MOCK_DATA=false
VITE_USE_REAL_BACKEND=true
VITE_APP_NAME="IPS ERP"
```

---

## Parameter Rotation Schedule

| Parameter Type | Rotation Frequency | Rotation Method |
|----------------|-------------------|-----------------|
| AWS Access Keys | 90 days | IAM Console or CLI |
| GitHub Secrets | After any incident | GitHub Settings |
| Cognito App Client | Never (managed by Amplify) | Redeploy |

---

## IAM Permissions Required

### Deployment Role (GitHub Actions)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "amplify:StartJob",
        "amplify:GetJob",
        "amplify:ListApps"
      ],
      "Resource": "*"
    }
  ]
}
```

### Lambda Execution Role (Bedrock Access)

Automatically created by Amplify. Includes:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-3-5-sonnet-20240620-v1:0"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::amplify-*-airec/*"
    }
  ]
}
```

---

## Config File Locations

| File | Purpose | Git Status |
|------|---------|------------|
| `.env.example` | Template for local dev | ✅ Committed |
| `.env.development` | Local dev config | ✅ Committed |
| `.env.staging` | Staging config | ✅ Committed |
| `.env.production` | Production config | ✅ Committed |
| `amplify_outputs.json` | Amplify-generated | ❌ Gitignored |
| `config/environments/*.yaml` | Environment configs | ✅ Committed |

---

## Retrieving Secrets from Deployed Environment

```bash
# Get Cognito User Pool ID
aws cognito-idp list-user-pools --max-results 10 \
  --query "UserPools[?Name.contains(@, 'ips')].Id" --output text

# Get AppSync API URL
aws appsync list-graphql-apis \
  --query "graphqlApis[?name.contains(@, 'ips')].uris.GRAPHQL" --output text

# Get Amplify App ID
aws amplify list-apps \
  --query "apps[?name.contains(@, 'ips')].appId" --output text
```

---

## Emergency: Rotate All Credentials

```bash
#!/bin/bash
# rotate-all-credentials.sh

echo "⚠️  This will rotate all credentials. Continue? (yes/no)"
read confirm
if [ "$confirm" != "yes" ]; then exit 1; fi

# 1. Rotate AWS Access Keys
echo "Rotating AWS access keys..."
aws iam create-access-key --user-name ips-erp-admin
echo "Update GitHub Secrets with new keys, then delete old keys"

# 2. Regenerate Cognito App Client Secret (if needed)
# Note: Amplify manages this automatically

# 3. Notify team
echo "Credentials rotated. Update:"
echo "- GitHub Secrets (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)"
echo "- Local ~/.aws/credentials"
echo "- Any CI/CD pipelines"
```
