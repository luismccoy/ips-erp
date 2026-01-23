---
description: Frontend Development Workflow
---

# Frontend Development Workflow Rule

This workflow enforces alignment between Antigravity (Frontend) and Kiro (Backend).

## Rule: Read-First, Update-After

**Constraint:** You **MUST** follow this workflow for every new task involving frontend development.

### 1. Pre-Task: Read Implementation Guide
Before starting any implementation work, you must read the `KIRO IMPLEMENTATION GUIDE.md` to understand the current backend status, architectural constraints, and recent changes.

- **File Path:** `.kiro/steering/KIRO IMPLEMENTATION GUIDE.md`
- **Action:** Use `view_file` to read the document (or the relevant last 500 lines).

### 2. Implementation
Perform the frontend implementation tasks as requested by the user.
- follow project patterns (e.g. `amplify-utils.ts` for backend toggling).
- Ensure type safety with `src/types.ts`.

### 3. Post-Task: Update Implementation Guide
Upon completing a significant phase of work (e.g., verifying a deployment), you **MUST** update the `KIRO IMPLEMENTATION GUIDE.md` with a summary of the completed frontend work.

**Append a new section in this format:**
```markdown
## Phase [N]: [Title of Work]
**Status:** ✅ COMPLETE

**Goal:** [Brief goal description]

**Completed Tasks:**
1. ✅ [Task 1 Description]
2. ✅ [Task 2 Description]
...

**Results:**
- [Result 1]
- [Result 2]

**Artifacts:**
- [Link to Walkthrough or Docs]

**Next Steps:**
- [Next Step 1]
```
