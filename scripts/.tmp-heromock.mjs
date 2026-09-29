import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const [S, list] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
for (const [w, h, tag] of [[1440, 900, 'd'], [390, 844, 'm']]) {
  for (const spec of list.split(',')) {
    const [n, pos = '50% 50%'] = spec.split('@');
    const img = 'data:image/jpeg;base64,' + (await fs.readFile(`${S}/airbnb/orig/${n.padStart(2, '0')}.jpg`)).toString('base64');
    const html = `<html><body style="margin:0;font-family:sans-serif"><section style="position:relative;height:${h}px;overflow:hidden;color:#fff;background:#282a2c">
<img src="${img}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${pos}">
<div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(18,20,22,.48),rgba(18,20,22,.04) 33%,rgba(18,20,22,.14) 55%,rgba(18,20,22,.56))"></div>
<div style="position:absolute;left:5vw;right:5vw;bottom:${tag === 'd' ? 132 : 150}px"><p style="font-size:13px">A quieter side of Chios.</p><h1 style="font-weight:300;letter-spacing:-.06em;font-size:${tag === 'd' ? 82 : 40}px;margin:0">Mastiha Luxury Suites</h1><div style="border-top:1px solid #fff6;margin-top:24px;padding-top:14px;font-size:12px">75 m² · 2 bedrooms · 4 guests</div></div>
<div style="position:absolute;top:22px;left:5vw;right:5vw;display:flex;justify-content:space-between;font-size:13px"><span>Suite · Photos · Location</span><b>Mastiha Luxury Suites</b><span>EN EL TR</span></div></section></body></html>`;
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.setContent(html); await page.waitForTimeout(300);
    await page.screenshot({ path: `${S}/shots/mock-${tag}-${n}.png` }); await page.close();
  }
}
await browser.close();
