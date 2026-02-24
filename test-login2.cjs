const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  const errors = [];
  page.on("console", msg => {
    const t = msg.text();
    if (msg.type() === "error" || t.includes("patient") || t.includes("Patient") || t.includes("Backend") || t.includes("Demo")) {
      errors.push(`[${msg.type()}] ${t.substring(0, 200)}`);
    }
  });
  
  try {
    await page.goto("https://main.d2wwgecog8smmr.amplifyapp.com", { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(2000);
    
    // Click Login button
    await page.click("button:has-text(\"Login\")");
    await page.waitForTimeout(3000);
    
    // Check what we see now
    const inputs = await page.$$eval("input", els => els.map(e => ({
      type: e.type, name: e.name, placeholder: e.placeholder, id: e.id
    })));
    console.log("After Login click - Inputs:", JSON.stringify(inputs));
    
    // Try to find Cognito Authenticator fields
    const hasAmplifyAuth = await page.$("[data-amplify-authenticator]").catch(() => null);
    console.log("Has Amplify Authenticator:", !!hasAmplifyAuth);
    
    // Fill in credentials if we see the right fields
    const emailInput = await page.$("input[type=email], input[name=username]");
    const passwordInput = await page.$("input[type=password], input[name=password]");
    
    if (emailInput && passwordInput) {
      console.log("Found login form, filling credentials...");
      await emailInput.fill("admin@ips.com");
      await passwordInput.fill("Admin123!");
      await page.click("button[type=submit]");
      
      await page.waitForSelector("[data-testid=admin-dashboard]", { timeout: 20000 });
      console.log("Dashboard loaded!");
      
      await page.waitForTimeout(8000);
      
      const statsText = await page.textContent("[data-tour=dashboard-stats]").catch(() => "STATS NOT FOUND");
      console.log("Stats:", statsText);
    } else {
      console.log("No login form found. Page URL:", page.url());
      const bodyText = await page.textContent("body");
      console.log("Body preview:", bodyText.substring(0, 300));
    }
    
    if (errors.length > 0) {
      console.log("\nRelevant logs:");
      errors.forEach(e => console.log(e));
    }
  } catch(e) {
    console.error("Error:", e.message);
  }
  await browser.close();
})();
