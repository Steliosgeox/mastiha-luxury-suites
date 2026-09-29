import { propertyData as property } from "@/content/property";
import { fillCopy, getStayCopy, type StayLocale } from "@/content/stay-copy";
import ui from "../ui.module.css";
import s from "./faq.module.css";

export function Faq({ locale }: { locale: StayLocale }) {
  const c = getStayCopy(locale).faq;
  const values = { guests: property.maxGuests, distance: property.distanceToSeaMeters };
  return <section id="information" className={`${ui.container} ${s.faq}`} aria-labelledby="faq-title">
    <h2 id="faq-title" className={ui.heading} data-split>{c.title}</h2>
    <div className={s.list} data-stagger>
      {c.items.map(item => <details key={item.q} name="faq">
        <summary>{item.q}<span aria-hidden="true" /></summary>
        <p>{fillCopy(item.a, values)}</p>
      </details>)}
    </div>
  </section>;
}
