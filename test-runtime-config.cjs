const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  
  try {
    await page.goto("https://main.d2wwgecog8smmr.amplifyapp.com", { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(2000);
    
    await page.click("button:has-text(\"Login\")");
    await page.waitForTimeout(2000);
    await page.fill("input[type='email']", "admin@ips.com");
    await page.fill("input[type='password']", "Admin123!");
    await page.click("button[type='submit']");
    
    await page.waitForSelector("[data-testid='admin-dashboard']", { timeout: 20000 });
    await page.waitForTimeout(3000);
    
    // Check the Amplify configuration at runtime
    const result = await page.evaluate(() => {
      // Try to access Amplify config
      try {
        const ampConfig = window.__AMPLIFY_CONFIG__ || window.Amplify?.getConfig?.() || null;
        
        // Also try to intercept a GraphQL request
        return {
          ampConfig: ampConfig ? "found" : "not found",
          url: window.location.href,
        };
      } catch(e) {
        return { error: e.message };
      }
    });
    
    console.log("Runtime check:", JSON.stringify(result));
    
    // Intercept network requests to see what auth headers are sent
    const requests = [];
    page.on("request", req => {
      if (req.url().includes("appsync")) {
        const headers = req.headers();
        requests.push({
          url: req.url().substring(0, 80),
          auth: headers.authorization ? headers.authorization.substring(0, 50) + "..." : "none",
          body: req.postData()?.substring(0, 200) || "no body"
        });
      }
    });
    
    // Navigate to patients page to trigger a patient query
    await page.click("[data-testid='nav-patients']");
    await page.waitForTimeout(5000);
    
    console.log("\nAppSync requests captured:");
    requests.forEach((r, i) => console.log(`${i}: ${JSON.stringify(r)}`));
    
    // Check what the patients page shows
    const patientsText = await page.textContent("[data-testid='admin-main-content']");
    const hasPatients = patientsText.includes("Rosa") || patientsText.includes("Jorge");
    const hasZero = patientsText.includes("No hay pacientes") || patientsText.includes("0 pacientes");
    console.log("\nPatients page has patient names:", hasPatients);
    console.log("Patients page shows empty:", hasZero);
    console.log("Page text preview:", patientsText.substring(0, 300));
    
  } catch(e) {
    console.error("Error:", e.message);
  }
  await browser.close();
})();
