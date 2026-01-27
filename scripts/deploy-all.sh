#!/bin/bash
#
# deploy-all.sh
# Deploy IPS-ERP to specified environment
#
# Usage: ./scripts/deploy-all.sh [dev|staging|prod]
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Default environment
ENV="${1:-dev}"
REGION="${AWS_REGION:-us-east-1}"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  IPS-ERP: Full Deployment                                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Environment: ${ENV}${NC}"
echo -e "${YELLOW}Region: ${REGION}${NC}"
echo ""

# Validate environment
case "$ENV" in
    dev|development)
        ENV_NAME="development"
        BRANCH="develop"
        ;;
    staging)
        ENV_NAME="staging"
        BRANCH="staging"
        ;;
    prod|production)
        ENV_NAME="production"
        BRANCH="main"
        ;;
    *)
        echo -e "${RED}❌ Unknown environment: ${ENV}${NC}"
        echo -e "${YELLOW}Usage: ./scripts/deploy-all.sh [dev|staging|prod]${NC}"
        exit 1
        ;;
esac

# ─────────────────────────────────────────────────────────────
# Step 1: Verify Prerequisites
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[1/6] Verifying prerequisites...${NC}"

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured or expired.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ AWS credentials valid${NC}"

# Check we're in project root
if [ ! -f "amplify/backend.ts" ]; then
    echo -e "${RED}❌ Not in project root. Run from ips-erp directory.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Project root detected${NC}"

# Check node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install --legacy-peer-deps
fi
echo -e "${GREEN}✅ Dependencies installed${NC}"

echo ""

# ─────────────────────────────────────────────────────────────
# Step 2: Run Linting and Type Checks
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[2/6] Running pre-deployment checks...${NC}"

echo -e "${YELLOW}Running TypeScript check...${NC}"
npx tsc --noEmit || {
    echo -e "${RED}❌ TypeScript errors found. Fix before deploying.${NC}"
    exit 1
}
echo -e "${GREEN}✅ TypeScript check passed${NC}"

echo -e "${YELLOW}Running ESLint...${NC}"
npm run lint || {
    echo -e "${YELLOW}⚠️  Lint warnings found. Continuing...${NC}"
}
echo -e "${GREEN}✅ Lint check passed${NC}"

echo ""

# ─────────────────────────────────────────────────────────────
# Step 3: Build Frontend
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[3/6] Building frontend...${NC}"

npm run build || {
    echo -e "${RED}❌ Build failed.${NC}"
    exit 1
}
echo -e "${GREEN}✅ Frontend build successful${NC}"

echo ""

# ─────────────────────────────────────────────────────────────
# Step 4: Deploy Backend
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[4/6] Deploying backend...${NC}"

if [ "$ENV_NAME" == "development" ]; then
    # Use sandbox for development
    echo -e "${YELLOW}Starting Amplify sandbox deployment...${NC}"
    npx ampx sandbox --once || {
        echo -e "${RED}❌ Backend deployment failed.${NC}"
        exit 1
    }
else
    # For staging/production, use Amplify Console pipeline
    echo -e "${YELLOW}Triggering Amplify Console deployment...${NC}"
    
    # Get Amplify App ID from environment variable or prompt
    if [ "$ENV_NAME" == "staging" ]; then
        APP_ID="${AMPLIFY_APP_ID_STAGING}"
    else
        APP_ID="${AMPLIFY_APP_ID_PROD}"
    fi
    
    if [ -z "$APP_ID" ]; then
        echo -e "${YELLOW}Enter Amplify App ID for ${ENV_NAME}:${NC}"
        read APP_ID
    fi
    
    aws amplify start-job \
        --app-id "$APP_ID" \
        --branch-name "$BRANCH" \
        --job-type RELEASE \
        --region "$REGION" || {
        echo -e "${RED}❌ Failed to trigger Amplify deployment.${NC}"
        exit 1
    }
    
    echo -e "${YELLOW}Deployment triggered. Monitor in Amplify Console.${NC}"
fi

echo -e "${GREEN}✅ Backend deployment initiated${NC}"

echo ""

# ─────────────────────────────────────────────────────────────
# Step 5: Wait for Deployment
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[5/6] Waiting for deployment to stabilize...${NC}"

if [ "$ENV_NAME" == "development" ]; then
    # Sandbox creates amplify_outputs.json synchronously
    echo -e "${GREEN}✅ Sandbox deployment complete${NC}"
else
    # For Amplify Console, wait for job to complete
    echo -e "${YELLOW}Waiting for Amplify job to complete (this may take 10-15 minutes)...${NC}"
    
    # Poll for job status
    MAX_WAIT=1800  # 30 minutes
    WAIT_INTERVAL=30
    WAITED=0
    
    while [ $WAITED -lt $MAX_WAIT ]; do
        JOB_STATUS=$(aws amplify list-jobs --app-id "$APP_ID" --branch-name "$BRANCH" --max-results 1 --query 'jobSummaries[0].status' --output text 2>/dev/null || echo "UNKNOWN")
        
        if [ "$JOB_STATUS" == "SUCCEED" ]; then
            echo -e "${GREEN}✅ Amplify deployment succeeded${NC}"
            break
        elif [ "$JOB_STATUS" == "FAILED" ]; then
            echo -e "${RED}❌ Amplify deployment failed. Check console for details.${NC}"
            exit 1
        elif [ "$JOB_STATUS" == "CANCELLED" ]; then
            echo -e "${RED}❌ Amplify deployment was cancelled.${NC}"
            exit 1
        fi
        
        echo -e "${YELLOW}Status: ${JOB_STATUS}. Waiting...${NC}"
        sleep $WAIT_INTERVAL
        WAITED=$((WAITED + WAIT_INTERVAL))
    done
    
    if [ $WAITED -ge $MAX_WAIT ]; then
        echo -e "${RED}❌ Deployment timed out. Check Amplify Console.${NC}"
        exit 1
    fi
fi

echo ""

# ─────────────────────────────────────────────────────────────
# Step 6: Run Validation
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[6/6] Running deployment validation...${NC}"

./scripts/validate-deployment.sh || {
    echo -e "${YELLOW}⚠️  Some validations failed. Review output above.${NC}"
}

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Deployment Complete!                                       ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Environment: ${ENV_NAME}${NC}"
echo -e "${YELLOW}Branch: ${BRANCH}${NC}"
echo ""

if [ "$ENV_NAME" == "development" ] && [ -f "amplify_outputs.json" ]; then
    API_URL=$(cat amplify_outputs.json | grep -o '"url": "[^"]*"' | head -1 | cut -d'"' -f4)
    echo -e "${YELLOW}API URL: ${API_URL}${NC}"
fi
