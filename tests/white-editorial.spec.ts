import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import dockHashes from './dock-preserved.json';

// This request explicitly excludes the approved dock from restyling.
test('approved dock source and WebP assets stay byte-identical', () => {
  for (const [file, hash] of Object.entries(dockHashes)) {
    expect(createHash('sha256').update(readFileSync(file)).digest('hex'), file).toBe(hash);
  }
});

for (const locale of ['en', 'el', 'tr']) {
  test(`full property name fits the modern hero and header in ${locale}`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const width of [320, 390, 768, 1440, 1920]) {
      await page.setViewportSize({ width, height: width < 600 ? 844 : 900 });
      await page.goto(`/${locale}`);
      await page.evaluate(() => document.fonts.ready);
      const title = page.locator('#mastiha-title');
      await expect(title).toHaveText('Mastiha Luxury Suites');
      await expect(title.locator('br')).toHaveCount(0);
      const hero = page.getByTestId('landing-hero');
      const geometry = await title.evaluate(element => {
        const box = element.getBoundingClientRect();
        const range = document.createRange(); range.selectNodeContents(element);
        const rects = Array.from(range.getClientRects());
        const header = document.querySelector('#home header')!.getBoundingClientRect();
        const discover = document.querySelector('#home a[href="#film"]')!.getBoundingClientRect();
        const css = getComputedStyle(element);
        return {
          font: css.fontFamily, size: parseFloat(css.fontSize),
          textFits: rects.every(r => r.left >= box.left - 1 && r.right <= box.right + 1),
          top: box.top, bottom: box.bottom, headerBottom: header.bottom, discoverTop: discover.top,
          overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        };
      });
      expect(geometry.font).toMatch(/Commissioner/i);
      expect(geometry.font).not.toMatch(/Garamond|Georgia|Times/i);
      expect(geometry.size).toBeLessThanOrEqual(104);
      expect(geometry.textFits).toBe(true);
      expect(geometry.top).toBeGreaterThan(geometry.headerBottom);
      expect(geometry.bottom).toBeLessThan(geometry.discoverTop);
      expect(geometry.overflow).toBe(false);
      await expect(hero.getByRole('button')).toBeVisible();
      await expect.poll(() => page.getByTestId('hero-image').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      if (width === 390 || width === 1440) {
        await hero.screenshot({ path: info.outputPath(`white-hero-${locale}-${width}.png`), animations: 'disabled' });
      }
    }
    expect(errors).toEqual([]);
  });
}

test('white sections and photo-tour rails have neutral backgrounds and readable text', async ({ page }, info) => {
  await page.goto('/en');
  await page.evaluate(() => document.fonts.ready);
  const surfaces = await page.locator('#suite,#spaces,#gallery,#amenities,#reviews,#location,#information,footer,section[aria-labelledby="host-title"],section[aria-labelledby="neighbourhood-title"]').evaluateAll(elements => elements.map(element => {
    let parent: Element | null = element;
    let channels: number[] = [];
    while (parent) {
      const values = (getComputedStyle(parent).backgroundColor.match(/[\d.]+/g) || []).map(Number);
      if (values.length === 3 || values[3] === 1) { channels = values.slice(0, 3); break; }
      parent = parent.parentElement;
    }
    return { section: element.id || element.getAttribute('aria-labelledby') || element.tagName, channels };
  }));
  for (const { section, channels } of surfaces) {
    expect(channels.length, section).toBe(3);
    expect(Math.min(...channels), section).toBeGreaterThanOrEqual(248);
    expect(Math.max(...channels) - Math.min(...channels), section).toBeLessThanOrEqual(2);
  }
  const gallery = page.locator('#gallery');
  await gallery.scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  const contrast = await gallery.locator('p,figcaption,button[aria-pressed]').evaluateAll(elements => {
    const luminance = (text: string) => {
      const channels = (text.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
      return channels.reduce((sum, channel, i) => { const v = channel / 255; return sum + (v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4) * [.2126, .7152, .0722][i]; }, 0);
    };
    return elements.map(element => ({ text: element.textContent, ratio: 1.05 / (luminance(getComputedStyle(element).color) + .05), opacity: Number(getComputedStyle(element).opacity) }));
  });
  for (const sample of contrast) { expect(sample.ratio, sample.text || '').toBeGreaterThanOrEqual(4.5); expect(sample.opacity).toBe(1); }
  await gallery.screenshot({ path: info.outputPath('white-gallery.png'), animations: 'disabled' });
  await page.locator('#film').evaluate(element => { const r = element.getBoundingClientRect(); window.scrollTo({ top: scrollY + r.top + (r.height - innerHeight) * .5, behavior: 'instant' }); });
  const image = page.locator('#film [data-active=true] img');
  await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  const cinematic = await image.evaluate(img => {
    const viewport = document.querySelector('[data-testid="photo-tour-viewport"]')!.getBoundingClientRect();
    const layer = img.parentElement!.getBoundingClientRect();
    return {
      objectFit: getComputedStyle(img).objectFit,
      layerWidth: layer.width,
      layerHeight: layer.height,
      viewportWidth: viewport.width,
      viewportHeight: viewport.height,
    };
  });
  expect(cinematic.objectFit).toBe('cover');
  expect(cinematic.layerWidth).toBeGreaterThanOrEqual(cinematic.viewportWidth * .99);
  expect(cinematic.layerHeight).toBeGreaterThanOrEqual(cinematic.viewportHeight * .99);
  const overlaps = await image.evaluate(img => {
    const frame = img.parentElement!.parentElement!.getBoundingClientRect();
    const section = document.querySelector('#film')!;
    const heading = section.querySelector('h2')!.getBoundingClientRect();
    const top = section.querySelector('a')!.getBoundingClientRect();
    return { caption: frame.bottom > heading.top, navigation: frame.top < top.bottom };
  });
  expect(overlaps).toEqual({ caption: false, navigation: false });
  await page.waitForTimeout(500);
  await page.screenshot({ path: info.outputPath('white-photo-tour.png'), animations: 'disabled' });
});

test('privacy shares the new typography and retired marketing copy is not serialized', async ({ page, request }) => {
  const response = await request.get('/en');
  expect(response.ok()).toBe(true);
  const html = await response.text();
  expect(html).not.toContain('Pine-Canopied Terrace');
  expect(html).not.toContain('High-Speed Wi-Fi (92 Mbps)');
  for (const locale of ['en', 'el', 'tr']) {
    await page.goto(`/${locale}/privacy`);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('h1')).toBeVisible();
    expect(await page.locator('h1').evaluate(element => getComputedStyle(element).fontFamily)).toMatch(/Commissioner/i);
    expect(await page.locator('main').evaluate(element => getComputedStyle(element).backgroundColor)).toBe('rgb(255, 255, 255)');
  }
});
