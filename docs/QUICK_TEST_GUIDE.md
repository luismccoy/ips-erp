# Quick Test Guide - Security Testing

**Quick Reference:** How to run security tests for AuthZ + Logout fixes

---

## 🚀 Quick Start (5 minutes)

### Option 1: Automated Tests

```bash
cd ~/projects/ERP

# Run all security tests
./scripts/test-security.sh

# OR run individually:
npm run test:run -- src/hooks/useAuth.test.ts
npm run test:run -- src/App.test.tsx
```

### Option 2: Manual Testing

```bash
# Open checklist and follow procedures
cat docs/SECURITY_TEST_CHECKLIST.md

# Or open in browser/editor
code docs/SECURITY_TEST_CHECKLIST.md
```

---

## 📋 Test Files

| File | Purpose | Tests |
|------|---------|-------|
| `src/hooks/useAuth.test.ts` | Auth logic unit tests | 11 tests |
| `src/App.test.tsx` | Route guard integration tests | 22 tests |
| `docs/SECURITY_TEST_CHECKLIST.md` | Manual test procedures | 15 procedures |

---

## ✅ Pre-Deployment Checklist

```
[ ] All automated tests pass
[ ] Manual checklist completed
[ ] Code review done
[ ] Security sign-off obtained
```

---

## 🐛 If Tests Fail

1. Check test output for specific failure
2. Review code changes in `useAuth.ts` or `App.tsx`
3. Fix security issue
4. Re-run tests
5. Do NOT deploy until all tests pass

---

## 📞 Need Help?

- **Test Details:** `docs/SECURITY_TEST_COVERAGE.md`
- **Full Report:** `docs/TEST_ENGINEER_REPORT.md`
- **Manual Checklist:** `docs/SECURITY_TEST_CHECKLIST.md`

---

**Remember:** This is P0 security - all tests must pass before deployment!
