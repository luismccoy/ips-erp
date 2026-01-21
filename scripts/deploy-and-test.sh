#!/bin/bash

# Deploy and Test Phase 2 Backend
# One-command deployment and testing

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}IPS ERP - Deploy & Test Phase 2${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Set AWS region
export AWS_DEFAULT_REGION=us-east-1
export AWS_REGION=us-east-1

# Check AWS credentials
echo -e "${YELLOW}Checking AWS credentials...${NC}"
if ! aws sts get-caller-identity &>/dev/null; then
    echo -e "${RED}❌ AWS credentials expired${NC}"
    echo -e "${YELLOW}Run: awsc${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Credentials valid (Region: $AWS_REGION)${NC}\n"

# Check if we're in the right directory
if [ ! -f "amplify/backend.ts" ]; then
    echo -e "${RED}❌ Not in project root. Run from ips-erp directory${NC}"
    exit 1
fi

# Deploy backend using sandbox
echo -e "${YELLOW}Starting Amplify sandbox...${NC}"
echo -e "${BLUE}This will deploy backend to AWS (5-10 minutes)${NC}\n"

# Start sandbox in background and capture output
if npx ampx sandbox --once; then
    echo -e "\n${GREEN}✅ Backend deployed successfully${NC}\n"
else
    echo -e "\n${RED}❌ Deployment failed${NC}"
    exit 1
fi

# Wait for deployment to stabilize
echo -e "${YELLOW}Waiting 30 seconds for deployment to stabilize...${NC}"
sleep 30

# Run tests
echo -e "\n${YELLOW}Running automated tests...${NC}\n"
./scripts/test-phase2.sh

echo -e "\n${GREEN}🎉 Deploy and test complete!${NC}"
