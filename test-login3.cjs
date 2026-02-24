const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  const allLogs = [];
  page.on("console", msg => {
    allLogs.push(`[${msg.type()}] ${msg.text().substring(0, 300)}`);
  });
  
  try {
    await page.goto("https://main.d2wwgecog8smmr.amplifyapp.com", { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(2000);
    
    await page.click("button:has-text(\"Login\")");
    await page.waitForTimeout(2000);
    
    await page.fill("input[type=email]", "admin@ips.com");
    await page.fill("input[type=password]", "Admin123!");
    await page.click("button[type=submit]");
    
    await page.waitForSelector("[data-testid=admin-dashboard]", { timeout: 20000 });
    await page.waitForTimeout(8000);
    
    // Check if using real backend
    const backendStatus = await page.evaluate(() => {
      // Check what the system status shows
      const statusEl = document.querySelector("[data-testid=admin-main-content]");
      return statusEl ? statusEl.textContent.substring(0, 500) : "NOT FOUND";
    });
    
    // Check for "Conectado a AWS Backend" vs "Modo Demo"
    const bodyText = await page.textContent("body");
    const isRealBackend = bodyText.includes("Conectado a AWS Backend");
    const isDemoMode = bodyText.includes("Modo Demo");
    
    console.log("Real Backend:", isRealBackend);
    console.log("Demo Mode:", isDemoMode);
    
    // Print ALL console logs
    console.log("\n=== ALL CONSOLE LOGS ===");
    allLogs.forEach(l => console.log(l));
    
  } catch(e) {
    console.error("Error:", e.message);
  }
  await browser.close();
})();
