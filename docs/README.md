# IPS-ERP Documentation

**Version:** 1.0.0  
**Last Updated:** 2026-02-09

## Quick Links

### Project Overview
- [IPS_ERP_CONTEXT.md](../IPS_ERP_CONTEXT.md) - High-level project context
- [PROJECT_ROADMAP.md](../PROJECT_ROADMAP.md) - Feature roadmap & milestones
- [PROJECT_SCOPE.md](../PROJECT_SCOPE.md) - Scope definition
- [SYSTEM_MAP.md](../SYSTEM_MAP.md) - Architecture overview

## Documentation Structure

### 📐 01-design/
Design system, UI/UX patterns, and visual guidelines
- [DESIGN_TOKENS.md](01-design/DESIGN_TOKENS.md)
- [ENTERPRISE_DESIGN_PATTERNS.md](01-design/ENTERPRISE_DESIGN_PATTERNS.md)
- [UI_UX_RESEARCH.md](01-design/UI_UX_RESEARCH.md)

### 🔧 02-technical/
Technical specifications, API docs, and integration guides
- [API_DOCUMENTATION.md](02-technical/API_DOCUMENTATION.md)
- [AUTHZ_MODEL.md](02-technical/AUTHZ_MODEL.md)
- [CLINICAL_SCALES_SPEC.md](02-technical/CLINICAL_SCALES_SPEC.md)
- [RIPS_AI_INTEGRATION.md](02-technical/RIPS_AI_INTEGRATION.md)
- [TASK_MANAGER_SPEC.md](02-technical/TASK_MANAGER_SPEC.md)
- [IAM_POLICY.md](02-technical/IAM_POLICY.md)

### 🧪 03-testing/
Test guides, QA reports, and verification procedures
- [QUICK_TEST_GUIDE.md](03-testing/QUICK_TEST_GUIDE.md)
- [DEMO_WORKFLOW.md](03-testing/DEMO_WORKFLOW.md)
- [ADMIN_USER_GUIDE.md](03-testing/ADMIN_USER_GUIDE.md)
- [SECURITY_TEST_CHECKLIST.md](03-testing/SECURITY_TEST_CHECKLIST.md)

### 📊 04-research/
Market research, competitor analysis, and GTM strategy
- [COMPETITOR_ANALYSIS.md](04-research/COMPETITOR_ANALYSIS.md)
- [MARKET_RESEARCH_COLOMBIA.md](04-research/MARKET_RESEARCH_COLOMBIA.md)
- [GTM_EXECUTIVE_SUMMARY.md](04-research/GTM_EXECUTIVE_SUMMARY.md)
- [CONTENT_STRATEGY.md](04-research/CONTENT_STRATEGY.md)

### 🚀 05-deployment/
CI/CD setup, deployment procedures, and verification guides
- [CICD_SETUP.md](05-deployment/CICD_SETUP.md)
- [DEPLOYMENT.md](05-deployment/DEPLOYMENT.md)
- [POST_DEPLOY_VERIFICATION_R5.md](05-deployment/POST_DEPLOY_VERIFICATION_R5.md)

### 🔐 security/
Security audits, route guards, and compliance reports
- [API_SECURITY_AUDIT_C1.md](security/API_SECURITY_AUDIT_C1.md)
- [ROUTE_GUARD_TESTING_GUIDE.md](security/ROUTE_GUARD_TESTING_GUIDE.md)
- [STORAGE_ISOLATION_AUDIT_C1.md](security/STORAGE_ISOLATION_AUDIT_C1.md)

### ☁️ account-portability/
AWS account migration and disaster recovery procedures
- [runbook-account-loss.md](account-portability/runbook-account-loss.md)
- [parameters-and-secrets.md](account-portability/parameters-and-secrets.md)

### 📦 archive/
Historical reports and deprecated documentation
- [old-reports/](archive/old-reports/) - Pre-v1.0 reports
- [reports-2026-02/](archive/reports-2026-02/) - Recent performance & compliance reports

---

## Key Documentation Standards

1. **Update Date**: Keep "Last Updated" current
2. **Version Tags**: Reference version numbers where relevant
3. **Links**: Use relative paths for cross-references
4. **Status Labels**: Mark docs as [ACTIVE], [DEPRECATED], or [DRAFT]
5. **Archive Old**: Move outdated docs to `archive/` with date folder

## Contributing

When adding new documentation:
1. Place in the appropriate category folder
2. Update this README with a link
3. Include a brief description
4. Add version/date metadata
