import { propertyData } from '@/content/property';
import { stayPhotos } from '@/content/stay-media';
import { SITE_URL, descriptions } from './site';
import { normalizeStayLocale } from '@/content/stay-copy';
export function getStructuredData(locale='en') {
 const lang=normalizeStayLocale(locale);
 // Do not publish incomplete VacationRental rich-result claims, guessed coordinates,
 // unconfirmed street address, or third-party review scores as first-party reviews.
 return {'@context':'https://schema.org','@graph':[
  {'@type':'WebSite','@id':`${SITE_URL}/#website`,url:SITE_URL,name:propertyData.name,inLanguage:['en','el','tr']},
  {'@type':'WebPage','@id':`${SITE_URL}/${lang}#page`,url:`${SITE_URL}/${lang}`,name:propertyData.name,description:descriptions[lang],inLanguage:lang,isPartOf:{'@id':`${SITE_URL}/#website`},about:{'@type':'Accommodation',name:propertyData.name,numberOfBedrooms:propertyData.bedrooms,numberOfBathroomsTotal:propertyData.bathrooms,occupancy:{'@type':'QuantitativeValue',value:propertyData.maxGuests},floorSize:{'@type':'QuantitativeValue',value:propertyData.areaM2,unitCode:'MTK'},image:stayPhotos.filter(p=>p.category!=='neighbourhood').slice(0,6).map(p=>SITE_URL+p.src),containedInPlace:{'@type':'Place',name:'Vrontados, Chios, Greece'}}}
 ]};
}
