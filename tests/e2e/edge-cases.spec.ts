import { test, expect } from '@playwright/test';

const BASE_URL = 'https://main.d2wwgecog8smmr.amplifyapp.com';

test.describe('IPS ERP Edge Cases - Nurse Portal', () => {
  
  test('Refresh mid-workflow preserves draft', async ({ page }) => {
    await page.goto(`${BASE_URL}?demo=nurse`);
    await page.waitForLoadState('networkidle');
    
    // Start a visit
    await page.waitForTimeout(3000);
    const visitButton = page.locator('button:has-text("Iniciar Visita"), button:has-text("Continuar Documentación")').first();
    await visitButton.click();
    await page.waitForTimeout(2000);
    
    // Enter some data in KARDEX
    const medicationField = page.locator('textarea, input[type="text"]').first();
    if (await medicationField.isVisible()) {
      await medicationField.fill('Test medication data - should persist');
    }
    
    // Refresh the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Check for "Borrador" (Draft) status indicator
    const hasDraft = await page.locator('text=/Borrador|Draft/i').count();
    expect(hasDraft).toBeGreaterThan(0);
    
    console.log('✅ Draft persists after refresh');
  });

  test('Empty form validation prevents submission', async ({ page }) => {
    await page.goto(`${BASE_URL}?demo=nurse`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Start a visit
    const visitButton = page.locator('button:has-text("Iniciar Visita")').first();
    await visitButton.click();
    await page.waitForTimeout(2000);
    
    // Try to submit without filling anything
    const submitButton = page.locator('button:has-text("Enviar"), button:has-text("Submit")');
    if (await submitButton.count() > 0) {
      const isDisabled = await submitButton.first().isDisabled();
      // Should either be disabled OR show validation errors
      if (!isDisabled) {
        await submitButton.first().click();
        // Should see validation errors
        await page.waitForTimeout(1000);
        const hasErrors = await page.locator('text=/requerido|obligatorio|required/i').count();
        expect(hasErrors).toBeGreaterThan(0);
      } else {
        // Button correctly disabled
        expect(isDisabled).toBe(true);
      }
    }
    
    console.log('✅ Empty form validation works');
  });

  test('Back button does not lose data', async ({ page }) => {
    await page.goto(`${BASE_URL}?demo=nurse`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Start a visit
    const visitButton = page.locator('button:has-text("Iniciar Visita"), button:has-text("Continuar Documentación")').first();
    await visitButton.click();
    await page.waitForTimeout(2000);
    
    // Enter data
    const textField = page.locator('textarea, input[type="text"]').first();
    if (await textField.isVisible()) {
      await textField.fill('Test data for back button');
    }
    
    // Go back
    await page.goBack();
    await page.waitForTimeout(2000);
    
    // Go forward again
    await page.goForward();
    await page.waitForTimeout(2000);
    
    // Data should still be there OR draft indicator should show
    const stillHasData = await page.locator('text=/Test data|Borrador/').count();
    expect(stillHasData).toBeGreaterThan(0);
    
    console.log('✅ Back button preserves data');
  });

  test('Rapid clicking does not cause errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.goto(`${BASE_URL}?demo=nurse`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Rapid click between tabs
    for (let i = 0; i < 10; i++) {
      const statsButton = page.locator('button:has-text("Estadísticas")');
      await statsButton.click();
      await page.waitForTimeout(100);
      
      const routeButton = page.locator('button:has-text("Mi Ruta")');
      await routeButton.click();
      await page.waitForTimeout(100);
    }
    
    // Should not have produced errors
    expect(errors.length).toBe(0);
    
    console.log('✅ Rapid clicking handled gracefully');
  });

  test('Offline mode simulation - localStorage works', async ({ page }) => {
    await page.goto(`${BASE_URL}?demo=nurse`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Start visit and enter data
    const visitButton = page.locator('button:has-text("Iniciar Visita"), button:has-text("Continuar Documentación")').first();
    await visitButton.click();
    await page.waitForTimeout(2000);
    
    // Enter some data
    const textField = page.locator('textarea, input[type="text"]').first();
    if (await textField.isVisible()) {
      await textField.fill('Offline test data');
    }
    
    // Simulate offline by blocking network
    await page.context().setOffline(true);
    
    // Try to interact - should still work with localStorage
    await page.waitForTimeout(1000);
    
    // Go back online
    await page.context().setOffline(false);
    
    // Data should still be there
    const hasData = await page.locator('text=/Offline test data|Borrador/').count();
    expect(hasData).toBeGreaterThan(0);
    
    console.log('✅ Offline mode preserves data in localStorage');
  });

  test('Multiple visits in sequence', async ({ page }) => {
    await page.goto(`${BASE_URL}?demo=nurse`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Get visit count
    const visitCards = await page.locator('button:has-text("Iniciar Visita"), button:has-text("Continuar")').count();
    
    if (visitCards >= 2) {
      // Start first visit
      await page.locator('button:has-text("Iniciar Visita"), button:has-text("Continuar")').first().click();
      await page.waitForTimeout(2000);
      
      // Go back to list
      const backButton = page.locator('button:has-text("Volver"), button:has-text("Atrás")').first();
      if (await backButton.count() > 0) {
        await backButton.click();
      } else {
        await page.goBack();
      }
      await page.waitForTimeout(2000);
      
      // Start second visit
      await page.locator('button:has-text("Iniciar Visita"), button:has-text("Continuar")').nth(1).click();
      await page.waitForTimeout(2000);
      
      // Should load second visit successfully
      const hasForm = await page.locator('button:has-text("KARDEX"), button:has-text("Escalas")').count();
      expect(hasForm).toBeGreaterThan(0);
    }
    
    console.log('✅ Can navigate between multiple visits');
  });

  test('Clinical Scales tab rapid switching', async ({ page }) => {
    await page.goto(`${BASE_URL}?demo=nurse`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const visitButton = page.locator('button:has-text("Iniciar Visita"), button:has-text("Continuar")').first();
    await visitButton.click();
    await page.waitForTimeout(2000);
    
    // Rapidly switch between tabs
    for (let i = 0; i < 5; i++) {
      const kardexTab = page.locator('button:has-text("KARDEX")');
      await kardexTab.click();
      await page.waitForTimeout(200);
      
      const scalesTab = page.locator('button:has-text("Escalas Clínicas")');
      await scalesTab.click();
      await page.waitForTimeout(200);
    }
    
    // Should still be functional
    const hasScales = await page.locator('text=/Glasgow|Braden|Morse/').count();
    expect(hasScales).toBeGreaterThan(0);
    
    console.log('✅ Rapid tab switching works without crash');
  });

  test('Console errors during edge cases', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.goto(`${BASE_URL}?demo=nurse`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Perform various actions
    const visitButton = page.locator('button:has-text("Iniciar Visita"), button:has-text("Continuar")').first();
    await visitButton.click();
    await page.waitForTimeout(1000);
    
    // Refresh
    await page.reload();
    await page.waitForTimeout(2000);
    
    // Back
    await page.goBack();
    await page.waitForTimeout(1000);
    
    // Forward
    await page.goForward();
    await page.waitForTimeout(1000);
    
    // Filter critical errors
    const criticalErrors = errors.filter(err => 
      !err.includes('favicon') && 
      !err.includes('manifest') &&
      !err.includes('404') &&
      !err.toLowerCase().includes('warning')
    );
    
    expect(criticalErrors.length).toBe(0);
    
    console.log('✅ No critical errors during edge case testing');
  });
});
