import { test, expect } from '@playwright/test';
import { ASSISTANT_COPY } from '../src/content/assistant-copy';
import { listingCopy } from '../src/content/listing-copy';

for (const locale of ['en', 'el', 'tr'] as const) {
  test(`visible chat answers two real browser messages in ${locale}`, async ({ page }, info) => {
    await page.setViewportSize({ width: locale === 'el' ? 390 : 1440, height: 844 });
    await page.setExtraHTTPHeaders({ 'x-forwarded-for': `release-browser-${info.project.name}-${locale}` });
    await page.goto(`/${locale}`);
    const c = ASSISTANT_COPY[locale];
    const toggle = page.getByTestId('assistant-toggle');
    await expect(toggle).toBeVisible();
    await toggle.click();
    const dialog = page.getByTestId('assistant-dialog');
    await expect(dialog).toBeVisible();
    const reply = page.waitForResponse(r => r.url().endsWith('/api/assistant/chat') && r.request().method() === 'POST');
    await dialog.getByRole('button', { name: c.welcomeSuggestions[0], exact: true }).click();
    expect((await reply).status()).toBe(200);
    await expect(dialog.locator('.chatbot__rich').last()).toContainText('Market mou');
    const answerTwo = page.waitForResponse(r => r.url().endsWith('/api/assistant/chat') && r.request().method() === 'POST');
    await dialog.locator('textarea').fill(c.welcomeSuggestions[1]);
    await dialog.getByRole('button', { name: c.sendLabel, exact: true }).click();
    expect((await answerTwo).status()).toBe(200);
    await expect(dialog.locator('.chatbot__rich')).toHaveCount(2);
    await expect(dialog.locator('.chatbot__rich').last()).toContainText(listingCopy(locale).familyBody);
    if (info.project.name === 'chromium') await dialog.screenshot({ path: info.outputPath(`chat-working-${locale}.png`), animations: 'disabled' });
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(toggle).toBeFocused();
    await toggle.click();
    await expect(page.getByTestId('assistant-dialog').locator('.chatbot__rich')).toHaveCount(2);
  });

  test(`guest copy speaks as the hosts in ${locale}`, async ({ page }, info) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${locale}`);
    const family = page.locator('#family');
    await expect(family).toContainText(listingCopy(locale).familyBody);
    expect(await page.locator('main').innerText()).not.toMatch(/Booking\.com (currently lists|αναφέρει|şu anda)|shown in the listing|Στην καταχώριση|Η οικοδέσποινα αναφέρει|AI training later|AI αργότερα|İlanda .*gösterilir/i);
    for (const image of await family.locator('img').all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
      expect(await image.getAttribute('alt')).not.toMatch(/listing|καταχώριση|İlanda/i);
    }
    if (info.project.name === 'chromium') await family.screenshot({ path: info.outputPath(`family-host-voice-${locale}.png`), animations: 'disabled' });
  });
}

test('same-origin protection accepts the actual request host but rejects forged forwarding headers', async ({ request }) => {
  const payload = { locale: 'en', messages: [{ role: 'user', content: 'What is nearby?' }] };
  const accepted = await request.post('/api/assistant/chat', { headers: { Origin: 'http://127.0.0.1:3000', 'x-forwarded-for': 'release-origin' }, data: payload });
  expect(accepted.status()).toBe(200);
  for (const origin of ['https://attacker.example', 'null', 'http://127.0.0.1:3000.attacker.example']) {
    const rejected = await request.post('/api/assistant/chat', { headers: { Origin: origin, 'x-forwarded-host': 'attacker.example', 'x-forwarded-for': 'release-origin' }, data: payload });
    expect(rejected.status()).toBe(403);
  }
  const wrongScheme = await request.post('/api/assistant/chat', { headers: { Origin: 'https://127.0.0.1:3000' }, data: payload });
  expect(wrongScheme.status()).toBe(403);
});
