"use client";
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { tourPhotos, photoCaption } from '@/content/stay-media';
import { listingCopy } from '@/content/listing-copy';
import type { StayLocale } from '@/content/stay-copy';
import s from './MastihaOdisej.module.css';

// Authentic photographs; no synthesized rooms or interpolated walkthrough frames.
export function StayFilm({locale}:{locale:StayLocale}) {
  const section=useRef<HTMLElement>(null), bar=useRef<HTMLSpanElement>(null);
  const [enabled,setEnabled]=useState(false), [near,setNear]=useState(false), [index,setIndex]=useState(0);
  const [ready,setReady]=useState<Set<number>>(()=>new Set());
  const l=listingCopy(locale);
  useEffect(()=>{
    const motion=matchMedia('(prefers-reduced-motion: reduce)');
    const connection=(navigator as Navigator & {connection?:{saveData?:boolean}}).connection;
    const read=()=>setEnabled(!motion.matches && !connection?.saveData);
    read();motion.addEventListener('change',read);return()=>motion.removeEventListener('change',read);
  },[]);
  useEffect(()=>{
    const element=section.current;if(!element || !enabled)return;
    const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting&&entry.intersectionRatio>.001){setNear(true);observer.disconnect();}},{threshold:[0,.001]});
    observer.observe(element);gsap.registerPlugin(ScrollTrigger);
    const trigger=ScrollTrigger.create({trigger:element,start:'top top',end:'bottom bottom',onUpdate:self=>{
      element.dataset.progress=self.progress.toFixed(4);
      if(bar.current)bar.current.style.transform=`scaleX(${self.progress})`;
      const target=Math.min(tourPhotos.length-1,Math.floor(self.progress*tourPhotos.length));
      setIndex(old=>old===target?old:target);
    }});
    return()=>{observer.disconnect();trigger.kill();};
  },[enabled]);
  const displayed=ready.has(index)?index:0;
  return <section id="film" ref={section} className={s.film} data-static={!enabled} data-testid="scroll-film" aria-label={l.tour} data-target={index} data-frame={displayed}>
    <div className={s.filmViewport} data-media-frame data-testid="photo-tour-viewport">
      <div className={s.tourMedia}>
        {tourPhotos.map((photo,i)=>(i===0||(near&&enabled))&&<div key={photo.id} className={s.tourLayer} data-active={i===displayed} aria-hidden={i!==displayed} style={{position:'absolute',inset:0}} data-media-frame>
          <Image src={photo.src} alt={photoCaption(photo.id,locale)} fill sizes="(max-width:760px) 100vw, 100vw" className={s.tourImage} loading="lazy" onLoad={()=>setReady(old=>new Set(old).add(i))}/>
        </div>)}
      </div>
      <div className={s.filmTop}><span>{l.tour}</span><a href="#suite">{l.skip} ↘</a></div>
      <div className={s.filmCaption}><p>{l.tourNote}</p><h2>{photoCaption(tourPhotos[displayed].id,locale)}</h2></div>
      <div className={s.filmProgress} aria-hidden="true"><span ref={bar}/></div>
    </div>
    <noscript><style>{'#film{height:82svh!important}#film>div{position:relative!important;height:100%!important}'}</style></noscript>
  </section>;
}
