# AWS Amplify Homepage Fix

## Problem
- `/homepage/` serves React app (1599 bytes) instead of beta landing page (30KB)
- Vite doesn't copy subdirectories from `public/` to `dist/`

## Solution

### Option 1: Vite Plugin (RECOMMENDED)

1. **Install the plugin:**
```bash
npm install --save-dev vite-plugin-static-copy
```

2. **Update `vite.config.ts`:**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  base: '/',
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
  ],
  // ... rest of config
})
```

3. **Simplify `amplify.yml` build commands:**
```yaml
build:
  commands:
    - npm run build
    # Files are now copied by Vite plugin - no manual cp needed
```

4. **Keep existing `customRules` in `amplify.yml`** - they're correct!

---

### Option 2: Post-Build Script (Alternative)

If you can't install dependencies, use a build script:

1. **Create `scripts/copy-public.sh`:**
```bash
#!/bin/bash
echo "Copying public subdirectories to dist..."
mkdir -p dist/homepage dist/images
cp -r public/homepage/* dist/homepage/
cp -r public/images/* dist/images/
echo "✓ Files copied successfully"
ls -la dist/homepage/
ls -la dist/images/
```

2. **Make it executable:**
```bash
chmod +x scripts/copy-public.sh
```

3. **Update `amplify.yml`:**
```yaml
build:
  commands:
    - npm run build
    - bash scripts/copy-public.sh
```

---

### Option 3: Direct amplify.yml Fix (Quick Fix)

Update the build commands to ensure directories exist:

```yaml
build:
  commands:
    - npm run build
    - mkdir -p dist/homepage dist/images
    - cp -r public/homepage/* dist/homepage/ 2>/dev/null || echo "No homepage files"
    - cp -r public/images/* dist/images/ 2>/dev/null || echo "No image files"
    - echo "=== Verification ==="
    - ls -la dist/homepage/ 2>&1
    - ls -la dist/images/ 2>&1
    - echo "=== Homepage file size ==="
    - wc -c dist/homepage/index.html 2>&1
```

---

## Testing

After deploying, verify:

```bash
# Should return 30KB file
curl -I https://main.d2wwgecog8smmr.amplifyapp.com/homepage/

# Should show ~30KB
curl -s https://main.d2wwgecog8smmr.amplifyapp.com/homepage/ | wc -c

# Should show beta page content
curl -s https://main.d2wwgecog8smmr.amplifyapp.com/homepage/ | head -50
```

---

## Why This Happened

1. **Vite's public folder behavior**: Only copies root files, not subdirectories
2. **Manual cp in amplify.yml**: May execute in wrong order or wrong directory
3. **Routing rules**: Were actually correct - just no files to serve!

## Recommended Solution: **Option 1** (Vite Plugin)

- Most reliable
- Integrates with build process
- Works locally AND on Amplify
- No manual script maintenance
