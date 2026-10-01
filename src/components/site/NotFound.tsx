import Link from "next/link";
import s from "./not-found.module.css";

const lines = [
  { lang: "el", title: "Η σελίδα δεν βρέθηκε", link: "Αρχική σελίδα" },
  { lang: "en", title: "Page not found", link: "Home page" },
  { lang: "tr", title: "Sayfa bulunamadı", link: "Ana sayfa" },
] as const;

/** 404 in all three languages: the URL alone doesn't tell us which one the visitor reads. */
export function NotFound() {
  return <main className={s.page}>
    <p className={s.code}>404</p>
    <h1 className={s.name}>Mastiha Luxury Suites</h1>
    <ul className={s.lines}>
      {lines.map(line => <li key={line.lang} lang={line.lang}>
        <span>{line.title}</span>
        <Link href={`/${line.lang}`}>{line.link} →</Link>
      </li>)}
    </ul>
  </main>;
}
