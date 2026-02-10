import { test, expect } from '@playwright/test';

test('capture console errors and screenshot', async ({ page }) => {
  const consoleMessages: string[] = [];
  const consoleErrors: string[] = [];
  
  page.on('console', msg => {
    const text = `[${msg.type()}] ${msg.text()}`;
    consoleMessages.push(text);
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    }
  });
  
  page.on('pageerror', error => {
    consoleErrors.push(`[EXCEPTION] ${error.message}\n${error.stack}`);
  });
  
  await page.goto('https://main.d2wwgecog8smmr.amplifyapp.com');
  await page.waitForLoadState('networkidle');
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/landing-page.png', fullPage: true });
  
  // Try to find login form
  const emailInput = await page.locator('input[type="email"]').count();
  const demoButton = await page.locator('text=Modo Demo').count();
  
  console.log('\n=== PAGE STATUS ===');
  console.log('Email input found:', emailInput);
  console.log('Demo button found:', demoButton);
  console.log('\n=== CONSOLE ERRORS ===');
  consoleErrors.forEach(err => console.log(err));
  console.log('\n=== ALL CONSOLE MESSAGES ===');
  consoleMessages.slice(-20).forEach(msg => console.log(msg));
  
  // Write to file
  const fs = require('fs');
  fs.writeFileSync('test-results/console-log.txt', 
    `Email Input: ${emailInput}\nDemo Button: ${demoButton}\n\n` +
    `=== ERRORS ===\n${consoleErrors.join('\n')}\n\n` +
    `=== ALL MESSAGES ===\n${consoleMessages.join('\n')}`
  );
});
