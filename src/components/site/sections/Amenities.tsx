import { Car, CookingPot, Desk, Snowflake, SpeakerSimpleSlash, TShirt, Television, Armchair, WashingMachine, WifiHigh } from "@phosphor-icons/react/dist/ssr";
import { getStayCopy, type StayCopy, type StayLocale } from "@/content/stay-copy";
import { photoCaption } from "@/content/stay-media";
import { OpenablePhoto } from "../Photo";
import ui from "../ui.module.css";
import s from "./amenities.module.css";

const icons: Record<keyof StayCopy["amenities"]["items"], typeof Car> = {
  parking: Car,
  wifi: WifiHigh,
  climate: Snowflake,
  kitchen: CookingPot,
  laundry: WashingMachine,
  tv: Television,
  iron: TShirt,
  balcony: Armchair,
  desk: Desk,
  quiet: SpeakerSimpleSlash,
};

export function Amenities({ locale }: { locale: StayLocale }) {
  const c = getStayCopy(locale).amenities;
  const items = Object.entries(c.items) as [keyof typeof icons, string][];
  return <section id="amenities" className={`${ui.container} ${s.amenities}`} aria-labelledby="amenities-title">
    <div>
      <p className={ui.eyebrow} data-rule>{c.eyebrow}</p>
      <h2 id="amenities-title" className={ui.heading} data-split>{c.title}</h2>
      <ul className={s.list} data-stagger>
        {items.map(([key, label]) => {
          const Icon = icons[key];
          return <li key={key}><Icon className={s.icon} weight="light" aria-hidden="true" /><span>{label}</span></li>;
        })}
      </ul>
    </div>
    <figure className={s.figure}>
      <OpenablePhoto id="bathroom-wide" locale={locale} className={s.photo} sizes="(max-width: 760px) 100vw, 42vw" parallax />
      <figcaption className={ui.caption}>{photoCaption("bathroom-wide", locale)}</figcaption>
    </figure>
  </section>;
}
