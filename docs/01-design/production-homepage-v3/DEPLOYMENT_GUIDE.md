# 🚀 Safe Deployment Guide - Homepage V3 Beta

**Date:** 2026-01-31  
**Goal:** Replace current landing page without breaking anything

---

## ✅ What We Just Updated

### **Beta Version Created:**
- File: `preview-beta.html`
- Images: Already in `images/` folder
- Form: Beta signup form with Formspree (needs configuration)

### **Key Changes from V3 to Beta:**
1. ✅ Badge: "Programa Beta - Lanzamiento Q2 2026"
2. ✅ Headline: "Sea de las primeras IPS..."
3. ✅ CTA: Changed from "Agendar Demo" → "Solicitar Acceso Beta"
4. ✅ Stats: Removed fake claims (500+ IPS) → Real promises (Q2 2026, 100% RIPS)
5. ✅ Beta Form: Complete signup form added

---

## 🔒 **Pre-Deployment Checklist**

### **Step 1: Configure Form Backend**

**Current placeholder:** `action="https://formspree.io/f/YOUR_FORM_ID"`

**Options:**

**A) Formspree (FREE tier - 50 submissions/month):**
1. Go to https://formspree.io/
2. Create account
3. Create new form
4. Copy form ID
5. Replace `YOUR_FORM_ID` in preview-beta.html

**B) AWS SES + Lambda (Your infrastructure):**
```bash
# Create simple Lambda function to handle form posts
# Sends email to your address
# More control, no external dependency
```

**C) Netlify Forms (if hosted on Netlify):**
- Just add `netlify` attribute to form
- Automatic handling

**Recommendation:** Start with Formspree for beta, migrate to AWS Lambda later.

---

## 📦 **Deployment Strategy: Zero-Downtime**

### **Current Setup (What we know):**
- Live site: https://main.d2wwgecog8smmr.amplifyapp.com
- Hosted on: AWS Amplify
- Repo: ~/projects/ERP (git-based)

### **Safe Deployment Plan:**

### **Phase 1: Backup Current Page (2 min)**
```bash
# SSH to your EC2 or access Amplify console
cd ~/projects/ERP

# Backup current homepage
git branch backup-homepage-$(date +%Y%m%d)
git add -A
git commit -m "Backup before V3 Beta deployment"
git push
```

### **Phase 2: Copy Files to Repo (5 min)**
```bash
# Copy beta version and images to your ERP project
cd ~/projects/ERP

# Create public/homepage directory if doesn't exist
mkdir -p public/homepage
mkdir -p public/images

# Copy beta HTML
cp ~/projects/ERP/docs/01-design/production-homepage-v3/preview-beta.html \
   public/homepage/index.html

# Copy all images
cp ~/projects/ERP/docs/01-design/production-homepage-v3/images/* \
   public/images/

# Fix image paths in HTML (they currently reference ./images/)
sed -i 's|./images/|/images/|g' public/homepage/index.html
```

### **Phase 3: Configure Form (3 min)**
```bash
# Edit the form action in index.html
nano public/homepage/index.html

# Find: action="https://formspree.io/f/YOUR_FORM_ID"
# Replace with your actual Formspree ID or AWS endpoint
```

### **Phase 4: Test Locally (2 min)**
```bash
# Start local server
cd ~/projects/ERP/public/homepage
python3 -m http.server 8080

# Open in browser (if you have access):
# http://localhost:8080

# Or use curl to verify:
curl -I http://localhost:8080/index.html
```

### **Phase 5: Commit & Deploy (3 min)**
```bash
cd ~/projects/ERP

git add public/homepage/index.html public/images/
git commit -m "feat: Add beta homepage V3 with real images and signup form"
git push origin main

# Amplify will auto-deploy (usually 2-5 minutes)
# Watch deployment in Amplify console
```

---

## 🛡️ **Safety Measures**

### **Rollback Plan (if something breaks):**
```bash
# Instant rollback
git revert HEAD
git push origin main

# Or restore from backup branch
git checkout backup-homepage-YYYYMMDD
git cherry-pick <commit-hash>
git push origin main
```

### **Testing Checklist Before Going Live:**
- [ ] All 5 images load correctly
- [ ] Form submits without errors
- [ ] Mobile responsive (test with browser dev tools)
- [ ] All links work (#beta, #soluciones)
- [ ] No broken images or 404s
- [ ] Page loads in < 3 seconds

---

## 🎯 **Alternative: Amplify Hosting Specific**

### **If you want to set homepage as root:**
```yaml
# amplify.yml
version: 1
frontend:
  phases:
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: public
    files:
      - '**/*'
  rewrites:
    - source: /
      target: /homepage/index.html
      status: 200
```

---

## 📊 **Post-Deployment Monitoring**

### **Things to Watch (First 24 hours):**
1. Form submissions - Do they arrive?
2. Image load times - Are they optimized?
3. Mobile traffic - Does it work on phones?
4. Error rates - Any 404s or broken links?

### **Add Analytics (Recommended):**
```html
<!-- Add before </head> in index.html -->
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

---

## 🚨 **Security Notes**

**We're NOT:**
- ❌ Opening any new ports
- ❌ Modifying security groups
- ❌ Exposing services to 0.0.0.0/0

**We ARE:**
- ✅ Using Amplify's built-in HTTPS
- ✅ Serving static files (safest deployment type)
- ✅ Using external form handler (Formspree)
- ✅ Following AWS best practices

---

## ✅ **Quick Deploy (TL;DR)**

**If you trust the process:**
```bash
# 1. Configure form
cd ~/projects/ERP/docs/01-design/production-homepage-v3
nano preview-beta.html  # Add your Formspree ID

# 2. Copy to project
mkdir -p ~/projects/ERP/public/homepage ~/projects/ERP/public/images
cp preview-beta.html ~/projects/ERP/public/homepage/index.html
cp images/* ~/projects/ERP/public/images/
sed -i 's|./images/|/images/|g' ~/projects/ERP/public/homepage/index.html

# 3. Deploy
cd ~/projects/ERP
git add public/
git commit -m "feat: Beta homepage V3"
git push origin main

# 4. Watch Amplify console for deployment status
```

**Time:** ~15 minutes total  
**Risk:** Minimal (can rollback in seconds)  
**Downtime:** Zero (Amplify blue-green deployment)

---

## 🎯 **Next Steps After Deployment**

1. Test form submissions
2. Monitor first beta signups
3. A/B test different headlines
4. Collect feedback from submissions
5. Iterate based on data

---

**Need help with deployment?** Let me know which hosting method you're using:
- A) AWS Amplify (auto-deploy from git)
- B) Manual upload to S3
- C) Other hosting platform

I can provide specific commands! 🚀
