import { chromium } from 'playwright';
async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  page.on('console', msg => console.log('CONSOLE:', msg.text()));
  page.on('response', resp => {
    if(resp.status() >= 400) console.log('NETWORK ERROR:', resp.status(), resp.url());
  });
  
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000);
  await browser.close();
}
run();
