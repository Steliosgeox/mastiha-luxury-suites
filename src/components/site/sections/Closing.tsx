import Image from "next/image";
import { getStayCopy, type StayLocale } from "@/content/stay-copy";
import { photoCaption, stayPhoto } from "@/content/stay-media";
import { BookButton } from "../SiteShell";
import ui from "../ui.module.css";
import s from "./scene.module.css";

export function Closing({ locale }: { locale: StayLocale }) {
  const c = getStayCopy(locale).closing;
  const photo = stayPhoto("windmills");
  return <section id="book" className={`${s.scene} ${s.closing}`} aria-labelledby="closing-title">
    <div className={s.media} data-photo-id="windmills">
      <Image src={photo.src} alt={photoCaption("windmills", locale)} fill sizes="100vw" className={s.image} style={{ objectPosition: "24% 55%" }} data-parallax />
    </div>
    <div className={s.scrim} aria-hidden="true" />
    <div className={s.closingCopy}>
      <h2 id="closing-title" className={ui.heading} data-split>{c.title}</h2>
      <div>
        <p>{c.body}</p>
        <BookButton source="closing" className={ui.buttonLight}>{c.action}<span aria-hidden="true">↗</span></BookButton>
      </div>
    </div>
  </section>;
}
