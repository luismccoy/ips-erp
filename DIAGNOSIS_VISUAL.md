# Visual Diagnosis: Homepage Deployment Issue

## 🔍 What Was Happening (BEFORE FIX)

```
┌─────────────────────────────────────────────────────────────────┐
│  REPO: ~/projects/ERP/                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  public/                                                        │
│  ├── favicon.ico              ────┐                            │
│  ├── vite.svg                 ────┤                            │
│  ├── homepage/                ────┤ Vite Build (npm run build) │
│  │   └── index.html (30KB)   ────┤                            │
│  └── images/                  ────┤                            │
│      └── *.jpg                ────┘                            │
│                                    │                            │
│                                    ▼                            │
│  dist/                                                          │
│  ├── favicon.ico              ✅ COPIED                         │
│  ├── vite.svg                 ✅ COPIED                         │
│  ├── index.html (1599 bytes)  ✅ React app                      │
│  ├── assets/                  ✅ JS/CSS bundles                 │
│  ├── homepage/                ❌ NOT COPIED (missing!)          │
│  └── images/                  ❌ NOT COPIED (missing!)          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ Deploy to Amplify
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  AWS AMPLIFY: https://main.d2wwgecog8smmr.amplifyapp.com       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User visits: /homepage/                                        │
│                                                                 │
│  Amplify customRule check:                                      │
│  1. /homepage → /homepage/index.html                            │
│     └─ File exists? ❌ NO (dist/homepage/ doesn't exist!)       │
│                                                                 │
│  2. Falls through to SPA fallback: /<*> → /index.html           │
│     └─ Serves: index.html (1599 bytes, React app) ❌ WRONG!     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Why This Happened
- **Vite only copies files in the ROOT of public/**
- `public/favicon.ico` → `dist/favicon.ico` ✅
- `public/homepage/` → NOT COPIED ❌

---

## ✅ What Happens AFTER FIX

```
┌─────────────────────────────────────────────────────────────────┐
│  REPO: ~/projects/ERP/                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  vite.config.ts (UPDATED)                                       │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ import { viteStaticCopy } from 'vite-plugin-static-copy'  │ │
│  │                                                           │ │
│  │ plugins: [                                                │ │
│  │   viteStaticCopy({                                        │ │
│  │     targets: [                                            │ │
│  │       { src: 'public/homepage', dest: '.' },              │ │
│  │       { src: 'public/images', dest: '.' }                 │ │
│  │     ]                                                     │ │
│  │   })                                                      │ │
│  │ ]                                                         │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  public/                                                        │
│  ├── favicon.ico              ────┐                            │
│  ├── homepage/                ────┤                            │
│  │   └── index.html (30KB)   ────┤ Vite Build + Plugin        │
│  └── images/                  ────┤                            │
│      └── *.jpg                ────┘                            │
│                                    │                            │
│                                    ▼                            │
│  dist/                                                          │
│  ├── favicon.ico              ✅ Copied by Vite                 │
│  ├── index.html (1599 bytes)  ✅ React app                      │
│  ├── assets/                  ✅ JS/CSS bundles                 │
│  ├── homepage/                ✅ COPIED BY PLUGIN! 🎉           │
│  │   └── index.html (30KB)   ✅ Beta landing page              │
│  └── images/                  ✅ COPIED BY PLUGIN! 🎉           │
│      └── *.jpg                ✅ All images                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ Deploy to Amplify
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│  AWS AMPLIFY: https://main.d2wwgecog8smmr.amplifyapp.com       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  User visits: /homepage/                                        │
│                                                                 │
│  Amplify customRule check:                                      │
│  1. /homepage → /homepage/index.html                            │
│     └─ File exists? ✅ YES!                                     │
│     └─ Serves: homepage/index.html (30KB) ✅ CORRECT!           │
│                                                                 │
│  User visits: /images/logo.jpg                                  │
│  2. /images/<*> → /images/<*>                                   │
│     └─ File exists? ✅ YES!                                     │
│     └─ Serves: images/logo.jpg ✅ CORRECT!                      │
│                                                                 │
│  User visits: /app (or any other route)                         │
│  3. Falls through to SPA fallback: /<*> → /index.html           │
│     └─ Serves: index.html (React app) ✅ CORRECT!               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Flow Comparison

### ❌ BEFORE (Broken)
```
public/homepage/index.html (30KB)
        │
        │ Vite Build (ignores subdirs)
        ▼
dist/   ← homepage/ NOT HERE!
        │
        │ Amplify Deploy
        ▼
/homepage/ → 404 → SPA fallback → React app (1599 bytes) ❌
```

### ✅ AFTER (Fixed)
```
public/homepage/index.html (30KB)
        │
        │ Vite Build + vite-plugin-static-copy
        ▼
dist/homepage/index.html (30KB) ✅
        │
        │ Amplify Deploy
        ▼
/homepage/ → homepage/index.html (30KB) ✅ CORRECT!
```

---

## The Key Change

| Component | Before | After |
|-----------|--------|-------|
| **Vite Config** | No static copy plugin | ✅ `vite-plugin-static-copy` added |
| **Build Output** | `dist/homepage/` missing | ✅ `dist/homepage/` exists (30KB file) |
| **Amplify Routing** | Falls through to SPA | ✅ Serves correct file |
| **Result** | React app (1599 bytes) ❌ | Beta page (30KB) ✅ |

---

## One-Line Summary

**Problem**: Vite doesn't copy subdirectories from `public/`  
**Solution**: Use `vite-plugin-static-copy` to explicitly copy them  
**Result**: Files exist in `dist/`, Amplify serves correct content ✅
