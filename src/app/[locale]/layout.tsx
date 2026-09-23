import type { ReactNode } from 'react';
import { Commissioner, Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { SmoothScrollProvider } from '@/components/layout/SmoothScrollProvider';
import { localeMetadata } from '@/lib/site';
import '../globals.css';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import 'yet-another-react-lightbox/plugins/captions.css';

// Commissioner is the display face: modern, distinctive and fully Greek-capable.
const display = Commissioner({ subsets: ['latin', 'latin-ext', 'greek'], variable: '--font-display', display: 'swap' });
const sans = Inter({ subsets: ['latin', 'latin-ext', 'greek', 'greek-ext'], variable: '--font-sans', display: 'swap' });

export function generateStaticParams() { return routing.locales.map(locale => ({ locale })); }
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) { return localeMetadata((await params).locale); }

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as 'en' | 'el' | 'tr')) notFound();
  setRequestLocale(locale);
  // Active sections use typed stay/listing copy. Do not ship obsolete template messages.
  return <html lang={locale} className={`${display.variable} ${sans.variable}`}>
    <body className="font-sans antialiased">
      <NextIntlClientProvider locale={locale} messages={{}}>
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </NextIntlClientProvider>
    </body>
  </html>;
}
