import { test, expect } from '@playwright/test';
import { stayPhotos, stayPhoto, photoCaption } from '../src/content/stay-media';

test('all 33 PhotoIds resolve their own captions in all three languages', () => {
  expect(stayPhotos).toHaveLength(33);
  expect(new Set(stayPhotos.map(photo => photo.id)).size).toBe(stayPhotos.length);
  for (const photo of stayPhotos) {
    expect(stayPhoto(photo.id)).toBe(photo);
    for (const locale of ['en', 'el', 'tr'] as const) {
      const text = photoCaption(photo.id, locale);
      expect(text).toBe(photo.captions[locale]);
      expect(text.trim().length, `${locale}:${photo.id}`).toBeGreaterThan(3);
      expect(text).not.toContain('undefined');
    }
  }
  expect(photoCaption('keys', 'en')).toBeTruthy();
  expect(photoCaption('kitchen-wide', 'el')).toBeTruthy();
});

test('every rendered property photograph is from the listing catalogue', async ({ page }) => {
  await page.goto('/en');
  await expect(page.getByTestId('hero-image')).toBeVisible();
  const sources = await page.locator('main img').evaluateAll(images => images.map(image => {
    const src = (image as HTMLImageElement).getAttribute('src') || '';
    const url = new URL(src, location.origin);
    return url.pathname === '/_next/image' ? url.searchParams.get('url') : url.pathname;
  }));
  const allowed = new Set(stayPhotos.map(photo => photo.src));
  for (const source of sources) expect(allowed.has(source || ''), source || 'empty image URL').toBe(true);
  const og = await page.locator('meta[property="og:image"]').getAttribute('content');
  expect(og).toContain('/photography/airbnb/living.webp');
  await expect(page.locator('main')).not.toContainText('undefined');
});

for (const locale of ['el', 'tr'] as const) {
  test(`localized dock keeps its icon and booking label contained at 320px in ${locale}`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(`/${locale}`);
    const dock = page.getByTestId('mastiha-dock');
    await expect(dock).toBeVisible();
    const issues = await dock.evaluate(element => {
      const failures: string[] = [];
      const box = element.getBoundingClientRect();
      if (box.left < 0 || box.right > innerWidth) failures.push('dock overflow');
      for (const button of element.querySelectorAll('button')) {
        const b = button.getBoundingClientRect();
        for (const child of button.children) {
          const r = child.getBoundingClientRect();
          if (r.left < b.left - 1 || r.right > b.right + 1 || r.top < b.top - 1 || r.bottom > b.bottom + 1) failures.push('button content overflow');
        }
      }
      return failures;
    });
    expect(issues).toEqual([]);
  });
}
