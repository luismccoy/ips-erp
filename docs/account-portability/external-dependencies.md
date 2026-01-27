# External Dependencies Inventory

> Complete inventory of all external services, integrations, and third-party dependencies required for IPS-ERP.

---

## Critical Dependencies

### 1. GitHub (Source Control & CI/CD)

| Attribute | Value |
|-----------|-------|
| **Service** | GitHub |
| **Type** | Source control, CI/CD trigger |
| **Owner** | Luis Coy |
| **Repository** | `luiscoy/ips-erp` |
| **Integration** | OAuth app for Amplify Console |
| **Credentials Location** | GitHub account |
| **Re-authorization Steps** | See below |
| **Verification** | `git clone` works, Actions run |

**Re-authorization Steps:**
1. Go to AWS Amplify Console → New App → Host web app
2. Select GitHub as source
3. Click "Authorize AWS Amplify" in GitHub popup
4. Select repository and branch
5. Amplify installs a GitHub App for webhooks

**Verification:**
```bash
# Test clone access
git clone https://github.com/luiscoy/ips-erp.git

# Check GitHub Actions status
gh run list --repo luiscoy/ips-erp
```

---

### 2. Amazon Bedrock (AI Services)

| Attribute | Value |
|-----------|-------|
| **Service** | Amazon Bedrock |
| **Type** | AI/ML inference |
| **Model** | `anthropic.claude-3-5-sonnet-20240620-v1:0` |
| **Region** | us-east-1 |
| **Credentials** | IAM role (automatic via Lambda execution role) |
| **Re-authorization** | Enable model access in new account |
| **Verification** | Call `generateRoster` mutation |

**Re-authorization Steps:**
1. Navigate to Amazon Bedrock Console: https://console.aws.amazon.com/bedrock/home?region=us-east-1#/modelaccess
2. Click "Manage model access"
3. Check "Anthropic" → "Claude 3.5 Sonnet"
4. Click "Request model access"
5. Wait for approval (usually instant for Anthropic)

**Verification:**
```bash
# Test Bedrock access via CLI
aws bedrock-runtime invoke-model \
  --model-id anthropic.claude-3-5-sonnet-20240620-v1:0 \
  --content-type application/json \
  --body '{"anthropic_version": "bedrock-2023-05-31", "max_tokens": 100, "messages": [{"role": "user", "content": "Hello"}]}' \
  /tmp/response.json

cat /tmp/response.json
```

---

### 3. AWS Amplify Hosting

| Attribute | Value |
|-----------|-------|
| **Service** | AWS Amplify Hosting |
| **Type** | Frontend hosting, CI/CD |
| **Region** | us-east-1 |
| **Current URL** | https://main.d2wwgecog8smmr.amplifyapp.com |
| **Credentials** | IAM role (AmplifyServiceRole) |
| **Re-creation** | Create new Amplify app |
| **Verification** | App loads in browser |

**Re-creation Steps:**
1. Go to Amplify Console
2. Create new app (Host web app)
3. Connect GitHub repository
4. Configure build settings (auto-detected from `amplify.yml`)
5. Deploy

**Verification:**
```bash
# List Amplify apps
aws amplify list-apps

# Check app status
aws amplify get-app --app-id APP_ID
```

---

## Non-Critical Dependencies

### 4. npm Registry

| Attribute | Value |
|-----------|-------|
| **Service** | npm (npmjs.com) |
| **Type** | Package registry |
| **Credentials** | None (public packages) |
| **Re-authorization** | None needed |
| **Verification** | `npm install` works |

**Note:** All dependencies are public npm packages. No private registry access required.

---

### 5. Email Service (Cognito SES)

| Attribute | Value |
|-----------|-------|
| **Service** | Amazon SES (via Cognito) |
| **Type** | Transactional email |
| **Used For** | Password reset, verification emails |
| **Configuration** | Automatic via Cognito |
| **Re-authorization** | None (Cognito default email) |
| **Verification** | Test password reset flow |

**Note:** Cognito uses its default email sender. For production, configure custom SES domain.

**Optional SES Setup (for custom domain):**
```bash
# Verify domain
aws ses verify-domain-identity --domain ips-erp.com

# Configure Cognito to use SES
# Must be done via Cognito Console or CDK
```

---

## Future Dependencies (Not Yet Implemented)

### WhatsApp Business API (Planned)

| Attribute | Value |
|-----------|-------|
| **Service** | Meta WhatsApp Business API |
| **Type** | Messaging |
| **Status** | Not implemented |
| **When Needed** | Phase: External Integrations |
| **Re-authorization** | Meta Business verification |

### Twilio (Planned)

| Attribute | Value |
|-----------|-------|
| **Service** | Twilio SMS |
| **Type** | SMS notifications |
| **Status** | Not implemented |
| **When Needed** | Phase: Notifications |
| **Re-authorization** | Twilio account + phone number |

### Stripe (Planned)

| Attribute | Value |
|-----------|-------|
| **Service** | Stripe Payments |
| **Type** | Payment processing |
| **Status** | Not implemented |
| **When Needed** | Phase: SaaS Billing |
| **Re-authorization** | Stripe account + API keys |

---

## Dependency Verification Script

Run this to verify all external dependencies are accessible:

```bash
#!/bin/bash
# verify-dependencies.sh

echo "=== External Dependency Verification ==="

# 1. GitHub
echo -n "GitHub: "
if git ls-remote https://github.com/luiscoy/ips-erp.git HEAD &>/dev/null; then
  echo "✅ OK"
else
  echo "❌ FAIL"
fi

# 2. npm Registry
echo -n "npm: "
if npm ping &>/dev/null; then
  echo "✅ OK"
else
  echo "❌ FAIL"
fi

# 3. AWS Credentials
echo -n "AWS Credentials: "
if aws sts get-caller-identity &>/dev/null; then
  echo "✅ OK"
else
  echo "❌ FAIL"
fi

# 4. Bedrock Access
echo -n "Bedrock Model: "
if aws bedrock list-foundation-models --query "modelSummaries[?modelId=='anthropic.claude-3-5-sonnet-20240620-v1:0']" --output text | grep -q anthropic; then
  echo "✅ OK"
else
  echo "❌ FAIL (enable model access)"
fi

echo "=== Verification Complete ==="
```

---

## Credential Storage Summary

| Dependency | Credential Type | Storage Location |
|------------|-----------------|------------------|
| GitHub | OAuth token | GitHub account |
| AWS | IAM access key | GitHub Secrets / ~/.aws/credentials |
| Bedrock | IAM role | Automatic (Lambda execution role) |
| npm | None | N/A (public packages) |

---

## Emergency Contacts for Dependencies

| Service | Support URL | Notes |
|---------|-------------|-------|
| GitHub | support.github.com | Account/repo issues |
| AWS | aws.amazon.com/support | Account/service issues |
| Anthropic | anthropic.com/support | Bedrock model issues |
