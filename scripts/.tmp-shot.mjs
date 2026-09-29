import { chromium } from '@playwright/test';
const [url, out, w = '1440', h = '900', full = '0'] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
await page.waitForTimeout(1800);
if (full === '1') {
  // step through the page so scroll-triggered reveals fire
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 500) { await page.evaluate(v => window.scrollTo(0, v), y); await page.waitForTimeout(120); }
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(600);
}
await page.screenshot({ path: out, fullPage: full === '1' });
await browser.close();
