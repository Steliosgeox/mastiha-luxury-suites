import { setRequestLocale } from "next-intl/server";
import { SitePage } from "@/components/site/SitePage";
import { normalizeStayLocale } from "@/content/stay-copy";
import { getStructuredData } from "@/lib/seo";
import { localeMetadata } from "@/lib/site";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  return localeMetadata((await params).locale);
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const structuredData = JSON.stringify(getStructuredData(locale)).replace(/</g, "\\u003c");
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
    <SitePage locale={normalizeStayLocale(locale)} />
  </>;
}
