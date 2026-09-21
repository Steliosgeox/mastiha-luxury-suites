import { MastihaOdisej } from '@/components/redesign/MastihaOdisej';
import { setRequestLocale } from 'next-intl/server';
import { getStructuredData } from '@/lib/seo';
import { localeMetadata } from '@/lib/site';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}) {return localeMetadata((await params).locale);}
export default async function HomePage({params}:{params:Promise<{locale:string}>}) {
 const {locale}=await params;setRequestLocale(locale);
 return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(getStructuredData(locale)).replace(/</g,'\\u003c')}}/><MastihaOdisej locale={locale}/></>;
}
