import { test, expect } from '@playwright/test';

test('skip link stays visually hidden until focus and transfers focus to content', async ({ page }) => {
  await page.goto('/en');
  const skip = page.getByRole('link', { name: 'Skip to the suite', exact: true });
  await expect(skip).toHaveCSS('clip-path', 'inset(50%)');
  await page.keyboard.press('Tab');
  await expect(skip).toBeFocused();
  await expect(skip).toHaveCSS('clip-path', 'none');
  expect((await skip.boundingBox())!.y).toBeGreaterThanOrEqual(0);
  await page.keyboard.press('Enter');
  await expect(page.locator('#suite')).toBeFocused();
  await expect(skip).toHaveCSS('clip-path', 'inset(50%)');
  await page.keyboard.press('Tab');
  await expect(page.locator('#suite').getByRole('button').first()).toBeFocused();
  await expect(page.locator('#suite')).not.toHaveAttribute('tabindex');
});
