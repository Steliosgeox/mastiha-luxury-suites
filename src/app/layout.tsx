import type { Metadata } from "next";
import { EB_Garamond, Inter } from "next/font/google";
import "./globals.css";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import "yet-another-react-lightbox/plugins/captions.css";

const ebGaramond = EB_Garamond({
  subsets: ["latin", "latin-ext", "greek", "greek-ext"],
  variable: "--font-serif",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext", "greek", "greek-ext"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://mastihasuites.gr"),
  title: {
    template: "%s | Mastiha Luxury Suites",
    default: "Mastiha Luxury Suites | Seaside Stay in Vrontados, Chios",
  },
  description:
    "A private 75 m² home for up to four guests in Vrontados, Chios, moments from the Aegean with two bedrooms, sea views, free private parking and modern amenities.",
  keywords: [
    "Mastiha Luxury Suites",
    "Vrontados accommodation",
    "Chios luxury stay",
    "Chios vacation rental",
    "seaside accommodation Chios",
    "holiday home Chios",
    "Vrontados Chios",
  ],
  authors: [{ name: "Mastiha Luxury Suites" }],
  creator: "Mastiha Luxury Suites",
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["el_GR", "tr_TR"],
    url: "https://mastihasuites.gr",
    siteName: "Mastiha Luxury Suites",
    title: "Mastiha Luxury Suites | Seaside Stay in Vrontados, Chios",
    description:
      "A private 75 m² seaside sanctuary for up to four guests in Vrontados, Chios. 40 metres from the Aegean shore with free private parking.",
    images: [
      {
        url: "/photography/hero.webp",
        width: 1920,
        height: 1080,
        alt: "Mastiha Luxury Suites private pine-view terrace overlooking the Aegean",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mastiha Luxury Suites | Seaside Stay in Vrontados, Chios",
    description: "A private 75 m² seaside sanctuary for up to four guests in Vrontados, Chios.",
    images: ["/photography/hero.webp"],
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${ebGaramond.variable} ${inter.variable}`}>
      <body className="font-sans antialiased bg-plaster text-ink selection:bg-mastiha-resin selection:text-ink">
        {children}
      </body>
    </html>
  );
}
