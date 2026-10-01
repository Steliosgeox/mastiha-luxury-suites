import Image from "next/image";
import { getStayCopy, type StayLocale } from "@/content/stay-copy";
import { photoCaption, stayPhoto } from "@/content/stay-media";
import { PhotoButton } from "../SiteShell";
import ui from "../ui.module.css";
import s from "./scene.module.css";

/** Full-bleed photograph with a short caption block: the balcony. */
export function Balcony({ locale }: { locale: StayLocale }) {
  const c = getStayCopy(locale).balcony;
  const photo = stayPhoto("balcony");
  return <section className={s.scene} aria-labelledby="balcony-title" data-testid="terrace-scene">
    <div className={s.media} data-photo-id="balcony">
      <Image src={photo.src} alt={photoCaption("balcony", locale)} fill sizes="100vw" className={s.image} data-parallax />
    </div>
    <div className={s.scrim} aria-hidden="true" />
    <div className={s.copy}>
      <p className={ui.eyebrow} data-rule>{c.eyebrow}</p>
      <h2 id="balcony-title" className={ui.heading} data-split>{c.title}</h2>
      <p data-reveal>{c.body}</p>
      <PhotoButton id="balcony-wide" className={ui.buttonLight}>{c.action}<span aria-hidden="true">↗</span></PhotoButton>
    </div>
  </section>;
}
