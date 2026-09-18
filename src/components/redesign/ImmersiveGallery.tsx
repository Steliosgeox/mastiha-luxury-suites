"use client";
import Image from "next/image";
import { useState } from "react";
import { stayPhotos } from "@/content/stay-media";
import { getStayCopy, type StayLocale } from "@/content/stay-copy";
import { PhotoButton } from "./StayExperience";
import s from "./MastihaOdisej.module.css";

export function ImmersiveGallery({ locale = "en" }: { locale?: StayLocale }) {
  const [filter, setFilter] = useState("all"); const c = getStayCopy(locale);
  const categories = [{ id: "all", label: c.all }, { id: "bedrooms", label: c.bedrooms }, { id: "outdoors", label: c.outdoors }, { id: "details", label: c.details }];
  const photos = stayPhotos.filter((photo) => filter === "all" || (filter === "bedrooms" && ["master", "second"].includes(photo.id)) || (filter === "outdoors" && photo.id === "terrace") || (filter === "details" && photo.id === "bathroom"));
  return <section id="gallery" className={s.gallery} aria-labelledby="gallery-title">
    <div className={s.galleryHeader}><div><p className={s.eyebrow}>{c.galleryEyebrow}</p><h2 id="gallery-title" className={s.heading}>{c.galleryTitle}</h2></div><p className={s.body}>{c.galleryBody}</p></div>
    <div className={s.galleryTools}><div className={s.filters} role="group" aria-label={c.gallery}>{categories.map((category) => <button type="button" key={category.id} aria-pressed={filter === category.id} onClick={() => setFilter(category.id)}>{category.label}</button>)}</div><span className={s.galleryCount} aria-live="polite">{photos.length} {c.galleryCount}</span></div>
    <div className={s.galleryGrid} data-filtered={filter !== "all"} data-testid="gallery-grid">{photos.map((photo) => <figure className={s.galleryItem} key={photo.id}><PhotoButton id={photo.id}><div className={s.photo} style={{ position: "relative", isolation: "isolate" }} data-media-frame><Image src={photo.src} alt={`${c.captions[photo.id]} · Mastiha Luxury Suites`} fill sizes="(max-width:760px) 90vw, 60vw" className={s.photoImage} style={{ objectPosition: photo.position }} /></div></PhotoButton><figcaption className={s.caption}>{c.captions[photo.id]}</figcaption></figure>)}</div>
    <div className={s.galleryFooter}><PhotoButton id="living" className={s.outlineButton}>{c.galleryOpen}<span aria-hidden="true">↗</span></PhotoButton></div>
  </section>;
}
