const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('Performance Audit', () => {
  const baseURL = 'https://main.d2wwgecog8smmr.amplifyapp.com';
  let performanceResults = {
    landingPage: {},
    loginFlow: {},
    dashboardRendering: {},
    moduleNavigation: {},
    networkRequests: [],
    consoleLogs: [],
    bundleSizes: {}
  };

  test.beforeEach(async ({ page, context }) => {
    // Capture network requests and console logs
    await context.route('**/*', route => {
      const request = route.request();
      performanceResults.networkRequests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType()
      });
      route.continue();
    });

    page.on('console', msg => {
      performanceResults.consoleLogs.push({
        type: msg.type(),
        text: msg.text()
      });
    });
  });

  test('Landing Page Performance', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    
    // Measure load time
    const loadTime = Date.now() - startTime;
    performanceResults.landingPage.loadTime = loadTime;

    // Check responsiveness
    const bodyWidth = await page.evaluate(() => document.body.clientWidth);
    const bodyHeight = await page.evaluate(() => document.body.clientHeight);
    performanceResults.landingPage.responsiveness = {
      width: bodyWidth,
      height: bodyHeight
    };
  });

  test('Login Flow Performance', async ({ page }) => {
    await page.goto(baseURL);
    
    const startLoginTime = Date.now();
    
    // Assuming standard login form - adjust selectors as needed
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'testpassword');
    
    const loginStartTime = Date.now();
    await page.click('button[type="submit"]');
    
    await page.waitForNavigation({ waitUntil: 'networkidle' });
    
    const loginTime = Date.now() - loginStartTime;
    const totalLoginProcessTime = Date.now() - startLoginTime;
    
    performanceResults.loginFlow = {
      loginProcessTime: totalLoginProcessTime,
      buttonClickToNavigationTime: loginTime
    };
  });

  test('Dashboard Rendering', async ({ page }) => {
    await page.goto(baseURL);
    // Login first (adjust as needed)
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    
    const startDashboardTime = Date.now();
    await page.waitForSelector('.dashboard-main', { state: 'visible' });
    
    const dashboardLoadTime = Date.now() - startDashboardTime;
    performanceResults.dashboardRendering.loadTime = dashboardLoadTime;
  });

  test('Module Navigation Performance', async ({ page }) => {
    await page.goto(baseURL);
    // Login first (adjust as needed)
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'testpassword');
    await page.click('button[type="submit"]');
    
    // Measure navigation between modules
    const moduleNavigationTimes = {};
    const modules = ['.module1', '.module2', '.module3']; // Adjust selectors
    
    for (const module of modules) {
      const startNavTime = Date.now();
      await page.click(module);
      await page.waitForSelector(module, { state: 'visible' });
      moduleNavigationTimes[module] = Date.now() - startNavTime;
    }
    
    performanceResults.moduleNavigation = moduleNavigationTimes;
  });

  test.afterAll(async () => {
    // Analyze bundle sizes (this requires additional setup with webpack/build tools)
    performanceResults.bundleSizes = {
      warning: 'Accurate bundle size analysis requires build tool integration'
    };

    // Write performance report
    const reportPath = path.join(__dirname, '..', 'PERFORMANCE_AUDIT_REPORT.md');
    const reportContent = `# Performance Audit Report

## Landing Page
- Load Time: ${performanceResults.landingPage.loadTime}ms
- Responsiveness: ${JSON.stringify(performanceResults.landingPage.responsiveness)}

## Login Flow
- Total Login Process Time: ${performanceResults.loginFlow.loginProcessTime}ms
- Button Click to Navigation Time: ${performanceResults.loginFlow.buttonClickToNavigationTime}ms

## Dashboard Rendering
- Load Time: ${performanceResults.dashboardRendering.loadTime}ms

## Module Navigation
${Object.entries(performanceResults.moduleNavigation).map(([module, time]) => 
  `- ${module}: ${time}ms`).join('\n')}

## Network Requests
Total Requests: ${performanceResults.networkRequests.length}
${performanceResults.networkRequests.slice(0, 10).map(req => 
  `- URL: ${req.url}, Method: ${req.method}, Type: ${req.resourceType}`).join('\n')}

## Console Warnings
${performanceResults.consoleLogs.filter(log => 
  log.type === 'warn' || log.type === 'error')
  .map(log => `- ${log.type.toUpperCase()}: ${log.text}`).join('\n') || 'No warnings detected'}

## Bundle Sizes
${JSON.stringify(performanceResults.bundleSizes, null, 2)}

**Note:** This is an automated performance audit. Actual performance may vary.
`;

    fs.writeFileSync(reportPath, reportContent);
  });
});