#!/bin/bash

# Phase 2 Backend Automated Testing Script
# Tests all 7 data models with multi-tenant isolation

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}IPS ERP Phase 2 Backend Testing${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check amplify_outputs.json exists
if [ ! -f "amplify_outputs.json" ]; then
    echo -e "${RED}❌ amplify_outputs.json not found${NC}"
    echo -e "${YELLOW}Run: npx ampx sandbox --once${NC}"
    exit 1
fi

# Extract GraphQL endpoint
GRAPHQL_ENDPOINT=$(jq -r '.data.url' amplify_outputs.json)
echo -e "${GREEN}✅ GraphQL endpoint: $GRAPHQL_ENDPOINT${NC}\n"

# Note: Testing with IAM auth (sandbox mode)
echo -e "${YELLOW}Note: Using IAM authentication (sandbox mode)${NC}"
echo -e "${YELLOW}For production, you'll need Cognito user tokens${NC}\n"

# Function to execute GraphQL with AWS signature
execute_graphql() {
    local query="$1"
    local test_name="$2"
    
    echo -e "${BLUE}Test: $test_name${NC}"
    
    # Use AWS CLI to sign the request
    local response=$(aws appsync-api post \
        --api-id "$(echo $GRAPHQL_ENDPOINT | grep -oP '(?<=https://)[^.]+' || echo '')" \
        --query "$query" \
        --region us-east-1 2>&1 || echo '{"errors":[{"message":"Command failed"}]}')
    
    if echo "$response" | grep -q "errors"; then
        echo -e "${RED}❌ FAILED${NC}"
        echo "$response" | head -5
        ((TESTS_FAILED++))
        return 1
    else
        echo -e "${GREEN}✅ PASSED${NC}"
        ((TESTS_PASSED++))
        return 0
    fi
}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Schema Validation Tests${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Test 1: Verify Tenant model exists
echo -e "${YELLOW}Test 1: Tenant Model${NC}"
if jq -e '.data.model_introspection.models.Tenant' amplify_outputs.json > /dev/null; then
    echo -e "${GREEN}✅ PASSED: Tenant model exists${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAILED: Tenant model missing${NC}"
    ((TESTS_FAILED++))
fi

# Test 2: Verify Patient model with nested types
echo -e "\n${YELLOW}Test 2: Patient Model with Nested Types${NC}"
if jq -e '.data.model_introspection.models.Patient.fields.medications' amplify_outputs.json > /dev/null && \
   jq -e '.data.model_introspection.models.Patient.fields.tasks' amplify_outputs.json > /dev/null; then
    echo -e "${GREEN}✅ PASSED: Patient has medications and tasks${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAILED: Patient nested types missing${NC}"
    ((TESTS_FAILED++))
fi

# Test 3: Verify Nurse model
echo -e "\n${YELLOW}Test 3: Nurse Model${NC}"
if jq -e '.data.model_introspection.models.Nurse.fields.skills' amplify_outputs.json > /dev/null; then
    echo -e "${GREEN}✅ PASSED: Nurse model with skills array${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAILED: Nurse model incomplete${NC}"
    ((TESTS_FAILED++))
fi

# Test 4: Verify Shift model with relationships
echo -e "\n${YELLOW}Test 4: Shift Model with Relationships${NC}"
if jq -e '.data.model_introspection.models.Shift.fields.nurse' amplify_outputs.json > /dev/null && \
   jq -e '.data.model_introspection.models.Shift.fields.patient' amplify_outputs.json > /dev/null; then
    echo -e "${GREEN}✅ PASSED: Shift has nurse and patient relationships${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAILED: Shift relationships missing${NC}"
    ((TESTS_FAILED++))
fi

# Test 5: Verify InventoryItem model
echo -e "\n${YELLOW}Test 5: InventoryItem Model${NC}"
if jq -e '.data.model_introspection.models.InventoryItem' amplify_outputs.json > /dev/null; then
    echo -e "${GREEN}✅ PASSED: InventoryItem model exists${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAILED: InventoryItem model missing${NC}"
    ((TESTS_FAILED++))
fi

# Test 6: Verify VitalSigns model
echo -e "\n${YELLOW}Test 6: VitalSigns Model${NC}"
if jq -e '.data.model_introspection.models.VitalSigns.fields.date' amplify_outputs.json > /dev/null; then
    echo -e "${GREEN}✅ PASSED: VitalSigns model with date field${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAILED: VitalSigns model incomplete${NC}"
    ((TESTS_FAILED++))
fi

# Test 7: Verify BillingRecord model
echo -e "\n${YELLOW}Test 7: BillingRecord Model${NC}"
if jq -e '.data.model_introspection.models.BillingRecord.fields.totalAmount' amplify_outputs.json > /dev/null && \
   jq -e '.data.model_introspection.models.BillingRecord.fields.ripsGenerated' amplify_outputs.json > /dev/null; then
    echo -e "${GREEN}✅ PASSED: BillingRecord with totalAmount and ripsGenerated${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAILED: BillingRecord fields missing${NC}"
    ((TESTS_FAILED++))
fi

# Test 8: Verify Multi-Tenant Authorization
echo -e "\n${YELLOW}Test 8: Multi-Tenant Authorization${NC}"
PATIENT_AUTH=$(jq -r '.data.model_introspection.models.Patient.attributes[] | select(.type=="auth") | .properties.rules[0].identityClaim' amplify_outputs.json)
if [ "$PATIENT_AUTH" = "custom:tenantId" ]; then
    echo -e "${GREEN}✅ PASSED: Multi-tenant auth configured${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAILED: Multi-tenant auth not configured${NC}"
    ((TESTS_FAILED++))
fi

# Test 9: Verify Enums
echo -e "\n${YELLOW}Test 9: Enum Types${NC}"
if jq -e '.data.model_introspection.enums.ShiftStatus' amplify_outputs.json > /dev/null && \
   jq -e '.data.model_introspection.enums.InventoryStatus' amplify_outputs.json > /dev/null && \
   jq -e '.data.model_introspection.enums.BillingStatus' amplify_outputs.json > /dev/null; then
    echo -e "${GREEN}✅ PASSED: All enum types exist${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAILED: Some enum types missing${NC}"
    ((TESTS_FAILED++))
fi

# Test 10: Verify Custom Types
echo -e "\n${YELLOW}Test 10: Custom Types${NC}"
if jq -e '.data.model_introspection.nonModels.Medication' amplify_outputs.json > /dev/null && \
   jq -e '.data.model_introspection.nonModels.Task' amplify_outputs.json > /dev/null; then
    echo -e "${GREEN}✅ PASSED: Custom types (Medication, Task) exist${NC}"
    ((TESTS_PASSED++))
else
    echo -e "${RED}❌ FAILED: Custom types missing${NC}"
    ((TESTS_FAILED++))
fi

# Summary
TESTS_TOTAL=$((TESTS_PASSED + TESTS_FAILED))
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Total Tests: $TESTS_TOTAL"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All schema validation tests passed!${NC}"
    echo -e "\n${YELLOW}Next Steps:${NC}"
    echo -e "1. Update docs/API_DOCUMENTATION.md"
    echo -e "2. Commit changes"
    echo -e "3. Move to Phase 3"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed${NC}"
    exit 1
fi
