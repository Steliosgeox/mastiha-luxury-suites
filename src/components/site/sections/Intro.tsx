import { propertyData as property } from "@/content/property";
import { fillCopy, getStayCopy, type StayLocale } from "@/content/stay-copy";
import { photoCaption } from "@/content/stay-media";
import { OpenablePhoto } from "../Photo";
import ui from "../ui.module.css";
import s from "./intro.module.css";

export function Intro({ locale }: { locale: StayLocale }) {
  const c = getStayCopy(locale).intro;
  const facts = [
    { value: property.areaM2, label: c.area },
    { value: property.bedrooms, label: c.bedrooms },
    { value: property.maxGuests, label: c.guests },
    { value: property.distanceToSeaMeters, label: c.toSea },
  ];

  return <section id="suite" className={`${ui.container} ${s.intro}`} aria-labelledby="suite-title">
    <div className={s.copy}>
      <p className={ui.eyebrow} data-rule>{c.eyebrow}</p>
      <h2 id="suite-title" className={ui.heading} data-split>{c.title}</h2>
      <p className={ui.body} data-reveal>{fillCopy(c.body, { area: property.areaM2, distance: property.distanceToSeaMeters })}</p>
      <dl className={s.facts} data-stagger>
        {facts.map(fact => <div key={fact.label}>
          <dt>{fact.label}</dt>
          <dd data-count={fact.value}>{fact.value}</dd>
        </div>)}
      </dl>
    </div>
    <figure className={s.figure}>
      <OpenablePhoto id="lounge" locale={locale} className={s.photo} sizes="(max-width: 760px) 100vw, 58vw" parallax />
      <figcaption className={ui.caption}>{photoCaption("lounge", locale)}</figcaption>
    </figure>
  </section>;
}
