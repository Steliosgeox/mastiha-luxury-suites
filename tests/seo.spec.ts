import { readdirSync } from "node:fs";
import { expect, test } from "@playwright/test";

/*
  What search engines and AI assistants read: titles, descriptions, language alternates,
  structured data, robots, sitemap, llms.txt and the IndexNow key. Checked on the built site.
*/

const islands = { el: "Χίος", en: "Chios", tr: "Sakız Adası" } as const;

test.describe("search and AI readiness", () => {
  for (const locale of ["el", "en", "tr"] as const) {
    test(`home page metadata and structured data in ${locale}`, async ({ page }) => {
      await page.goto(`/${locale}`);
      await expect(page).toHaveTitle(new RegExp(`^Mastiha Luxury Suites, ${islands[locale]} \\|`));
      const description = await page.locator('meta[name="description"]').getAttribute("content");
      expect(description).toMatch(/Airbnb/);
      expect(description!.length).toBeLessThanOrEqual(160);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/${locale}$`));
      for (const lang of ["el", "en", "tr", "x-default"]) await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveCount(1);
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/og\/mastiha-luxury-suites\.jpg$/);
      await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");

      const graph = JSON.parse(await page.locator('script[type="application/ld+json"]').first().textContent() ?? "{}")["@graph"] as { "@type": string; [key: string]: unknown }[];
      const types = graph.map(node => node["@type"]);
      expect(types).toEqual(expect.arrayContaining(["WebSite", "WebPage", "VacationRental", "FAQPage"]));
      const rental = graph.find(node => node["@type"] === "VacationRental")!;
      expect(rental.sameAs).toEqual(expect.arrayContaining([expect.stringContaining("airbnb.com"), expect.stringContaining("booking.com")]));
      expect(rental).not.toHaveProperty("aggregateRating");

      // The FAQ markup is exactly what the page shows.
      const faq = graph.find(node => node["@type"] === "FAQPage")!.mainEntity as { name: string; acceptedAnswer: { text: string } }[];
      const questions = await page.locator("#information summary").allTextContents();
      const answers = await page.locator("#information details > p").allTextContents();
      expect(faq.map(item => item.name)).toEqual(questions.map(text => text.trim()));
      expect(faq.map(item => item.acceptedAnswer.text)).toEqual(answers);
    });
  }

  test("the privacy page stays out of the index", async ({ page }) => {
    await page.goto("/en/privacy");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("robots, sitemap, llms.txt and the IndexNow key", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Sitemap: ");
    expect(robots).toContain("Disallow: /admin");
    for (const bot of ["GPTBot", "OAI-SearchBot", "ClaudeBot", "PerplexityBot", "Google-Extended"]) expect(robots).toContain(`User-Agent: ${bot}`);

    const sitemap = await (await request.get("/sitemap.xml")).text();
    for (const locale of ["el", "en", "tr"]) expect(sitemap).toContain(`/${locale}</loc>`);
    expect(sitemap).toContain("<image:loc>");

    const llms = await request.get("/llms.txt");
    expect(llms.headers()["content-type"]).toContain("text/plain");
    const text = await llms.text();
    expect(text).toMatch(/^# Mastiha Luxury Suites\n\n> /);
    expect(text).toContain("https://www.airbnb.com/rooms/");
    expect(text).toContain("### How far is Chios port?");

    const keyFile = readdirSync("public").find(name => /^[0-9a-f]{32}\.txt$/.test(name))!;
    expect((await (await request.get(`/${keyFile}`)).text()).trim()).toBe(keyFile.slice(0, -4));
  });
});
