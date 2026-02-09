# IPS-ERP Documentation

**Production Status**: v1.0.0 Live | https://main.d2wwgecog8smmr.amplifyapp.com

---

## 🎯 Start Here

### Essential Documents
1. **[PROJECT_SCOPE.md](../PROJECT_SCOPE.md)** - Project scope and requirements
2. **[SYSTEM_MAP.md](../SYSTEM_MAP.md)** - Complete architecture reference
3. **[IPS_ERP_CONTEXT.md](../IPS_ERP_CONTEXT.md)** - Business context and Colombian regulations

### Current Production Status
- **[SECURITY_AUDIT_REPORT.md](../SECURITY_AUDIT_REPORT.md)** - Latest security audit (78/100)
- **[PERFORMANCE_REPORT.md](../PERFORMANCE_REPORT.md)** - Performance benchmarks (91.8/100)
- **[RIPS_COMPLIANCE_REPORT.md](../RIPS_COMPLIANCE_REPORT.md)** - Colombian billing compliance (72/100)

---

## 📁 Documentation Structure

### 01-design/
Design system, tokens, UX research, enterprise patterns

**Key Files**:
- `DESIGN_TOKENS.md` - Colors, typography, spacing
- `ENTERPRISE_DESIGN_PATTERNS.md` - Reusable UI patterns
- `UI_UX_RESEARCH.md` - User research findings

### 02-technical/
API specs, authorization, integrations, clinical features

**Key Files**:
- `API_DOCUMENTATION.md` - GraphQL API reference
- `AUTHZ_MODEL.md` - Multi-tenant authorization
- `CLINICAL_SCALES_SPEC.md` - Clinical assessment tools
- `RIPS_AI_INTEGRATION.md` - Bedrock AI integration

### 03-testing/
Test guides, security checklists, QA reports

**Key Files**:
- `QUICK_TEST_GUIDE.md` - Quick validation checklist
- `SECURITY_TEST_CHECKLIST.md` - Security validation
- `TEST_ENGINEER_REPORT.md` - QA findings

### 04-research/
Market analysis, competitor research, GTM strategy

**Key Files**:
- `MARKET_RESEARCH_COLOMBIA.md` - Colombian healthcare market
- `COMPETITOR_ANALYSIS.md` - Competitive landscape
- `GTM_EXECUTIVE_SUMMARY.md` - Go-to-market strategy

### 05-deployment/
CI/CD, deployment logs, verification protocols

**Key Files**:
- `CICD_SETUP.md` - GitHub Actions pipeline
- `DEPLOYMENT.md` - Deployment procedures
- `POST_DEPLOY_VERIFICATION_R5.md` - Production verification

---

## 🚀 Quick Actions

### For Developers
- **API Reference**: `02-technical/API_DOCUMENTATION.md`
- **Auth Model**: `02-technical/AUTHZ_MODEL.md`
- **Test Locally**: `03-testing/QUICK_TEST_GUIDE.md`

### For Product/Business
- **Project Scope**: `../PROJECT_SCOPE.md`
- **Roadmap**: `../PROJECT_ROADMAP.md`
- **Market Research**: `04-research/`

### For DevOps
- **System Architecture**: `../SYSTEM_MAP.md`
- **Deployment Guide**: `05-deployment/DEPLOYMENT.md`
- **Security Audit**: `../SECURITY_AUDIT_REPORT.md`

---

## 🔄 Recent Updates (2026-02-09)

- ✅ Security audit completed (2 critical vulnerabilities identified)
- ✅ Performance benchmarks added (91.8/100 score)
- ✅ RIPS compliance audit (production blocker found)
- ⏳ P0 fixes in progress (tenant isolation, EPS providers, file upload, PDF generation)

---

**Last Updated**: 2026-02-09  
**Backup**: ~/ERP-docs-backup-2026-02-09.tar.gz
