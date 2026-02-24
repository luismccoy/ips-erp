const { chromium } = require("playwright");

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    const responses = {};
    page.on("response", async (resp) => {
        if (resp.url().includes("appsync")) {
            try {
                const body = await resp.json();
                const query = Object.keys(body.data || {})[0] || "unknown";
                const items = body.data?.[query]?.items;
                const hasError = body.errors?.length > 0;
                responses[query] = {
                    items: items ? items.length : "N/A",
                    error: hasError ? body.errors[0].errorType : null
                };
            } catch (e) {}
        }
    });
    
    // Login
    await page.goto("https://main.d2wwgecog8smmr.amplifyapp.com", { waitUntil: "networkidle", timeout: 30000 });
    await page.click("text=Login", { timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.fill("input[type=\"email\"]", "admin@ips.com");
    await page.fill("input[type=\"password\"]", "Admin123!");
    await page.click("button[type=\"submit\"]");
    await page.waitForTimeout(5000);
    
    // Navigate to nurses page
    console.log("Navigating to /admin/nurses...");
    await page.goto("https://main.d2wwgecog8smmr.amplifyapp.com/admin/nurses", { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(3000);
    
    // Navigate to patients page
    console.log("Navigating to /admin/patients...");
    await page.goto("https://main.d2wwgecog8smmr.amplifyapp.com/admin/patients", { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(3000);
    
    console.log("\n=== ALL APPSYNC RESPONSES ===");
    for (const [query, info] of Object.entries(responses)) {
        const status = info.error ? "FAIL" : "OK";
        console.log(`  [${status}] ${query}: items=${info.items}${info.error ? " error=" + info.error : ""}`);
    }
    
    await browser.close();
})();
