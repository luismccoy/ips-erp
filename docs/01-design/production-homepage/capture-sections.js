const playwright = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await playwright.chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  
  await page.goto('file://' + path.resolve('./preview.html'));
  await page.waitForTimeout(2000);
  
  const sections = [
    { name: '01-hero', selector: 'section:nth-of-type(1)' },
    { name: '02-trust-logos', selector: 'section:nth-of-type(2)' },
    { name: '03-challenges', selector: 'section:nth-of-type(3)' },
    { name: '04-ai-agents', selector: 'section:nth-of-type(4)' },
    { name: '05-roles', selector: 'section:nth-of-type(5)' },
    { name: '06-compliance', selector: 'section:nth-of-type(6)' },
    { name: '07-mobile-app', selector: 'section:nth-of-type(7)' },
    { name: '08-stories', selector: 'section:nth-of-type(8)' },
    { name: '09-cta-footer', selector: 'section:nth-of-type(9)' }
  ];
  
  for (const section of sections) {
    try {
      const element = await page.$(section.selector);
      if (element) {
        await element.screenshot({ path: `section-${section.name}.png` });
        console.log(`✓ ${section.name}`);
      }
    } catch (e) {
      console.log(`✗ ${section.name}: ${e.message}`);
    }
  }
  
  await browser.close();
})();
