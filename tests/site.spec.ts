import { expect, test, type Page } from "@playwright/test";

const collectErrors = (page: Page) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  return errors;
};

test.describe("page", () => {
  for (const [locale, title] of [["el", "Καλώς ήρθατε στο Mastiha"], ["en", "Welcome to Mastiha"], ["tr", "Mastiha’ya hoş geldiniz"]] as const) {
    test(`renders every section in ${locale}`, async ({ page }) => {
      const errors = collectErrors(page);
      await page.goto(`/${locale}`);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.getByRole("heading", { level: 1, name: "Mastiha Luxury Suites" })).toBeVisible();
      await expect(page.getByTestId("hero-image")).toHaveAttribute("src", /living/);
      for (const id of ["suite", "spaces", "family", "kitchen", "gallery", "amenities", "reviews", "location", "nearby", "vrontados", "host", "information", "book"]) {
        await expect(page.locator(`#${id}`)).toHaveCount(1);
      }
      await expect(page.locator("#suite-title")).toHaveText(title);
      expect(errors).toEqual([]);
    });
  }

  test("Greek copy reads like a Greek host wrote it", async ({ page }) => {
    await page.goto("/el");
    // SplitText wraps heading lines in elements, so compare whitespace-normalised text.
    const text = (await page.locator("main").textContent() ?? "").replace(/\s+/g, " ");
    for (const heading of ["Ταξιδεύετε με παιδιά;", "Τι άλλο έχει ο Βροντάδος", "Η γειτονιά μας", "Πού θα μας βρείτε", "Συχνές ερωτήσεις", "Σας περιμένουμε στη Χίο"]) {
      expect(text).toContain(heading);
    }
    // Calques and slogans from the old machine-written copy must not come back.
    for (const phrase of ["Πέρα από την πόρτα", "Κάντε χώρο", "Αφήστε τη μέρα απέξω", "Τα καθημερινά,", "Το νησί ξεκινά", "Πρώτα ο καφές", "Κυλήστε"]) {
      expect(text).not.toContain(phrase);
    }
    // Greek decimals use a comma.
    await expect(page.getByTestId("review-score").first()).toHaveText("5,0");
  });

  test("only our own photographs are shown", async ({ page }) => {
    await page.goto("/en");
    const sources = await page.locator("img").evaluateAll(images => images.map(image => (image as HTMLImageElement).currentSrc || (image as HTMLImageElement).src));
    for (const source of sources) {
      const url = new URL(source);
      const path = url.pathname === "/_next/image" ? url.searchParams.get("url")! : url.pathname;
      expect(path, source).toMatch(/^\/(photography\/(airbnb|booking)|ui\/dock)\//);
    }
  });

  test("the family section shows the children's equipment", async ({ page }) => {
    await page.goto("/en");
    const family = page.getByTestId("family-section");
    for (const id of ["kids-corner", "toys", "cot", "playpen", "crib", "high-chair"]) {
      await expect(family.locator(`[data-photo-id="${id}"]`)).toHaveCount(1);
    }
  });

  test("gallery filters and the lightbox", async ({ page }) => {
    await page.goto("/en");
    const gallery = page.locator("#gallery");
    await gallery.scrollIntoViewIfNeeded();
    await gallery.getByRole("button", { name: "For children" }).click();
    await expect(gallery.getByTestId("gallery-grid").locator("figure")).toHaveCount(6);
    await expect(gallery.getByText("6 photos")).toBeVisible();
    await gallery.getByRole("button", { name: "All", exact: true }).click();
    const opener = gallery.getByTestId("gallery-grid").getByRole("button").first();
    await opener.click();
    await expect(page.locator(".yarl__root")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator(".yarl__root")).toHaveCount(0);
    await expect(opener).toBeFocused();
  });

  test("booking dialog links to the real listings", async ({ page }) => {
    await page.goto("/el");
    await page.getByTestId("landing-hero").getByRole("button", { name: /Διαθεσιμότητα/ }).click();
    const dialog = page.getByRole("dialog", { name: "Κράτηση" });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('a[href="https://www.airbnb.com/rooms/1368953469779774276"]')).toBeVisible();
    await expect(dialog.locator('a[href="https://www.booking.com/hotel/gr/mastiha-luxury-suites.html"]')).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("the Google map loads only on request", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByTestId("google-map")).toHaveCount(0);
    await page.getByRole("button", { name: "Show map" }).click();
    await expect(page.getByTestId("google-map")).toHaveAttribute("src", /place_id%3AChIJC2Y7IgBmuxQRQN6ormboZOk/);
  });

  test("works on a narrow phone without sideways scrolling", async ({ page }) => {
    const errors = collectErrors(page);
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto("/el");
    await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    expect(errors).toEqual([]);
  });

  test("everything is visible with reduced motion", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/en");
    await page.locator("#vrontados").scrollIntoViewIfNeeded();
    await expect(page.locator("#vrontados-title")).toBeVisible();
    await expect(page.getByTestId("scroll-film")).toHaveAttribute("data-static", "true");
    await context.close();
  });

  test("the family photographs pin and slide sideways on a wide screen", async ({ page }) => {
    // The photo tour above grows once its script runs; the pin below must be measured after that,
    // or it starts thousands of pixels early and the section never pins.
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en");
    await expect(page.getByTestId("scroll-film")).toHaveAttribute("data-static", "false");
    await page.waitForLoadState("networkidle");
    const section = page.locator("#family");
    const firstCard = section.locator("[role=listitem]").first();
    await expect(section.locator("xpath=..")).toHaveClass(/pin-spacer/);
    const startLeft = (await firstCard.boundingBox())!.x;
    await page.evaluate(() => {
      const spacer = document.getElementById("family")!.parentElement!;
      window.scrollTo(0, spacer.getBoundingClientRect().top + window.scrollY + 500);
    });
    await expect.poll(() => section.evaluate(element => getComputedStyle(element).position)).toBe("fixed");
    await expect.poll(async () => (await firstCard.boundingBox())!.x).toBeLessThan(startLeft - 200);
  });

  test("privacy page and 404 are localised", async ({ page }) => {
    await page.goto("/el/privacy");
    await expect(page.getByRole("heading", { level: 1, name: "Απόρρητο" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Συνομιλίες" })).toBeVisible();
    const missing = await page.goto("/el/does-not-exist");
    expect(missing?.status()).toBe(404);
    await expect(page.getByText("Η σελίδα δεν βρέθηκε")).toBeVisible();
  });
});
