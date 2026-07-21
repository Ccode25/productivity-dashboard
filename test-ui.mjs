import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:\\Users\\ajdae\\.gemini\\antigravity-ide\\brain\\8cc7897f-a17a-4e71-ac8b-3850a63e2ab3';

const VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  laptop: { width: 1366, height: 768 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 390, height: 844 },
};

async function runTest() {
  console.log('Starting UI Regression Test...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const findings = [];

  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      findings.push(`Console ${msg.type()}: ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    findings.push(`Page Error: ${err.message}`);
  });

  for (const [deviceName, viewport] of Object.entries(VIEWPORTS)) {
    console.log(`\nTesting ${deviceName} (${viewport.width}x${viewport.height})...`);
    await page.setViewportSize(viewport);
    
    // Go to dashboard
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000); // Wait for initial render and animations

    // Attempt login if on auth page
    try {
      const emailInput = await page.$('input[type="email"]');
      if (emailInput) {
        await emailInput.fill('test@test.com');
        const passInput = await page.$('input[type="password"]');
        await passInput.fill('password123');
        const btn = await page.$('button[type="submit"]');
        await btn.click();
        await page.waitForTimeout(2000); // Wait for dashboard to load
      }
    } catch (e) {
      console.log('Login skip or error:', e.message);
    }

    // Check horizontal scroll and find elements
    const overflowingElements = await page.evaluate(() => {
      const isOverflowing = document.body.scrollWidth > window.innerWidth;
      const elements = [];
      if (isOverflowing) {
        document.querySelectorAll('*').forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.right > window.innerWidth) {
            elements.push({
              tag: el.tagName,
              className: el.className,
              id: el.id,
              right: rect.right
            });
          }
        });
      }
      return { isOverflowing, elements };
    });
    
    if (overflowingElements.isOverflowing) {
      findings.push(`[${deviceName}] Horizontal scrolling detected!`);
      // keep only the top 5 elements to avoid noise, usually the parents
      overflowingElements.elements.slice(0, 5).forEach(el => {
        findings.push(`  -> Overflowing element: <${el.tag.toLowerCase()} class="${el.className}" id="${el.id}"> (right: ${el.right})`);
      });
    }

    // Take screenshot
    const screenshotPath = path.join(ARTIFACTS_DIR, `screenshot_${deviceName}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Saved screenshot to ${screenshotPath}`);

    // Click smart triage if visible
    try {
      const triagePrompt = await page.$('.triage-prompt');
      if (triagePrompt) {
        await triagePrompt.click();
        await page.waitForTimeout(1000); // Wait for animation
        const triageScreenshot = path.join(ARTIFACTS_DIR, `triage_${deviceName}.png`);
        await page.screenshot({ path: triageScreenshot });
      }
    } catch (e) {
      findings.push(`[${deviceName}] Smart triage interaction failed: ${e.message}`);
    }
  }

  await browser.close();

  // Save report
  const reportPath = path.join(ARTIFACTS_DIR, 'test_results.json');
  fs.writeFileSync(reportPath, JSON.stringify(findings, null, 2));
  console.log('\nTesting Complete! Findings:');
  console.log(findings.length > 0 ? findings : 'No issues found!');
}

runTest().catch(console.error);
