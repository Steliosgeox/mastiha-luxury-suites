import { propertyData as property } from "@/content/property";
import { fillCopy, getStayCopy, type StayLocale } from "@/content/stay-copy";
import { photoCaption } from "@/content/stay-media";
import { OpenablePhoto } from "../Photo";
import { MapPanel } from "./MapPanel";
import ui from "../ui.module.css";
import s from "./location.module.css";

export function Location({ locale }: { locale: StayLocale }) {
  const c = getStayCopy(locale).where;
  return <section id="location" className={`${ui.container} ${s.location}`} aria-labelledby="location-title">
    <div>
      <p className={ui.eyebrow} data-rule>{c.eyebrow}</p>
      <h2 id="location-title" className={ui.heading} data-split>{c.title}</h2>
      <p className={ui.body} data-reveal>{fillCopy(c.body, { distance: property.distanceToSeaMeters })}</p>
      <div className={s.links}>
        <a className={ui.textLink} href={property.location.googleMapsUrl} target="_blank" rel="noopener noreferrer">{c.maps} <span aria-hidden="true">↗</span></a>
        <a className={ui.textLink} href={property.location.googleDirectionsUrl} target="_blank" rel="noopener noreferrer">{c.directions} <span aria-hidden="true">↗</span></a>
      </div>
      <MapPanel locale={locale} />
    </div>
    <figure className={s.figure}>
      <OpenablePhoto id="arrival" locale={locale} className={s.photo} position="64% 50%" sizes="(max-width: 760px) 100vw, 44vw" parallax />
      <figcaption className={ui.caption}>{photoCaption("arrival", locale)}</figcaption>
    </figure>
  </section>;
}
