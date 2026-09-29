"use client";

import { useState } from "react";
import { propertyData as property } from "@/content/property";
import { getStayCopy, type StayLocale } from "@/content/stay-copy";
import { trackEvent } from "@/lib/analytics";
import s from "./location.module.css";

/** The Google map is only requested after the guest asks for it. */
export function MapPanel({ locale }: { locale: StayLocale }) {
  const [open, setOpen] = useState(false);
  const c = getStayCopy(locale).where;
  const placeId = property.location.googlePlaceId;
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY?.trim();
  const query = encodeURIComponent(`place_id:${placeId}`);
  const src = key
    ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(key)}&q=${query}&zoom=17&language=${locale}`
    : `https://www.google.com/maps?q=${query}&output=embed&hl=${locale}`;

  return <div className={s.map} data-google-place-id={placeId}>
    <button
      type="button"
      className={s.mapToggle}
      aria-expanded={open}
      aria-controls="property-map"
      onClick={() => { if (!open) trackEvent("map_open", { mode: key ? "embed-api" : "place-id-embed" }); setOpen(value => !value); }}
    >
      {open ? c.mapHide : c.mapShow}<span aria-hidden="true">{open ? "×" : "↘"}</span>
    </button>
    {open && <iframe id="property-map" className={s.frame} title={c.mapTitle} src={src} loading="lazy" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" data-testid="google-map" />}
    <p className={s.mapNote}>{c.mapNote}</p>
  </div>;
}
