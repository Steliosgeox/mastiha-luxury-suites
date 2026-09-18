import { MastihaOdisej } from "@/components/redesign/MastihaOdisej";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <MastihaOdisej locale={locale} />;
}
