#!/bin/bash

# Set up environment
cd /home/ubuntu/projects/ERP

# Ensure Playwright is installed
npm install @playwright/test

# Run Playwright tests with JSON report
npx playwright test demo_mode_audit.js --reporter=json > demo_mode_test_results.json

# Generate markdown report
node -e "
const fs = require('fs');
const results = JSON.parse(fs.readFileSync('demo_mode_test_results.json', 'utf8'));

const report = \`# Demo Mode Comprehensive Audit Report

## Overview
- **Date:** \${new Date().toISOString()}
- **URL:** https://main.d2wwgecog8smmr.amplifyapp.com
- **Test Status:** \${results.success ? 'PASSED' : 'FAILED'}

## Test Details
\${results.suites.map(suite => 
  suite.specs.map(spec => \`
### \${spec.title}
- **Result:** \${spec.tests[0].results[0].status}
\${spec.tests[0].results[0].status === 'failed' 
  ? \`- **Error:** \${spec.tests[0].results[0].error.message}\` 
  : ''}
\`).join('\n')
).join('\n')}

## Conclusion
Comprehensive audit of demo portals completed. All critical checks performed.
\`;

fs.writeFileSync('/home/ubuntu/projects/ERP/DEMO_MODE_AUDIT_REPORT.md', report);
"