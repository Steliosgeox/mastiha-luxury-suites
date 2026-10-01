import type { Metadata } from "next";
import { normalizeStayLocale, type StayLocale } from "@/content/stay-copy";
import { stayPhoto } from "@/content/stay-media";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://mastiha-luxury-suites.vercel.app").replace(/\/$/, "");

export const descriptions: Record<StayLocale, string> = {
  el: "Διαμέρισμα 75 τ.μ. για έως τέσσερα άτομα στον Βροντάδο Χίου, 40 μέτρα από τη θάλασσα. Δύο υπνοδωμάτια, κουζίνα, μπαλκόνι και δωρεάν ιδιωτικό πάρκινγκ.",
  en: "A 75 m² apartment for up to four in Vrontados, Chios, 40 metres from the sea. Two bedrooms, a full kitchen, a balcony and free private parking.",
  tr: "Sakız Adası Vrontados’ta, denize 40 metre mesafede, dört kişiye kadar 75 m² daire. İki yatak odası, mutfak, balkon ve ücretsiz özel otopark.",
};

const titles: Record<StayLocale, { home: string; privacy: string }> = {
  el: { home: "Διαμέρισμα στον Βροντάδο Χίου", privacy: "Απόρρητο" },
  en: { home: "Apartment in Vrontados, Chios", privacy: "Privacy" },
  tr: { home: "Vrontados, Sakız Adası’nda daire", privacy: "Gizlilik" },
};

const ogLocales: Record<StayLocale, string> = { el: "el_GR", en: "en_US", tr: "tr_TR" };

export function localeMetadata(locale: string, privacy = false): Metadata {
  const lang = normalizeStayLocale(locale);
  const path = privacy ? "/privacy" : "";
  const title = `Mastiha Luxury Suites | ${titles[lang][privacy ? "privacy" : "home"]}`;
  const image = stayPhoto("living");
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description: descriptions[lang],
    alternates: {
      canonical: `${SITE_URL}/${lang}${path}`,
      languages: { el: `${SITE_URL}/el${path}`, en: `${SITE_URL}/en${path}`, tr: `${SITE_URL}/tr${path}`, "x-default": `${SITE_URL}/en${path}` },
    },
    robots: process.env.VERCEL_ENV === "preview" ? { index: false, follow: false } : { index: !privacy, follow: true },
    openGraph: {
      type: "website",
      title,
      description: descriptions[lang],
      url: `${SITE_URL}/${lang}${path}`,
      siteName: "Mastiha Luxury Suites",
      locale: ogLocales[lang],
      images: [{ url: image.src, width: image.width, height: image.height, alt: image.captions[lang] }],
    },
    twitter: { card: "summary_large_image", title, description: descriptions[lang], images: [image.src] },
    icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
  };
}
