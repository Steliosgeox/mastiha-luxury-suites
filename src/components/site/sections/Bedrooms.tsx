import { getStayCopy, type StayLocale } from "@/content/stay-copy";
import { photoCaption } from "@/content/stay-media";
import { OpenablePhoto } from "../Photo";
import ui from "../ui.module.css";
import s from "./bedrooms.module.css";

export function Bedrooms({ locale }: { locale: StayLocale }) {
  const c = getStayCopy(locale).bedrooms;
  return <section id="spaces" className={`${ui.container} ${s.bedrooms}`} aria-labelledby="bedrooms-title">
    <header className={s.header}>
      <p className={ui.eyebrow} data-rule>{c.eyebrow}</p>
      <h2 id="bedrooms-title" className={ui.heading} data-split>{c.title}</h2>
    </header>
    <figure className={s.main}>
      <OpenablePhoto id="master" locale={locale} className={s.mainPhoto} sizes="(max-width: 760px) 100vw, 62vw" parallax />
      <figcaption className={ui.caption}>{photoCaption("master", locale)}</figcaption>
    </figure>
    <div className={s.aside}>
      <p className={ui.body} data-reveal>{c.body}</p>
      <figure data-speed="0.08">
        <OpenablePhoto id="second" locale={locale} className={s.secondPhoto} sizes="(max-width: 760px) 100vw, 30vw" />
        <figcaption className={ui.caption}>{photoCaption("second", locale)}</figcaption>
      </figure>
    </div>
  </section>;
}
