const { test, expect } = require('@playwright/test');

test.describe('IPS-ERP Demo Mode Comprehensive Audit', () => {
  const baseUrl = 'https://main.d2wwgecog8smmr.amplifyapp.com';
  
  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
  });

  test('Click "Ver Demo Interactivo" button', async ({ page }) => {
    const demoBtnSelector = 'button:has-text("Ver Demo Interactivo")';
    await expect(page.locator(demoBtnSelector)).toBeVisible();
    await page.click(demoBtnSelector);
    await page.waitForURL(`${baseUrl}/demo`);
  });

  const demoPortals = [
    { name: 'Admin', url: '/demo/admin', expectedElements: ['admin-dashboard', 'user-management'] },
    { name: 'Enfermera', url: '/demo/enfermera', expectedElements: ['patient-list', 'vital-signs'] },
    { name: 'Familia', url: '/demo/familia', expectedElements: ['family-dashboard', 'patient-info'] }
  ];

  demoPortals.forEach(portal => {
    test(`Test ${portal.name} Demo Portal`, async ({ page }) => {
      await page.goto(`${baseUrl}${portal.url}`);
      
      // Check page loads without errors
      const pageErrors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          pageErrors.push(msg.text());
        }
      });

      // Check for demo mode indicators
      const demoIndicator = await page.locator('.demo-mode-indicator');
      await expect(demoIndicator).toBeVisible();

      // Verify expected elements are present
      for (const element of portal.expectedElements) {
        await expect(page.locator(`[data-testid="${element}"]`)).toBeVisible();
      }

      // Check sample data
      const sampleDataRows = await page.locator('tbody tr').count();
      expect(sampleDataRows).toBeGreaterThan(0);

      // Ensure no console errors
      expect(pageErrors).toHaveLength(0, `Errors found in ${portal.name} portal: ${pageErrors.join(', ')}`);
    });
  });
});