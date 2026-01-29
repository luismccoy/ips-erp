import { test, expect } from '@playwright/test';

test.describe('Admin Portal Tests', () => {
  const baseUrl = 'https://main.d2wwgecog8smmr.amplifyapp.com';
  const adminEmail = 'admin@ips.com';
  const adminPassword = 'Test123!';

  test.beforeEach(async ({ page }) => {
    await page.goto(baseUrl);
    
    // Login as admin
    await page.locator('input[type="email"]').fill(adminEmail);
    await page.locator('input[type="password"]').fill(adminPassword);
    await page.locator('button:has-text("Ingresar")').click();
    
    // Wait for dashboard to load
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Panel Principal')).toBeVisible({ timeout: 15000 });
  });

  const modules = [
    { name: 'Dashboard', selector: 'text=Panel Principal' },
    { name: 'Pending Reviews', selector: 'text=Revisiones Pendientes' },
    { name: 'Audit', selector: 'text=Auditoría Clínica' },
    { name: 'Inventory', selector: 'text=Inventario' },
    { name: 'Roster', selector: 'text=Programación de Turnos' },
    { name: 'Compliance', selector: 'text=Cumplimiento' },
    { name: 'Billing', selector: 'text=Facturación y RIPS' },
    { name: 'Reports', selector: 'text=Reportes' },
    { name: 'Patients', selector: 'text=Pacientes' },
    { name: 'Staff', selector: 'text=Personal' },
    { name: 'Settings', selector: 'text=Configuración' },
  ];

  for (const module of modules) {
    test(`should navigate to ${module.name} without crashing`, async ({ page }) => {
      // Click sidebar item
      await page.locator(module.selector).first().click();
      
      // Wait for content to load
      await page.waitForLoadState('networkidle');
      
      // Verify no error screen
      const errorScreen = await page.locator('text=Algo salió mal').count();
      expect(errorScreen).toBe(0);
      
      // Take screenshot on failure
      if (errorScreen > 0) {
        await page.screenshot({ 
          path: `test-results/admin-${module.name.toLowerCase()}-error.png`,
          fullPage: true 
        });
      }
    });
  }

  test('should display admin dashboard statistics', async ({ page }) => {
    // Verify key dashboard elements
    await expect(page.locator('text=pacientes')).toBeVisible();
    await expect(page.locator('text=turnos')).toBeVisible();
  });
});
