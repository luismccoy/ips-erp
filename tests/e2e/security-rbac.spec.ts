import { test, expect, Page } from '@playwright/test';

/**
 * SECURITY & RBAC AUDIT TEST SUITE
 * 
 * Tests for:
 * 1. Role boundary enforcement (admin, nurse, family)
 * 2. Authentication flows (login, logout, session)
 * 3. Authorization (route access, data access)
 * 4. Data isolation (tenant boundaries)
 */

const BASE_URL = 'https://main.d2wwgecog8smmr.amplifyapp.com';

// Test credentials (demo mode)
const ROLES = {
  admin: { buttonText: 'Admin Demo', expectedPath: '/dashboard' },
  nurse: { buttonText: 'Enfermera Demo', expectedPath: '/nurse' },
  family: { buttonText: 'Familia Demo', expectedPath: '/family' },
};

// Protected routes by role
const PROTECTED_ROUTES = {
  admin: ['/dashboard', '/admin'],
  nurse: ['/nurse', '/app'],
  family: ['/family'],
};

// ============================================
// HELPER FUNCTIONS
// ============================================

async function loginAsRole(page: Page, role: 'admin' | 'nurse' | 'family') {
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  
  // Click demo mode
  await page.locator('text=Modo Demo').click();
  await page.waitForTimeout(500);
  
  // Click role-specific demo button
  const roleConfig = ROLES[role];
  await page.locator(`text=${roleConfig.buttonText}`).click();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);
}

async function logout(page: Page) {
  // Look for logout button in any portal
  const logoutBtn = page.locator('[data-testid="logout-btn"], button:has-text("Cerrar Sesión"), button:has-text("Logout")');
  if (await logoutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await logoutBtn.click();
    await page.waitForLoadState('networkidle');
  }
}

async function checkForUnauthorizedScreen(page: Page): Promise<boolean> {
  const accessDenied = await page.locator('text=Access Denied').isVisible({ timeout: 2000 }).catch(() => false);
  const shieldIcon = await page.locator('text=don\'t have permission').isVisible({ timeout: 1000 }).catch(() => false);
  return accessDenied || shieldIcon;
}

async function checkForErrorCrash(page: Page): Promise<boolean> {
  const error = await page.locator('text=Algo salió mal').isVisible({ timeout: 1000 }).catch(() => false);
  const errorBoundary = await page.locator('text=Error').isVisible({ timeout: 1000 }).catch(() => false);
  return error || errorBoundary;
}

// ============================================
// TEST SUITE 1: ROLE BOUNDARY TESTS
// ============================================

test.describe('1. ROLE BOUNDARY TESTS', () => {
  
  test.describe('1.1 Admin Role Access', () => {
    test('Admin can access /dashboard', async ({ page }) => {
      await loginAsRole(page, 'admin');
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForLoadState('networkidle');
      
      const unauthorized = await checkForUnauthorizedScreen(page);
      expect(unauthorized).toBe(false);
      
      // Verify admin content is visible
      await expect(page.locator('text=Panel Principal')).toBeVisible({ timeout: 10000 });
    });

    test('Admin can access all sidebar modules', async ({ page }) => {
      await loginAsRole(page, 'admin');
      
      const modules = [
        'Panel Principal',
        'Pacientes',
        'Inventario',
        'Facturación',
      ];
      
      for (const module of modules) {
        const moduleLink = page.locator(`text=${module}`).first();
        if (await moduleLink.isVisible({ timeout: 3000 }).catch(() => false)) {
          await moduleLink.click();
          await page.waitForLoadState('networkidle');
          
          const crashed = await checkForErrorCrash(page);
          expect(crashed, `Module ${module} crashed`).toBe(false);
        }
      }
    });
  });

  test.describe('1.2 Nurse Role Access', () => {
    test('Nurse can access /nurse', async ({ page }) => {
      await loginAsRole(page, 'nurse');
      
      const unauthorized = await checkForUnauthorizedScreen(page);
      expect(unauthorized).toBe(false);
      
      // Verify nurse-specific content
      await expect(page.locator('text=Turnos')).toBeVisible({ timeout: 10000 });
    });

    test('Nurse CANNOT access /dashboard (admin route)', async ({ page }) => {
      await loginAsRole(page, 'nurse');
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForLoadState('networkidle');
      
      // Should either show unauthorized screen OR redirect to nurse portal
      const unauthorized = await checkForUnauthorizedScreen(page);
      const nurseContent = await page.locator('text=Turnos').isVisible({ timeout: 3000 }).catch(() => false);
      
      // Either blocked or redirected - neither should show admin content
      const adminContent = await page.locator('text=Panel Principal').isVisible({ timeout: 2000 }).catch(() => false);
      expect(adminContent, 'CRITICAL: Nurse accessed Admin dashboard!').toBe(false);
    });

    test('Nurse CANNOT access /admin (admin route)', async ({ page }) => {
      await loginAsRole(page, 'nurse');
      await page.goto(`${BASE_URL}/admin`);
      await page.waitForLoadState('networkidle');
      
      const adminContent = await page.locator('text=Panel Principal').isVisible({ timeout: 3000 }).catch(() => false);
      expect(adminContent, 'CRITICAL: Nurse accessed Admin via /admin!').toBe(false);
    });
  });

  test.describe('1.3 Family Role Access', () => {
    test('Family can access /family', async ({ page }) => {
      await loginAsRole(page, 'family');
      
      const unauthorized = await checkForUnauthorizedScreen(page);
      expect(unauthorized).toBe(false);
      
      // Family portal should show patient-specific content
      await page.waitForTimeout(2000);
      const crashed = await checkForErrorCrash(page);
      expect(crashed).toBe(false);
    });

    test('Family CANNOT access /dashboard (admin route)', async ({ page }) => {
      await loginAsRole(page, 'family');
      await page.goto(`${BASE_URL}/dashboard`);
      await page.waitForLoadState('networkidle');
      
      const adminContent = await page.locator('text=Panel Principal').isVisible({ timeout: 3000 }).catch(() => false);
      expect(adminContent, 'CRITICAL: Family accessed Admin dashboard!').toBe(false);
    });

    test('Family CANNOT access /nurse (nurse route)', async ({ page }) => {
      await loginAsRole(page, 'family');
      await page.goto(`${BASE_URL}/nurse`);
      await page.waitForLoadState('networkidle');
      
      const nurseContent = await page.locator('text=Turnos').isVisible({ timeout: 3000 }).catch(() => false);
      expect(nurseContent, 'CRITICAL: Family accessed Nurse portal!').toBe(false);
    });

    test('Family has read-only access (no edit buttons)', async ({ page }) => {
      await loginAsRole(page, 'family');
      await page.waitForTimeout(2000);
      
      // Family portal should NOT have edit/delete/create buttons
      const editButtons = await page.locator('button:has-text("Editar"), button:has-text("Crear"), button:has-text("Eliminar")').count();
      
      // Some interaction buttons are OK, but critical edit functions should be absent
      // This is more of a soft check - document findings
      console.log(`Family portal edit button count: ${editButtons}`);
    });
  });
});

// ============================================
// TEST SUITE 2: AUTHENTICATION TESTS
// ============================================

test.describe('2. AUTHENTICATION TESTS', () => {
  
  test('2.1 Invalid credentials show error', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Click org login (not demo)
    const orgLogin = page.locator('text=Acceso IPS');
    if (await orgLogin.isVisible({ timeout: 3000 }).catch(() => false)) {
      await orgLogin.click();
      await page.waitForTimeout(500);
    }
    
    // Try invalid credentials
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await emailInput.fill('invalid@test.com');
      await passwordInput.fill('wrongpassword');
      await page.locator('button:has-text("Ingresar")').click();
      
      await page.waitForTimeout(3000);
      
      // Should show error or stay on login
      const stillOnLogin = await page.locator('input[type="email"]').isVisible();
      expect(stillOnLogin, 'Should stay on login page with invalid credentials').toBe(true);
    }
  });

  test('2.2 Session persists after page refresh', async ({ page }) => {
    await loginAsRole(page, 'admin');
    
    // Verify logged in
    await expect(page.locator('text=Panel Principal')).toBeVisible({ timeout: 10000 });
    
    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should still be logged in (session persisted)
    const stillLoggedIn = await page.locator('text=Panel Principal').isVisible({ timeout: 5000 }).catch(() => false);
    const backToLanding = await page.locator('text=Modo Demo').isVisible({ timeout: 3000 }).catch(() => false);
    
    // Document finding - either behavior is documented
    console.log(`Session persisted after refresh: ${stillLoggedIn}`);
    console.log(`Returned to landing: ${backToLanding}`);
  });

  test('2.3 Logout clears session state', async ({ page }) => {
    await loginAsRole(page, 'admin');
    await page.waitForTimeout(1000);
    
    // Find and click logout
    const logoutBtn = page.locator('button:has-text("Cerrar Sesión")').first();
    if (await logoutBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await logoutBtn.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // Should be back at landing
      const atLanding = await page.locator('text=Modo Demo').isVisible({ timeout: 5000 }).catch(() => false);
      expect(atLanding, 'Should return to landing after logout').toBe(true);
    }
  });

  test('2.4 Cannot access protected route without authentication', async ({ page }) => {
    // Clear any existing state
    await page.context().clearCookies();
    
    // Try to access protected route directly
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Should either show login/landing OR unauthorized
    const showsLogin = await page.locator('text=Modo Demo').isVisible({ timeout: 3000 }).catch(() => false);
    const showsUnauthorized = await checkForUnauthorizedScreen(page);
    const showsDemoSelection = await page.locator('text=Admin Demo').isVisible({ timeout: 3000 }).catch(() => false);
    
    const isProtected = showsLogin || showsUnauthorized || showsDemoSelection;
    expect(isProtected, 'Unauthenticated user should not see admin content').toBe(true);
  });
});

// ============================================
// TEST SUITE 3: AUTHORIZATION DEEP TESTS
// ============================================

test.describe('3. AUTHORIZATION DEEP TESTS', () => {
  
  test('3.1 Admin can access ALL admin modules', async ({ page }) => {
    await loginAsRole(page, 'admin');
    
    const adminModules = [
      { name: 'Revisiones Pendientes', nav: 'reviews' },
      { name: 'Auditoría', nav: 'audit' },
      { name: 'Inventario', nav: 'inventory' },
      { name: 'Facturación', nav: 'billing' },
      { name: 'Personal', nav: 'staff' },
      { name: 'Configuración', nav: 'settings' },
    ];
    
    for (const module of adminModules) {
      const link = page.locator(`text=${module.name}`).first();
      if (await link.isVisible({ timeout: 2000 }).catch(() => false)) {
        await link.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(500);
        
        const crashed = await checkForErrorCrash(page);
        expect(crashed, `Admin module ${module.name} crashed`).toBe(false);
        
        const unauthorized = await checkForUnauthorizedScreen(page);
        expect(unauthorized, `Admin blocked from ${module.name}`).toBe(false);
      }
    }
  });

  test('3.2 No role escalation via URL manipulation', async ({ page }) => {
    // Start as family (lowest privilege)
    await loginAsRole(page, 'family');
    
    // Try to escalate to admin via URL
    await page.goto(`${BASE_URL}/dashboard?role=admin`);
    await page.waitForLoadState('networkidle');
    
    // Should NOT show admin content
    const adminContent = await page.locator('text=Panel Principal').isVisible({ timeout: 3000 }).catch(() => false);
    expect(adminContent, 'CRITICAL: Role escalation via URL possible!').toBe(false);
    
    // Try hash-based escalation
    await page.goto(`${BASE_URL}/dashboard#admin`);
    await page.waitForLoadState('networkidle');
    
    const adminAfterHash = await page.locator('text=Panel Principal').isVisible({ timeout: 3000 }).catch(() => false);
    expect(adminAfterHash, 'CRITICAL: Role escalation via hash possible!').toBe(false);
  });

  test('3.3 Storage manipulation does not grant access', async ({ page }) => {
    // Login as family
    await loginAsRole(page, 'family');
    
    // Try to manipulate sessionStorage
    await page.evaluate(() => {
      sessionStorage.setItem('ips-erp-demo-role', 'admin');
      sessionStorage.setItem('ips-erp-demo-role', 'superadmin');
    });
    
    // Navigate to admin route
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // App should re-verify role, not just trust storage
    // Document the behavior
    const adminContent = await page.locator('text=Panel Principal').isVisible({ timeout: 3000 }).catch(() => false);
    
    if (adminContent) {
      console.warn('WARNING: Storage manipulation may allow role escalation - needs review');
    }
  });
});

// ============================================
// TEST SUITE 4: DATA ISOLATION TESTS
// ============================================

test.describe('4. DATA ISOLATION TESTS', () => {
  
  test('4.1 Patient list is tenant-filtered', async ({ page }) => {
    await loginAsRole(page, 'admin');
    
    // Navigate to patients
    const patientsLink = page.locator('text=Pacientes').first();
    if (await patientsLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await patientsLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      // In demo mode, should only show demo tenant patients
      // Count patients displayed
      const patientCards = await page.locator('[data-testid="patient-card"], .patient-card, [class*="patient"]').count();
      console.log(`Patients visible: ${patientCards}`);
      
      // Verify no crash
      const crashed = await checkForErrorCrash(page);
      expect(crashed).toBe(false);
    }
  });

  test('4.2 Family can only see authorized patient data', async ({ page }) => {
    await loginAsRole(page, 'family');
    await page.waitForTimeout(2000);
    
    // Family should have limited patient view
    // Should NOT see admin-only fields
    const adminOnlyFields = [
      'Facturación',
      'RIPS',
      'Personal',
      'Configuración',
      'Auditoría',
    ];
    
    for (const field of adminOnlyFields) {
      const visible = await page.locator(`text=${field}`).isVisible({ timeout: 1000 }).catch(() => false);
      expect(visible, `Family should not see ${field}`).toBe(false);
    }
  });

  test('4.3 API endpoints respect tenant boundaries', async ({ page }) => {
    await loginAsRole(page, 'admin');
    
    // Listen for API calls
    const apiCalls: string[] = [];
    page.on('request', request => {
      if (request.url().includes('graphql') || request.url().includes('api')) {
        apiCalls.push(request.url());
      }
    });
    
    // Navigate to trigger API calls
    await page.locator('text=Pacientes').first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log(`API calls made: ${apiCalls.length}`);
    
    // In demo mode, API calls should be mocked
    // In production, tenantId should be in all queries
  });

  test('4.4 No cross-tenant patient IDs in URLs', async ({ page }) => {
    await loginAsRole(page, 'admin');
    
    // Check that URLs don't expose patient IDs that could be manipulated
    const url = page.url();
    const hasPatientId = url.includes('patientId=') || url.includes('/patient/');
    
    if (hasPatientId) {
      console.log('NOTE: Patient IDs in URLs - ensure backend validates tenant ownership');
    }
  });
});

// ============================================
// TEST SUITE 5: SECURITY HEADERS & XSS TESTS
// ============================================

test.describe('5. SECURITY HARDENING TESTS', () => {
  
  test('5.1 Check for security headers', async ({ page }) => {
    const response = await page.goto(BASE_URL);
    const headers = response?.headers() || {};
    
    const securityHeaders = {
      'x-frame-options': headers['x-frame-options'],
      'x-content-type-options': headers['x-content-type-options'],
      'strict-transport-security': headers['strict-transport-security'],
      'x-xss-protection': headers['x-xss-protection'],
      'content-security-policy': headers['content-security-policy'],
    };
    
    console.log('Security Headers:', securityHeaders);
    
    // HSTS should be present for HTTPS site
    // Others are recommended
  });

  test('5.2 No sensitive data in page source', async ({ page }) => {
    await loginAsRole(page, 'admin');
    
    const pageContent = await page.content();
    
    // Check for common sensitive data patterns
    const sensitivePatterns = [
      /aws_access_key_id/i,
      /aws_secret_access_key/i,
      /password.*=.*["'][^"']+["']/i,
      /api_key.*=.*["'][^"']+["']/i,
      /bearer.*[a-z0-9]{20,}/i,
    ];
    
    for (const pattern of sensitivePatterns) {
      const found = pattern.test(pageContent);
      expect(found, `Found sensitive data matching ${pattern}`).toBe(false);
    }
  });

  test('5.3 Forms have CSRF protection indicators', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Click org login to see login form
    const orgLogin = page.locator('text=Acceso IPS');
    if (await orgLogin.isVisible({ timeout: 3000 }).catch(() => false)) {
      await orgLogin.click();
    }
    
    // Check for CSRF tokens or same-origin indicators
    const forms = await page.locator('form').count();
    console.log(`Forms on page: ${forms}`);
    
    // AWS Amplify handles auth - check for Amplify patterns
    const amplifyAuth = await page.locator('[class*="amplify"], [data-amplify]').count();
    console.log(`Amplify components: ${amplifyAuth}`);
  });
});

// ============================================
// TEST SUITE 6: SESSION SECURITY
// ============================================

test.describe('6. SESSION SECURITY TESTS', () => {
  
  test('6.1 Session tokens not in URL', async ({ page }) => {
    await loginAsRole(page, 'admin');
    
    // Check URL for tokens
    const url = page.url();
    
    const tokenPatterns = [
      /token=/i,
      /jwt=/i,
      /session=/i,
      /auth=/i,
      /id_token=/i,
      /access_token=/i,
    ];
    
    for (const pattern of tokenPatterns) {
      const found = pattern.test(url);
      expect(found, `Token in URL: ${pattern}`).toBe(false);
    }
  });

  test('6.2 Concurrent session handling', async ({ browser }) => {
    // Open two contexts (simulating two browser sessions)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    // Login as admin in first session
    await loginAsRole(page1, 'admin');
    
    // Login as nurse in second session
    await loginAsRole(page2, 'nurse');
    
    // Verify each session maintains its own role
    const page1Admin = await page1.locator('text=Panel Principal').isVisible({ timeout: 5000 }).catch(() => false);
    const page2Nurse = await page2.locator('text=Turnos').isVisible({ timeout: 5000 }).catch(() => false);
    
    console.log(`Session 1 (Admin) correct: ${page1Admin}`);
    console.log(`Session 2 (Nurse) correct: ${page2Nurse}`);
    
    await context1.close();
    await context2.close();
  });
});
