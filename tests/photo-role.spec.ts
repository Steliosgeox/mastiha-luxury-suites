import { test, expect } from '@playwright/test';

test('hero, tour and editorial storytelling do not lazily repeat the same photographs', async ({ page }) => {
  await page.goto('/en');
  await expect(page.getByTestId('hero-image')).toHaveAttribute('alt', /Living and dining room/i);
  const heroId = await page.locator('[data-hero-media]').getAttribute('data-photo-id');
  expect(heroId).toBe('living');

  const staticIds = await page.locator('main [data-photo-id]').evaluateAll(elements =>
    elements.map(element => element.getAttribute('data-photo-id')).filter(Boolean)
  );
  // Gallery and scroll tour are intentionally excluded: galleries are collections,
  // while the tour has its own alternate angles.
  const nonGallery = await page.locator('main > :not(#gallery):not(#film) [data-photo-id], main > [data-photo-id]').evaluateAll(elements =>
    elements.map(element => element.getAttribute('data-photo-id')).filter(Boolean)
  );
  expect(new Set(nonGallery).size).toBe(nonGallery.length);

  const tour = page.getByTestId('scroll-film');
  await tour.evaluate(element => {
    const r = element.getBoundingClientRect();
    window.scrollTo({ top: scrollY + r.top + 80, behavior: 'instant' });
  });
  await expect(tour.locator('[data-active=true] img')).toHaveAttribute('alt', /Kitchen and appliances/i);
  expect(staticIds.length).toBeGreaterThan(8);
});

test('coffee story is unique and the opening gallery uses fresh photographs', async ({ page }) => {
  await page.goto('/en');
  const editorialEspresso = page.locator('main > :not(#gallery):not(#film) [data-photo-id="espresso"]');
  await expect(editorialEspresso).toHaveCount(1);

  const openingAlts = await page.getByTestId('gallery-grid').locator('img').evaluateAll(images =>
    images.map(image => image.getAttribute('alt') || '')
  );
  expect(openingAlts.some(alt => /espresso|coffee/i.test(alt))).toBe(false);

  const openingSources = await page.getByTestId('gallery-grid').locator('img').evaluateAll(images =>
    images.map(image => (image as HTMLImageElement).src)
  );
  expect(new Set(openingSources).size).toBe(openingSources.length);
});
