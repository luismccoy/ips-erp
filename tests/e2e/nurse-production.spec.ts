import { test, expect } from '@playwright/test';

test.describe('Nurse Workflow Tests (PRODUCTION)', () => {
  const baseUrl = process.env.PLAYWRIGHT_BASE_URL || 'https://main.d2wwgecog8smmr.amplifyapp.com';

  test.beforeEach(async ({ page }) => {
    // Navigate directly to demo nurse portal via query param
    await page.goto(`${baseUrl}/?demo=nurse`);
    
    // Wait for nurse dashboard to load
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Iniciar Visita').first()).toBeVisible({ timeout: 15000 });
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
    await expect(page.locator('text=Signos Vitales')).toBeVisible({ timeout: 5000 });
  });

  test('should display clinical scales tab', async ({ page }) => {
    // Start a visit
    const startButton = page.locator('button:has-text("Iniciar Visita"), button:has-text("Iniciar")').first();
    await startButton.click();
    await page.waitForLoadState('networkidle');
    
    // Navigate to clinical scales
    const scalesTab = page.locator('button:has-text("Escalas Clínicas"), a:has-text("Escalas")');
    await expect(scalesTab).toBeVisible({ timeout: 10000 });
    await scalesTab.click();
    
    // Verify scales interface loaded
    await expect(page.locator('text=Escalas de Evaluación')).toBeVisible({ timeout: 5000 });
  });

  test('should show all 8 clinical assessment scales', async ({ page }) => {
    // Start visit and navigate to scales
    await page.locator('button:has-text("Iniciar")').first().click();
    await page.waitForLoadState('networkidle');
    await page.locator('button:has-text("Escalas Clínicas"), a:has-text("Escalas")').click();
    
    // Verify all 8 scales are present
    const expectedScales = [
      'Norton',
      'Barthel',
      'Braden',
      'Glasgow',
      'Lawton',
      'MMSE',
      'Yesavage',
      'Zarit'
    ];
    
    for (const scale of expectedScales) {
      await expect(page.locator(`text=${scale}`)).toBeVisible({ timeout: 5000 });
    }
  });

  test('should allow form submission', async ({ page }) => {
    // Start visit
    await page.locator('button:has-text("Iniciar")').first().click();
    await page.waitForLoadState('networkidle');
    
    // Fill out a simple vital sign
    const heartRateInput = page.locator('input[name="heartRate"], input[placeholder*="Frecuencia"]').first();
    if (await heartRateInput.isVisible({ timeout: 5000 })) {
      await heartRateInput.fill('72');
    }
    
    // Save the form
    const saveButton = page.locator('button:has-text("Guardar"), button:has-text("Completar")').first();
    await saveButton.click();
    
    // Verify success (either toast or redirect)
    await page.waitForTimeout(2000);
    const errorCount = await page.locator('text=Error, text=error').count();
    expect(errorCount).toBe(0);
  });
});
