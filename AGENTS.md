# AGENTS.md — IPS ERP AI Agent Guidelines

This file provides rules and context for any AI agent working on the IPS ERP codebase.

## Project Summary

IPS ERP is an AI-native SaaS platform for Colombian home care agencies. It's an admin-first ERP that uses AWS Bedrock Agents to automate rostering, defend against billing rejections (Glosas), and prevent inventory leakage. Field nurses use an offline-first mobile app for visit logging with legal proof of attendance. Built on AWS Amplify Gen 2 with React + TypeScript.

## Architecture Rules

### AWS Amplify Gen 2 Architecture

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4
- **Backend**: AWS Amplify Gen 2 (serverless)
- **Authentication**: Amazon Cognito with multi-tenant isolation via `tenantId`
- **Database**: Amazon DynamoDB (single-table design)
- **API**: AWS AppSync (GraphQL) with offline sync
- **AI**: AWS Bedrock (Claude models) for intelligent automation
- **Location**: Amazon Location Service for geofencing and routing

### Multi-Tenant Architecture

- All data is logically isolated by `tenantId` (agency ID)
- Cognito custom attributes enforce tenant boundaries
- DynamoDB partition keys include `tenantId` prefix
- AppSync resolvers filter by authenticated user's tenant
- Never expose cross-tenant data in queries or mutations

### Offline-First Mobile Strategy

- Field nurses work in "Zona Roja" (no connectivity)
- AppSync DataStore handles offline sync and conflict resolution
- Critical data (visit logs, patient info) cached locally
- GPS coordinates captured offline, synced when online
- Optimistic UI updates with eventual consistency

## File Conventions

| Location | Language | Purpose |
|---|---|---|
| `src/pages/*.tsx` | TypeScript/JSX | Page components (route-level) |
| `src/components/*.tsx` | TypeScript/JSX | Reusable UI components |
| `src/hooks/use*.ts` | TypeScript | Custom React hooks |
| `src/services/*.ts` | TypeScript | AWS service integrations (Bedrock, Location, etc.) |
| `src/types/*.ts` | TypeScript | Shared type definitions |
| `src/utils/*.ts` | TypeScript | Pure utility functions |
| `src/contexts/*.tsx` | TypeScript/JSX | React Context providers |
| `amplify/` | TypeScript | Amplify Gen 2 backend definitions |
| `tests/` | TypeScript | All tests (Vitest + Playwright) |

### Naming

- Pages: `PascalCase.tsx` (e.g., `Dashboard.tsx`, `PatientList.tsx`)
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Services: `camelCase.ts`
- GraphQL operations: `camelCase` (e.g., `listPatients`, `createVisit`)
- Tests: `*.test.ts` or `*.test.tsx`

## Coding Standards

### General

- Use existing patterns. If services use async/await, new services should too.
- Keep changes minimal. Don't refactor surrounding code when fixing a bug or adding a feature.
- Don't add comments, docstrings, or type annotations to code you didn't change.
- Don't create new files unless necessary. Prefer editing existing files.
- All AWS SDK calls must include error handling and retry logic.

### React Components

- Use functional components with hooks.
- Use Tailwind CSS classes for styling (v4 with `@tailwindcss/vite`).
- Icons come from `lucide-react` and `healthicons-react`.
- Animations use `framer-motion`.
- Forms should validate Colombian-specific data (RIPS format, ReTHUS IDs, etc.).

### GraphQL & AppSync

- All queries/mutations defined in `amplify/data/resource.ts`
- Use AppSync DataStore for offline-first features
- Subscriptions for real-time updates (nurse arrival notifications)
- Authorization rules enforce tenant isolation at the schema level
- Never bypass AppSync resolvers with direct DynamoDB access

### AWS Bedrock Integration

- Claude models accessed via `@aws-sdk/client-bedrock-runtime`
- AI features: roster optimization, glosa defense, voice-to-text transcription
- All prompts must be in Spanish for Colombian users
- Bedrock responses cached in DynamoDB to reduce costs
- Never log patient PHI in Bedrock requests

### Colombian Compliance

- **RIPS JSON validation**: All billing data must conform to Resolución 2275
- **Habilitación tracking**: Equipment calibrations and ReTHUS certifications
- **Tecnovigilancia**: Adverse event reporting for medical equipment
- **Data residency**: Prefer AWS Bogotá region when available
- **Legal proof**: GPS + timestamp + digital signature for visit logs

## Testing

### Framework

- **Unit/Integration**: Vitest + React Testing Library
- **E2E**: Playwright
- **Property-based**: fast-check
- **AWS Mocks**: `aws-sdk-client-mock`

### Commands

```bash
npm run test          # Watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage report
npm run test:ui       # Vitest UI
```

### Test Structure

```
tests/
├── unit/              # Component, hook, and service tests
├── integration/       # Multi-module tests
├── e2e/               # Playwright end-to-end tests
└── mocks/             # Reusable mock implementations
```

### Writing Tests

- Mock AWS services using `aws-sdk-client-mock`
- Mock AppSync DataStore for offline sync tests
- Test Colombian-specific validations (RIPS format, ReTHUS IDs)
- Test multi-tenant isolation (no cross-tenant data leaks)
- Test offline scenarios (network failures, sync conflicts)

## Building & Deployment

```bash
npm run dev           # Local dev server (Vite)
npm run build         # Production build
npm run preview       # Preview production build
npx amplify sandbox   # Start Amplify sandbox environment
npx amplify deploy    # Deploy to AWS
```

### Environments

- **Development**: Local Vite + Amplify sandbox
- **Staging**: AWS Amplify staging branch (`.env.staging`)
- **Production**: AWS Amplify production branch (`.env.production`)

### Amplify Gen 2 Backend

- Backend defined in `amplify/` directory (TypeScript)
- Data models in `amplify/data/resource.ts`
- Auth config in `amplify/auth/resource.ts`
- Functions in `amplify/functions/`
- Deploy with `npx amplify deploy`

## Common Pitfalls

- **Tenant isolation**: Always filter by `tenantId`. Cross-tenant data leaks are critical security bugs.
- **Offline sync**: Test conflict resolution. Nurses may edit the same visit offline simultaneously.
- **Colombian formats**: RIPS JSON, ReTHUS IDs, and CUPS codes have strict validation rules. Use existing validators.
- **GPS accuracy**: "Zona Roja" has poor GPS. Allow 100m geofence radius, not 10m.
- **Bedrock costs**: Cache AI responses. Don't call Bedrock on every keystroke.
- **AppSync subscriptions**: Unsubscribe on component unmount to prevent memory leaks.
- **DynamoDB capacity**: Single-table design requires careful GSI planning. Don't add indexes without review.

## Security

- Never commit AWS credentials, API keys, or secrets.
- Never log patient PHI (names, addresses, medical conditions).
- All user input must be sanitized before DynamoDB writes.
- Cognito tokens expire after 1 hour. Handle token refresh gracefully.
- GPS coordinates are sensitive. Encrypt at rest in DynamoDB.
- Colombian data residency laws apply. Use AWS Bogotá region when possible.

## Dependencies

Key dependencies to be aware of:

| Package | Version | Purpose |
|---|---|---|
| `react` | ^19.2.0 | UI framework |
| `react-router-dom` | ^7.13.0 | Client-side routing |
| `aws-amplify` | ^6.15.10 | AWS Amplify client library |
| `@aws-sdk/client-bedrock-runtime` | ^3.972.0 | AI integration (Claude) |
| `tailwindcss` | ^4.1.18 | CSS framework |
| `framer-motion` | ^12.29.2 | Animations |
| `lucide-react` | ^0.562.0 | Icons |
| `healthicons-react` | ^3.5.0 | Medical icons |
| `jspdf` | ^2.5.2 | PDF generation (RIPS reports) |
| `vitest` | ^4.0.17 | Test runner |
| `@playwright/test` | ^1.58.0 | E2E testing |

## Colombian Domain Knowledge

### RIPS (Registro Individual de Prestación de Servicios)

- JSON format mandated by Resolución 2275
- Required fields: patient ID, service code (CUPS), diagnosis (CIE-10), provider ReTHUS
- Submitted monthly to EPS (health insurance) for payment
- Rejections ("Glosas") result in non-payment

### Habilitación

- License to operate as a home care agency
- Requires proof of equipment calibrations and staff certifications
- Audited annually by Secretaría de Salud
- Non-compliance results in closure

### ReTHUS

- National registry of healthcare professionals
- All nurses must have valid ReTHUS ID
- App validates ReTHUS IDs against government API

### CUPS Codes

- Standardized procedure codes (e.g., "890201" = home nursing visit)
- Used in RIPS billing
- App provides CUPS code lookup

### Zona Roja

- Neighborhoods with poor/no cellular connectivity
- Nurses work offline for hours
- App must handle offline data entry and sync

## Git Workflow

All AI IDEs (Kiro, Antigravity, Claude Code, Clawdbot) must follow these rules. No exceptions.

### Branching

- **Never commit directly to `main`.** Always create a feature branch first.
- Branch naming: `feat/<short-description>`, `fix/<short-description>`, `refactor/<short-description>`
- Examples: `feat/route-optimizer`, `fix/auth-redirect`, `refactor/nurse-workflow`
- Keep branches short-lived. One feature or fix per branch.

### Commits

- Use **conventional commit** format: `type(scope): description`
- Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`, `perf`, `ci`, `style`, `release`
- Scope is optional but encouraged: `feat(auth): add JWT refresh`, `fix(nurse): resolve TDZ error`
- Write in imperative mood: "add feature" not "added feature"
- Keep subject under 72 characters.
- **Squash fix chains before merging.** If you committed 5 fixes to get something working, squash them into one commit before the PR. Do not merge `fix`, `fix`, `fix`, `fix` into `main`.

### Merging to Main

- Always merge via **pull request** (squash merge preferred).
- PR title should follow conventional commit format.
- PR description should summarize what changed and why.
- Verify the branch builds and tests pass before merging.

### What NOT to Commit

- Task-tracking files (Kiro tasks, Antigravity queues, IDE-specific workflow docs)
- Handoff documents between IDEs
- Deployment proof or monitoring protocol docs
- `EMERGENCY REVERT` / `HOTFIX` / `CRITICAL FIX` panic commits — if you need to revert, do it on the branch, squash, then merge cleanly
- Build config trial-and-error (e.g., toggling `npm ci` vs `npm install` five times) — get it right on the branch first

### Quick Reference

```
# Start work
git checkout -b feat/my-feature main

# Commit with conventional format
git commit -m "feat(scope): add the thing"

# Squash fix chain before pushing (if you have multiple fix commits)
git rebase -i main

# Push and open PR
git push -u origin feat/my-feature
gh pr create --title "feat(scope): add the thing" --body "Summary of changes"
```

## AI Agent Behavior

When working on this codebase:

1. **Prioritize Colombian compliance**: RIPS validation, ReTHUS checks, and Habilitación tracking are non-negotiable.
2. **Respect multi-tenancy**: Never write code that could leak data across agencies.
3. **Test offline scenarios**: Nurses work in Zona Roja. Offline-first is not optional.
4. **Use Spanish**: UI text, error messages, and AI prompts must be in Spanish.
5. **Minimize Bedrock costs**: Cache responses, batch requests, use Haiku for simple tasks.
6. **Follow Amplify Gen 2 patterns**: Don't bypass AppSync or write custom Lambda functions unless necessary.
7. **Validate Colombian data formats**: RIPS JSON, ReTHUS IDs, CUPS codes, CIE-10 diagnoses.
8. **Handle GPS gracefully**: Poor accuracy in Zona Roja. Use generous geofences.
