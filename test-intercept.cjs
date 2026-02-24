const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  
  const responses = [];
  page.on("response", async resp => {
    if (resp.url().includes("appsync")) {
      try {
        const body = await resp.text();
        const req = resp.request();
        const postData = req.postData() || "";
        const isPatient = postData.includes("listPatients") || postData.includes("Patient");
        if (isPatient) {
          responses.push({
            status: resp.status(),
            query: postData.substring(0, 100),
            response: body.substring(0, 500)
          });
        }
      } catch(e) {}
    }
  });
  
  try {
    await page.goto("https://main.d2wwgecog8smmr.amplifyapp.com", { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(2000);
    
    await page.click("button:has-text(\"Login\")");
    await page.waitForTimeout(2000);
    await page.fill("input[type='email']", "admin@ips.com");
    await page.fill("input[type='password']", "Admin123!");
    await page.click("button[type='submit']");
    
    await page.waitForSelector("[data-testid='admin-dashboard']", { timeout: 20000 });
    console.log("Dashboard loaded, waiting for data...");
    await page.waitForTimeout(10000);
    
    console.log("\n=== PATIENT-RELATED APPSYNC RESPONSES ===");
    responses.forEach((r, i) => {
      console.log(`\nResponse ${i}:`);
      console.log("Status:", r.status);
      console.log("Query:", r.query);
      console.log("Response:", r.response);
    });
    
    if (responses.length === 0) {
      console.log("NO patient-related AppSync requests captured!");
    }
    
  } catch(e) {
    console.error("Error:", e.message);
  }
  await browser.close();
})();
