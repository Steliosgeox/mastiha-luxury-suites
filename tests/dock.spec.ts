import { test, expect } from "@playwright/test";
import { createHash } from "node:crypto";

for (const width of [320, 390, 768, 1440]) {
  test(`dock contains every icon and booking label at ${width}px`, async ({ page }, testInfo) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/en");
    const dock = page.getByTestId("mastiha-dock");
    await expect(dock).toBeVisible();
    await expect(dock.locator("button")).toHaveCount(5);
    await expect(dock.locator("img")).toHaveCount(5);
    await expect.poll(() => dock.locator("img").evaluateAll((elements) => elements.every((element) => {
      const image = element as HTMLImageElement;
      return image.complete && image.naturalWidth > 0;
    }))).toBe(true);

    const geometry = await dock.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const failures: string[] = [];
      if (box.left < 0 || box.right > window.innerWidth) failures.push("dock exceeds viewport");
      for (const button of element.querySelectorAll("button")) {
        const buttonBox = button.getBoundingClientRect();
        if (buttonBox.width < 44 || buttonBox.height < 44) failures.push("small tap target");
        for (const child of button.children) {
          const rect = child.getBoundingClientRect();
          if (rect.left < buttonBox.left - 1 || rect.right > buttonBox.right + 1 || rect.top < buttonBox.top - 1 || rect.bottom > buttonBox.bottom + 1) failures.push("button child overflow");
          if (child.tagName === "IMG" && (rect.width > 40 || rect.height > 40)) failures.push("oversized image");
        }
      }
      return failures;
    });
    expect(geometry).toEqual([]);
    const book = dock.getByRole("button", { name: "Book your stay" });
    await expect(book.getByText("Book", { exact: true })).toBeVisible();
    await expect(book.locator("img")).toHaveAttribute("src", "/ui/dock/booking.webp");
    await expect(dock.getByRole("button", { name: "The suite" }).locator("img")).toHaveAttribute("src", "/ui/dock/suite-repaired.webp");
    await dock.screenshot({ path: testInfo.outputPath(`dock-${width}.png`) });
    await page.screenshot({ path: testInfo.outputPath(`page-${width}.png`) });
    await book.focus();
    await page.keyboard.press("Enter");
    const modal = page.getByRole("dialog", { name: "Choose a booking platform" });
    await expect(modal).toBeVisible();
    await expect(modal.locator('a[href="https://www.airbnb.com/rooms/1368953469779774276"]')).toBeVisible();
    await expect(modal.locator('a[href="https://www.booking.com/hotel/gr/mastiha-luxury-suites.html"]')).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(modal).toBeHidden();
    expect(errors).toEqual([]);
  });
}

test("repaired suite asset matches validated export bytes", async ({ request }) => {
  const response = await request.get("/ui/dock/suite-repaired.webp");
  expect(response.ok()).toBe(true);
  const data = await response.body();
  expect(data.length).toBe(4224);
  const hash = createHash("sha1").update(`blob ${data.length}\0`).update(data).digest("hex");
  expect(hash).toBe("f98e8c16141046c00acdf56a093c1de8d5a5a78d");
});
