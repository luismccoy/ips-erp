const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  
  const errors = [];
  page.on("console", msg => {
    if (msg.type() === "error") errors.push(msg.text().substring(0, 200));
  });
  
  try {
    await page.goto("https://main.d2wwgecog8smmr.amplifyapp.com", { waitUntil: "domcontentloaded", timeout: 20000 });
    
    await page.waitForSelector("input[name='username'], input[type='email']", { timeout: 15000 });
    await page.fill("input[name='username'], input[type='email']", "admin@ips.com");
    await page.fill("input[name='password'], input[type='password']", "Admin123!");
    await page.click("button[type='submit']");
    
    await page.waitForSelector("[data-testid='admin-dashboard']", { timeout: 20000 });
    console.log("Dashboard loaded");
    
    await page.waitForTimeout(8000);
    
    const text = await page.textContent("[data-tour='dashboard-stats']").catch(() => "STATS NOT FOUND");
    console.log("Stats area text:", text);
    
    if (errors.length > 0) {
      console.log("\nConsole errors:");
      errors.slice(0, 5).forEach(e => console.log(" -", e));
    }
  } catch(e) {
    console.error("Error:", e.message);
  }
  
  await browser.close();
})();
