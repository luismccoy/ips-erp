# IPS-ERP Team Handoff Document

**Last Updated:** 2026-01-26  
**Project:** IPS-ERP (Colombian Home Healthcare Management System)  
**Repo:** https://github.com/luismccoy/ips-erp  
**Production URL:** https://main.d2wwgecog8smmr.amplifyapp.com

---

## 🤖 The Team

| Agent | Location | Specialty | Access |
|-------|----------|-----------|--------|
| **Clawd** | EC2 (Ubuntu) | Coordination, Git, Docs, Audits, Testing | Git push, no AWS Console |
| **Kiro** | Mac (Local) | Backend, AWS, Amplify, CDK, Lambda | Full AWS via ADA auth |
| **Antigravity** | Mac (Local) | Frontend, React, UX, Tailwind, Components | Git, local dev |

---

## 📋 How This Works

1. **Before starting work:** Pull latest and check this doc for context
2. **While working:** Document what you're doing in your section below
3. **After completing:** Update status, commit changes, note any blockers
4. **Handoffs:** Tag the next agent with clear instructions

---

## 🔄 Current Sprint: Production Auth & User Workflows

### Sprint Goal
Get production authentication working with real Cognito users so we can test full user workflows (SuperAdmin → Admin → Nurse → Family).

### Sprint Status: 🟡 IN PROGRESS

---

## 📝 Agent Work Logs

### Clawd (Coordinator) - Last Update: 2026-01-26 15:30 UTC

#### Completed ✅
- [x] Fixed `useAuth.ts` - now reads role from Cognito groups (JWT `cognito:groups`)
- [x] Added `SuperAdmin` group to auth config
- [x] Fixed navigation bug (removed `window.location.href` redirects)
- [x] Created production auth fix plan (`docs/PRODUCTION_AUTH_FIX_PLAN.md`)
- [x] Created Kiro backend tasks (`docs/KIRO_BACKEND_TASKS.md`)
- [x] Created this handoff document

#### In Progress 🔄
- [ ] Waiting for Kiro to create Cognito test users
- [ ] Waiting for Kiro to seed DynamoDB tenants

#### Blocked 🔴
- Cannot create Cognito users (no AWS Console access from EC2)
- Cannot add Amplify redirect rules (no `amplify:UpdateApp` permission)

#### Next Steps (after Kiro completes)
- Test production auth flow for all user roles
- Verify multi-tenant data isolation
- Test AI service integrations with real backend

#### Notes for Other Agents
- Demo mode (landing page → "View Demo") should continue to work with mock data
- Production mode kicks in when `isUsingRealBackend()` returns true
- The `custom:tenantId` attribute is critical - non-superadmin users MUST have it

---

### Kiro (Backend) - Last Update: [PENDING]

#### Assigned Tasks 📋
See `docs/KIRO_BACKEND_TASKS.md` for detailed instructions.

1. [ ] Verify/Create `SuperAdmin` Cognito group
2. [ ] Create 5 test users in Cognito (see task doc for commands)
3. [ ] Seed 2 tenants in DynamoDB
4. [ ] Verify all users can authenticate
5. [ ] Update this section when complete

#### Completed ✅
*[Kiro: Update this section as you complete tasks]*

#### Issues Found 🐛
*[Kiro: Document any issues or questions here]*

#### Notes for Other Agents
*[Kiro: Add any context others need to know]*

---

### Antigravity (Frontend) - Last Update: [PENDING]

#### Assigned Tasks 📋
*[Clawd will assign frontend tasks after auth is working]*

Upcoming:
- [ ] Test production login UI with real credentials
- [ ] SuperAdmin dashboard view (if needed)
- [ ] Any UX issues found during production testing

#### Completed ✅
*[Antigravity: Update this section as you complete tasks]*

#### Issues Found 🐛
*[Antigravity: Document any issues or questions here]*

#### Notes for Other Agents
*[Antigravity: Add any context others need to know]*

---

## 🏗️ Architecture Quick Reference

```
┌─────────────────────────────────────────────────────────────────────┐
│                        IPS-ERP Architecture                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  FRONTEND (Antigravity)          BACKEND (Kiro)                      │
│  ──────────────────────          ──────────────────                  │
│  React + Vite + TypeScript       AWS Amplify Gen 2                   │
│  Tailwind CSS                    AppSync (GraphQL)                   │
│  Components:                     DynamoDB Tables:                    │
│  - AdminDashboard                - Tenant, Patient, Nurse            │
│  - SimpleNurseApp                - Shift, Visit, VitalSigns          │
│  - FamilyPortal                  - InventoryItem, BillingRecord      │
│                                  - AuditLog, Notification            │
│                                                                      │
│  AUTH (Cognito)                  AI SERVICES (Lambda + Bedrock)      │
│  ─────────────                   ───────────────────────────         │
│  Groups: SuperAdmin, Admin,      - roster-architect                  │
│          Nurse, Family           - rips-validator                    │
│  Attribute: custom:tenantId      - glosa-defender                    │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                       COORDINATION (Clawd)                           │
│  ─────────────────────────────────────────                           │
│  Git operations, documentation, audits, testing, handoffs            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Files Reference

| File | Purpose | Owner |
|------|---------|-------|
| `src/hooks/useAuth.ts` | Auth state, role detection | Clawd/Antigravity |
| `amplify/auth/resource.ts` | Cognito config, groups | Kiro |
| `amplify/data/resource.ts` | GraphQL schema, models | Kiro |
| `src/amplify-utils.ts` | Client factory, demo mode | Clawd |
| `src/data/mock-data.ts` | Demo mode sample data | Antigravity |
| `docs/TEAM_HANDOFF.md` | This file | All |

---

## 📊 Production Test Credentials

**✅ Created by Kiro on 2026-01-26**

| Role | Email | Password | TenantId |
|------|-------|----------|----------|
| SuperAdmin | superadmin@ipserp.com | TempPass123! | - |
| Admin | admin@clinica-vida.com | TempPass123! | tenant-vida-01 |
| Admin | admin@clinica-salud.com | TempPass123! | tenant-salud-01 |
| Nurse | maria.nurse@clinica-vida.com | TempPass123! | tenant-vida-01 |
| Family | carlos.familia@gmail.com | TempPass123! | tenant-vida-01 |

⚠️ **Note:** First login will require password change (Cognito policy).

---

## 🚨 Known Issues / Blockers

| Issue | Status | Owner | Notes |
|-------|--------|-------|-------|
| SPA redirect rules not configured | 🟡 Pending | Kiro | Need to add in Amplify Console |
| ~~No production test users~~ | ✅ Done | Kiro | 5 users + 2 tenants created |
| ~~Chunk size warning (545kb)~~ | ✅ Fixed | Clawd | Code splitting implemented |
| Test production auth flow | 🔄 In Progress | Clawd | Ready to test with new users |

---

## 📅 Change Log

| Date | Agent | Change |
|------|-------|--------|
| 2026-01-26 | Clawd | Created handoff doc, fixed useAuth, assigned Kiro tasks |
| 2026-01-26 | Clawd | Performance fix: lazy loading + panel state persistence |
| 2026-01-26 | Kiro | Created 5 Cognito users + 2 DynamoDB tenants |
| | | |

---

## 💬 Communication Protocol

Since we're async agents, use this doc as the source of truth:
1. **Urgent:** Update the "Known Issues" section
2. **Questions:** Add to your agent section under "Notes for Other Agents"
3. **Completed:** Check off tasks and update status
4. **Blocked:** Clearly state what you need in your section

**Always commit this file after updates!**

---

*This document is our shared brain. Keep it current.* 🧠
