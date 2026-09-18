import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mastihasuites.gr";
  const locales = ["en", "el", "tr"];
  const routes = ["", "/privacy"];

  const entries: MetadataRoute.Sitemap = [];

  for (const route of routes) {
    for (const locale of locales) {
      entries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date("2026-09-18"),
        changeFrequency: "weekly",
        priority: route === "" ? 1.0 : 0.4,
        alternates: {
          languages: {
            en: `${baseUrl}/en${route}`,
            el: `${baseUrl}/el${route}`,
            tr: `${baseUrl}/tr${route}`,
            "x-default": `${baseUrl}/en${route}`,
          },
        },
      });
    }
  }

  return entries;
}
