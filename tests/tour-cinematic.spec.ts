import { test, expect } from '@playwright/test';

for (const width of [390, 768, 1440, 1920]) {
  test(`cinematic tour fills and centers the viewport at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 900 });
    await page.goto('/en');
    const tour = page.getByTestId('scroll-film');
    await expect(tour).toHaveAttribute('data-static', 'false');
    await tour.evaluate(element => {
      const r = element.getBoundingClientRect();
      window.scrollTo({ top: scrollY + r.top + (r.height - innerHeight) * .12, behavior: 'instant' });
    });
    await expect(tour).toHaveAttribute('data-target', '0');
    await expect(tour).toHaveAttribute('data-frame', '0', { timeout: 15000 });
    const active = tour.locator('[data-active=true]');
    const image = active.locator('img');
    await expect.poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    const geometry = await active.evaluate(layer => {
      const viewport = layer.parentElement!.parentElement!.getBoundingClientRect();
      const image = layer.querySelector('img')!;
      const layerRect = layer.getBoundingClientRect();
      return {
        objectFit: getComputedStyle(image).objectFit,
        layerWidth: layerRect.width,
        layerHeight: layerRect.height,
        viewportWidth: viewport.width,
        viewportHeight: viewport.height,
        centerDelta: Math.abs((layerRect.left + layerRect.width / 2) - (viewport.left + viewport.width / 2)),
      };
    });
    expect(geometry.objectFit).toBe('cover');
    expect(geometry.layerWidth).toBeGreaterThanOrEqual(geometry.viewportWidth * .99);
    expect(geometry.layerHeight).toBeGreaterThanOrEqual(geometry.viewportHeight * .99);
    expect(geometry.centerDelta).toBeLessThan(2);
    await page.screenshot({ path: info.outputPath(`tour-fullbleed-${width}.png`), animations: 'disabled' });
  });
}
