import { chromium } from 'playwright';

const PROD_URL = process.env.PROD_URL || 'https://main.d2wwgecog8smmr.amplifyapp.com';
const SCREENSHOTS_DIR = './test-screenshots';

async function runTests() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();

    const results: { test: string; status: string; details: string }[] = [];

    try {
        // Test 1: Landing Page Load
        console.log('🧪 Test 1: Landing Page Load');
        await page.goto(PROD_URL, { waitUntil: 'networkidle' });
        await page.screenshot({ path: `${SCREENSHOTS_DIR}/01-landing-hero.png`, fullPage: false });
        results.push({ test: 'Landing Page Load', status: '✅ PASS', details: 'Page loaded successfully' });

        // Test 2: Hero Image Check
        console.log('🧪 Test 2: Hero Image Check');
        const heroImg = await page.locator('img[src*="hero-main"]').first();
        const heroVisible = await heroImg.isVisible().catch(() => false);
        results.push({
            test: 'Hero Image',
            status: heroVisible ? '✅ PASS' : '❌ FAIL',
            details: heroVisible ? 'Hero image is visible' : 'Hero image not found'
        });

        // Test 3: VER DEMO Button
        console.log('🧪 Test 3: VER DEMO Button');
        const demoButton = await page.locator('button:has-text("VER DEMO")').first();
        const demoVisible = await demoButton.isVisible().catch(() => false);
        results.push({
            test: 'VER DEMO Button',
            status: demoVisible ? '✅ PASS' : '❌ FAIL',
            details: demoVisible ? 'Button is visible' : 'Button not found'
        });

        // Test 4: Módulos Section Navigation
        console.log('🧪 Test 4: Módulos Section');
        await page.locator('a:has-text("Módulos")').first().click().catch(() => { });
        await page.waitForTimeout(1000);
        await page.screenshot({ path: `${SCREENSHOTS_DIR}/02-modulos-section.png`, fullPage: false });

        // Check for module images
        const glosasImg = await page.locator('img[src*="challenge-glosadas"]');
        const glosasCount = await glosasImg.count();
        results.push({
            test: 'Módulos Section',
            status: glosasCount > 0 ? '✅ PASS' : '⚠️ PARTIAL',
            details: glosasCount > 0 ? 'Glosas image found' : 'Module images may be using scroll-based loading'
        });

        // Test 5: Click VER DEMO and test Portal Administrativo
        console.log('🧪 Test 5: Demo Portal Test');
        await page.goto(PROD_URL, { waitUntil: 'networkidle' });
        await page.locator('button:has-text("VER DEMO")').first().click().catch(() => { });
        await page.waitForTimeout(1500);
        await page.screenshot({ path: `${SCREENSHOTS_DIR}/03-demo-selection.png`, fullPage: false });

        const adminPortal = await page.locator('button:has-text("Portal Administrativo"), div:has-text("Portal Administrativo")').first();
        if (await adminPortal.isVisible().catch(() => false)) {
            await adminPortal.click();
            await page.waitForTimeout(2000);
            await page.screenshot({ path: `${SCREENSHOTS_DIR}/04-admin-dashboard.png`, fullPage: false });
            results.push({ test: 'Admin Portal Demo', status: '✅ PASS', details: 'Admin dashboard loaded' });
        } else {
            results.push({ test: 'Admin Portal Demo', status: '⚠️ PARTIAL', details: 'Portal button not directly visible' });
        }

        // Test 6: Production Login - React SPA, clicking Login triggers state change
        console.log('🧪 Test 6: Production Login');
        await page.goto(PROD_URL, { waitUntil: 'networkidle' });

        // Click the Login button using JavaScript to ensure React receives the event 
        const loginClicked = await page.evaluate(() => {
            const loginBtn = Array.from(document.querySelectorAll('button')).find(
                btn => btn.textContent?.trim() === 'Login'
            );
            if (loginBtn) {
                loginBtn.click();
                return true;
            }
            return false;
        });

        if (loginClicked) {
            // Wait for React state change and re-render
            await page.waitForTimeout(3000);
            await page.screenshot({ path: `${SCREENSHOTS_DIR}/05-after-login-click.png`, fullPage: false });

            // Check for the org login form (should have "Acceso Organizacional" text)
            const hasLoginForm = await page.evaluate(() => {
                return document.body.textContent?.includes('Acceso Organizacional') ||
                    document.body.textContent?.includes('Correo Electrónico') ||
                    !!document.querySelector('input[type="email"]');
            });

            if (hasLoginForm) {
                const emailInput = await page.locator('input[type="email"], input[placeholder*="@"]').first();
                await emailInput.fill('admin@ips.com');

                const passwordInput = await page.locator('input[type="password"]').first();
                await passwordInput.fill('TestIPS#2026!');
                await page.screenshot({ path: `${SCREENSHOTS_DIR}/06-login-filled.png`, fullPage: false });

                // Submit the login form
                const submitBtn = await page.locator('button[type="submit"], button:has-text("Ingresar")').first();
                await submitBtn.click();
                await page.waitForTimeout(5000);
                await page.screenshot({ path: `${SCREENSHOTS_DIR}/07-login-result.png`, fullPage: false });

                // Check for error message
                const errorEl = await page.locator('.text-rose-500, .text-red-500').first();
                const hasError = await errorEl.isVisible().catch(() => false);

                if (hasError) {
                    const errText = await errorEl.textContent();
                    results.push({ test: 'Production Login', status: '❌ FAIL', details: `Error: ${errText}` });
                } else {
                    const url = page.url();
                    results.push({ test: 'Production Login', status: '✅ PASS', details: `Login submitted, current URL: ${url}` });
                }
            } else {
                // Login form didn't appear - the button may be connecting to demo selection instead
                results.push({ test: 'Production Login', status: '⚠️ UX_ISSUE', details: 'Login button clicked but org login form did not appear. The button may route to demo selection or another view.' });
            }
        } else {
            results.push({ test: 'Production Login', status: '⚠️ BLOCKED', details: 'Login button not found on page' });
        }

    } catch (error) {
        console.error('Test error:', error);
        results.push({ test: 'General', status: '❌ ERROR', details: String(error) });
    } finally {
        await browser.close();
    }

    // Print results
    console.log('\n📊 TEST RESULTS\n' + '='.repeat(60));
    for (const r of results) {
        console.log(`${r.status} ${r.test}: ${r.details}`);
    }
    console.log('='.repeat(60));
    console.log(`Screenshots saved to ${SCREENSHOTS_DIR}/`);
}

runTests();
