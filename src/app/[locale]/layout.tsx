import type { ReactNode } from 'react';
import { EB_Garamond, Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { SmoothScrollProvider } from '@/components/layout/SmoothScrollProvider';
import { localeMetadata } from '@/lib/site';
import '../globals.css';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import 'yet-another-react-lightbox/plugins/captions.css';
const serif=EB_Garamond({subsets:['latin','latin-ext','greek','greek-ext'],variable:'--font-serif',display:'swap'});
const sans=Inter({subsets:['latin','latin-ext','greek','greek-ext'],variable:'--font-sans',display:'swap'});
export function generateStaticParams(){return routing.locales.map(locale=>({locale}));}
export async function generateMetadata({params}:{params:Promise<{locale:string}>}) {return localeMetadata((await params).locale);}
export default async function LocaleLayout({children,params}:{children:ReactNode;params:Promise<{locale:string}>}) {
 const {locale}=await params;if(!routing.locales.includes(locale as 'en'|'el'|'tr'))notFound();
 setRequestLocale(locale);const messages=await getMessages();
 return <html lang={locale} className={`${serif.variable} ${sans.variable}`}><body className="font-sans antialiased bg-plaster text-ink selection:bg-mastiha-resin selection:text-ink"><NextIntlClientProvider locale={locale} messages={messages}><SmoothScrollProvider>{children}</SmoothScrollProvider></NextIntlClientProvider></body></html>;
}
