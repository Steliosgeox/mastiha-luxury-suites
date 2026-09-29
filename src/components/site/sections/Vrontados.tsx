import { getStayCopy, type StayLocale } from "@/content/stay-copy";
import { photoCaption, type PhotoId } from "@/content/stay-media";
import { OpenablePhoto } from "../Photo";
import ui from "../ui.module.css";
import s from "./vrontados.module.css";

// Photographs from the listing of the village around the apartment. Each layer drifts at its
// own speed, so the collage gains depth as the page scrolls.
const collage: { id: PhotoId; className: string; speed: string }[] = [
  { id: "coast", className: s.wide, speed: "0.05" },
  { id: "sailor", className: s.sailor, speed: "0.18" },
  { id: "rocket-war", className: s.rockets, speed: "0.1" },
  { id: "beach", className: s.beach, speed: "0.22" },
  { id: "sunrise", className: s.sunrise, speed: "0.08" },
];

export function Vrontados({ locale }: { locale: StayLocale }) {
  const c = getStayCopy(locale).vrontados;
  return <section id="vrontados" className={`${ui.container} ${s.vrontados}`} aria-labelledby="vrontados-title">
    <header className={s.header}>
      <p className={ui.eyebrow} data-rule>{c.eyebrow}</p>
      <h2 id="vrontados-title" className={ui.heading} data-split>{c.title}</h2>
      <p className={ui.body} data-reveal>{c.body}</p>
    </header>
    <div className={s.collage}>
      {collage.map(({ id, className, speed }) => <figure key={id} className={className} data-speed={speed}>
        <OpenablePhoto id={id} locale={locale} className={s.photo} sizes="(max-width: 760px) 90vw, 34vw" />
        <figcaption className={ui.caption}>{photoCaption(id, locale)}</figcaption>
      </figure>)}
    </div>
  </section>;
}
