import { getStayCopy, type StayLocale } from "@/content/stay-copy";
import { photoCaption } from "@/content/stay-media";
import { OpenablePhoto } from "../Photo";
import ui from "../ui.module.css";
import s from "./kitchen.module.css";

export function Kitchen({ locale }: { locale: StayLocale }) {
  const c = getStayCopy(locale).kitchen;
  return <section id="kitchen" className={`${ui.container} ${s.kitchen}`} aria-labelledby="kitchen-title">
    <figure className={s.main}>
      <OpenablePhoto id="kitchen" locale={locale} className={s.mainPhoto} sizes="(max-width: 760px) 100vw, 56vw" parallax />
      <figcaption className={ui.caption}>{photoCaption("kitchen", locale)}</figcaption>
    </figure>
    <div className={s.copy}>
      <p className={ui.eyebrow} data-rule>{c.eyebrow}</p>
      <h2 id="kitchen-title" className={ui.heading} data-split>{c.title}</h2>
      <p className={ui.body} data-reveal>{c.body}</p>
      <div className={s.details}>
        {(["cookware", "appliances"] as const).map((id, index) => <figure key={id} data-speed={index ? "0.06" : "0.12"}>
          <OpenablePhoto id={id} locale={locale} className={s.detailPhoto} sizes="(max-width: 760px) 50vw, 18vw" />
          <figcaption className={ui.caption}>{photoCaption(id, locale)}</figcaption>
        </figure>)}
      </div>
    </div>
  </section>;
}
