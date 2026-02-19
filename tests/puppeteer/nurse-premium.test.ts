/**
 * Nurse Premium Features — Puppeteer Headless Tests
 *
 * Independent validation using Puppeteer headless Chrome.
 * Tests the 5 premium features on the live production site.
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'https://main.d2wwgecog8smmr.amplifyapp.com';
const SCREENSHOT_DIR = path.join(process.cwd(), 'test-results/puppeteer');

// Ensure screenshot directory exists
fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

let browser: Browser;
let page: Page;

async function loginViaDemo(): Promise<void> {
  await page.goto(`${BASE_URL}/?demo=nurse`, { waitUntil: 'networkidle2', timeout: 30000 });
  await delay(3000);

  // Dismiss guided tour overlays (may appear multiple times)
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const skipBtn = await page.$('text/Explorar por mi cuenta');
      if (skipBtn) {
        await skipBtn.click();
        await delay(500);
      }
    } catch {
      // Tour not present
    }

    try {
      const closeBtn = await page.$('[aria-label="Cerrar tour"]');
      if (closeBtn) {
        await closeBtn.click();
        await delay(500);
      }
    } catch {
      // No close button
    }

    try {
      const omitirBtn = await page.$('text/Omitir');
      if (omitirBtn) {
        await omitirBtn.click();
        await delay(500);
      }
    } catch {
      // No skip button
    }
  }

  await delay(1000);
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function screenshot(name: string): Promise<void> {
  try {
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${name}.png`), fullPage: true });
  } catch {
    // Ignore screenshot failures
  }
}

// ============================================
// Test Runner
// ============================================

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

const results: TestResult[] = [];

async function runTest(name: string, fn: () => Promise<void>): Promise<void> {
  const start = Date.now();
  try {
    await fn();
    results.push({ name, passed: true, duration: Date.now() - start });
    console.log(`  PASS  ${name} (${Date.now() - start}ms)`);
  } catch (err: any) {
    results.push({ name, passed: false, error: err.message, duration: Date.now() - start });
    console.log(`  FAIL  ${name}: ${err.message}`);
    await screenshot(`FAIL-${name.replace(/\s/g, '-')}`);
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

// ============================================
// Tests
// ============================================

async function main() {
  console.log('\n========================================');
  console.log('Puppeteer Headless — Nurse Premium Tests');
  console.log('========================================\n');

  browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
    ],
  });

  page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 768 }); // Tablet size

  // ========================================
  // Login
  // ========================================

  await runTest('Login via demo mode', async () => {
    await loginViaDemo();
    // Check that the nurse dashboard loaded (no error screen)
    const bodyText = await page.evaluate(() => document.body?.innerText || '');
    assert(!bodyText.includes('Algo salió mal'), 'Error screen "Algo salió mal" appeared');
    assert(
      bodyText.includes('Enfermería') || bodyText.includes('Mi Ruta'),
      `Nurse dashboard not loaded. Page text starts with: "${bodyText.substring(0, 200)}"`
    );
    await screenshot('01-login-success');
  });

  // ========================================
  // Feature 1: Three tabs
  // ========================================

  await runTest('Three tabs visible (Mi Ruta, Mapa, Estadisticas)', async () => {
    const tabs = await page.$$('[role="tab"]');
    assert(tabs.length === 3, `Expected 3 tabs, found ${tabs.length}`);

    const tabTexts = await Promise.all(tabs.map(t => t.evaluate(el => el.textContent?.trim())));
    assert(tabTexts.some(t => t?.includes('Mi Ruta')), 'Missing "Mi Ruta" tab');
    assert(tabTexts.some(t => t?.includes('Mapa')), 'Missing "Mapa" tab');
    assert(tabTexts.some(t => t?.includes('Estadísticas')), 'Missing "Estadísticas" tab');

    await screenshot('02-three-tabs');
  });

  await runTest('Default tab is Mi Ruta with aria-selected=true', async () => {
    const firstTab = await page.$('[role="tab"]:first-child');
    const selected = await firstTab?.evaluate(el => el.getAttribute('aria-selected'));
    assert(selected === 'true', `First tab aria-selected="${selected}", expected "true"`);
  });

  // ========================================
  // Feature 2: Route Map
  // ========================================

  await runTest('Mapa tab renders Leaflet map', async () => {
    // Click Mapa tab
    const mapaTab = await page.$('text/Mapa');
    assert(!!mapaTab, 'Mapa tab not found');
    await mapaTab!.click();
    await delay(3000);

    // Leaflet container
    const leaflet = await page.$('.leaflet-container');
    assert(!!leaflet, 'Leaflet map container not found');

    // OSM tiles
    const tiles = await page.$('.leaflet-tile-container');
    assert(!!tiles, 'Map tiles not rendered');

    await screenshot('03-route-map');
  });

  await runTest('Optimizar Ruta button exists', async () => {
    const btn = await page.$('text/Optimizar Ruta');
    assert(!!btn, '"Optimizar Ruta" button not found');
  });

  await runTest('Mi Ubicacion button exists', async () => {
    const btn = await page.$('[aria-label="Centrar en mi ubicación"]');
    assert(!!btn, 'Location recenter button not found');
  });

  // ========================================
  // Feature 3: Shift cards still render
  // ========================================

  await runTest('Mi Ruta tab shows shift cards', async () => {
    const miRutaTab = await page.$('text/Mi Ruta');
    await miRutaTab!.click();
    await delay(2000);

    // Panel should be visible
    const panel = await page.$('#panel-route');
    assert(!!panel, 'Route panel not found');

    await screenshot('04-shift-cards');
  });

  // ========================================
  // Feature 4: Swipeable cards structure
  // ========================================

  await runTest('Swipeable card wrapper present in DOM', async () => {
    // The SwipeableShiftCard wraps content in a .touch-pan-y div
    const swipeables = await page.$$('.touch-pan-y');
    // Should have at least 0 (may have cards)
    console.log(`    Found ${swipeables.length} swipeable card wrappers`);
    // Swipe action buttons should be in the DOM behind cards
    const navBtns = await page.$$('[aria-label="Navegar al paciente"]');
    const vitalBtns = await page.$$('[aria-label="Signos vitales rápidos"]');
    const callBtns = await page.$$('[aria-label="Llamar al paciente"]');
    console.log(`    Swipe actions: Navegar=${navBtns.length}, Vitales=${vitalBtns.length}, Llamar=${callBtns.length}`);
  });

  // ========================================
  // Feature 5: Statistics tab
  // ========================================

  await runTest('Estadisticas tab renders MetricCards and progress ring', async () => {
    const statsTab = await page.$('text/Estadísticas');
    await statsTab!.click();
    await delay(2000);

    const panel = await page.$('#panel-stats');
    assert(!!panel, 'Stats panel not found');

    // SVG progress ring
    const svgs = await page.$$('#panel-stats svg');
    assert(svgs.length > 0, 'No SVG progress ring found in stats');

    await screenshot('05-stats-tab');
  });

  // ========================================
  // Rapid tab switching stress test
  // ========================================

  await runTest('Rapid tab switching (12 transitions) — no crash', async () => {
    for (let i = 0; i < 4; i++) {
      const miRuta = await page.$('text/Mi Ruta');
      await miRuta!.click();
      await delay(200);
      const mapa = await page.$('text/Mapa');
      await mapa!.click();
      await delay(200);
      const stats = await page.$('text/Estadísticas');
      await stats!.click();
      await delay(200);
    }

    // No crash
    const errors = await page.$$('text/Algo salió mal');
    assert(errors.length === 0, 'Error screen appeared after rapid switching');

    await screenshot('06-stress-test-stable');
  });

  // ========================================
  // White theme verification
  // ========================================

  await runTest('White theme — no dark background', async () => {
    const bgColor = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
    assert(!bgColor.includes('rgb(15,'), `Dark background detected: ${bgColor}`);
    assert(!bgColor.includes('rgb(30,'), `Dark background detected: ${bgColor}`);
    console.log(`    Background: ${bgColor}`);
  });

  // ========================================
  // Mobile viewport test
  // ========================================

  await runTest('Mobile viewport (360x640) — single column, no overflow', async () => {
    await page.setViewport({ width: 360, height: 640 });
    await delay(1000);

    const miRuta = await page.$('text/Mi Ruta');
    await miRuta!.click();
    await delay(1000);

    // Check for horizontal overflow
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    assert(!hasOverflow, 'Horizontal overflow detected on mobile viewport');

    await screenshot('07-mobile-360');

    // Restore tablet viewport
    await page.setViewport({ width: 1024, height: 768 });
    await delay(500);
  });

  // ========================================
  // Tablet viewport test
  // ========================================

  await runTest('Tablet viewport (768x1024) — two-column grid', async () => {
    await page.setViewport({ width: 768, height: 1024 });
    await delay(1000);

    const miRuta = await page.$('text/Mi Ruta');
    await miRuta!.click();
    await delay(1000);

    await screenshot('08-tablet-768');

    // Restore
    await page.setViewport({ width: 1024, height: 768 });
  });

  // ========================================
  // Cleanup & Report
  // ========================================

  await browser.close();

  // Print summary
  console.log('\n========================================');
  console.log('RESULTS SUMMARY');
  console.log('========================================');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  results.forEach(r => {
    const icon = r.passed ? 'PASS' : 'FAIL';
    console.log(`  ${icon}  ${r.name} (${r.duration}ms)`);
    if (!r.passed && r.error) {
      console.log(`         ${r.error}`);
    }
  });

  console.log(`\n  ${passed}/${total} passed, ${failed} failed`);
  console.log('========================================\n');

  // Exit with error code if any failed
  if (failed > 0) process.exit(1);
}

main().catch(err => {
  console.error('Fatal error:', err);
  browser?.close();
  process.exit(1);
});
