import { test, expect } from '@playwright/test';

test.describe('Nurse Workflow - Manual Run', () => {
  const baseUrl = 'https://main.d2wwgecog8smmr.amplifyapp.com';
  const nurseEmail = 'nurse@ips.com';
  const nursePassword = 'Test123!';

  test('Complete nurse workflow test', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(`[${msg.type()}] ${msg.text()}`);
      }
    });

    // Navigate and login
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');
    
    // Click "Iniciar Sesión"
    const loginButton = page.locator('button:has-text("Iniciar Sesión"), a:has-text("Iniciar Sesión")').first();
    if (await loginButton.count() > 0) {
      await loginButton.click();
      await page.waitForLoadState('networkidle');
    }
    
    // Fill login form
    await page.locator('input[type="email"], input[name="email"]').fill(nurseEmail);
    await page.locator('input[type="password"], input[name="password"]').fill(nursePassword);
    await page.locator('button:has-text("Ingresar"), button[type="submit"]').click();
    
    // Wait for nurse dashboard
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Take screenshot of nurse dashboard
    await page.screenshot({ path: 'test-results/nurse-dashboard.png', fullPage: true });
    
    // Look for shift cards and "Iniciar Visita" button
    const shiftCards = await page.locator('button:has-text("Iniciar"), button:has-text("Iniciar Visita")').count();
    console.log(`Found ${shiftCards} shift card(s) with start button`);
    
    if (shiftCards > 0) {
      // Click first "Iniciar Visita" button
      await page.locator('button:has-text("Iniciar"), button:has-text("Iniciar Visita")').first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Check for error screen
      const errorScreen = await page.locator('text=Algo salió mal').count();
      console.log(`Error screen present: ${errorScreen > 0 ? 'YES - FAILED' : 'NO - PASSED'}`);
      
      // Take screenshot of visit form or error
      await page.screenshot({ path: 'test-results/nurse-visit-form.png', fullPage: true });
      
      // Look for clinical scales tab
      const scalesTab = await page.locator('text=Escalas Clínicas, button:has-text("Escalas")').count();
      console.log(`Clinical scales tab found: ${scalesTab > 0 ? 'YES' : 'NO'}`);
      
      if (scalesTab > 0) {
        await page.locator('text=Escalas Clínicas, button:has-text("Escalas")').first().click();
        await page.waitForTimeout(1000);
        
        // Check for all 8 scales
        const scales = ['Glasgow', 'Braden', 'Morse', 'NEWS', 'Barthel', 'Norton', 'Pain', 'RASS'];
        for (const scale of scales) {
          const found = await page.locator(`text=${scale}`).count();
          console.log(`Scale "${scale}": ${found > 0 ? 'FOUND' : 'MISSING'}`);
        }
        
        await page.screenshot({ path: 'test-results/nurse-clinical-scales.png', fullPage: true });
      }
      
      // Report console errors
      if (consoleErrors.length > 0) {
        console.log('\n=== CONSOLE ERRORS ===');
        consoleErrors.forEach(err => console.log(err));
      }
    } else {
      console.log('NO SHIFT CARDS FOUND - Cannot test visit workflow');
    }
  });
});
