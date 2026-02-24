const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const captured = [];
  
  page.on("requestfinished", async req => {
    if (req.url().includes("appsync")) {
      try {
        const resp = await req.response();
        const body = await resp.text();
        const postData = req.postData() || "";
        captured.push({ postData: postData.substring(0, 100), body: body.substring(0, 400) });
      } catch(e) {
        captured.push({ error: e.message });
      }
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
    await page.waitForTimeout(10000);
    
    console.log("Captured", captured.length, "AppSync requests");
    captured.forEach((c, i) => {
      console.log(`\n--- Request ${i} ---`);
      if (c.error) { console.log("Error:", c.error); return; }
      console.log("Query:", c.postData);
      console.log("Response:", c.body);
    });
    
  } catch(e) {
    console.error("Error:", e.message);
  }
  await browser.close();
})();
