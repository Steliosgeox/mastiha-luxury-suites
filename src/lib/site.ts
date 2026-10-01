import type { Metadata } from "next";
import { propertyData as property } from "@/content/property";
import { reviewStats } from "@/content/reviews";
import { formatScore, normalizeStayLocale, type StayLocale } from "@/content/stay-copy";
import { photoCaption } from "@/content/stay-media";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://mastiha-luxury-suites.vercel.app").replace(/\/$/, "");

export const descriptions: Record<StayLocale, string> = {
  el: "Διαμέρισμα 75 τ.μ. για έως τέσσερα άτομα στον Βροντάδο Χίου, 40 μέτρα από τη θάλασσα. Δύο υπνοδωμάτια, κουζίνα, μπαλκόνι και δωρεάν ιδιωτικό πάρκινγκ.",
  en: "A 75 m² apartment for up to four in Vrontados, Chios, 40 metres from the sea. Two bedrooms, a full kitchen, a balcony and free private parking.",
  tr: "Sakız Adası Vrontados’ta, denize 40 metre mesafede, dört kişiye kadar 75 m² daire. İki yatak odası, mutfak, balkon ve ücretsiz özel otopark.",
};

/** What a search result shows: the scores guests gave, then the apartment (about 155 characters). */
export function metaDescription(lang: StayLocale): string {
  const airbnb = formatScore(reviewStats.airbnb.score, lang);
  const booking = formatScore(reviewStats.booking.score, lang);
  const { areaM2: area, maxGuests: guests, distanceToSeaMeters: sea } = property;
  return {
    el: `Διαμέρισμα ${area} τ.μ. δίπλα στη θάλασσα στον Βροντάδο Χίου, με ${airbnb} στο Airbnb και ${booking} στο Booking.com. Δύο υπνοδωμάτια, έως ${guests} άτομα, δωρεάν πάρκινγκ.`,
    en: `A ${area} m² seaside apartment in Vrontados, Chios, rated ${airbnb} on Airbnb and ${booking} on Booking.com. Two bedrooms, sleeps ${guests}, full kitchen, free parking.`,
    tr: `Sakız Adası Vrontados’ta denize ${sea} m mesafede ${area} m² daire; Airbnb’de ${airbnb}, Booking.com’da ${booking} puan. İki yatak odası, ${guests} kişilik, ücretsiz otopark.`,
  }[lang];
}

// The brand with the island first (what people search for), then what the place is.
const titles: Record<StayLocale, { home: string; privacy: string }> = {
  el: { home: "Mastiha Luxury Suites, Χίος | Διαμέρισμα δίπλα στη θάλασσα στον Βροντάδο", privacy: "Mastiha Luxury Suites | Απόρρητο" },
  en: { home: "Mastiha Luxury Suites, Chios | Seaside apartment in Vrontados", privacy: "Mastiha Luxury Suites | Privacy" },
  tr: { home: "Mastiha Luxury Suites, Sakız Adası | Vrontados’ta denize yakın daire", privacy: "Mastiha Luxury Suites | Gizlilik" },
};

const ogLocales: Record<StayLocale, string> = { el: "el_GR", en: "en_US", tr: "tr_TR" };

/** The link preview: the living room, cropped to 1200×630 (what WhatsApp, Facebook and iMessage expect). */
const shareImage = { url: "/og/mastiha-luxury-suites.jpg", width: 1200, height: 630, type: "image/jpeg" };

/** Search Console and Bing Webmaster Tools ownership tags, set in Vercel when the owner adds the site. */
function verification(): Metadata["verification"] {
  const google = process.env.GOOGLE_SITE_VERIFICATION?.trim();
  const bing = process.env.BING_SITE_VERIFICATION?.trim();
  if (!google && !bing) return undefined;
  return { ...(google ? { google } : {}), ...(bing ? { other: { "msvalidate.01": bing } } : {}) };
}

export function localeMetadata(locale: string, privacy = false): Metadata {
  const lang = normalizeStayLocale(locale);
  const path = privacy ? "/privacy" : "";
  const title = titles[lang][privacy ? "privacy" : "home"];
  const description = privacy ? descriptions[lang] : metaDescription(lang);
  const image = { ...shareImage, alt: photoCaption("living", lang) };
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/${lang}${path}`,
      languages: { el: `${SITE_URL}/el${path}`, en: `${SITE_URL}/en${path}`, tr: `${SITE_URL}/tr${path}`, "x-default": `${SITE_URL}/en${path}` },
    },
    robots: process.env.VERCEL_ENV === "preview" ? { index: false, follow: false } : { index: !privacy, follow: true },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${SITE_URL}/${lang}${path}`,
      siteName: "Mastiha Luxury Suites",
      locale: ogLocales[lang],
      alternateLocale: Object.entries(ogLocales).filter(([code]) => code !== lang).map(([, value]) => value),
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
    icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
    category: "travel",
    verification: verification(),
  };
}
