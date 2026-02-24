const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  
  page.on("request", req => {
    if (req.url().includes("appsync") && req.postData()?.includes("listPatients")) {
      const headers = req.headers();
      console.log("\n=== listPatients REQUEST HEADERS ===");
      Object.entries(headers).forEach(([k, v]) => {
        if (k === "authorization") {
          // Decode JWT to see claims
          const parts = v.split(".");
          if (parts.length === 3) {
            try {
              const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
              console.log("authorization: JWT token");
              console.log("  iss:", payload.iss);
              console.log("  cognito:groups:", payload["cognito:groups"]);
              console.log("  custom:tenantId:", payload["custom:tenantId"]);
              console.log("  token_use:", payload.token_use);
              console.log("  email:", payload.email);
            } catch(e) {
              console.log("authorization:", v.substring(0, 50) + "...");
            }
          } else {
            console.log("authorization:", v.substring(0, 80) + "...");
          }
        } else if (k.startsWith("x-amz") || k === "content-type") {
          console.log(`${k}: ${v}`);
        }
      });
      console.log("\nPost data:", req.postData()?.substring(0, 200));
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
    await page.waitForTimeout(8000);
    
  } catch(e) {
    console.error("Error:", e.message);
  }
  await browser.close();
})();
