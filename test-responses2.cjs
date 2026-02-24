const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  
  const results = [];
  
  await page.route("**/*appsync*/**", async route => {
    const req = route.request();
    const postData = req.postData() || "";
    const resp = await route.fetch();
    const body = await resp.text();
    
    const match = postData.match(/"query":"query[^{]*\{\s*(\w+)/);
    const queryName = match ? match[1] : null;
    
    if (queryName && queryName.startsWith("list")) {
      const hasError = body.includes("Unauthorized");
      results.push({ queryName, hasError, body: body.substring(0, 300) });
    }
    
    await route.fulfill({ response: resp, body });
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
    await page.waitForTimeout(10000);
    
    console.log("=== APPSYNC LIST QUERY RESULTS ===");
    results.forEach(r => {
      console.log(`${r.queryName}: ${r.hasError ? "UNAUTHORIZED" : "OK"}`);
      if (r.hasError) console.log("  Response:", r.body);
    });
    
    if (results.length === 0) console.log("No list queries captured");
    
  } catch(e) {
    console.error("Error:", e.message);
  }
  await browser.close();
})();
