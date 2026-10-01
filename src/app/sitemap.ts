import type { MetadataRoute } from "next";
import { GUIDES_UPDATED, guideIds, guideMedia } from "@/content/guides";
import { stayPhotos } from "@/content/stay-media";
import { SITE_URL } from "@/lib/site";

/** When the home page's content last changed; bump it with the copy or photos. */
const CONTENT_UPDATED = new Date("2026-10-01");

const locales = ["el", "en", "tr"] as const;
const alternates = (path: string) => ({ languages: { el: `${SITE_URL}/el${path}`, en: `${SITE_URL}/en${path}`, tr: `${SITE_URL}/tr${path}`, "x-default": `${SITE_URL}/en${path}` } });
const photoUrl = (id: string) => SITE_URL + stayPhotos.find(photo => photo.id === id)!.src;

export default function sitemap(): MetadataRoute.Sitemap {
  // Every photograph on the home page, so image search can find the apartment too.
  const home = locales.map(locale => ({
    url: `${SITE_URL}/${locale}`,
    lastModified: CONTENT_UPDATED,
    changeFrequency: "monthly" as const,
    priority: 1,
    alternates: alternates(""),
    images: stayPhotos.map(photo => SITE_URL + photo.src),
  }));
  const guides = guideIds.flatMap(id => locales.map(locale => ({
    url: `${SITE_URL}/${locale}/${id}`,
    lastModified: new Date(GUIDES_UPDATED),
    changeFrequency: "monthly" as const,
    priority: .8,
    alternates: alternates(`/${id}`),
    images: guideMedia[id].photo ? [photoUrl(guideMedia[id].photo!)] : [],
  })));
  return [...home, ...guides];
}
