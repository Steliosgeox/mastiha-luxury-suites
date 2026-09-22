import { test, expect } from '@playwright/test';

async function seek(page: import('@playwright/test').Page, progress: number) {
  const tour = page.getByTestId('scroll-film');
  await tour.evaluate((element, p) => {
    const r = element.getBoundingClientRect();
    window.scrollTo({ top: scrollY + r.top + (r.height - innerHeight) * p, behavior: 'instant' });
  }, progress);
}

test('tour uses pre-encoded responsive files without waiting on the image optimizer', async ({ page }) => {
  await page.goto('/en');
  const tour = page.getByTestId('scroll-film');
  await expect(tour).toHaveAttribute('data-static', 'false');
  await seek(page, .85);
  await expect(tour).toHaveAttribute('data-frame', '4');
  await expect(tour.locator('img')).toHaveCount(5);
  const sources = await tour.locator('img').evaluateAll(images => images.map(image => ({
    current: (image as HTMLImageElement).currentSrc,
    srcSet: image.getAttribute('srcset'),
  })));
  for (const source of sources) {
    expect(source.current).toContain('/photography/airbnb/');
    expect(source.current).not.toContain('/_next/image');
    expect(source.srcSet).toContain('640w');
  }
});

test('a failed requested photo retains the previous loaded photo and matching caption', async ({ page }) => {
  let failed = 0;
  await page.route('**/photography/airbnb/terrace*.webp', route => {
    failed++;
    return route.fulfill({ status: 503, contentType: 'text/plain', body: 'Test: unavailable photograph' });
  });
  await page.goto('/en');
  const tour = page.getByTestId('scroll-film');
  await expect(tour).toHaveAttribute('data-static', 'false');
  await seek(page, .35);
  await expect(tour).toHaveAttribute('data-frame', '1');
  const caption = await tour.locator('h2').textContent();
  await seek(page, .85);
  await expect(tour).toHaveAttribute('data-target', '4');
  await expect.poll(() => failed).toBeGreaterThan(0);
  await expect(tour).toHaveAttribute('data-frame', '1');
  await expect(tour.locator('h2')).toHaveText(caption!);
  await expect.poll(() => tour.locator('[data-active=true] img').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
});
