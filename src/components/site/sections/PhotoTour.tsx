"use client";

/* eslint-disable @next/next/no-img-element -- the tour swaps between pre-encoded
   responsive WebPs instantly, without an image-optimiser round trip per frame. */
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getStayCopy, type StayLocale } from "@/content/stay-copy";
import { photoCaption, tourPhotos } from "@/content/stay-media";
import s from "./tour.module.css";

const srcSets = tourPhotos.map(photo => photo.srcSet.map(variant => `${variant.src} ${variant.width}w`).join(", "));
const pad = (n: number) => String(n).padStart(2, "0");

/** A pinned, scroll-driven walk through five photographs of the apartment. */
export function PhotoTour({ locale }: { locale: StayLocale }) {
  const section = useRef<HTMLElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const caption = useRef<HTMLParagraphElement>(null);
  const [animated, setAnimated] = useState(false);
  const [nearby, setNearby] = useState(false);
  const [active, setActive] = useState(0);
  const c = getStayCopy(locale);

  // Reduced motion and data saver get a single static photograph.
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    const read = () => setAnimated(!reduce.matches && !saveData);
    read();
    reduce.addEventListener("change", read);
    return () => reduce.removeEventListener("change", read);
  }, []);

  useEffect(() => {
    const element = section.current;
    if (!element || !animated) return;
    // Start loading the remaining photographs just before the tour arrives.
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setNearby(true); observer.disconnect(); }
    }, { rootMargin: "100% 0px" });
    observer.observe(element);
    gsap.registerPlugin(ScrollTrigger);
    const trigger = ScrollTrigger.create({
      trigger: element,
      start: "top top",
      end: "bottom bottom",
      onUpdate: self => {
        element.dataset.progress = self.progress.toFixed(3);
        gsap.set(bar.current, { scaleX: self.progress });
        setActive(Math.min(tourPhotos.length - 1, Math.floor(self.progress * tourPhotos.length)));
      },
    });
    return () => { observer.disconnect(); trigger.kill(); };
  }, [animated]);

  const shown = animated ? active : 0;
  useEffect(() => {
    if (animated && caption.current) gsap.fromTo(caption.current, { yPercent: 40, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: .6, ease: "expo.out" });
  }, [shown, animated]);

  return <section id="film" ref={section} className={s.tour} data-static={!animated} data-frame={shown} aria-label={c.tour.label} data-testid="scroll-film">
    <div className={s.viewport} data-testid="photo-tour-viewport">
      {tourPhotos.map((photo, index) => (index === 0 || (animated && nearby)) && (
        <div key={photo.id} className={s.layer} data-active={index === shown} aria-hidden={index !== shown}>
          <img
            src={photo.src}
            srcSet={srcSets[index]}
            sizes="100vw"
            width={photo.width}
            height={photo.height}
            alt={photoCaption(photo.id, locale)}
            className={s.image}
            loading={index === 0 ? "lazy" : "eager"}
            decoding="async"
          />
        </div>
      ))}
      <div className={s.scrim} aria-hidden="true" />
      <div className={s.top}>
        <span>{c.tour.label}</span>
        <a href="#suite">{c.tour.skip} ↘</a>
      </div>
      <div className={s.caption}>
        <span className={s.index}>{pad(shown + 1)} / {pad(tourPhotos.length)}</span>
        <p ref={caption}>{photoCaption(tourPhotos[shown].id, locale)}</p>
      </div>
      <div className={s.progress} aria-hidden="true"><span ref={bar} /></div>
    </div>
  </section>;
}
