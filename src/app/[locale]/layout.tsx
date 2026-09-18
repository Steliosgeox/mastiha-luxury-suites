import React from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import { getStructuredData } from "@/lib/seo";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "el" | "tr")) {
    notFound();
  }

  const messages = await getMessages();
  const structuredData = getStructuredData(locale);

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <SmoothScrollProvider>
        {/* VacationRental JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </SmoothScrollProvider>
    </NextIntlClientProvider>
  );
}
