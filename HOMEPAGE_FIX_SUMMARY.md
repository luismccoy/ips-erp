# 🔥 Amplify Homepage Deployment Fix - Summary

## The Problem
Your beta landing page at `/homepage/` was serving the React app (1599 bytes) instead of the 30KB beta page.

## Root Cause
**Vite's default behavior**: Only copies files from the **root** of `public/` to `dist/`. It does **NOT** copy subdirectories.

```
public/
├── homepage/       ← NOT COPIED by Vite
│   └── index.html
├── images/         ← NOT COPIED by Vite
│   └── *.jpg
└── favicon.ico     ← COPIED by Vite ✓
```

Result: `dist/homepage/` never existed, so Amplify's routing fell through to the SPA fallback, serving `index.html` (the React app).

---

## The Solution

### Use `vite-plugin-static-copy` to properly handle subdirectories

This plugin explicitly copies `public/homepage/` and `public/images/` during the Vite build process.

---

## Quick Deploy (Automated)

```bash
cd ~/projects/ERP
bash DEPLOY_FIX.sh
```

This script will:
1. ✅ Install `vite-plugin-static-copy`
2. ✅ Backup your current config files
3. ✅ Apply the fixes
4. ✅ Test the build locally
5. ✅ Verify files are copied correctly
6. ✅ Commit and push to trigger Amplify deployment

---

## Manual Deploy (Step-by-Step)

### 1. Install the Plugin
```bash
cd ~/projects/ERP
npm install --save-dev vite-plugin-static-copy
```

### 2. Update vite.config.ts
Add the import at the top:
```typescript
import { viteStaticCopy } from 'vite-plugin-static-copy'
```

Add to plugins array (before VitePWA):
```typescript
plugins: [
  react(),
  tailwindcss(),
  viteStaticCopy({
    targets: [
      {
        src: 'public/homepage',
        dest: '.'
      },
      {
        src: 'public/images',
        dest: '.'
      }
    ]
  }),
  VitePWA({
    // ... existing config
  })
]
```

### 3. Simplify amplify.yml
Replace the build commands section:
```yaml
build:
  commands:
    - npm run build
    # Vite plugin now handles copying
    - echo "=== Verifying dist contents ==="
    - ls -la dist/homepage/ 2>&1 || echo "⚠ homepage not found"
    - ls -la dist/images/ 2>&1 || echo "⚠ images not found"
    - wc -c dist/homepage/index.html 2>&1 || echo "⚠ homepage/index.html missing"
```

### 4. Test Locally
```bash
npm run build
ls -la dist/homepage/  # Should show index.html (~30KB)
ls -la dist/images/    # Should show *.jpg files
```

### 5. Deploy
```bash
git add vite.config.ts amplify.yml package.json package-lock.json
git commit -m "fix: Add vite-plugin-static-copy for homepage deployment"
git push origin main
```

---

## Verification After Deployment

### Test 1: Check File Size
```bash
curl -s https://main.d2wwgecog8smmr.amplifyapp.com/homepage/ | wc -c
```
**Expected**: ~30000 bytes  
**Before**: 1599 bytes ❌

### Test 2: Check Content
```bash
curl -s https://main.d2wwgecog8smmr.amplifyapp.com/homepage/ | head -20
```
**Expected**: Your beta landing page HTML  
**Before**: React app HTML ❌

### Test 3: Images
```bash
curl -I https://main.d2wwgecog8smmr.amplifyapp.com/images/[IMAGE_NAME].jpg
```
**Expected**: HTTP 200 OK

---

## Why Your customRules Were Already Correct

Your routing rules in `amplify.yml` were fine:
```yaml
customRules:
  - source: /homepage
    target: /homepage/index.html
    status: '200'
  - source: /homepage/<*>
    target: /homepage/<*>
    status: '200'
  - source: /<*>
    target: /index.html    # SPA fallback (last)
    status: '200'
```

The problem was that `dist/homepage/index.html` **didn't exist**, so the SPA fallback kicked in.

---

## Files Created

| File | Purpose |
|------|---------|
| `AMPLIFY_FIX.md` | Detailed explanation with 3 solution options |
| `vite.config.ts.FIXED` | Complete fixed Vite config (drop-in replacement) |
| `amplify.yml.FIXED` | Complete fixed Amplify config (drop-in replacement) |
| `DEPLOY_FIX.sh` | Automated deployment script |
| `HOMEPAGE_FIX_SUMMARY.md` | This file - quick reference |

---

## Backup Files

Before running the fix, your original files are backed up to:
- `vite.config.ts.backup`
- `amplify.yml.backup`

---

## Alternative Solutions (If Plugin Doesn't Work)

### Option A: Post-Build Script
Create `scripts/copy-public.sh`:
```bash
#!/bin/bash
mkdir -p dist/homepage dist/images
cp -r public/homepage/* dist/homepage/
cp -r public/images/* dist/images/
```

Update `amplify.yml`:
```yaml
build:
  commands:
    - npm run build
    - bash scripts/copy-public.sh
```

### Option B: Move Files to Root
If nothing else works:
- Move `public/homepage/index.html` → `public/beta.html`
- Update route: `/beta` → `/beta.html`

But this is **not ideal** - the plugin solution is cleaner.

---

## Success Metrics

✅ `/homepage/` returns ~30KB HTML  
✅ `/homepage/` shows beta landing page (not React app)  
✅ `/images/*.jpg` return 200 OK  
✅ React app still works at `/`  

---

## Questions?

- Check Amplify build logs: Look for "Verifying dist contents" output
- Local test: `npm run build && ls -la dist/homepage/`
- File size: `wc -c dist/homepage/index.html` (should be ~30KB)

---

**Next Step**: Run `bash DEPLOY_FIX.sh` to deploy the fix automatically! 🚀
