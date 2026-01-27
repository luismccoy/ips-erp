#!/bin/bash
#
# validate-deployment.sh
# Validate IPS-ERP deployment health
#
# Usage: ./scripts/validate-deployment.sh [--env production] [--verbose]
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Defaults
ENV="production"
REGION="${AWS_REGION:-us-east-1}"
VERBOSE=false

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --env) ENV="$2"; shift ;;
        --region) REGION="$2"; shift ;;
        --verbose) VERBOSE=true ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  IPS-ERP: Deployment Validation                            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Environment: ${ENV}${NC}"
echo -e "${YELLOW}Region: ${REGION}${NC}"
echo ""

PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

# Helper function for test results
check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASS_COUNT++))
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((FAIL_COUNT++))
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARN_COUNT++))
}

# ─────────────────────────────────────────────────────────────
# Step 1: AWS Connectivity
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[1/8] Checking AWS connectivity...${NC}"

if aws sts get-caller-identity &> /dev/null; then
    check_pass "AWS credentials valid"
else
    check_fail "AWS credentials invalid or expired"
fi

echo ""

# ─────────────────────────────────────────────────────────────
# Step 2: Cognito User Pool
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[2/8] Checking Cognito User Pool...${NC}"

USER_POOL_ID=$(aws cognito-idp list-user-pools --max-results 60 --query "UserPools[?contains(Name, 'amplify')].Id" --output text --region "$REGION" 2>/dev/null | head -1)

if [ -n "$USER_POOL_ID" ]; then
    check_pass "Cognito User Pool found: ${USER_POOL_ID}"
    
    # Check user count
    USER_COUNT=$(aws cognito-idp list-users --user-pool-id "$USER_POOL_ID" --query "length(Users)" --output text --region "$REGION" 2>/dev/null || echo "0")
    echo -e "   Users: ${USER_COUNT}"
    
    # Check groups
    GROUPS=$(aws cognito-idp list-groups --user-pool-id "$USER_POOL_ID" --query "Groups[].GroupName" --output text --region "$REGION" 2>/dev/null)
    if [[ "$GROUPS" == *"Admin"* ]]; then
        check_pass "Admin group exists"
    else
        check_warn "Admin group not found"
    fi
else
    check_fail "Cognito User Pool not found"
fi

echo ""

# ─────────────────────────────────────────────────────────────
# Step 3: AppSync API
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[3/8] Checking AppSync GraphQL API...${NC}"

API_ID=$(aws appsync list-graphql-apis --query "graphqlApis[?contains(name, 'amplify')].apiId" --output text --region "$REGION" 2>/dev/null | head -1)

if [ -n "$API_ID" ]; then
    API_URL=$(aws appsync get-graphql-api --api-id "$API_ID" --query "graphqlApi.uris.GRAPHQL" --output text --region "$REGION" 2>/dev/null)
    check_pass "AppSync API found: ${API_ID}"
    echo -e "   URL: ${API_URL}"
    
    # Test API endpoint (basic connectivity)
    if curl -s -o /dev/null -w "%{http_code}" "$API_URL" 2>/dev/null | grep -q "401\|403"; then
        check_pass "AppSync endpoint responding (auth required)"
    else
        check_warn "AppSync endpoint may not be responding"
    fi
else
    check_fail "AppSync API not found"
fi

echo ""

# ─────────────────────────────────────────────────────────────
# Step 4: DynamoDB Tables
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[4/8] Checking DynamoDB tables...${NC}"

EXPECTED_MODELS=("Tenant" "Patient" "Nurse" "Shift" "Visit" "VitalSign" "BillingRecord" "InventoryItem" "AuditLog" "Notification" "PatientAssessment")

ALL_TABLES=$(aws dynamodb list-tables --output text --region "$REGION" 2>/dev/null)

for MODEL in "${EXPECTED_MODELS[@]}"; do
    if echo "$ALL_TABLES" | grep -q "${MODEL}-"; then
        TABLE_NAME=$(echo "$ALL_TABLES" | tr '\t' '\n' | grep "^${MODEL}-" | head -1)
        
        # Check table status
        STATUS=$(aws dynamodb describe-table --table-name "$TABLE_NAME" --query "Table.TableStatus" --output text --region "$REGION" 2>/dev/null)
        
        if [ "$STATUS" == "ACTIVE" ]; then
            check_pass "${MODEL} table: ${TABLE_NAME} (ACTIVE)"
        else
            check_warn "${MODEL} table: ${TABLE_NAME} (${STATUS})"
        fi
    else
        check_fail "${MODEL} table not found"
    fi
done

echo ""

# ─────────────────────────────────────────────────────────────
# Step 5: Lambda Functions
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[5/8] Checking Lambda functions...${NC}"

EXPECTED_FUNCTIONS=("roster-architect" "rips-validator" "glosa-defender" "list-approved-visit-summaries" "create-visit-draft" "submit-visit" "reject-visit" "approve-visit" "verify-family-access")

for FUNC in "${EXPECTED_FUNCTIONS[@]}"; do
    # Find function (Amplify adds prefixes)
    FUNC_NAME=$(aws lambda list-functions --query "Functions[?contains(FunctionName, '${FUNC}')].FunctionName" --output text --region "$REGION" 2>/dev/null | head -1)
    
    if [ -n "$FUNC_NAME" ]; then
        STATE=$(aws lambda get-function --function-name "$FUNC_NAME" --query "Configuration.State" --output text --region "$REGION" 2>/dev/null)
        
        if [ "$STATE" == "Active" ]; then
            check_pass "Lambda ${FUNC}: ${FUNC_NAME}"
        else
            check_warn "Lambda ${FUNC}: ${STATE}"
        fi
    else
        check_fail "Lambda ${FUNC} not found"
    fi
done

echo ""

# ─────────────────────────────────────────────────────────────
# Step 6: Bedrock Model Access
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[6/8] Checking Bedrock model access...${NC}"

MODEL_ID="anthropic.claude-3-5-sonnet-20240620-v1:0"

BEDROCK_CHECK=$(aws bedrock list-foundation-models --query "modelSummaries[?modelId=='${MODEL_ID}'].modelId" --output text --region "$REGION" 2>/dev/null || echo "")

if [ -n "$BEDROCK_CHECK" ]; then
    check_pass "Bedrock model available: ${MODEL_ID}"
else
    check_warn "Bedrock model may not be accessible: ${MODEL_ID}"
    echo -e "   Enable at: https://console.aws.amazon.com/bedrock/home?region=${REGION}#/modelaccess"
fi

echo ""

# ─────────────────────────────────────────────────────────────
# Step 7: Amplify Hosting
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[7/8] Checking Amplify hosting...${NC}"

APP_ID=$(aws amplify list-apps --query "apps[?contains(name, 'ips') || contains(name, 'erp')].appId" --output text --region "$REGION" 2>/dev/null | head -1)

if [ -n "$APP_ID" ]; then
    APP_URL=$(aws amplify get-app --app-id "$APP_ID" --query "app.defaultDomain" --output text --region "$REGION" 2>/dev/null)
    check_pass "Amplify app found: ${APP_ID}"
    echo -e "   URL: https://main.${APP_URL}"
    
    # Test frontend endpoint
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://main.${APP_URL}" 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" == "200" ]; then
        check_pass "Frontend responding (HTTP 200)"
    elif [ "$HTTP_CODE" == "000" ]; then
        check_warn "Could not reach frontend (network issue?)"
    else
        check_warn "Frontend returned HTTP ${HTTP_CODE}"
    fi
else
    check_warn "Amplify app not found (may be using sandbox)"
fi

echo ""

# ─────────────────────────────────────────────────────────────
# Step 8: Local Environment
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[8/8] Checking local environment...${NC}"

# Check amplify_outputs.json
if [ -f "amplify_outputs.json" ]; then
    check_pass "amplify_outputs.json exists"
else
    check_warn "amplify_outputs.json not found (run sandbox or download from Amplify)"
fi

# Check .env files
for ENV_FILE in ".env.development" ".env.staging" ".env.production"; do
    if [ -f "$ENV_FILE" ]; then
        check_pass "${ENV_FILE} exists"
    else
        check_warn "${ENV_FILE} not found"
    fi
done

echo ""

# ─────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────
echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}                    VALIDATION SUMMARY                         ${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}Passed:  ${PASS_COUNT}${NC}"
echo -e "${YELLOW}Warnings: ${WARN_COUNT}${NC}"
echo -e "${RED}Failed:  ${FAIL_COUNT}${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ] && [ $WARN_COUNT -eq 0 ]; then
    echo -e "${GREEN}🎉 All validations passed! Deployment is healthy.${NC}"
    exit 0
elif [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Deployment functional but has warnings. Review above.${NC}"
    exit 0
else
    echo -e "${RED}❌ Deployment has failures. Review above and fix issues.${NC}"
    exit 1
fi
