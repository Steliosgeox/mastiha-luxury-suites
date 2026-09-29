import type { ReactNode } from "react";
import { Geologica, Inter } from "next/font/google";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import { routing } from "@/i18n/routing";
import { localeMetadata } from "@/lib/site";
import "../globals.css";

const display = Geologica({ subsets: ["latin", "latin-ext", "greek"], variable: "--font-display", display: "swap" });
const sans = Inter({ subsets: ["latin", "latin-ext", "greek", "greek-ext"], variable: "--font-sans", display: "swap" });

type Props = { children: ReactNode; params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }));
}

export async function generateMetadata({ params }: Props) {
  return localeMetadata((await params).locale);
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) notFound();
  setRequestLocale(locale);
  return <html lang={locale} className={`${display.variable} ${sans.variable}`}>
    <body>
      <SmoothScrollProvider>{children}</SmoothScrollProvider>
    </body>
  </html>;
}
