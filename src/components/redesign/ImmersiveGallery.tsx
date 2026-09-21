"use client";
import Image from 'next/image';
import { useState } from 'react';
import { stayPhotos, photoCaption, type PhotoCategory } from '@/content/stay-media';
import { getStayCopy, type StayLocale } from '@/content/stay-copy';
import { listingCopy } from '@/content/listing-copy';
import { PhotoButton } from './StayExperience';
import s from './MastihaOdisej.module.css';

export function ImmersiveGallery({ locale = 'en' }: { locale?: StayLocale }) {
  const [filter, setFilter] = useState<'all' | PhotoCategory>('all');
  const [expanded, setExpanded] = useState(false);
  const c = getStayCopy(locale), l = listingCopy(locale);
  const categories: {id:'all'|PhotoCategory;label:string}[] = [{id:'all',label:c.all},{id:'living',label:l.living},{id:'kitchen',label:l.kitchen},{id:'bedrooms',label:c.bedrooms},{id:'bathroom',label:l.bathroom},{id:'outdoors',label:c.outdoors},{id:'neighbourhood',label:l.neighbourhood}];
  const photos = stayPhotos.filter(photo => filter === 'all' || photo.category === filter);
  const visible = filter === 'all' && !expanded ? photos.slice(0,6) : photos;
  return <section id="gallery" className={s.gallery} aria-labelledby="gallery-title">
    <div className={s.galleryHeader}><div><p className={s.eyebrow}>{c.galleryEyebrow}</p><h2 id="gallery-title" className={s.heading}>{c.galleryTitle}</h2></div><p className={s.body}>{c.galleryBody}</p></div>
    <div className={s.galleryTools}><div className={s.filters} role="group" aria-label={c.gallery}>{categories.map(category => <button type="button" key={category.id} aria-pressed={filter === category.id} onClick={() => setFilter(category.id)}>{category.label}</button>)}</div><span className={s.galleryCount} aria-live="polite">{photos.length} {c.galleryCount}</span></div>
    {filter === 'neighbourhood' && <p className={s.neighbourhoodNote}>{l.neighbourhoodBody}</p>}
    <div className={s.galleryGrid} data-filtered={filter !== 'all' || expanded} data-testid="gallery-grid">{visible.map(photo => <figure className={s.galleryItem} key={photo.id}><PhotoButton id={photo.id}><div className={s.photo} style={{position:'relative',isolation:'isolate'}} data-media-frame><Image src={photo.src} alt={photoCaption(photo.id,locale)} fill sizes="(max-width:760px) 90vw, 60vw" className={s.photoImage} style={{objectPosition:photo.position}} /></div></PhotoButton><figcaption className={s.caption}>{photoCaption(photo.id,locale)}</figcaption></figure>)}</div>
    <div className={s.galleryFooter}>{filter === 'all' && <button type="button" className={s.outlineButton} aria-expanded={expanded} onClick={() => setExpanded(value=>!value)}>{expanded?l.less:l.more} ({photos.length})</button>}<PhotoButton id={photos[0]?.id ?? 'living'} className={s.outlineButton}>{c.galleryOpen}<span aria-hidden="true">↗</span></PhotoButton></div>
  </section>;
}
