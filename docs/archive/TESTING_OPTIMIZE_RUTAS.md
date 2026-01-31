# Testing Guide: Optimize Rutas UX Improvements

## Quick Test Steps

### 1. Start the App in Demo Mode
```bash
cd ~/projects/ERP
npm run dev
```

### 2. Navigate to Shift Management
- Open the app: http://localhost:5173
- Login with demo credentials
- Go to "Programación de Turnos" section

### 3. Create Unassigned Shifts (if needed)
- Click "Nuevo Turno"
- Select a patient
- Choose "Leaving Unassigned" for nurse
- Set date/time and location
- Create 2-3 unassigned shifts

### 4. Test Optimization Flow
**Before clicking optimize:**
- Note which shifts show "Sin Asignar" (unassigned)
- Take a screenshot of current state

**Click "Optimizar Rutas (IA)" button:**
- Loading spinner should appear
- Button text changes to "Optimizando..."

**Modal should appear showing:**
- ✅ Green success header with Sparkles icon
- 📊 Three stat cards:
  - Number of shifts assigned
  - Optimization score percentage
  - Total travel time
- 📋 Detailed table with columns:
  - Patient name
  - Assigned nurse (with checkmark)
  - Location
  - Time

**Click "Entendido" (OK button):**
- Modal closes
- Watch for visual feedback (happens quickly!)

### 5. Verify Visual Feedback

**Immediately after modal closes:**
- [ ] Assigned rows have **green background**
- [ ] Green **pulse animation** (2 seconds)
- [ ] "✨ Recién Asignado" badge appears (with bounce)
- [ ] Check icon replaces clock icon
- [ ] Nurse name appears in **green text**
- [ ] Page **auto-scrolls** to first assigned shift

**After 5 seconds:**
- [ ] Green highlights **fade away**
- [ ] Badge disappears
- [ ] Nurse name remains (in normal color)
- [ ] Assignments are permanent

## Expected Results

### Before Optimization
```
┌──────────────────────────────────────┐
│ Maria Garcia                          │
│ 📍 Calle 10 #20-30                   │
│ 👤 Sin Asignar                       │ ← Gray text
│                           [PENDING]  │
└──────────────────────────────────────┘
```

### After Optimization (First 5 seconds)
```
┌──────────────────────────────────────┐  ← GREEN BACKGROUND
│ ✅ Maria Garcia  ✨ Recién Asignado  │  ← Bouncing badge
│ 📍 Calle 10 #20-30                   │
│ 👤 Enfermera Lopez                   │  ← GREEN text
│                           [PENDING]  │
└──────────────────────────────────────┘
     ↑ Pulsing animation
```

### After 5 Seconds
```
┌──────────────────────────────────────┐  ← Normal background
│ Maria Garcia                          │
│ 📍 Calle 10 #20-30                   │
│ 👤 Enfermera Lopez                   │  ← Gray text, but assigned!
│                           [PENDING]  │
└──────────────────────────────────────┘
```

## Edge Cases to Test

### 1. No Unassigned Shifts
- All shifts already have nurses
- Click "Optimizar Rutas"
- **Expected:** Alert saying "Todos los turnos ya están asignados"

### 2. Multiple Assignments
- Create 5+ unassigned shifts
- Optimize
- **Expected:** 
  - Modal shows all assignments in table
  - All rows highlight simultaneously
  - Scrolls to first one

### 3. Single Assignment
- Create 1 unassigned shift
- Optimize
- **Expected:**
  - Modal shows 1 assignment
  - That row highlights
  - Auto-scrolls to it

## Browser DevTools Checks

### Console Logs
- No errors should appear
- Look for: `AI Roster Response:` log

### Network Tab
- Check `generateRoster` GraphQL call
- Verify response contains assignments

### Animation Check
Open DevTools > Animations panel:
- Should see `pulse-green` animation (2s duration)
- Should see `bounce` animation on badge

## Troubleshooting

### Highlights Don't Appear
- **Check:** CSS animation loaded?
- **Fix:** Hard refresh (Ctrl+Shift+R)
- **Verify:** `index.css` has `@keyframes pulse-green`

### Modal Doesn't Show Details
- **Check:** Console for errors
- **Verify:** `optimizationResult` state is populated
- **Debug:** Add `console.log(optimizationResult)` before modal

### Auto-scroll Doesn't Work
- **Check:** Are shift IDs set correctly?
- **Verify:** `id="shift-{id}"` exists in DOM
- **Debug:** Check if `setTimeout` is executing

### Assignments Don't Persist
- **Check:** Is `setItems()` called?
- **Verify:** Shifts array updated correctly
- **Debug:** Console log `updatedShifts`

## Performance Checklist
- [ ] Animations are smooth (60fps)
- [ ] No lag when rendering multiple shifts
- [ ] Modal opens instantly
- [ ] Highlights clear cleanly after 5s
- [ ] No memory leaks (check DevTools > Memory)

## Accessibility Checklist
- [ ] Modal can be closed with Escape key (if implemented)
- [ ] Focus moves to modal when it opens
- [ ] Badge text is readable (high contrast)
- [ ] Table is keyboard navigable
- [ ] Screen reader announces success

## Demo Recording Checklist
Record a video showing:
1. Starting state (unassigned shifts)
2. Clicking optimize button
3. Modal with detailed results
4. Visual feedback (highlights, badges)
5. Auto-scroll effect
6. Highlights fading after 5 seconds

## Success Criteria
✅ User can clearly see what was optimized
✅ User knows which nurses were assigned
✅ Visual feedback is immediate and obvious
✅ Changes persist after highlights fade
✅ No confusion about what changed

## Notes
- Feature works in **demo mode** (no backend required)
- Uses mock AI response for testing
- Animation duration: 5 seconds
- Pulse speed: 2 seconds per cycle
- Modal z-index: 50 (appears above everything)
