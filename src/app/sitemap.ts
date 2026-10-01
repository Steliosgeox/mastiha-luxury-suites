import type { MetadataRoute } from "next";
import { stayPhotos } from "@/content/stay-media";
import { SITE_URL } from "@/lib/site";

/** When the page's content last changed; bump it with the copy or photos. */
const CONTENT_UPDATED = new Date("2026-10-01");

const languages = { el: `${SITE_URL}/el`, en: `${SITE_URL}/en`, tr: `${SITE_URL}/tr`, "x-default": `${SITE_URL}/en` };
// Every photograph on the page, so image search can find the apartment too.
const images = stayPhotos.map(photo => SITE_URL + photo.src);

export default function sitemap(): MetadataRoute.Sitemap {
  return ["el", "en", "tr"].map(locale => ({
    url: `${SITE_URL}/${locale}`,
    lastModified: CONTENT_UPDATED,
    changeFrequency: "monthly",
    priority: 1,
    alternates: { languages },
    images,
  }));
}
