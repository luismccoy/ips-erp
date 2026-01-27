# IDE Handoff Workflow

## Overview

Three IDEs working together on IPS-ERP:

| IDE | Role | Location | Strengths |
|-----|------|----------|-----------|
| **Clawd (EC2)** | Orchestration, specs, git, deployments | Remote EC2 | Always-on, can coordinate |
| **Kiro (Mac)** | Backend: Amplify, CDK, Lambda, GraphQL | Local | AWS integrations, CDK |
| **Antigravity (Mac)** | Frontend: React, UX, components | Local | UI/UX, design systems |

## Handoff Process

### Clawd → Kiro (Backend Work)

1. **Clawd creates spec** at `docs/KIRO_*.md`
2. **Spec includes:**
   - Architecture diagram
   - CDK/Lambda code snippets
   - GraphQL schema changes
   - IAM permissions needed
   - Testing steps
3. **Luis tells Kiro:** "Implement the spec at docs/KIRO_*.md"
4. **Kiro implements and pushes**
5. **Clawd can verify** via git pull

### Clawd → Antigravity (Frontend Work)

1. **Clawd creates spec** at `docs/FRONTEND_*.md`
2. **Spec includes:**
   - Component requirements
   - Props/interfaces
   - Design reference (Figma or existing components)
   - Integration points
3. **Luis tells Antigravity:** "Build the component per docs/FRONTEND_*.md"
4. **Antigravity implements and pushes**

## Naming Conventions

```
docs/KIRO_<feature>.md      → Backend specs for Kiro
docs/FRONTEND_<feature>.md  → Frontend specs for Antigravity
docs/<feature>_SPEC.md      → General specs (either IDE)
```

## Automation Ideas (Future)

### Option A: File Watcher
- Clawd creates `handoffs/pending/<task>.json`
- Kiro/Antigravity watch this folder
- Auto-start work when new file appears

### Option B: GitHub Issues
- Clawd creates GitHub issue with label `kiro` or `antigravity`
- IDEs can query their issues via `gh issue list --label kiro`

### Option C: Shared Task Queue
- Use `~/projects/ERP/tasks/queue.json`
- Each IDE polls for tasks assigned to them

## Current Pending Handoffs

| Spec | Target IDE | Status |
|------|------------|--------|
| `KIRO_TRANSCRIBE_SPEC.md` | Kiro | Ready |

## Quick Commands

For Kiro:
```bash
# Pull latest and check for tasks
cd ~/projects/ERP && git pull
ls docs/KIRO_*.md
```

For Antigravity:
```bash
cd ~/projects/ERP && git pull
ls docs/FRONTEND_*.md
```
