import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const languages = { el: `${SITE_URL}/el`, en: `${SITE_URL}/en`, tr: `${SITE_URL}/tr`, "x-default": `${SITE_URL}/en` };

export default function sitemap(): MetadataRoute.Sitemap {
  return ["el", "en", "tr"].map(locale => ({ url: `${SITE_URL}/${locale}`, lastModified: new Date("2026-09-29"), alternates: { languages } }));
}
