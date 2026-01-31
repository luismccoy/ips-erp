# Homepage V3 - Action Plan
**Date:** 2026-01-30  
**Goal:** Merge the best of V1 + V2 based on Luis's feedback

## 🎯 Luis's Requirements

### Keep from V1
- ✅ Overall layout structure (better flow)
- ✅ "Agendar Demo Gratuito" section at END (CRITICAL - lead capture)

### Keep from V2
- ✅ "Los Desafíos que enfrentan las IPS hoy" section
- ✅ Four challenge boxes:
  - Glosadas (Claim Denials)
  - Manuales (Manual Processes)
  - Planillas (Spreadsheets/Rosters)
  - Cumplimiento (Compliance)

### Must Fix/Change

#### 1. Hero Image ❌ CRITICAL
- **Current:** Blood samples (WRONG - not relevant to home care)
- **Required:** Real nurse providing home care to a patient
- **Style:** Professional, warm, authentic (no AI-generated look)

#### 2. Challenge Boxes (4 boxes) 🔄
- **Current:** Too "AI-looking", generic
- **Required:** Small relevant pictures/icons that match each challenge
  - Glosadas → Claims/paperwork/red stamp imagery
  - Manuales → Person with stacks of forms/documents
  - Planillas → Excel/spreadsheet chaos
  - Cumplimiento → Checklist/audit/regulatory

#### 3. Features Section 🆕 ADD
- **Required:** Show tablet or phone mockup
- **Content:** Live screenshot of the Nurse Module
- **Goal:** Demonstrate mobile compatibility + real product

#### 4. Demo Form 🚨 CRITICAL
- **Location:** At the end (from V1)
- **Component:** "Agendar Demo Gratuito"
- **Must Have:** Lead capture form (name, email, company, phone)

## 📸 Image Sourcing Strategy

### Priority: HIGH-QUALITY REAL PHOTOS (NOT AI)

#### Sources to Use:
1. **Unsplash** - Free, high-quality, commercial use
   - Search: "home care nurse", "elderly care", "nurse patient home"
2. **Pexels** - Free stock photos
3. **Pixabay** - Free images
4. **Custom Photography** - Consider hiring for final version
   - Cost: ~$200-500 for professional shoot
   - Colombian home care setting (authentic)

#### Image Requirements:
- **Format:** WebP (optimized), with fallback JPG
- **Resolution:** 2x retina (1920x1080+ for hero)
- **File Size:** < 200KB per image (compressed)
- **Style:** Natural lighting, authentic scenarios, diverse patients
- **Location:** `/public/images/homepage/` directory

## 🏗️ Implementation Plan

### Phase 1: Image Research & Curation (1 hour)
- [ ] Find 3-5 hero image candidates (nurse + patient at home)
- [ ] Find 4 challenge box images (one per challenge)
- [ ] Find/create device mockup with nurse module screenshot
- [ ] Document sources in `IMAGE_SOURCES.md`

### Phase 2: Component Structure (30 min)
- [ ] Copy V1 layout as base
- [ ] Import "Desafíos" section from V2
- [ ] Add device mockup section (new)
- [ ] Restore "Agendar Demo" form from V1

### Phase 3: Image Integration (1 hour)
- [ ] Replace hero image
- [ ] Add images to 4 challenge boxes
- [ ] Create device mockup with nurse module screenshot
- [ ] Optimize all images (WebP conversion)

### Phase 4: Styling & Polish (30 min)
- [ ] Ensure images don't look "AI-generated"
- [ ] Add subtle shadows/borders to boxes
- [ ] Verify mobile responsiveness
- [ ] Check load times (< 3s)

### Phase 5: Content Review (15 min)
- [ ] Remove any remaining fake data
- [ ] Verify all text is accurate
- [ ] Check Spanish grammar/spelling
- [ ] Luis final approval

## 📝 Notes

### Bedrock Functions Status ✅
Luis asked about Bedrock agents. Checked and confirmed:
- **Status:** ALL WORKING
- **Functions:** glosaDefender, ripsValidator, rosterArchitect
- **IAM:** Bedrock InvokeModel permissions granted
- **Logs:** AI Client initializing correctly in LIVE mode
- **Issue:** Just not being called from the app yet (that's expected during homepage work)

### Next Steps After Homepage
1. Wire up demo form to CRM/email (Resend/AWS SES)
2. Add analytics (Plausible/Google Analytics)
3. SEO optimization (meta tags, sitemap)
4. Launch marketing campaign

---

**Estimated Total Time:** 3-4 hours  
**Priority:** HIGH - This is the front door to the product
