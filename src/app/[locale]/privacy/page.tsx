import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { propertyData as property } from "@/content/property";
import { PRIVACY_COPY, PRIVACY_UPDATED } from "@/content/privacy-copy";
import { fillCopy, formatDate, normalizeStayLocale } from "@/content/stay-copy";
import { localeMetadata } from "@/lib/site";
import s from "./privacy.module.css";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  return localeMetadata((await params).locale, true);
}

export default async function PrivacyPage({ params }: Props) {
  const locale = normalizeStayLocale((await params).locale);
  setRequestLocale(locale);
  const c = PRIVACY_COPY[locale];
  return <main className={s.page}>
    <Link href={`/${locale}`} className={s.back}>← {c.back}</Link>
    <h1>{c.title}</h1>
    <p className={s.updated}>{fillCopy(c.updated, { date: formatDate(PRIVACY_UPDATED, locale) })}</p>
    {c.sections.map(section => <section key={section.heading}>
      <h2>{section.heading}</h2>
      <p>{fillCopy(section.body, { license: property.licenseNumber })}</p>
    </section>)}
  </main>;
}
