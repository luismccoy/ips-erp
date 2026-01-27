#!/bin/bash
#
# bootstrap-new-account.sh
# Prepares a brand-new AWS account for IPS-ERP deployment
#
# Usage: ./scripts/bootstrap-new-account.sh [--region us-east-1]
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
REGION="${AWS_REGION:-us-east-1}"
BEDROCK_MODEL="anthropic.claude-3-5-sonnet-20240620-v1:0"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  IPS-ERP: New AWS Account Bootstrap                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --region) REGION="$2"; shift ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

echo -e "${YELLOW}Region: ${REGION}${NC}"
echo ""

# ─────────────────────────────────────────────────────────────
# Step 1: Verify Prerequisites
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[1/7] Checking prerequisites...${NC}"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Install Node.js 18+ first.${NC}"
    exit 1
fi
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js 18+ required. Current: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm -v)${NC}"

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI not found. Install AWS CLI v2 first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ AWS CLI $(aws --version | cut -d' ' -f1)${NC}"

# Check Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git not found.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Git $(git --version | cut -d' ' -f3)${NC}"

echo ""

# ─────────────────────────────────────────────────────────────
# Step 2: Verify AWS Credentials
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[2/7] Verifying AWS credentials...${NC}"

if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured or expired.${NC}"
    echo -e "${YELLOW}Run: aws configure${NC}"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
CALLER_ARN=$(aws sts get-caller-identity --query Arn --output text)
echo -e "${GREEN}✅ AWS Account: ${ACCOUNT_ID}${NC}"
echo -e "${GREEN}✅ Caller: ${CALLER_ARN}${NC}"

echo ""

# ─────────────────────────────────────────────────────────────
# Step 3: Set Region
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[3/7] Setting AWS region...${NC}"

export AWS_DEFAULT_REGION="$REGION"
export AWS_REGION="$REGION"
echo -e "${GREEN}✅ Region set to: ${REGION}${NC}"

echo ""

# ─────────────────────────────────────────────────────────────
# Step 4: Bootstrap CDK
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[4/7] Bootstrapping AWS CDK...${NC}"

# Check if already bootstrapped
BOOTSTRAP_STATUS=$(aws cloudformation describe-stacks --stack-name CDKToolkit --query 'Stacks[0].StackStatus' --output text 2>/dev/null || echo "NOT_FOUND")

if [ "$BOOTSTRAP_STATUS" == "NOT_FOUND" ] || [ "$BOOTSTRAP_STATUS" == "DELETE_COMPLETE" ]; then
    echo -e "${YELLOW}CDK not bootstrapped. Running bootstrap...${NC}"
    npx cdk bootstrap aws://${ACCOUNT_ID}/${REGION}
    echo -e "${GREEN}✅ CDK bootstrapped${NC}"
else
    echo -e "${GREEN}✅ CDK already bootstrapped (status: ${BOOTSTRAP_STATUS})${NC}"
fi

echo ""

# ─────────────────────────────────────────────────────────────
# Step 5: Check Bedrock Model Access
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[5/7] Checking Bedrock model access...${NC}"

# List foundation models to check access
BEDROCK_CHECK=$(aws bedrock list-foundation-models --query "modelSummaries[?modelId=='${BEDROCK_MODEL}'].modelId" --output text 2>/dev/null || echo "ERROR")

if [ "$BEDROCK_CHECK" == "ERROR" ]; then
    echo -e "${YELLOW}⚠️  Could not query Bedrock models. May need permissions.${NC}"
elif [ -z "$BEDROCK_CHECK" ]; then
    echo -e "${YELLOW}⚠️  Bedrock model access not found for: ${BEDROCK_MODEL}${NC}"
    echo -e "${YELLOW}   ACTION REQUIRED: Enable model access in Bedrock console${NC}"
    echo -e "${YELLOW}   https://console.aws.amazon.com/bedrock/home?region=${REGION}#/modelaccess${NC}"
else
    echo -e "${GREEN}✅ Bedrock model available: ${BEDROCK_MODEL}${NC}"
fi

echo ""

# ─────────────────────────────────────────────────────────────
# Step 6: Install Project Dependencies
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[6/7] Installing project dependencies...${NC}"

if [ -f "package.json" ]; then
    npm install --legacy-peer-deps
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  No package.json found. Skipping npm install.${NC}"
fi

echo ""

# ─────────────────────────────────────────────────────────────
# Step 7: Create Output Summary
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[7/7] Creating bootstrap summary...${NC}"

SUMMARY_FILE="bootstrap-summary-$(date +%Y%m%d-%H%M%S).txt"
cat > "$SUMMARY_FILE" << EOF
IPS-ERP Bootstrap Summary
=========================
Date: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
AWS Account: ${ACCOUNT_ID}
Region: ${REGION}
CDK Status: Bootstrapped
Bedrock Model: ${BEDROCK_MODEL}

Next Steps:
1. If Bedrock model access is not enabled:
   - Go to: https://console.aws.amazon.com/bedrock/home?region=${REGION}#/modelaccess
   - Enable: Anthropic → Claude 3.5 Sonnet

2. Deploy the application:
   - For development: npx ampx sandbox
   - For production: Use Amplify Console or ./scripts/deploy-all.sh

3. Create initial admin user after deployment

4. Update GitHub Secrets:
   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY
   - AWS_REGION=${REGION}
   - AMPLIFY_APP_ID_PROD (after Amplify app creation)
EOF

echo -e "${GREEN}✅ Summary saved to: ${SUMMARY_FILE}${NC}"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Bootstrap Complete!                                        ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Enable Bedrock model access (if not already done)"
echo -e "  2. Run: ${BLUE}npx ampx sandbox${NC} (for dev) or deploy via Amplify Console"
echo -e "  3. See: ${BLUE}docs/account-portability/README.md${NC} for full deployment guide"
echo ""
