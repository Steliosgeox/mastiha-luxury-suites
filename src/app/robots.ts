import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
export default function robots():MetadataRoute.Robots {return process.env.VERCEL_ENV==='preview'?{rules:{userAgent:'*',disallow:'/'}}:{rules:{userAgent:'*',allow:'/'},sitemap:`${SITE_URL}/sitemap.xml`};}
