# Homepage V3 - Production Landing Page

**Status:** 🚧 In Progress - Image Research Phase  
**Date:** 2026-01-30  
**Goal:** Merge best of V1 + V2 with high-quality REAL photography

---

## ✅ What's Complete

### Structure
- ✅ Hero component (awaiting image)
- ✅ Challenges component with 4 boxes (awaiting 4 images)
- ✅ Features component with tablet mockup (awaiting screenshot)
- ✅ FinalCTA "Agendar Demo" form (copied from V1)
- ✅ App.tsx entry point

### Requirements Captured
- ✅ Use V1 layout structure
- ✅ Keep V2's "Desafíos" section
- ✅ Replace blood samples → Real home care nurse
- ✅ Add real images to challenge boxes (not AI-looking)
- ✅ Add tablet/phone mockup with Nurse Module
- ✅ Restore "Agendar Demo" form at end

---

## 🔄 In Progress

### Sub-Agent: Image Research (Haiku)
**Task:** Finding high-quality images from Unsplash/Pexels  
**Output:** `IMAGE_SOURCES.md` with URLs and attribution  
**Status:** Running...

**Images Needed:**
1. **Hero:** Real nurse doing home care (Colombian if possible)
2. **Glosas:** Claims/paperwork/red stamp imagery
3. **Manuales:** Person with stacks of forms
4. **Planillas:** Excel/spreadsheet chaos
5. **Cumplimiento:** Checklist/audit imagery
6. **Features:** Tablet mockup + Nurse Module screenshot

---

## 📋 Next Steps

### Phase 1: Image Integration (After sub-agent completes)
1. Review IMAGE_SOURCES.md recommendations
2. Download selected images
3. Optimize (WebP conversion, compression)
4. Replace all `PLACEHOLDER_*_URL` in components
5. Save to `/public/images/homepage-v3/`

### Phase 2: Screenshot Capture
1. Start local server: `npm run dev`
2. Navigate to Nurse Module
3. Capture clean screenshot (1200x900px recommended)
4. Create tablet mockup overlay
5. Integrate into Features.tsx

### Phase 3: Preview & Test
1. Build preview HTML (like V1/V2)
2. Test on localhost:8888
3. Verify all images load correctly
4. Check mobile responsiveness
5. Luis approval

### Phase 4: Production Deploy
1. Move to actual ERP repo
2. Wire up demo form (backend integration)
3. Add analytics tracking
4. Deploy to Amplify
5. Launch! 🚀

---

## 📁 File Structure

```
production-homepage-v3/
├── ACTION_PLAN.md          # Overall strategy
├── README.md               # This file
├── IMAGE_SOURCES.md        # Sub-agent output (pending)
├── App.tsx                 # Main entry point
└── components/
    ├── Hero.tsx            # Hero with home care image
    ├── Challenges.tsx      # 4 boxes with real images
    ├── Features.tsx        # Tablet mockup + screenshot
    └── FinalCTA.tsx        # "Agendar Demo" form
```

---

## 🎨 Design Decisions

### Why This Structure?
- **Hero first:** Immediate emotional connection (nurse + patient)
- **Challenges next:** Establish pain points (builds urgency)
- **Features then:** Show the solution (mobile-first approach)
- **Demo last:** Capture leads when interest is peak

### Image Quality Standards
- **Format:** WebP (with JPG fallback)
- **Resolution:** 2x retina (1920px width for hero)
- **File Size:** < 200KB per image (compressed)
- **Style:** Natural lighting, authentic scenarios
- **Requirement:** REAL photos only (no AI-generated look)

---

## 💰 Cost Estimate

| Item | Cost | Source |
|------|------|--------|
| Unsplash images | $0 | Free (attribution required) |
| Pexels images | $0 | Free (no attribution) |
| Custom photography (optional) | $200-500 | Colombian photographer |
| Midjourney (if needed) | $10/mo | AI generation (backup only) |

**Total:** $0-500 depending on custom photography decision

---

## 🚨 Critical Reminders

1. **NO AI-looking images** - Luis specifically requested authentic photos
2. **Home care focus** - NOT hospital/clinical settings
3. **Demo form MUST be included** - Lead capture is critical
4. **Real product screenshot** - Not generic stock mockups
5. **Colombian context** - Prefer Latin American imagery when available

---

## 📊 Success Metrics

After launch, track:
- Page load time (< 3 seconds)
- Demo form submissions
- Bounce rate on hero section
- Mobile vs desktop traffic
- Time spent on Challenges section

---

**Last Updated:** 2026-01-30 15:45 UTC  
**Next Review:** After sub-agent completes image research
