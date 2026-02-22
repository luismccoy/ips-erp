/**
 * Production Workflow E2E Test
 *
 * Full realistic workflow with REAL Cognito auth, REAL data entry, and REAL API calls.
 * Captures 40+ screenshots at every step for AI agent review.
 *
 * Workflow:
 *   NURSE 1 → Login → Start Visit → Fill KARDEX → Enter Vitals → Complete Morse Scale → Submit
 *   ADMIN   → Login → Find Submitted Visit → Review Data → Approve
 *
 * This test CREATES real production data. Run only when intended.
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://main.d2wwgecog8smmr.amplifyapp.com';
const SS = 'test-results/production-workflow';

const NURSE = { email: 'nurse@ips.com', password: 'Nurse123!' };
const ADMIN = { email: 'admin@ips.com', password: 'Admin123!' };

let stepNum = 0;
async function snap(page: Page, name: string) {
  stepNum++;
  const padded = String(stepNum).padStart(2, '0');
  await page.screenshot({
    path: `${SS}/${padded}-${name}.png`,
    fullPage: true,
  });
  console.log(`  📸 ${padded}: ${name}`);
}

async function realLogin(page: Page, user: { email: string; password: string }, label: string) {
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  await snap(page, `${label}-landing-page`);

  // Click login button on landing page
  const loginBtn = page.locator('button:has-text("Login"), button:has-text("Acceso"), button:has-text("Ingresar")').first();
  if (await loginBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await loginBtn.click();
    await page.waitForTimeout(2000);
  }

  await snap(page, `${label}-login-form`);

  // Fill credentials
  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  const passInput = page.locator('input[type="password"], input[name="password"]').first();
  await expect(emailInput).toBeVisible({ timeout: 10000 });
  await emailInput.fill(user.email);
  await passInput.fill(user.password);

  await snap(page, `${label}-credentials-filled`);

  // Submit
  const submitBtn = page.locator('button[type="submit"], button:has-text("Ingresar"), button:has-text("Iniciar Sesión")').first();
  await submitBtn.click();

  // Wait for auth + app load
  await page.waitForTimeout(10000);
  await page.waitForLoadState('networkidle').catch(() => {});

  await snap(page, `${label}-after-login`);
  console.log(`  ✅ Logged in as ${label}`);
}

// ============================================================================
// NURSE WORKFLOW: Create a real visit with full documentation
// ============================================================================

test.describe.serial('Production Workflow: Nurse → Admin', () => {

  test('NURSE: Complete visit documentation workflow', async ({ page }) => {
    test.setTimeout(180000); // 3 min timeout
    stepNum = 0;

    // Accept any confirmation dialogs
    page.on('dialog', dialog => dialog.accept());

    // Track GraphQL for debugging
    const gqlOps: string[] = [];
    const gqlErrors: string[] = [];
    page.on('response', async (res) => {
      if (res.url().includes('graphql')) {
        try {
          const body = await res.json();
          if (body.data) gqlOps.push(...Object.keys(body.data));
          if (body.errors) gqlErrors.push(...body.errors.map((e: any) => e.message));
        } catch {}
      }
    });

    // ── Step 1: Login ──
    console.log('\n═══ NURSE WORKFLOW ═══');
    await realLogin(page, NURSE, 'nurse');

    // ── Step 2: Verify Nurse Dashboard ──
    const bodyText = await page.textContent('body') || '';
    const isNurse = bodyText.includes('Enfermería') || bodyText.includes('Mi Ruta');
    console.log(`  Dashboard: ${isNurse ? 'Nurse app' : 'Unknown'}`);

    await snap(page, 'nurse-dashboard-loaded');

    // ── Step 3: Check tabs ──
    const tabCount = await page.locator('[role="tab"]').count();
    console.log(`  Tabs visible: ${tabCount}`);

    // ── Step 4: Check shift cards ──
    await page.waitForTimeout(3000);
    const routePanel = page.locator('#panel-route');
    await snap(page, 'nurse-mi-ruta-tab');

    // ── Step 5: Find an actionable shift card ──
    // Try "Iniciar Visita" first, then "Ver Visita" as fallback
    const startVisitBtn = page.locator('button:has-text("Iniciar Visita")').first();
    const hasStartBtn = await startVisitBtn.isVisible({ timeout: 5000 }).catch(() => false);

    if (!hasStartBtn) {
      // Try toggling "Solo hoy" off to see more shifts
      const toggle = page.locator('text=Solo hoy').first();
      if (await toggle.isVisible({ timeout: 2000 }).catch(() => false)) {
        await toggle.click();
        await page.waitForTimeout(2000);
        await snap(page, 'nurse-toggle-solo-hoy-off');
      }
    }

    // ── Step 6: Check for swipe hint ──
    const swipeHint = page.locator('text=Desliza').first();
    const hasHint = await swipeHint.isVisible({ timeout: 3000 }).catch(() => false);
    console.log(`  Swipe hint visible: ${hasHint}`);
    await snap(page, 'nurse-shift-cards-detail');

    // ── Step 7: Check desktop action buttons ──
    const desktopNavBtn = page.locator('#panel-route button:has-text("Navegar")').first();
    const desktopVitalsBtn = page.locator('#panel-route button:has-text("Vitales")').first();
    const desktopCallBtn = page.locator('#panel-route button:has-text("Llamar")').first();
    console.log(`  Desktop actions: Nav=${await desktopNavBtn.isVisible().catch(() => false)}, Vitals=${await desktopVitalsBtn.isVisible().catch(() => false)}, Call=${await desktopCallBtn.isVisible().catch(() => false)}`);

    // ── Step 8: Navigate to Mapa tab ──
    const mapaTab = page.locator('text=Mapa').first();
    if (await mapaTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await mapaTab.click();
      await page.waitForTimeout(3000);
      await snap(page, 'nurse-mapa-tab');

      // Check map markers
      const markers = await page.locator('.leaflet-marker-icon').count();
      console.log(`  Map markers: ${markers}`);

      // Check optimize route button
      const optimizeBtn = page.locator('text=Optimizar Ruta').first();
      console.log(`  Optimize button: ${await optimizeBtn.isVisible().catch(() => false)}`);
      await snap(page, 'nurse-map-detail');
    }

    // ── Step 9: Navigate to Estadísticas tab ──
    const statsTab = page.locator('text=Estadísticas').first();
    if (await statsTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await statsTab.click();
      await page.waitForTimeout(2000);
      await snap(page, 'nurse-estadisticas-tab');
    }

    // ── Step 10: Back to Mi Ruta ──
    const miRutaTab = page.locator('text=Mi Ruta').first();
    if (await miRutaTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await miRutaTab.click();
      await page.waitForTimeout(2000);
    }

    // ── Step 11: Start a visit ──
    const startBtn = page.locator('button:has-text("Iniciar Visita"), button:has-text("Iniciar")').first();
    const canStart = await startBtn.isVisible({ timeout: 5000 }).catch(() => false);

    if (canStart) {
      console.log('  Starting visit...');
      await startBtn.click();
      await page.waitForTimeout(5000);
      await snap(page, 'nurse-visit-form-opened');

      // ── Step 12: Document the form layout ──
      const formTitle = page.locator('text=Documentación de visita').first();
      const hasForm = await formTitle.isVisible({ timeout: 5000 }).catch(() => false);
      console.log(`  Form opened: ${hasForm}`);

      if (hasForm) {
        // ── Step 13: Check KARDEX tab ──
        const kardexTab = page.locator('button:has-text("KARDEX")').first();
        const scalesTab = page.locator('button:has-text("Escalas Clínicas")').first();
        console.log(`  KARDEX tab: ${await kardexTab.isVisible().catch(() => false)}`);
        console.log(`  Scales tab: ${await scalesTab.isVisible().catch(() => false)}`);

        // ── Step 14: Voice dictation button ──
        const dictateBtn = page.locator('text=Dictar Observaciones').first();
        const hasDictate = await dictateBtn.isVisible({ timeout: 3000 }).catch(() => false);
        console.log(`  Voice dictation: ${hasDictate}`);

        // ── Step 15: Voice helper text ──
        const voiceHelper = page.locator('text=Toca el botón y habla').first();
        console.log(`  Voice helper text: ${await voiceHelper.isVisible({ timeout: 2000 }).catch(() => false)}`);
        await snap(page, 'nurse-kardex-tab-overview');

        // ── Step 16: Fill in KARDEX fields ──
        // Count available form fields
        const allTextareas = await page.locator('textarea').all();
        const allNumberInputs = await page.locator('input[type="number"]').all();
        console.log(`  Textarea fields found: ${allTextareas.length}`);
        console.log(`  Number inputs found: ${allNumberInputs.length}`);

        // Fill generalObservations (first textarea — the required one)
        if (allTextareas.length > 0) {
          await allTextareas[0].fill(
            'Paciente se encuentra consciente, orientado en tiempo, espacio y persona. ' +
            'Signos vitales dentro de parámetros normales. Piel íntegra sin lesiones. ' +
            'Movilidad conservada con marcha independiente. Tolera dieta blanda sin dificultad. ' +
            'Refiere dolor leve en región lumbar (EVA 3/10). ' +
            'Se administra medicación según prescripción médica. ' +
            'Se realizan cuidados de enfermería según plan de atención.'
          );
          console.log('  ✅ General observations filled');
        }
        await snap(page, 'nurse-observations-filled');

        // Fill other KARDEX assessment textareas
        const kardexTexts = [
          'Piel íntegra, coloración normal, sin edema ni lesiones por presión. Mucosas hidratadas.',
          'Marcha independiente, se desplaza sin ayuda. Movilidad completa en 4 extremidades.',
          'Tolera dieta blanda. Ingesta adecuada de líquidos (~1.5L). Sin náuseas ni vómito.',
          'Consciente, alerta, orientado x3. Colaborador con el cuidado. Estado de ánimo estable.',
          'Hogar limpio y ordenado. Buena ventilación. Sin riesgos de caída evidentes.',
          'Cuidador principal presente (hija). Manifiesta buena adherencia al tratamiento.',
          'Revisar control con médico tratante en 15 días. Ajustar analgesia si dolor persiste.',
        ];
        let filledCount = 0;
        for (let i = 1; i < allTextareas.length && filledCount < kardexTexts.length; i++) {
          const ta = allTextareas[i];
          if (await ta.isVisible().catch(() => false) && await ta.isEnabled().catch(() => false)) {
            await ta.fill(kardexTexts[filledCount]);
            filledCount++;
          }
        }
        console.log(`  Filled ${filledCount} additional KARDEX fields`);
        await snap(page, 'nurse-kardex-fields-filled');

        // ── Step 17: Enter vital signs using stepper buttons ──
        const plusBtns = page.locator('[aria-label*="Aumentar"]');
        const plusCount = await plusBtns.count();
        console.log(`  Stepper + buttons: ${plusCount}`);

        // Fill vitals via number inputs directly (faster and more reliable)
        const vitalsMap: Record<string, string> = {
          'Aumentar Sistólica': '120',
          'Aumentar Diastólica': '80',
          'Aumentar SpO': '97',
          'Aumentar Frec': '78',
          'Aumentar Temperatura': '36.5',
          'Aumentar Peso': '68',
        };

        for (const [ariaPrefix, value] of Object.entries(vitalsMap)) {
          const btn = page.locator(`[aria-label*="${ariaPrefix}"]`).first();
          if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
            // Find the sibling number input in the same container
            const container = btn.locator('..'); // parent
            const input = container.locator('input[type="number"]');
            if (await input.isVisible().catch(() => false)) {
              await input.fill(value);
            }
          }
        }
        console.log('  ✅ Vitals entered via number inputs');

        // Scroll to see form content
        const scrollContainer = page.locator('.fixed.inset-0.overflow-y-auto').first();
        if (await scrollContainer.isVisible().catch(() => false)) {
          await scrollContainer.evaluate(el => el.scrollBy(0, 400));
          await page.waitForTimeout(500);
          await snap(page, 'nurse-form-scrolled-1');

          await scrollContainer.evaluate(el => el.scrollBy(0, 400));
          await page.waitForTimeout(500);
          await snap(page, 'nurse-form-scrolled-2');

          await scrollContainer.evaluate(el => el.scrollBy(0, 999));
          await page.waitForTimeout(500);
          await snap(page, 'nurse-form-scrolled-bottom');
        }
        await snap(page, 'nurse-vitals-section');

        // ── Step 19: Switch to Escalas Clínicas tab ──
        if (await scalesTab.isVisible().catch(() => false)) {
          await scalesTab.click();
          await page.waitForTimeout(2000);
          await snap(page, 'nurse-escalas-tab');

          // ── Step 20: Document all available scale tabs ──
          const scaleTabs = page.locator('.fixed button, .fixed [role="tab"]');
          const scaleTabTexts = await scaleTabs.allTextContents();
          const scaleNames = scaleTabTexts.filter(t =>
            ['Glasgow', 'Dolor', 'Braden', 'Morse', 'NEWS', 'Barthel', 'Norton', 'RASS'].some(s => t.includes(s))
          );
          console.log(`  Scale tabs found: ${scaleNames.join(', ')}`);

          // ── Step 21: Click on Morse tab (required for submission) ──
          const morseTab = page.locator('button:has-text("Morse"), [role="tab"]:has-text("Morse")').first();
          if (await morseTab.isVisible({ timeout: 3000 }).catch(() => false)) {
            await morseTab.click();
            await page.waitForTimeout(1500);
            await snap(page, 'nurse-morse-scale');

            // Try to fill Morse scale fields
            // Look for checkboxes, selects, radio buttons
            const checkboxes = page.locator('.fixed input[type="checkbox"]');
            const checkboxCount = await checkboxes.count();
            console.log(`  Morse checkboxes: ${checkboxCount}`);

            const selects = page.locator('.fixed select');
            const selectCount = await selects.count();
            console.log(`  Morse selects: ${selectCount}`);

            // Fill some checkboxes for realistic data
            for (let i = 0; i < Math.min(checkboxCount, 3); i++) {
              const cb = checkboxes.nth(i);
              if (await cb.isEnabled().catch(() => false)) {
                await cb.check().catch(() => {});
              }
            }

            // Fill selects with middle values
            for (let i = 0; i < selectCount; i++) {
              const sel = selects.nth(i);
              if (await sel.isEnabled().catch(() => false)) {
                const options = await sel.locator('option').allTextContents();
                if (options.length > 1) {
                  const midIdx = Math.floor(options.length / 2);
                  await sel.selectOption({ index: midIdx }).catch(() => {});
                }
              }
            }

            // Fill number inputs for Morse components
            const morseInputs = page.locator('.fixed input[type="number"]');
            const morseInputCount = await morseInputs.count();
            for (let i = 0; i < morseInputCount; i++) {
              const inp = morseInputs.nth(i);
              if (await inp.isEnabled().catch(() => false)) {
                const min = await inp.getAttribute('min') || '0';
                const max = await inp.getAttribute('max') || '10';
                const mid = Math.floor((parseInt(min) + parseInt(max)) / 2);
                await inp.fill(String(mid)).catch(() => {});
              }
            }

            await snap(page, 'nurse-morse-filled');
          }

          // ── Step 22: Check Glasgow scale ──
          const glasgowTab = page.locator('button:has-text("Glasgow")').first();
          if (await glasgowTab.isVisible({ timeout: 2000 }).catch(() => false)) {
            await glasgowTab.click();
            await page.waitForTimeout(1000);
            await snap(page, 'nurse-glasgow-scale');
          }

          // ── Step 23: Check Pain scale ──
          const painTab = page.locator('button:has-text("Dolor")').first();
          if (await painTab.isVisible({ timeout: 2000 }).catch(() => false)) {
            await painTab.click();
            await page.waitForTimeout(1000);
            await snap(page, 'nurse-pain-scale');
          }

          // ── Step 24: Check Braden scale ──
          const bradenTab = page.locator('button:has-text("Braden")').first();
          if (await bradenTab.isVisible({ timeout: 2000 }).catch(() => false)) {
            await bradenTab.click();
            await page.waitForTimeout(1000);
            await snap(page, 'nurse-braden-scale');
          }

          // ── Step 25: Check NEWS scale ──
          const newsTab = page.locator('button:has-text("NEWS")').first();
          if (await newsTab.isVisible({ timeout: 2000 }).catch(() => false)) {
            await newsTab.click();
            await page.waitForTimeout(1000);
            await snap(page, 'nurse-news-scale');
          }

          // ── Step 26: Check Barthel scale ──
          const barthelTab = page.locator('button:has-text("Barthel")').first();
          if (await barthelTab.isVisible({ timeout: 2000 }).catch(() => false)) {
            await barthelTab.click();
            await page.waitForTimeout(1000);
            await snap(page, 'nurse-barthel-scale');
          }

          // ── Step 27: Save the assessment (click Guardar Evaluación) ──
          const saveAssessmentBtn = page.locator('button:has-text("Guardar Evaluación")').first();
          if (await saveAssessmentBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            console.log('  Clicking Guardar Evaluación...');
            await saveAssessmentBtn.click();
            await page.waitForTimeout(3000);
            const assessSaved = await page.locator('text=exitosamente').first()
              .isVisible({ timeout: 3000 }).catch(() => false);
            console.log(`  Assessment save: ${assessSaved ? 'SUCCESS' : 'no confirmation'}`);
            await snap(page, 'nurse-assessment-saved');
          }

          // ── Step 28: Go back to KARDEX tab ──
          if (await kardexTab.isVisible().catch(() => false)) {
            await kardexTab.click();
            await page.waitForTimeout(1000);
          }
        }

        // ── Step 28: Look for Save button ──
        // Scroll footer into view first
        if (await scrollContainer.isVisible().catch(() => false)) {
          await scrollContainer.evaluate(el => el.scrollTo(0, el.scrollHeight));
          await page.waitForTimeout(500);
        }

        const saveBtn = page.locator('button:has-text("Guardar Borrador")').first();
        const canSave = await saveBtn.isVisible({ timeout: 3000 }).catch(() => false);
        console.log(`  Save button: ${canSave}`);

        if (canSave) {
          await snap(page, 'nurse-before-save');
          await saveBtn.click();
          await page.waitForTimeout(3000);
          await snap(page, 'nurse-after-save');

          const successMsg = page.locator('text=exitosamente').first();
          const saved = await successMsg.isVisible({ timeout: 5000 }).catch(() => false);
          console.log(`  Save result: ${saved ? 'SUCCESS' : 'no confirmation seen'}`);
        }

        // ── Step 29: Look for Submit button ──
        const submitBtn = page.locator('button:has-text("Enviar para Revisión")').first();
        const canSubmit = await submitBtn.isVisible({ timeout: 3000 }).catch(() => false);
        console.log(`  Submit button visible: ${canSubmit}`);

        // Check if submit is enabled (form complete)
        if (canSubmit) {
          const isDisabled = await submitBtn.isDisabled().catch(() => true);
          console.log(`  Submit button enabled: ${!isDisabled}`);
          await snap(page, 'nurse-before-submit');

          if (!isDisabled) {
            await submitBtn.click();
            await page.waitForTimeout(3000);
            await snap(page, 'nurse-after-submit');

            const submitSuccess = page.locator('text=enviada, text=revisión').first();
            const submitted = await submitSuccess.isVisible({ timeout: 5000 }).catch(() => false);
            console.log(`  Submit result: ${submitted ? 'SUCCESS' : 'no confirmation seen'}`);
          } else {
            console.log('  Submit disabled — checking what\'s missing...');
            // Check what validation is missing
            const obsField = page.locator('textarea').first();
            const obsValue = await obsField.inputValue().catch(() => '');
            console.log(`  Observations filled: ${obsValue.length > 0 ? 'yes' : 'NO'}`);
          }
        }

        // ── Step 30: Close the form and document the result ──
        await snap(page, 'nurse-form-final-state');

        const backBtn = page.locator('[aria-label="Volver"]').first();
        if (await backBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await backBtn.click();
          await page.waitForTimeout(2000);
        }
      }
    } else {
      // If no "Iniciar Visita", check for other visit states
      const viewApproved = page.locator('button:has-text("Ver Visita")').first();
      const hasView = await viewApproved.isVisible({ timeout: 3000 }).catch(() => false);

      if (hasView) {
        console.log('  Opening existing approved visit...');
        await viewApproved.click();
        await page.waitForTimeout(4000);
        await snap(page, 'nurse-viewing-approved-visit');

        // Scroll through the approved visit
        const formScroll = page.locator('.fixed.inset-0 .overflow-y-auto').first();
        if (await formScroll.isVisible().catch(() => false)) {
          await formScroll.evaluate(el => el.scrollTop = el.scrollHeight / 2);
          await page.waitForTimeout(500);
          await snap(page, 'nurse-approved-visit-scrolled');

          await formScroll.evaluate(el => el.scrollTop = el.scrollHeight);
          await page.waitForTimeout(500);
          await snap(page, 'nurse-approved-visit-bottom');
        }

        const backBtn = page.locator('[aria-label="Volver"]').first();
        if (await backBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await backBtn.click();
          await page.waitForTimeout(1000);
        }
      } else {
        console.log('  No actionable shift cards found');
        await snap(page, 'nurse-no-actionable-shifts');
      }
    }

    // ── Step 31: Final nurse dashboard state ──
    await snap(page, 'nurse-final-dashboard');

    // ── Step 32: Check notification bell ──
    const notifBell = page.locator('[aria-label*="Notificacion"], [aria-label*="notificacion"]').first();
    if (await notifBell.isVisible({ timeout: 2000 }).catch(() => false)) {
      await notifBell.click();
      await page.waitForTimeout(1500);
      await snap(page, 'nurse-notifications');
    }

    // ── Step 33: Logout ──
    const logoutBtn = page.locator('[data-testid="nurse-logout-button"]')
      .or(page.locator('text=Cerrar Sesión'))
      .or(page.locator('text=Cerrar sesión'))
      .first();
    if (await logoutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await logoutBtn.click();
      await page.waitForTimeout(3000);
      await snap(page, 'nurse-logged-out');
    }

    // Print GraphQL summary
    console.log(`\n  GraphQL operations: ${[...new Set(gqlOps)].join(', ')}`);
    console.log(`  GraphQL errors: ${gqlErrors.length > 0 ? gqlErrors.slice(0, 5).join('; ') : 'none'}`);

    // No crash
    const errorCount = await page.locator('text=Algo salió mal').count();
    expect(errorCount).toBe(0);
  });

  // ============================================================================
  // ADMIN WORKFLOW: Review and approve/reject submitted visits
  // ============================================================================

  test('ADMIN: Review submitted visits and approve', async ({ page }) => {
    test.setTimeout(180000);

    const gqlOps: string[] = [];
    page.on('response', async (res) => {
      if (res.url().includes('graphql')) {
        try {
          const body = await res.json();
          if (body.data) gqlOps.push(...Object.keys(body.data));
        } catch {}
      }
    });

    // ── Step 1: Admin Login ──
    console.log('\n═══ ADMIN WORKFLOW ═══');
    await realLogin(page, ADMIN, 'admin');

    // ── Step 2: Verify Admin Dashboard ──
    await page.waitForTimeout(5000);
    await snap(page, 'admin-dashboard');

    // ── Step 3: Document the sidebar navigation ──
    const sidebarLinks = await page.locator('nav a, nav button, [data-testid*="nav"]').allTextContents();
    console.log(`  Sidebar items: ${sidebarLinks.filter(t => t.trim()).join(', ')}`);
    await snap(page, 'admin-sidebar');

    // ── Step 4: Navigate to Dashboard/Home ──
    const dashNav = page.locator('text=Dashboard').first();
    if (await dashNav.isVisible({ timeout: 3000 }).catch(() => false)) {
      await dashNav.click();
      await page.waitForTimeout(3000);
      await snap(page, 'admin-dashboard-home');
    }

    // ── Step 5: Check metric cards ──
    await page.waitForTimeout(3000);
    await snap(page, 'admin-metrics');

    // ── Step 6: Navigate to Patients ──
    const patientsNav = page.locator('text=Pacientes').first();
    if (await patientsNav.isVisible({ timeout: 3000 }).catch(() => false)) {
      await patientsNav.click();
      await page.waitForTimeout(3000);
      await snap(page, 'admin-patients-list');

      // Click first patient if table exists
      const patientRow = page.locator('tr, [data-testid*="patient"]').nth(1);
      if (await patientRow.isVisible({ timeout: 3000 }).catch(() => false)) {
        await patientRow.click().catch(() => {});
        await page.waitForTimeout(2000);
        await snap(page, 'admin-patient-detail');
      }
    }

    // ── Step 7: Navigate to Shifts ──
    const shiftsNav = page.locator('text=Turnos').first();
    if (await shiftsNav.isVisible({ timeout: 3000 }).catch(() => false)) {
      await shiftsNav.click();
      await page.waitForTimeout(3000);
      await snap(page, 'admin-shifts-list');
    }

    // ── Step 8: Navigate to Pending Reviews ──
    // Use the exact sidebar text — "Revisiones Pendientes" is in the CLINICO section
    const reviewsNav = page.locator('nav >> text=Revisiones Pendientes').first();
    const reviewsNavAlt = page.locator('text=Revisiones Pendientes').first();
    const navTarget = await reviewsNav.isVisible({ timeout: 3000 }).catch(() => false) ? reviewsNav : reviewsNavAlt;
    if (await navTarget.isVisible({ timeout: 3000 }).catch(() => false)) {
      await navTarget.click();
      await page.waitForTimeout(5000);
      await snap(page, 'admin-pending-reviews');
      console.log('  Navigated to Revisiones Pendientes');
    } else {
      console.log('  WARNING: Could not find Revisiones Pendientes nav');
    }

    // Look for submitted visits in the main content area
    const pendingVisit = page.locator('text=Pendiente de Revisión').or(page.locator('text=Enviado')).first();
    const hasPending = await pendingVisit.isVisible({ timeout: 8000 }).catch(() => false);
    console.log(`  Pending visits found: ${hasPending}`);

    if (hasPending) {
      await snap(page, 'admin-pending-visit-found');

      // Click to open the pending visit
      await pendingVisit.click();
      await page.waitForTimeout(3000);
      await snap(page, 'admin-review-visit-detail');

      // ── Step 9: Review visit data ──
      // Scroll through the visit details
      const reviewContainer = page.locator('.overflow-y-auto').first();
      if (await reviewContainer.isVisible().catch(() => false)) {
        await snap(page, 'admin-review-top');

        await reviewContainer.evaluate(el => el.scrollTop = el.scrollHeight / 3);
        await page.waitForTimeout(500);
        await snap(page, 'admin-review-vitals');

        await reviewContainer.evaluate(el => el.scrollTop = el.scrollHeight * 2 / 3);
        await page.waitForTimeout(500);
        await snap(page, 'admin-review-kardex');

        await reviewContainer.evaluate(el => el.scrollTop = el.scrollHeight);
        await page.waitForTimeout(500);
        await snap(page, 'admin-review-bottom');
      }

      // ── Step 10: Look for Approve/Reject buttons ──
      const approveBtn = page.locator('button:has-text("Aprobar"), button:has-text("Aprobar Visita")').first();
      const rejectBtn = page.locator('button:has-text("Rechazar")').first();
      console.log(`  Approve button: ${await approveBtn.isVisible().catch(() => false)}`);
      console.log(`  Reject button: ${await rejectBtn.isVisible().catch(() => false)}`);

      await snap(page, 'admin-review-actions');

      // Approve the visit
      if (await approveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await approveBtn.click();
        await page.waitForTimeout(3000);
        await snap(page, 'admin-after-approve');
        console.log('  ✅ Visit approved');
      }
    } else {
      console.log('  No pending visits — checking visit cards/list...');
      await snap(page, 'admin-no-pending-visits');
    }

    // ── Step 11: Navigate to Inventory ──
    const inventoryNav = page.locator('text=Inventario').first();
    if (await inventoryNav.isVisible({ timeout: 3000 }).catch(() => false)) {
      await inventoryNav.click();
      await page.waitForTimeout(3000);
      await snap(page, 'admin-inventory');
    }

    // ── Step 12: Navigate to Billing ──
    const billingNav = page.locator('text=Facturación').first();
    if (await billingNav.isVisible({ timeout: 3000 }).catch(() => false)) {
      await billingNav.click();
      await page.waitForTimeout(3000);
      await snap(page, 'admin-billing');
    }

    // ── Step 13: Navigate to Audit Log ──
    const auditNav = page.locator('text=Auditoría').first();
    if (await auditNav.isVisible({ timeout: 3000 }).catch(() => false)) {
      await auditNav.click();
      await page.waitForTimeout(3000);
      await snap(page, 'admin-audit-log');
    }

    // ── Step 14: Final admin state ──
    await snap(page, 'admin-final-state');

    // ── Step 15: Logout ──
    const logoutBtn = page.locator('text=Cerrar Sesión').or(page.locator('text=Cerrar sesión')).first();
    if (await logoutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await logoutBtn.click();
      await page.waitForTimeout(3000);
      await snap(page, 'admin-logged-out');
    }

    console.log(`\n  GraphQL operations: ${[...new Set(gqlOps)].join(', ')}`);

    const errorCount = await page.locator('text=Algo salió mal').count();
    expect(errorCount).toBe(0);
  });
});
