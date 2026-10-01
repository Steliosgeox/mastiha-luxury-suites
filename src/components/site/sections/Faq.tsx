import { faqItems } from "@/content/faq";
import { getStayCopy, type StayLocale } from "@/content/stay-copy";
import ui from "../ui.module.css";
import s from "./faq.module.css";

export function Faq({ locale }: { locale: StayLocale }) {
  const c = getStayCopy(locale).faq;
  return <section id="information" className={`${ui.container} ${s.faq}`} aria-labelledby="faq-title">
    <h2 id="faq-title" className={ui.heading} data-split>{c.title}</h2>
    <div className={s.list} data-stagger>
      {faqItems(locale).map(item => <details key={item.q} name="faq">
        <summary>{item.q}<span aria-hidden="true" /></summary>
        <p>{item.a}</p>
      </details>)}
    </div>
  </section>;
}
