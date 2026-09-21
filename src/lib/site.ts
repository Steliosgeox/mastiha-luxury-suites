import type { Metadata } from 'next';
import { normalizeStayLocale } from '@/content/stay-copy';
import { stayPhoto } from '@/content/stay-media';
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://mastiha-luxury-suites.vercel.app').replace(/\/$/,'');
export const descriptions = {
 en:'A private 75 m² home for up to four guests in Vrontados, Chios. Two bedrooms, equipped kitchen, balcony and real photographs of every space.',
 el:'Ιδιωτικό σπίτι 75 τ.μ. για έως τέσσερις επισκέπτες στον Βροντάδο Χίου. Δύο υπνοδωμάτια, εξοπλισμένη κουζίνα, μπαλκόνι και πραγματικές φωτογραφίες.',
 tr:'Sakız Adası Vrontados’ta dört kişiye kadar 75 m² özel ev. İki yatak odası, donanımlı mutfak, balkon ve her alanın gerçek fotoğrafları.',
};
export function localeMetadata(locale:string, privacy=false):Metadata {
 const lang=normalizeStayLocale(locale), suffix=privacy?'/privacy':'';
 const title=privacy?{en:'Privacy',el:'Απόρρητο',tr:'Gizlilik'}[lang]:{en:'A private stay in Vrontados, Chios',el:'Ιδιωτική διαμονή στον Βροντάδο Χίου',tr:'Vrontados, Sakız Adası’nda özel konaklama'}[lang];
 const image=stayPhoto('living');
 return {metadataBase:new URL(SITE_URL),title:`Mastiha Luxury Suites | ${title}`,description:descriptions[lang],
  alternates:{canonical:`${SITE_URL}/${lang}${suffix}`,languages:{en:`${SITE_URL}/en${suffix}`,el:`${SITE_URL}/el${suffix}`,tr:`${SITE_URL}/tr${suffix}`,'x-default':`${SITE_URL}/en${suffix}`}},
  robots:process.env.VERCEL_ENV==='preview'?{index:false,follow:false}:{index:!privacy,follow:true},
  openGraph:{type:'website',title:`Mastiha Luxury Suites | ${title}`,description:descriptions[lang],url:`${SITE_URL}/${lang}${suffix}`,siteName:'Mastiha Luxury Suites',locale:{en:'en_US',el:'el_GR',tr:'tr_TR'}[lang],images:[{url:image.src,width:image.width,height:image.height,alt:image.captions[lang]}]},
  twitter:{card:'summary_large_image',title:`Mastiha Luxury Suites | ${title}`,description:descriptions[lang],images:[image.src]},icons:{icon:'/icon.svg',apple:'/apple-icon.png'}};
}
