# 🧪 Post-Deployment Test Plan

**Date:** 2026-01-31  
**Deployment:** Job #156  
**URL:** https://main.d2wwgecog8smmr.amplifyapp.com/homepage/

---

## ✅ **Critical Tests (Must Pass)**

### **1. Page Loads**
- [ ] Homepage loads without errors
- [ ] All images display correctly
- [ ] No 404 errors in console
- [ ] Page loads in < 3 seconds

### **2. Hero Section**
- [ ] Hero image displays (nurse + patient)
- [ ] "Programa Beta" badge visible
- [ ] Headline readable and correct
- [ ] Stats grid shows: Q2 2026, 100% RIPS, AWS, 24/7
- [ ] "Solicitar Acceso Beta" button visible (teal color)
- [ ] "Ver Soluciones" button visible

### **3. Navigation & Links**
- [ ] "Solicitar Acceso Beta" scrolls to #beta section
- [ ] "Ver Soluciones" scrolls to #soluciones section
- [ ] Scroll indicator at bottom works
- [ ] All anchor links function

### **4. Challenges Section**
- [ ] 4 challenge boxes display
- [ ] All 4 images load:
  - Glosadas (DENIED stamp)
  - Manuales (paperwork stacks)
  - Planillas (Excel screenshot)
  - Cumplimiento (checklist)
- [ ] Hover effects work
- [ ] Text is readable
- [ ] Stats badges overlay images correctly

### **5. Beta Form Section**
- [ ] Form displays at #beta
- [ ] All 6 fields present:
  - Nombre Completo
  - Email Corporativo
  - Nombre de IPS
  - Cargo (dropdown)
  - Tamaño del equipo (dropdown)
  - Consent checkbox
- [ ] Submit button visible
- [ ] Form validation works (required fields)
- [ ] Form submits without errors

### **6. Mobile Responsive**
- [ ] Page displays correctly on mobile (375px)
- [ ] Images scale properly
- [ ] Buttons are tappable (44px+)
- [ ] Form is usable on mobile
- [ ] Stats grid stacks correctly

### **7. Visual Polish**
- [ ] Gradients render correctly
- [ ] Animations work (float, bounce)
- [ ] Colors match brand (blue/teal)
- [ ] Typography hierarchy clear
- [ ] No layout shifts

---

## 🔍 **Detailed Test Commands**

### **Test 1: Check if deployed**
```bash
curl -I https://main.d2wwgecog8smmr.amplifyapp.com/homepage/
# Expected: 200 OK
```

### **Test 2: Check image loading**
```bash
curl -I https://main.d2wwgecog8smmr.amplifyapp.com/images/hero-nurse-patient.jpg
curl -I https://main.d2wwgecog8smmr.amplifyapp.com/images/challenge-glosadas.jpg
curl -I https://main.d2wwgecog8smmr.amplifyapp.com/images/challenge-manuales.jpg
curl -I https://main.d2wwgecog8smmr.amplifyapp.com/images/challenge-planillas.jpg
curl -I https://main.d2wwgecog8smmr.amplifyapp.com/images/challenge-cumplimiento.jpg
# All expected: 200 OK
```

### **Test 3: Check HTML structure**
```bash
curl -s https://main.d2wwgecog8smmr.amplifyapp.com/homepage/ | grep -c "Solicitar Acceso Beta"
# Expected: 2+ (hero button + form)

curl -s https://main.d2wwgecog8smmr.amplifyapp.com/homepage/ | grep -c "Q2 2026"
# Expected: 1+ (stats grid)
```

### **Test 4: Performance**
```bash
curl -w "@-" -o /dev/null -s https://main.d2wwgecog8smmr.amplifyapp.com/homepage/ <<'EOF'
time_total: %{time_total}s
size_download: %{size_download} bytes
EOF
# Expected: < 3 seconds, ~500KB total
```

---

## 🐛 **Common Issues & Fixes**

### **Issue: Images don't load (404)**
**Fix:**
```bash
# Check if path is correct
aws s3 ls s3://amplify-bucket/images/

# Or fix paths in HTML
sed -i 's|/images/|./images/|g' public/homepage/index.html
git commit -am "fix: Update image paths"
git push
```

### **Issue: Form doesn't submit**
**Fix:**
```bash
# Update form action to proper endpoint
# Current: mailto:beta@ips-erp.com
# Should be: AWS Lambda or Formspree
```

### **Issue: Page not found (404)**
**Fix:**
```bash
# Check Amplify rewrites in amplify.yml
# Or access at: /public/homepage/index.html
```

---

## ✅ **Success Criteria**

**Minimum to declare success:**
- [ ] Page loads with 200 status
- [ ] All 5 images display
- [ ] All buttons are clickable
- [ ] Form is visible and submittable
- [ ] No console errors

**Nice to have:**
- [ ] Load time < 2 seconds
- [ ] Form actually sends emails
- [ ] Mobile looks perfect
- [ ] Animations smooth

---

## 📊 **Test Results (Fill in after testing)**

### Checklist:
- [ ] Hero: ___
- [ ] Images: ___
- [ ] Links: ___
- [ ] Form: ___
- [ ] Mobile: ___
- [ ] Performance: ___

### Issues Found:
1. 
2. 
3. 

### Actions Needed:
1. 
2. 
3. 

---

**Tester:** Jarvis (automated)  
**Date:** 2026-01-31  
**Time:** After deployment completes
