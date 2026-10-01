import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { GuidePage } from "@/components/guide/GuidePage";
import { guideIds, isGuideId } from "@/content/guides";
import { normalizeStayLocale } from "@/content/stay-copy";
import { getGuideStructuredData } from "@/lib/seo";
import { guideMetadata } from "@/lib/site";

type Props = { params: Promise<{ locale: string; guide: string }> };

export function generateStaticParams() {
  return guideIds.map(guide => ({ guide }));
}

export async function generateMetadata({ params }: Props) {
  const { locale, guide } = await params;
  return isGuideId(guide) ? guideMetadata(guide, locale) : {};
}

export default async function GuideRoute({ params }: Props) {
  const { locale, guide } = await params;
  // Only the guides that exist; anything else is the localised 404.
  if (!isGuideId(guide)) notFound();
  setRequestLocale(locale);
  const structuredData = JSON.stringify(getGuideStructuredData(guide, locale)).replace(/</g, "\\u003c");
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
    <GuidePage id={guide} locale={normalizeStayLocale(locale)} />
  </>;
}
