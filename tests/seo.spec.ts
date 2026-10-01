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

  const guideTitles = {
    chios: { el: "Οδηγός για τη Χίο", en: "A guide to Chios", tr: "Sakız Adası rehberi" },
    vrontados: { el: "Ο Βροντάδος, η γειτονιά μας", en: "Vrontados, our neighbourhood", tr: "Vrontados, mahallemiz" },
    mastiha: { el: "Η μαστίχα, ο θησαυρός της Χίου", en: "Mastiha, the treasure of Chios", tr: "Mastiha, Sakız Adası’nın hazinesi" },
  } as const;
  for (const [id, titles] of Object.entries(guideTitles)) {
    test(`the ${id} guide in three languages`, async ({ page }) => {
      for (const locale of ["el", "en", "tr"] as const) {
        const response = await page.goto(`/${locale}/${id}`);
        expect(response?.status()).toBe(200);
        await expect(page.locator("html")).toHaveAttribute("lang", locale);
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(titles[locale]);
        await expect(page).toHaveTitle(/\| Mastiha Luxury Suites$/);
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/${locale}/${id}$`));
        for (const lang of ["el", "en", "tr", "x-default"]) await expect(page.locator(`link[rel="alternate"][hreflang="${lang}"]`)).toHaveAttribute("href", new RegExp(`/${id}$`));
        await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
        const graph = JSON.parse(await page.locator('script[type="application/ld+json"]').first().textContent() ?? "{}")["@graph"] as { "@type": string; [key: string]: unknown }[];
        const article = graph.find(node => node["@type"] === "Article")!;
        expect(article.headline).toBe(titles[locale]);
        expect((article.about as { sameAs: string }).sameAs).toMatch(/^https:\/\/en\.wikipedia\.org\/wiki\//);
        const crumbs = graph.find(node => node["@type"] === "BreadcrumbList")!.itemListElement as { item: string }[];
        expect(crumbs.map(crumb => new URL(crumb.item).pathname)).toEqual([`/${locale}`, `/${locale}/${id}`]);
        // Every guide leads back to the apartment and its listings.
        await expect(page.locator(`a[href="/${locale}"]`).first()).toBeVisible();
        await expect(page.locator('a[href^="https://www.airbnb.com/rooms/"]')).toHaveCount(1);
      }
    });
  }

  test("unknown guides are 404 and the home page links to every guide", async ({ page }) => {
    expect((await page.goto("/en/not-a-guide"))?.status()).toBe(404);
    await page.goto("/el");
    for (const id of Object.keys(guideTitles)) await expect(page.locator(`footer a[href="/el/${id}"]`)).toHaveCount(1);
    await expect(page.locator('#vrontados a[href="/el/vrontados"]')).toHaveCount(1);
  });

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
    for (const id of ["chios", "vrontados", "mastiha"]) for (const locale of ["el", "en", "tr"]) expect(sitemap).toContain(`/${locale}/${id}</loc>`);

    const llms = await request.get("/llms.txt");
    expect(llms.headers()["content-type"]).toContain("text/plain");
    const text = await llms.text();
    expect(text).toMatch(/^# Mastiha Luxury Suites\n\n> /);
    expect(text).toContain("https://www.airbnb.com/rooms/");
    expect(text).toContain("### How far is Chios port?");
    expect(text).toContain("## Guides by the host");
    expect(text).toContain("/en/mastiha)");

    const keyFile = readdirSync("public").find(name => /^[0-9a-f]{32}\.txt$/.test(name))!;
    expect((await (await request.get(`/${keyFile}`)).text()).trim()).toBe(keyFile.slice(0, -4));
  });
});
