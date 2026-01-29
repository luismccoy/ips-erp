import { test, expect } from '@playwright/test';

test.describe('Nurse Workflow Tests (CRITICAL)', () => {
  const baseUrl = 'https://main.d2wwgecog8smmr.amplifyapp.com';
  const nurseEmail = 'nurse@ips.com';
  const nursePassword = 'Test123!';

  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
    
    // Login as nurse
    await page.locator('input[type="email"]').fill(nurseEmail);
    await page.locator('input[type="password"]').fill(nursePassword);
    await page.locator('button:has-text("Ingresar")').click();
    
    // Wait for nurse dashboard to load
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Turnos')).toBeVisible({ timeout: 15000 });
  });

  test('CRITICAL: should start visit without crashing', async ({ page }) => {
    // This is the P0 bug that broke production
    
    // Find and click first patient shift card
    const shiftCard = page.locator('[data-testid="shift-card"], .shift-card, button:has-text("Iniciar")').first();
    await shiftCard.waitFor({ state: 'visible', timeout: 10000 });
    
    // Click "Iniciar Visita" button
    const startButton = page.locator('button:has-text("Iniciar Visita"), button:has-text("Iniciar")').first();
    await startButton.click();
    
    // CRITICAL: Wait for visit form to load WITHOUT crash
    await page.waitForLoadState('networkidle');
    
    // Verify NO error screen
    const errorScreen = await page.locator('text=Algo salió mal').count();
    expect(errorScreen).toBe(0);
    
    if (errorScreen > 0) {
      await page.screenshot({ 
        path: 'test-results/CRITICAL-iniciar-visita-crash.png',
        fullPage: true 
      });
      throw new Error('CRITICAL: Iniciar Visita crashed with "Algo salió mal" error');
    }
    
    // Verify visit documentation form loaded
    await expect(page.locator('text=KARDEX, text=Documentación')).toBeVisible({ timeout: 5000 });
  });

  test('should display clinical scales tab', async ({ page }) => {
    // Start a visit first
    const startButton = page.locator('button:has-text("Iniciar Visita"), button:has-text("Iniciar")').first();
    await startButton.click();
    await page.waitForLoadState('networkidle');
    
    // Look for Escalas Clínicas tab
    const clinicalScalesTab = page.locator('text=Escalas Clínicas');
    await expect(clinicalScalesTab).toBeVisible({ timeout: 10000 });
    
    // Click the tab
    await clinicalScalesTab.click();
    await page.waitForLoadState('networkidle');
  });

  test('should show all 8 clinical assessment scales', async ({ page }) => {
    // Start visit and navigate to clinical scales
    const startButton = page.locator('button:has-text("Iniciar Visita"), button:has-text("Iniciar")').first();
    await startButton.click();
    await page.waitForLoadState('networkidle');
    
    const clinicalScalesTab = page.locator('text=Escalas Clínicas');
    await clinicalScalesTab.click();
    await page.waitForTimeout(2000);
    
    // Verify all 8 scales are present
    const expectedScales = [
      'Glasgow',
      'Braden',
      'Morse',
      'NEWS',
      'Barthel',
      'Norton',
      'Pain',
      'RASS'
    ];
    
    for (const scale of expectedScales) {
      const scaleElement = page.locator(`text=${scale}`);
      await expect(scaleElement).toBeVisible({ 
        timeout: 5000 
      });
    }
  });

  test('should allow form submission', async ({ page }) => {
    // Start visit
    const startButton = page.locator('button:has-text("Iniciar Visita"), button:has-text("Iniciar")').first();
    await startButton.click();
    await page.waitForLoadState('networkidle');
    
    // Fill minimal required fields (if any)
    // Then submit
    const submitButton = page.locator('button:has-text("Guardar"), button:has-text("Submit"), button[type="submit"]').first();
    
    if (await submitButton.isVisible()) {
      await submitButton.click();
      
      // Verify no crash on submit
      await page.waitForLoadState('networkidle');
      const errorScreen = await page.locator('text=Algo salió mal').count();
      expect(errorScreen).toBe(0);
    }
  });
});
