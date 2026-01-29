# Production Verification Protocol

## Never Deploy Without:
1. **Local build verification** - `npm run build` must pass
2. **Component smoke test** - Key components render without crash
3. **Code review** - Check git diff before push
4. **Staged rollout** - Test in dev branch first

## Broken Deploy Checklist:
1. ✅ Identify commit that broke it
2. ✅ Revert specific file/component 
3. ✅ Push hotfix
4. ✅ Monitor deployment (2-3 min)
5. ✅ Manual verification
6. Document root cause

## Current Issue:
- **Commit**: ad01ab2 (skeleton AdminDashboard with undefined fetchData())
- **Fix**: dcb2c77 (restored working version from 3a24b91)
- **Status**: Deploying now
- **ETA**: 2-3 minutes
