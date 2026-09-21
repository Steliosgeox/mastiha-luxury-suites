import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
export default function sitemap():MetadataRoute.Sitemap {return ['en','el','tr'].map(locale=>({url:`${SITE_URL}/${locale}`,lastModified:new Date('2026-09-21'),alternates:{languages:{en:`${SITE_URL}/en`,el:`${SITE_URL}/el`,tr:`${SITE_URL}/tr`,'x-default':`${SITE_URL}/en`}}}));}
