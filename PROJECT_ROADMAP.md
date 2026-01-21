# IPS ERP - Project Vision & Development Roadmap

**Last Updated:** 2026-01-21

---

## 🎯 Ultimate Goal

Build a production-ready, multi-tenant ERP system for Colombian Home Care IPS (Healthcare Institutions) with:

- **Seamless team collaboration** via Git-based workflow
- **AWS-powered backend** developed using AWS KIRO IDE
- **Automated CI/CD pipeline** where Git commits trigger deployments
- **Multi-environment setup** (dev, staging, production) with proper testing gates
- **Scalable architecture** serving 10-50+ healthcare organizations from a single codebase

---

## 📋 Current State (What We Have)

### ✅ Completed Frontend (100%)

**Technology Stack:**
- React 18 + TypeScript + Vite
- TailwindCSS for styling
- AWS Amplify SDK for auth/data integration
- Zero build errors, zero lint warnings
- Production-ready codebase

**Features Implemented:**
1. **Landing Page** - Marketing page with demo walkthrough
2. **Authentication Flow** - Login + Demo mode + Role-based access
3. **Admin Portal** - Complete dashboard with:
   - AI-powered nurse roster automation (Roster Architect)
   - Inventory management with stock alerts
   - Patient management
   - Staff management
   - RIPS compliance reporting
4. **Nurse Portal** - Mobile-optimized shift management
5. **Family Portal** - Patient status viewer for relatives
6. **UI Component Library** - Reusable components (Button, Card, Modal, Input, etc.)

**Code Quality:**
- Strict TypeScript (no `any` types)
- CSS Modules for style isolation
- Custom React hooks (useAuth, useApiCall, useForm, useAnalytics)
- Lazy loading for performance
- Error boundary for graceful failures

### ✅ Completed Backend Scaffolding (30%)

**AWS Amplify Gen 2 Structure:**
```
amplify/
├── auth/resource.ts          # Cognito user pools (configured)
├── data/resource.ts          # GraphQL API schema (scaffolded)
├── backend.ts               # Main backend definition
└── functions/
    └── roster-architect/    # AI-powered rostering Lambda
        ├── handler.ts
        └── resource.ts
```

**What's Configured:**
- AWS Cognito authentication structure
- GraphQL API schema definitions
- Lambda function for AI roster generation (using Claude API)
- Multi-tenant data model (Tenant → Patients → Shifts → Nurses)

**What's NOT Connected:**
- Frontend currently uses mock data (see `src/mock-client.ts`)
- Real Amplify backend not deployed yet
- Database tables not created in DynamoDB
- Lambda functions not deployed to AWS

### ✅ Git & CI/CD Infrastructure (Ready)

**Configuration Files:**
- `amplify.yml` - AWS Amplify build configuration
- `.github/workflows/deploy.yml` - GitHub Actions for deployment
- `.github/workflows/test.yml` - Automated testing on PRs
- Environment templates (`.env.development`, `.env.staging`, `.env.production`)

**Branch Strategy:**
```
main (production)     ← Requires approval
  ↑
staging (UAT)         ← Auto-deploy for testing
  ↑
develop (development) ← Auto-deploy for feature testing
  ↑
feature/* branches    ← Active development
```

**Documentation:**
- `docs/CICD_SETUP.md` - Complete setup guide
- `docs/DEPLOYMENT.md` - Deployment workflow
- `docs/IAM_POLICY.md` - AWS permissions

---

## 🚀 Development Workflow

### For You (Backend Development with AWS KIRO IDE)

1. **Clone the repository** (after Git initialization)
   ```bash
   git clone <repo-url>
   cd ips-erp
   ```

2. **Work on backend in KIRO IDE**
   - Open `amplify/` folder in AWS KIRO IDE
   - Edit `data/resource.ts` for schema changes
   - Add new Lambda functions in `functions/`
   - Test locally with Amplify sandbox

3. **Push changes to trigger deployment**
   ```bash
   git checkout develop
   # Make backend changes
   git add amplify/
   git commit -m "feat(backend): add patient vitals tracking"
   git push origin develop
   ```
   → Auto-deploys backend + frontend to dev environment

4. **Promote to staging when ready**
   ```bash
   git checkout staging
   git merge develop
   git push origin staging
   ```
   → Auto-deploys to staging for UAT

### For Frontend Developers

1. **Create feature branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/inventory-dashboard-improvements
   ```

2. **Develop with mock data**
   - Frontend uses `src/mock-client.ts` for development
   - No AWS connection needed during development
   - Run `npm run dev` for local testing

3. **Submit PR to develop**
   ```bash
   git push origin feature/inventory-dashboard-improvements
   # Create PR via GitHub
   ```
   → Automated tests run, then merge triggers dev deployment

---

## 🏗️ What We Need to Build Next

### Phase 1: Connect Real Backend (Priority: HIGH)

**Goal:** Replace mock data with real AWS Amplify backend

**Tasks:**
1. **Deploy Amplify Backend**
   ```bash
   npx ampx sandbox  # Test locally first
   npx ampx deploy   # Deploy to AWS
   ```

2. **Connect Frontend to Real Data**
   - Replace `src/mock-client.ts` with real Amplify client
   - Update `src/amplify-utils.ts` to use deployed backend
   - Configure environment variables with real API endpoints

3. **Implement Multi-Tenant Authentication**
   - Configure Cognito user pools with custom attributes
   - Add `tenantId` to user claims
   - Implement tenant isolation in GraphQL resolvers

**Files to Modify:**
- `amplify/data/resource.ts` - Add tenant isolation rules
- `src/amplify-utils.ts` - Connect to real backend
- `src/hooks/useAuth.ts` - Use real Cognito authentication

---

### Phase 2: Build Backend Business Logic (Priority: HIGH)

**1. Patient Management API**
- CRUD operations for patients
- Link patients to tenants
- Store medical history and vitals
- File uploads for patient documents (S3 integration)

**2. Nurse Rostering System**
- Complex shift assignment logic
- GPS-based nurse routing
- Skill-based matching algorithm
- Integration with Claude API for AI recommendations

**3. Inventory Management**
- Stock tracking with alerts
- Expiry date monitoring
- Automated reorder triggers
- Integration with suppliers (future)

**4. RIPS Compliance Engine**
- Colombian health regulation validation
- Automated report generation
- Export to government-required formats (XML/PDF)

**Backend Files to Create:**
```
amplify/functions/
├── patient-api/               # Patient CRUD operations
├── roster-optimizer/          # Enhanced rostering logic (already started)
├── inventory-service/         # Inventory management
├── rips-validator/           # Colombian compliance validation
└── notification-service/     # Email/SMS notifications
```

---

### Phase 3: Advanced Features (Priority: MEDIUM)

**1. Real-Time Updates**
- WebSocket integration via AWS AppSync subscriptions
- Live dashboard updates for admin
- Nurse shift notifications

**2. Mobile App (React Native)**
- Dedicated nurse mobile app
- Offline mode support
- GPS tracking integration

**3. Reporting & Analytics**
- QuickSight integration for business intelligence
- Custom report builder
- Export to Excel/PDF

**4. External Integrations**
- ADRES (Colombian health authority) API
- EPS (insurance companies) connectors
- Hospital EHR systems (HL7/FHIR)

---

### Phase 4: Production Hardening (Priority: MEDIUM)

**1. Security**
- Penetration testing
- HIPAA compliance review (if applicable)
- Data encryption at rest and in transit
- Audit logging with CloudWatch

**2. Performance**
- Implement caching with CloudFront
- Optimize database queries
- Lambda cold start optimization
- Database connection pooling

**3. Monitoring**
- CloudWatch dashboards
- Error tracking (Sentry integration)
- Performance monitoring
- User analytics

**4. Disaster Recovery**
- Automated backups
- Multi-region failover
- Incident response plan

---

## 🔧 Technology Stack Deep Dive

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite (fast builds, HMR)
- **Styling:** TailwindCSS + CSS Modules
- **State Management:** React Context + Custom Hooks
- **Routing:** React Router DOM v7
- **Icons:** Lucide React

### Backend (AWS Amplify Gen 2)
- **Authentication:** AWS Cognito (multi-tenant)
- **API:** AWS AppSync (GraphQL) or API Gateway (REST)
- **Database:** Amazon DynamoDB (NoSQL)
- **Functions:** AWS Lambda (Node.js 18)
- **Storage:** Amazon S3 (documents, images)
- **AI/ML:** Bedrock (Claude 3.5 Sonnet for AI features)

### DevOps
- **Version Control:** Git + GitHub
- **CI/CD:** AWS Amplify Hosting + GitHub Actions
- **Environments:** Development, Staging, Production
- **Monitoring:** CloudWatch + X-Ray
- **Logging:** CloudWatch Logs

---

## 👥 Team Collaboration Guidelines

### Branch Naming Convention
```
feature/[description]     → New features
bugfix/[description]      → Bug fixes
hotfix/[description]      → Urgent production fixes
backend/[description]     → Backend-specific changes
docs/[description]        → Documentation updates
```

### Commit Message Format
```
type(scope): description

types: feat, fix, docs, style, refactor, test, chore
scope: frontend, backend, auth, api, database, ci
```

**Examples:**
```
feat(backend): add patient vitals tracking API
fix(frontend): resolve authentication timeout issue
docs(deployment): update CI/CD setup guide
```

### Code Review Process
1. All changes require PR to develop
2. At least 1 approval required
3. All tests must pass
4. No merge conflicts
5. Squash commits before merging

---

## 📊 Success Metrics

### Phase 1 (Backend Connection)
- [ ] Real authentication working
- [ ] All mock data replaced with live data
- [ ] Multi-tenant isolation verified
- [ ] Dev environment fully functional

### Phase 2 (Feature Completion)
- [ ] All core APIs implemented
- [ ] AI rostering working in production
- [ ] RIPS compliance validator functional
- [ ] Mobile-responsive across all devices

### Phase 3 (Production Launch)
- [ ] First IPS organization onboarded
- [ ] Zero critical bugs
- [ ] < 2s page load time
- [ ] 99.9% uptime achieved

---

## 🗺️ Immediate Next Steps

1. **Initialize Git Repository** (You're here!)
   - Run `./scripts/init-git.sh`
   - Create GitHub repository
   - Push branches to remote

2. **Set Up AWS Amplify Hosting**
   - Follow `docs/CICD_SETUP.md`
   - Configure all 3 environments
   - Verify auto-deployment works

3. **Deploy Backend to AWS** (Your focus!)
   - Open `amplify/` in AWS KIRO IDE
   - Run `npx ampx sandbox` to test locally
   - Deploy with `npx ampx deploy`
   - Get API endpoints for frontend

4. **Connect Frontend to Backend**
   - Replace mock client implementation
   - Update environment variables
   - Test authentication flow
   - Verify data sync

---

## 📞 Support & Resources

**AWS Amplify Gen 2 Documentation:**
- [Getting Started](https://docs.amplify.aws/gen2/)
- [Data Modeling](https://docs.amplify.aws/gen2/build-a-backend/data/)
- [Authentication](https://docs.amplify.aws/gen2/build-a-backend/auth/)
- [Functions](https://docs.amplify.aws/gen2/build-a-backend/functions/)

**Project Documentation:**
- `docs/CICD_SETUP.md` - CI/CD configuration
- `docs/DEPLOYMENT.md` - Deployment workflow
- `README.md` - Project overview

**Need Help?**
- Frontend questions → Check `src/components/` for examples
- Backend questions → Review `amplify/` structure
- Deployment issues → See `docs/CICD_SETUP.md` troubleshooting

---

**This document should be updated as the project evolves. Keep it synchronized with the actual state of the codebase.**
