const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  try {
    await page.goto("https://main.d2wwgecog8smmr.amplifyapp.com", { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(3000);
    
    // Get all input elements
    const inputs = await page.$$eval("input", els => els.map(e => ({
      type: e.type, name: e.name, placeholder: e.placeholder, id: e.id
    })));
    console.log("Inputs found:", JSON.stringify(inputs, null, 2));
    
    // Get all buttons
    const buttons = await page.$$eval("button", els => els.map(e => ({
      type: e.type, text: e.textContent.trim().substring(0, 50)
    })));
    console.log("Buttons found:", JSON.stringify(buttons, null, 2));
    
    // Check page title/heading
    const h1 = await page.textContent("h1").catch(() => "no h1");
    const h2 = await page.textContent("h2").catch(() => "no h2");
    console.log("H1:", h1);
    console.log("H2:", h2);
  } catch(e) {
    console.error("Error:", e.message);
  }
  await browser.close();
})();
