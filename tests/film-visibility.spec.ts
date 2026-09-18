import { test, expect } from "@playwright/test";

for (const width of [390, 1440]) {
  test(`film remains on screen while its frames advance and reverse at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/en");
    const film = page.getByTestId("scroll-film"), canvas = page.getByTestId("film-canvas");
    const frames: number[] = [];
    for (const progress of [.2, .8, .35]) {
      await film.evaluate((element, amount) => {
        const box = element.getBoundingClientRect();
        window.scrollTo({ top: window.scrollY + box.top + (box.height - window.innerHeight) * amount, behavior: "instant" });
      }, progress);
      await expect(canvas).toBeInViewport({ ratio: .9 });
      await expect(canvas).toHaveAttribute("data-ready", "true", { timeout: 15000 });
      await expect.poll(() => canvas.evaluate((element) => element.dataset.frame === element.dataset.target), { timeout: 15000 }).toBe(true);
      const box = await canvas.boundingBox();
      expect(box).not.toBeNull(); expect(Math.abs(box!.y)).toBeLessThanOrEqual(2);
      frames.push(Number(await canvas.getAttribute("data-frame")));
      await page.screenshot({ path: info.outputPath(`film-${width}-${progress}.png`) });
    }
    expect(frames[1]).toBeGreaterThan(frames[0]); expect(frames[2]).toBeLessThan(frames[1]);
  });
}
