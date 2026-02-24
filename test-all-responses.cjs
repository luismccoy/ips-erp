const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  
  page.on("response", async resp => {
    if (resp.url().includes("appsync")) {
      try {
        const body = await resp.text();
        const req = resp.request();
        const postData = req.postData() || "";
        
        // Extract query name
        const match = postData.match(/{\s*(\w+)/);
        const queryName = match ? match[1] : "unknown";
        
        if (queryName.startsWith("list")) {
          const hasError = body.includes("Unauthorized");
          const itemsMatch = body.match(/"items":\[(.*?)\]/s);
          const itemCount = itemsMatch ? (itemsMatch[1].match(/"id"/g) || []).length : 0;
          console.log(`${queryName}: ${hasError ? "UNAUTHORIZED" : "OK"} (${itemCount} items)`);
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
    await page.waitForTimeout(10000);
    
  } catch(e) {
    console.error("Error:", e.message);
  }
  await browser.close();
})();
