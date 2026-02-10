# Deployment Workflow

This document describes the deployment process for IPS ERP across all environments.

## Overview

```
Feature Development → Dev → Staging → Production
     (feature/*)      (develop) (staging)   (main)
```

## Environments

| Environment | Branch | URL | Auto-Deploy | Approval Required |
|------------|--------|-----|-------------|-------------------|
| Development | `develop` | `https://develop.ips-erp.amplifyapp.com` | ✅ Yes | ❌ No |
| Staging | `staging` | `https://staging.ips-erp.amplifyapp.com` | ✅ Yes | ❌ No |
| Production | `main` | `https://ips-erp.com` | ✅ Yes | ✅ Yes (PR approval) |

---

## Standard Workflow

### 1. Feature Development

```bash
# Start from develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/patient-dashboard-improvements

# Make changes, commit frequently
git add .
git commit -m "feat: improve patient dashboard UI"
git push origin feature/patient-dashboard-improvements
```

### 2. Deploy to Development

```bash
# Create PR to develop branch
gh pr create --base develop --title "feat: improve patient dashboard UI"

# After approval, merge
# Auto-deploys to: https://develop.ips-erp.amplifyapp.com
```

**Testing in Dev:**
- Verify feature works with mock data
- Check all UI components render correctly  
- Verify no console errors

### 3. Promote to Staging

```bash
# After testing in dev, promote to staging
git checkout staging
git pull origin staging
git merge develop
git push origin staging

# Auto-deploys to: https://staging.ips-erp.amplifyapp.com
```

**Testing in Staging:**
- Test with real backend (if available)
- Perform UAT (User Acceptance Testing)
- Verify analytics integration
- Check performance metrics

### 4. Deploy to Production

```bash
# Create PR from staging to main
git checkout staging
gh pr create --base main --title "Release: v1.2.0 - Patient Dashboard Improvements"

# Requires approval from team lead
# After approval and merge:
# Auto-deploys to: https://ips-erp.com
```

**Post-Production Deployment:**
- Monitor CloudWatch logs for errors
- Verify deployment in Production
- Check analytics for unusual patterns
- Keep team on standby for 30 minutes

---

## Hotfix Workflow

For urgent production fixes:

```bash
# Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-auth-issue

# Make fix
git add .
git commit -m "fix: resolve authentication timeout"

# Push and create PR to main
git push origin hotfix/critical-auth-issue
gh pr create --base main --title "HOTFIX: Authentication timeout"

# After approval and merge, backport to other branches
git checkout staging
git merge main
git push origin staging

git checkout develop
git merge main
git push origin develop
```

---

## Rollback Procedure

If a deployment causes issues:

### Option 1: Revert via Git

```bash
# Find the commit to revert to
git log --oneline

# Revert the problematic commit
git revert <commit-hash>
git push origin main

# Auto-deploys previous version
```

### Option 2: Amplify Console Rollback

1. Go to AWS Amplify Console
2. Select the app → main branch
3. Find previous successful build
4. Click **Redeploy this version**

---

## Environment-Specific Configurations

### Development
- Mock data enabled
- Analytics disabled
- Debug mode on
- Source maps included

### Staging
- Real backend (test environment)
- Analytics enabled
- Debug mode on
- Source maps included

### Production
- Real backend (production)
- Analytics enabled
- Debug mode off
- Source maps excluded
- Performance monitoring active

---

## Pre-Deployment Checklist

Before merging to production:

- [ ] All tests passing in staging
- [ ] No console errors
- [ ] Performance metrics acceptable
- [ ] UAT completed successfully
- [ ] Database migrations applied (if any)
- [ ] Environment variables verified
- [ ] Rollback plan documented
- [ ] Team notified of deployment

---

## Monitoring Post-Deployment

After deploying to production:

1. **Immediate (0-5 minutes):**
   - Check deployment status in Amplify Console
   - Verify site loads correctly
   - Check critical user flows

2. **Short-term (5-30 minutes):**
   - Monitor CloudWatch logs
   - Watch error rates in analytics
   - Check user feedback channels

3. **Long-term (24-48 hours):**
   - Review performance metrics
   - Analyze user behavior changes
   - Monitor resource usage

---

## Common Issues

### Build Fails
- **Check:** `amplify.yml` syntax
- **Check:** Node.js version compatibility
- **Check:** Dependencies in `package.json`

### Environment Variables Not Working
- **Solution:** Verify in Amplify Console → Environment variables
- **Solution:** Restart build to refresh variables

### Backend Not Deploying
- **Check:** Amplify backend resources in `amplify/` folder
- **Check:** IAM permissions for Amplify service role
- **Run:** `amplify status` to see backend state

---

## Deployment Schedule

**Recommended Schedule:**

- **Development:** Deploy anytime (multiple times per day)
- **Staging:** Daily (end of business day)
- **Production:** Weekly (Friday morning, low-traffic time)

**Emergency Deployments:** 24/7 with approval

---

## Support Contacts

- **DevOps Lead:** [Contact Info]
- **AWS Support:** [Support Plan Details]
- **On-Call Engineer:** [Rotation Schedule]

