import { test, expect } from '@playwright/test';

test('destination copy has readable contrast on the light section', async ({ page }, info) => {
  await page.goto('/en');
  const section = page.locator('section[aria-labelledby="neighbourhood-title"]');
  await section.scrollIntoViewIfNeeded();
  const contrast = await section.locator('p').first().evaluate(element => {
    const rgb = (text: string) => (text.match(/[\d.]+/g) || []).map(Number);
    const lum = (channels: number[]) => channels.slice(0, 3).reduce((sum, channel, i) => {
      const v = channel / 255;
      return sum + (v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4) * [.2126, .7152, .0722][i];
    }, 0);
    let parent: Element | null = element;
    let background = [245, 241, 233];
    while (parent) {
      const color = rgb(getComputedStyle(parent).backgroundColor);
      if (color.length === 3 || color[3] === 1) { background = color; break; }
      parent = parent.parentElement;
    }
    const a = lum(rgb(getComputedStyle(element).color)), b = lum(background);
    return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
  });
  expect(contrast).toBeGreaterThanOrEqual(4.5);
  await section.screenshot({ path: info.outputPath('neighbourhood-contrast.png'), animations: 'disabled' });
});

test('photo-tour crossfade settles to one unobscured authentic image', async ({ page }, info) => {
  await page.goto('/en');
  const tour = page.getByTestId('scroll-film');
  await expect(tour).toHaveAttribute('data-static', 'false');
  await tour.evaluate(element => {
    const r = element.getBoundingClientRect();
    window.scrollTo({ top: scrollY + r.top + (r.height - innerHeight) * .85, behavior: 'instant' });
  });
  await expect(tour).toHaveAttribute('data-target', '4');
  await expect(tour).toHaveAttribute('data-frame', '4', { timeout: 15000 });
  await expect.poll(() => tour.locator('[data-active=true]').evaluate(element => Number(getComputedStyle(element).opacity))).toBe(1);
  await expect.poll(() => tour.locator('[data-active=false]').evaluateAll(elements => elements.every(element => Number(getComputedStyle(element).opacity) === 0))).toBe(true);
  await page.screenshot({ path: info.outputPath('photo-tour-settled.png'), animations: 'disabled' });
});
