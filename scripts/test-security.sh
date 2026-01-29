#!/bin/bash
# Security Test Automation Script
# Runs security-critical tests for P0 incident response

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       IPS ERP - SECURITY TEST SUITE (P0)                ║${NC}"
echo -e "${BLUE}║       Authorization & Logout Validation                  ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

cd "$PROJECT_DIR"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠ node_modules not found. Installing dependencies...${NC}"
    npm install
fi

# Function to run tests with specific pattern
run_test_suite() {
    local test_name=$1
    local test_pattern=$2
    
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Running: ${test_name}${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
    
    if npm run test:run -- "$test_pattern"; then
        echo -e "\n${GREEN}✓ ${test_name} - PASSED${NC}"
        return 0
    else
        echo -e "\n${RED}✗ ${test_name} - FAILED${NC}"
        return 1
    fi
}

# Track test results
FAILED_TESTS=()

# Run authentication tests
if ! run_test_suite "Authentication & Logout Tests" "src/hooks/useAuth.test.ts"; then
    FAILED_TESTS+=("Authentication & Logout")
fi

# Run route guard tests
if ! run_test_suite "Route Guard & Authorization Tests" "src/App.test.tsx"; then
    FAILED_TESTS+=("Route Guards")
fi

# Summary
echo -e "\n\n${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    TEST SUMMARY                          ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}\n"

if [ ${#FAILED_TESTS[@]} -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✓ ALL SECURITY TESTS PASSED${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "\n${GREEN}✓ Authentication tests: PASS${NC}"
    echo -e "${GREEN}✓ Authorization tests: PASS${NC}"
    echo -e "${GREEN}✓ Route guard tests: PASS${NC}"
    echo -e "\n${BLUE}Next Steps:${NC}"
    echo -e "  1. Review manual test checklist: ${BLUE}docs/SECURITY_TEST_CHECKLIST.md${NC}"
    echo -e "  2. Run manual tests in demo mode"
    echo -e "  3. Run manual tests with real backend"
    echo -e "  4. Sign off on deployment readiness"
    echo ""
    exit 0
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}✗ SECURITY TESTS FAILED${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "\n${RED}Failed test suites:${NC}"
    for test in "${FAILED_TESTS[@]}"; do
        echo -e "  ${RED}✗ $test${NC}"
    done
    echo -e "\n${YELLOW}⚠ DO NOT DEPLOY until all security tests pass!${NC}"
    echo -e "\n${BLUE}Troubleshooting:${NC}"
    echo -e "  1. Review test output above for specific failures"
    echo -e "  2. Check console for error messages"
    echo -e "  3. Run tests individually: ${BLUE}npm run test -- <test-file>${NC}"
    echo -e "  4. Update code to fix security issues"
    echo -e "  5. Re-run this script"
    echo ""
    exit 1
fi
