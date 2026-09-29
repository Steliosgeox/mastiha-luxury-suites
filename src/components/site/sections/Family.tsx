import { Baby, BabyCarriage, Chair, PuzzlePiece } from "@phosphor-icons/react/dist/ssr";
import { getStayCopy, type StayLocale } from "@/content/stay-copy";
import { photoCaption, type PhotoId } from "@/content/stay-media";
import { OpenablePhoto } from "../Photo";
import ui from "../ui.module.css";
import s from "./family.module.css";

const photos: { id: PhotoId; position?: string }[] = [
  { id: "kids-corner", position: "50% 60%" },
  { id: "toys" },
  { id: "cot" },
  { id: "playpen", position: "50% 55%" },
  { id: "crib" },
  { id: "high-chair" },
];
const icons = [Baby, BabyCarriage, Chair, PuzzlePiece];

/** Everything for children, from the listing: cot, travel cot, booster seat, toys. */
export function Family({ locale }: { locale: StayLocale }) {
  const c = getStayCopy(locale).family;
  return <section id="family" className={s.family} aria-labelledby="family-title" data-horizontal data-testid="family-section">
    <div className={s.inner}>
      <div className={s.copy}>
        <p className={ui.eyebrow} data-rule>{c.eyebrow}</p>
        <h2 id="family-title" className={ui.heading} data-split>{c.title}</h2>
        <p className={ui.body}>{c.body}</p>
        <ul className={s.items} data-stagger>
          {c.items.map((item, index) => {
            const Icon = icons[index];
            return <li key={item}><Icon className={s.icon} weight="light" aria-hidden="true" /><span>{item}</span></li>;
          })}
        </ul>
      </div>
      <div className={s.track} data-track role="list" aria-label={c.eyebrow}>
        {photos.map(({ id, position }, index) => <figure key={id} className={s.card} role="listitem">
          <OpenablePhoto id={id} locale={locale} className={s.cardPhoto} position={position} sizes="(max-width: 900px) 76vw, 26vw" reveal={false} />
          <figcaption><span>{String(index + 1).padStart(2, "0")}</span>{photoCaption(id, locale)}</figcaption>
        </figure>)}
      </div>
      <p className={s.hint} aria-hidden="true">{c.drag} →</p>
    </div>
  </section>;
}
