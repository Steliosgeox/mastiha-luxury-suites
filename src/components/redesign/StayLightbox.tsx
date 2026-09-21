"use client";
import Lightbox from 'yet-another-react-lightbox';
import { Captions, Counter, Fullscreen, Thumbnails, Zoom } from 'yet-another-react-lightbox/plugins';
import 'yet-another-react-lightbox/plugins/counter.css';
import { stayPhotos, photoCaption } from '@/content/stay-media';
import { getStayCopy, type StayLocale } from '@/content/stay-copy';
import { trackEvent } from '@/lib/analytics';
export default function StayLightbox({index,locale,onClose}:{index:number;locale:StayLocale;onClose:()=>void}) {
  const c=getStayCopy(locale);
  return <Lightbox open index={index} close={onClose} slides={stayPhotos.map(photo=>({src:photo.src,srcSet:photo.srcSet,thumbnail:photo.thumbnail,width:photo.width,height:photo.height,alt:photoCaption(photo.id,locale),title:photoCaption(photo.id,locale)}))}
    plugins={[Captions,Counter,Fullscreen,Thumbnails,Zoom]} carousel={{preload:1}} controller={{closeOnBackdropClick:true}} thumbnails={{width:80,height:54,gap:8,showToggle:true}}
    labels={{Close:c.close,Previous:c.previous,Next:c.next,'Zoom in':c.zoom,'Zoom out':c.zoomOut,'Enter Fullscreen':c.fullscreen,'Exit Fullscreen':c.exitFullscreen,'Show thumbnails':c.showThumbs,'Hide thumbnails':c.hideThumbs}}
    on={{view:({index:i})=>trackEvent('gallery_image_view',{index:i})}} styles={{container:{backgroundColor:'rgba(18,29,22,.98)'}}}/>;
}
