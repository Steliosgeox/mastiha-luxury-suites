import { test, expect } from "@playwright/test";

test.describe("Mastiha Luxury Suites E2E Suite", () => {
  test("1. Homepage loads with SEO metadata, Hero, and no horizontal scroll", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => {
      console.error("PAGE_ERROR:", err.message, err.stack);
    });

    await page.goto("/en");
    await expect(page).toHaveTitle(/Mastiha Luxury Suites/);

    // Hero headline check
    const heroHeading = page.locator("h1");
    await expect(heroHeading).toContainText("A quieter side of Chios.");

    // Check no horizontal scroll overflow
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);

    // Ensure zero uncaught JS console errors
    expect(errors.filter((e) => !e.includes("favicon"))).toHaveLength(0);
  });

  test("2. Desktop Header is visible with navigation on desktop and collapsed on mobile", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/en");

    const header = page.locator("header");
    await expect(header).toBeVisible();
    await expect(header).toContainText(/Mastiha/i);

    const nav = header.locator('nav[aria-label="Desktop Navigation"]');
    if (isMobile) {
      await expect(nav).toBeHidden();
    } else {
      await expect(nav).toBeVisible();
      await expect(nav.getByRole("button", { name: "Suite" })).toBeVisible();
      await expect(nav.getByRole("button", { name: "Spaces" })).toBeVisible();
      await expect(nav.getByRole("button", { name: "Amenities" })).toBeVisible();
      await expect(nav.getByRole("button", { name: "Location" })).toBeVisible();
      await expect(nav.getByRole("button", { name: "Reviews" })).toBeVisible();

      const bookBtn = header.getByRole("button", { name: /book/i });
      await expect(bookBtn).toBeVisible();

      // Clicking book button opens the booking modal
      await bookBtn.click();
      const modal = page.locator('div[role="dialog"][aria-modal="true"]');
      await expect(modal).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(modal).not.toBeVisible();
    }
  });

  test("3. Mobile Navigation Dock is visible exclusively on mobile viewports and opens booking modal", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/en");

    const mobileDock = page.locator('nav[aria-label="Mobile Bottom Navigation"]');
    if (isMobile) {
      await expect(mobileDock).toBeVisible();
      await expect(mobileDock.getByRole("button", { name: "Suite" })).toBeVisible();
      await expect(mobileDock.getByRole("button", { name: "Spaces" })).toBeVisible();
      await expect(mobileDock.getByRole("button", { name: "Location" })).toBeVisible();
      await expect(mobileDock.getByRole("button", { name: "Reviews" })).toBeVisible();
      await expect(mobileDock.getByRole("button", { name: /book/i })).toBeVisible();

      // Click Book button on mobile dock
      await mobileDock.getByRole("button", { name: /book/i }).click();
      const modal = page.locator('div[role="dialog"][aria-modal="true"]');
      await expect(modal).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(modal).not.toBeVisible();
    } else {
      await expect(mobileDock).toBeHidden();
    }
  });

  test("4. Booking Chooser contains verified partner links for Airbnb and Booking.com", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/en");

    if (isMobile) {
      const mobileDock = page.locator('nav[aria-label="Mobile Bottom Navigation"]');
      await mobileDock.getByRole("button", { name: /book/i }).click();
    } else {
      const header = page.locator("header");
      await header.getByRole("button", { name: /book/i }).click();
    }

    const modal = page.locator('div[role="dialog"][aria-modal="true"]');
    await expect(modal).toBeVisible();

    // Verify Airbnb outbound link
    const airbnbLink = modal.locator('a[href="https://www.airbnb.com/rooms/1368953469779774276"]');
    await expect(airbnbLink).toBeVisible();
    await expect(airbnbLink).toHaveAttribute("target", "_blank");
    await expect(airbnbLink).toHaveAttribute("rel", "noopener noreferrer");

    // Verify Booking.com outbound link
    const bookingLink = modal.locator('a[href="https://www.booking.com/hotel/gr/mastiha-luxury-suites.html"]');
    await expect(bookingLink).toBeVisible();
    await expect(bookingLink).toHaveAttribute("target", "_blank");
    await expect(bookingLink).toHaveAttribute("rel", "noopener noreferrer");

    // Close modal via Escape key
    await page.keyboard.press("Escape");
    await expect(modal).not.toBeVisible();
  });

  test("5. Photo Gallery opens accessible Lightbox with keyboard navigation", async ({
    page,
  }) => {
    await page.goto("/en");

    // Click first gallery item button
    const gallerySection = page.locator("#gallery");
    const firstPhotoBtn = gallerySection.getByRole("button").first();
    await firstPhotoBtn.click();

    // Lightbox should be visible
    const lightbox = page.locator('div[role="dialog"][aria-label="Photo Gallery Lightbox"]');
    await expect(lightbox).toBeVisible();
    await expect(lightbox).toContainText("1 / 6");

    // Navigate with Right Arrow key
    await page.keyboard.press("ArrowRight");
    await expect(lightbox).toContainText("2 / 6");

    // Navigate with Left Arrow key
    await page.keyboard.press("ArrowLeft");
    await expect(lightbox).toContainText("1 / 6");

    // Close via Escape
    await page.keyboard.press("Escape");
    await expect(lightbox).not.toBeVisible();
  });

  test("6. Multilingual routing works for Greek (el) and Turkish (tr)", async ({ page }) => {
    // Navigate to Greek locale
    await page.goto("/el");
    await expect(page.locator("h1")).toContainText("Μια πιο ήρεμη πλευρά της Χίου.");
    await expect(page.locator("body")).toContainText("75 τ.μ.");

    // Navigate to Turkish locale
    await page.goto("/tr");
    await expect(page.locator("h1")).toContainText("Sakız Adası'nın daha sakin bir yüzü.");
    await expect(page.locator("body")).toContainText("75 m²");
  });

  test("7. Verified facts and Greek license number 00003302833 are present in footer", async ({
    page,
  }) => {
    await page.goto("/en");
    const footer = page.locator("footer");
    await expect(footer).toContainText("00003302833");
    await expect(footer).toContainText("Vrontados, Chios");

    // Check Privacy link
    const privacyLink = footer.getByRole("link", { name: "Privacy Policy" });
    await expect(privacyLink).toBeVisible();
  });

  test("8. Structured Data JSON-LD is valid VacationRental schema", async ({ page }) => {
    await page.goto("/en");

    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
    expect(jsonLd).toBeTruthy();

    const data = JSON.parse(jsonLd!);
    expect(data["@context"]).toBe("https://schema.org");
    const graph = data["@graph"];
    const vacationRental = graph.find((item: any) => item["@type"] === "VacationRental");

    expect(vacationRental).toBeDefined();
    expect(vacationRental.name).toBe("Mastiha Luxury Suites");
    expect(vacationRental.floorSize.value).toBe(75);
    expect(vacationRental.occupancy.value).toBe(4);
    expect(vacationRental.numberOfBedrooms).toBe(2);
    expect(vacationRental.numberOfBathroomsTotal).toBe(1);
    expect(vacationRental.aggregateRating.ratingValue).toBe(5.0);
    expect(vacationRental.aggregateRating.reviewCount).toBe(27);
  });
});
