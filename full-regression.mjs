import { chromium } from 'playwright';
import fs from 'fs';

const viewports = [
  { name: 'desktop_1920', width: 1920, height: 1080 },
  { name: 'desktop_1366', width: 1366, height: 768 },
  { name: 'tablet_768', width: 768, height: 1024 },
  { name: 'mobile_430', width: 430, height: 932 },
  { name: 'mobile_390', width: 390, height: 844 },
  { name: 'mobile_375', width: 375, height: 812 },
  { name: 'mobile_360', width: 360, height: 800 },
  { name: 'mobile_320', width: 320, height: 568 }
];

async function run() {
  const browser = await chromium.launch({ headless: true });
  const results = { errors: [], overflow: [], network: [] };

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    
    page.on('console', msg => {
      if (msg.type() === 'error') results.errors.push(`[${vp.name}] Console: ${msg.text()}`);
    });
    
    page.on('response', response => {
      if (response.status() >= 400 && !response.url().includes('login') && !response.url().includes('auth')) {
        results.network.push(`[${vp.name}] Network ${response.status()}: ${response.url()}`);
      }
    });

    await page.goto('http://localhost:5173');
    await page.waitForTimeout(1000);
    
    // Login
    try {
      const email = await page.$('input[type="email"]');
      if (email) {
        await email.fill('test@test.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(2000);
      }
    } catch(e) {}
    
    // Check overflow
    const isOverflowing = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
    if (isOverflowing) {
      results.overflow.push(vp.name);
    }
    
    // Basic interactions
    try {
      // Try to open add task modal if it exists
      const addBtn = await page.$('button:has-text("Add Task")');
      if (addBtn) {
        await addBtn.click();
        await page.waitForTimeout(500);
        // Try to type in title
        const titleInput = await page.$('input[placeholder*="What needs"]');
        if (titleInput) {
           await titleInput.fill('Automated Test Task');
           const submitBtn = await page.$('button[type="submit"]');
           if (submitBtn) await submitBtn.click();
           await page.waitForTimeout(1000);
        }
      }

      // Open Smart Triage
      const triageTrigger = await page.$('.triage-trigger, button:has-text("Smart Triage")');
      if (triageTrigger) {
         await triageTrigger.click();
         await page.waitForTimeout(500);
         const triageClose = await page.$('.triage-close-btn');
         if (triageClose) await triageClose.click();
      }
      
      // Navigate to History
      const historyLink = await page.$('text=History');
      if (historyLink) {
         await historyLink.click();
         await page.waitForTimeout(500);
      }
      
      // Navigate to Dashboard
      const dashLink = await page.$('text=Dashboard');
      if (dashLink) {
         await dashLink.click();
         await page.waitForTimeout(500);
      }
    } catch(e) {}
    
    await page.screenshot({ path: `C:/Users/ajdae/.gemini/antigravity-ide/brain/8cc7897f-a17a-4e71-ac8b-3850a63e2ab3/screenshot_${vp.name}.png` });
    await context.close();
  }
  
  await browser.close();
  fs.writeFileSync('C:/Users/ajdae/.gemini/antigravity-ide/brain/8cc7897f-a17a-4e71-ac8b-3850a63e2ab3/test_results.json', JSON.stringify(results, null, 2));
}

run().catch(console.error);
