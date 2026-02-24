const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  
  try {
    await page.goto("https://main.d2wwgecog8smmr.amplifyapp.com", { waitUntil: "domcontentloaded", timeout: 20000 });
    await page.waitForTimeout(3000);
    
    // Try to fetch the amplify_outputs.json from the deployed site
    const config = await page.evaluate(async () => {
      try {
        const resp = await fetch("/amplify_outputs.json");
        if (resp.ok) return await resp.json();
        return { error: "fetch failed", status: resp.status };
      } catch(e) {
        return { error: e.message };
      }
    });
    
    // Check Patient auth rules
    const patientModel = config?.data?.model_introspection?.models?.Patient;
    if (patientModel) {
      const authAttr = patientModel.attributes?.find(a => a.type === "auth");
      console.log("Patient auth rules:", JSON.stringify(authAttr?.properties?.rules, null, 2));
    } else {
      console.log("Patient model not found in config");
      console.log("Config keys:", Object.keys(config || {}));
    }
  } catch(e) {
    console.error("Error:", e.message);
  }
  await browser.close();
})();
