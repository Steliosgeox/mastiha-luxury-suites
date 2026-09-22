"use client";

/* eslint-disable @next/next/no-img-element -- This tour deliberately serves the
   catalogue's pre-encoded responsive WebPs, avoiding on-demand AVIF conversion
   while a scroll transition is waiting for its next photograph. */
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { tourPhotos, photoCaption } from '@/content/stay-media';
import { listingCopy } from '@/content/listing-copy';
import type { StayLocale } from '@/content/stay-copy';
import s from './MastihaOdisej.module.css';

const tourSources = tourPhotos.map(photo => {
  const variants = new Map(photo.srcSet.map(variant => [variant.width, variant.src]));
  return [...variants].sort(([a], [b]) => a - b).map(([width, src]) => `${src} ${width}w`).join(', ');
});

// Authentic photographs; no synthesized rooms or interpolated walkthrough frames.
export function StayFilm({ locale }: { locale: StayLocale }) {
  const section = useRef<HTMLElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [near, setNear] = useState(false);
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState(0);
  const [ready, setReady] = useState<Set<number>>(() => new Set());
  const l = listingCopy(locale);

  useEffect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const read = () => setEnabled(!motion.matches && !connection?.saveData);
    read();
    motion.addEventListener('change', read);
    return () => motion.removeEventListener('change', read);
  }, []);

  useEffect(() => {
    const element = section.current;
    if (!element || !enabled) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio > .001) {
        setNear(true);
        observer.disconnect();
      }
    }, { threshold: [0, .001] });
    observer.observe(element);
    gsap.registerPlugin(ScrollTrigger);
    const trigger = ScrollTrigger.create({
      trigger: element,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: self => {
        element.dataset.progress = self.progress.toFixed(4);
        if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
        const target = Math.min(tourPhotos.length - 1, Math.floor(self.progress * tourPhotos.length));
        setIndex(old => old === target ? old : target);
      },
    });
    return () => { observer.disconnect(); trigger.kill(); };
  }, [enabled]);

  useEffect(() => {
    // Slow or failed images must not replace the last successfully loaded view.
    // Completing a pending image also updates the view after scrolling stops.
    if (!enabled) setDisplayed(0);
    else if (ready.has(index)) setDisplayed(index);
  }, [enabled, ready, index]);

  return <section id="film" ref={section} className={s.film} data-static={!enabled} data-testid="scroll-film" aria-label={l.tour} data-target={index} data-frame={displayed}>
    <div className={s.filmViewport} data-media-frame data-testid="photo-tour-viewport">
      <div className={s.tourMedia}>
        {tourPhotos.map((photo, i) => (i === 0 || (near && enabled)) && <div key={photo.id} className={s.tourLayer} data-active={i === displayed} aria-hidden={i !== displayed} style={{ position: 'absolute', inset: 0 }} data-media-frame>
          <img
            src={photo.src}
            srcSet={tourSources[i]}
            sizes="(max-width:760px) calc(100vw - 40px), 90vw"
            width={photo.width}
            height={photo.height}
            alt={photoCaption(photo.id, locale)}
            className={s.tourImage}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            loading={near && enabled ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={() => setReady(old => old.has(i) ? old : new Set(old).add(i))}
          />
        </div>)}
      </div>
      <div className={s.filmTop}><span>{l.tour}</span><a href="#suite">{l.skip} ↘</a></div>
      <div className={s.filmCaption}><p>{l.tourNote}</p><h2>{photoCaption(tourPhotos[displayed].id, locale)}</h2></div>
      <div className={s.filmProgress} aria-hidden="true"><span ref={bar} /></div>
    </div>
    <noscript><style>{'#film{height:82svh!important}#film>div{position:relative!important;height:100%!important}'}</style></noscript>
  </section>;
}
