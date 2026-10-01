"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { getStayCopy, type StayLocale } from "@/content/stay-copy";
import { photoCaption, stayPhotos, type PhotoCategory, type PhotoId } from "@/content/stay-media";
import { OpenablePhoto } from "../Photo";
import { PhotoButton } from "../SiteShell";
import ui from "../ui.module.css";
import s from "./gallery.module.css";

gsap.registerPlugin(Flip);

type Filter = "all" | PhotoCategory;
const filters: Filter[] = ["all", "living", "kitchen", "bedrooms", "family", "bathroom", "outdoors", "neighbourhood"];
// Lead with rooms that the rest of the page does not already show.
const lead: PhotoId[] = ["kitchen-wide", "sofa-bed", "master-wide", "vanity", "bathroom-wide", "terrace", "desk", "second-wide"];
const ordered = [...lead.map(id => stayPhotos.find(photo => photo.id === id)!), ...stayPhotos.filter(photo => !lead.includes(photo.id))];
const COLLAPSED = 10; // two full rows of the 7/5 + 4/4/4 rhythm

export function Gallery({ locale }: { locale: StayLocale }) {
  const c = getStayCopy(locale).photos;
  const [filter, setFilter] = useState<Filter>("all");
  const [expanded, setExpanded] = useState(false);
  const grid = useRef<HTMLDivElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);

  const photos = filter === "all" ? ordered : ordered.filter(photo => photo.category === filter);
  const visible = filter === "all" && !expanded ? photos.slice(0, COLLAPSED) : photos;

  // Capture positions before React re-renders, then animate from them.
  const change = (update: () => void) => {
    if (grid.current && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      flipState.current = Flip.getState(grid.current.querySelectorAll("[data-flip-id]"));
    }
    update();
  };

  useLayoutEffect(() => {
    const state = flipState.current;
    if (!state) return;
    flipState.current = null;
    Flip.from(state, {
      duration: .7,
      ease: "power3.inOut",
      absolute: true,
      nested: true,
      prune: true,
      onEnter: elements => gsap.fromTo(elements, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: .6, delay: .15, stagger: .03 }),
    });
  }, [filter, expanded]);

  return <section id="gallery" className={`${ui.container} ${s.gallery}`} aria-labelledby="gallery-title">
    <header className={s.header}>
      <div>
        <p className={ui.eyebrow} data-rule>{c.eyebrow}</p>
        <h2 id="gallery-title" className={ui.heading} data-split>{c.title}</h2>
      </div>
      <p className={ui.body}>{c.body}</p>
    </header>

    <div className={s.tools}>
      <div className={s.filters} role="group" aria-label={c.eyebrow}>
        {filters.map(id => <button type="button" key={id} aria-pressed={filter === id} onClick={() => change(() => setFilter(id))}>{c.filters[id]}</button>)}
      </div>
      <span className={s.count} aria-live="polite">{photos.length} {c.count}</span>
    </div>

    <div ref={grid} className={s.grid} data-layout={filter === "all" ? "editorial" : "even"} data-testid="gallery-grid">
      {visible.map(photo => <figure key={photo.id} className={s.item} data-flip-id={photo.id} data-gallery-item>
        <OpenablePhoto id={photo.id} locale={locale} className={s.photo} sizes="(max-width: 760px) 100vw, 45vw" reveal={false} />
        <figcaption className={ui.caption}>{photoCaption(photo.id, locale)}</figcaption>
      </figure>)}
    </div>

    <div className={s.footer}>
      {filter === "all" && <button type="button" className={ui.button} aria-expanded={expanded} onClick={() => change(() => setExpanded(value => !value))}>
        {expanded ? c.less : `${c.more} (${photos.length})`}
      </button>}
      <PhotoButton id={photos[0]?.id ?? "living"} className={ui.buttonSolid}>{c.viewAll}<span aria-hidden="true">↗</span></PhotoButton>
    </div>
  </section>;
}
