import { propertyData as property } from "@/content/property";
import { getStayCopy, type StayLocale } from "@/content/stay-copy";
import { OpenablePhoto } from "../Photo";
import { ChatButton } from "../SiteShell";
import ui from "../ui.module.css";
import s from "./host.module.css";

export function Host({ locale }: { locale: StayLocale }) {
  const c = getStayCopy(locale).host;
  return <section id="host" className={s.host} aria-labelledby="host-title">
    <div className={`${ui.container} ${s.inner}`}>
      <div className={s.copy}>
        <p className={ui.eyebrow} data-rule>{c.eyebrow}</p>
        <h2 id="host-title" className={ui.heading} data-split>{c.title}</h2>
        <p className={ui.body} data-reveal>{c.body}</p>
        <div className={s.actions}>
          <ChatButton mode="host" className={ui.buttonSolid}>{c.chat}<span aria-hidden="true">→</span></ChatButton>
          <a className={ui.textLink} href={property.bookingLinks.airbnb} target="_blank" rel="noopener noreferrer">{c.airbnb} <span aria-hidden="true">↗</span></a>
        </div>
      </div>
      <OpenablePhoto id="keys" locale={locale} className={s.photo} sizes="(max-width: 760px) 80vw, 30vw" />
    </div>
  </section>;
}
