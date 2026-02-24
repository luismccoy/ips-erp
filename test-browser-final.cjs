const { chromium } = require("playwright");

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Collect AppSync responses
    const responses = {};
    page.on("response", async (resp) => {
        if (resp.url().includes("appsync")) {
            try {
                const body = await resp.json();
                const query = Object.keys(body.data || {})[0] || "unknown";
                const items = body.data?.[query]?.items;
                const hasError = body.errors?.length > 0;
                responses[query] = {
                    items: items ? items.length : (body.data?.[query] ? "object" : "null"),
                    error: hasError ? body.errors[0].errorType : null
                };
            } catch (e) {}
        }
    });
    
    console.log("1. Navigating to app...");
    await page.goto("https://main.d2wwgecog8smmr.amplifyapp.com", { waitUntil: "networkidle", timeout: 30000 });
    
    console.log("2. Clicking Login...");
    await page.click("text=Login", { timeout: 10000 });
    await page.waitForTimeout(1000);
    
    console.log("3. Filling credentials...");
    await page.fill("input[type=\"email\"]", "admin@ips.com");
    await page.fill("input[type=\"password\"]", "Admin123!");
    
    console.log("4. Submitting...");
    await page.click("button[type=\"submit\"]");
    
    console.log("5. Waiting for dashboard...");
    await page.waitForTimeout(8000);
    
    // Take screenshot
    await page.screenshot({ path: "/home/ubuntu/projects/ERP/dashboard-after-fix.png", fullPage: true });
    
    // Check for patient count on dashboard
    const pageText = await page.textContent("body");
    
    // Look for key indicators
    const pacientesMatch = pageText.match(/(\d+)\s*Pacientes/i);
    const turnosMatch = pageText.match(/(\d+)\s*Turnos/i);
    const enfermerasMatch = pageText.match(/(\d+)\s*Enfermeras/i);
    
    console.log("\n=== DASHBOARD STATS ===");
    console.log("Pacientes:", pacientesMatch ? pacientesMatch[1] : "NOT FOUND");
    console.log("Turnos:", turnosMatch ? turnosMatch[1] : "NOT FOUND");
    console.log("Enfermeras:", enfermerasMatch ? enfermerasMatch[1] : "NOT FOUND");
    
    console.log("\n=== APPSYNC RESPONSES ===");
    for (const [query, info] of Object.entries(responses)) {
        console.log(`  ${query}: items=${info.items}, error=${info.error || "none"}`);
    }
    
    await browser.close();
    console.log("\nDone! Screenshot saved to dashboard-after-fix.png");
})();
