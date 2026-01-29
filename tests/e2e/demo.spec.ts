import { test, expect } from '@playwright/test';

test.describe('Demo Mode Portal Tests', () => {
  const baseUrl = 'https://main.d2wwgecog8smmr.amplifyapp.com';

  test('should load landing page successfully', async ({ page }) => {
    await page.goto(baseUrl);
    await expect(page).toHaveTitle(/IPS ERP/i);
    
    // Verify no error screens on landing
    const errorText = await page.locator('text=Algo salió mal').count();
    expect(errorText).toBe(0);
  });

  test('should display demo mode button', async ({ page }) => {
    await page.goto(baseUrl);
    
    // Wait for and verify demo mode button
    const demoButton = page.locator('text=Modo Demo');
    await expect(demoButton).toBeVisible({ timeout: 10000 });
  });

  test('should load Admin Demo portal without crashes', async ({ page }) => {
    await page.goto(baseUrl);
    
    // Click Modo Demo
    await page.locator('text=Modo Demo').click();
    
    // Click Admin Demo option
    await page.locator('text=Admin Demo').click();
    
    // Wait for admin dashboard to load
    await page.waitForLoadState('networkidle');
    
    // Verify no error screen
    const errorScreen = await page.locator('text=Algo salió mal').count();
    expect(errorScreen).toBe(0);
    
    // Verify admin content loaded
    await expect(page.locator('text=IPS ERP')).toBeVisible();
  });

  test('should load Enfermera Demo portal without crashes', async ({ page }) => {
    await page.goto(baseUrl);
    
    await page.locator('text=Modo Demo').click();
    await page.locator('text=Enfermera Demo').click();
    
    await page.waitForLoadState('networkidle');
    
    // Verify no crash
    const errorScreen = await page.locator('text=Algo salió mal').count();
    expect(errorScreen).toBe(0);
    
    // Verify nurse content
    await expect(page.locator('text=Turnos')).toBeVisible({ timeout: 10000 });
  });

  test('should load Familia Demo portal without crashes', async ({ page }) => {
    await page.goto(baseUrl);
    
    await page.locator('text=Modo Demo').click();
    await page.locator('text=Familia Demo').click();
    
    await page.waitForLoadState('networkidle');
    
    // Verify no crash
    const errorScreen = await page.locator('text=Algo salió mal').count();
    expect(errorScreen).toBe(0);
  });
});
