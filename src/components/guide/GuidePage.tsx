import Link from "next/link";
import { guideIds, guideMedia, type GuideId } from "@/content/guides";
import { nearbyPlaces, neighbourhoodCopy } from "@/content/neighbourhood";
import { propertyData as property } from "@/content/property";
import { formatDate, getStayCopy, type StayLocale } from "@/content/stay-copy";
import { photoCaption } from "@/content/stay-media";
import { GUIDES_UPDATED } from "@/content/guides";
import { chrome, guide } from "@/lib/guides";
import { Photo } from "../site/Photo";
import ui from "../site/ui.module.css";
import s from "./guide.module.css";

const locales = ["el", "en", "tr"] as const;

/** A guide to the island: readable text, our own photographs, and a way back to the apartment. */
export function GuidePage({ id, locale }: { id: GuideId; locale: StayLocale }) {
  const g = guide(id, locale);
  const c = chrome(locale);
  const site = getStayCopy(locale);
  const lead = guideMedia[id].photo;
  const others = guideIds.filter(other => other !== id);
  const nearby = nearbyPlaces.toSorted((a, b) => a.distanceMeters - b.distanceMeters);

  return <div className={`${ui.page} ${s.page}`}>
    <a className={ui.skip} href="#content">{site.common.skip}</a>

    <header className={s.bar}>
      <Link href={`/${locale}`} className={s.wordmark}>{property.name}</Link>
      <nav className={s.guides} aria-label={c.guides}>
        {guideIds.map(other => <Link key={other} href={`/${locale}/${other}`} aria-current={other === id ? "page" : undefined}>{guide(other, locale).label}</Link>)}
      </nav>
      <nav className={s.locales} aria-label={site.common.language}>
        {locales.map(code => <Link key={code} href={`/${code}/${id}`} lang={code} hrefLang={code} aria-current={code === locale ? "page" : undefined}>{code.toUpperCase()}</Link>)}
      </nav>
    </header>

    <main id="content">
      <article className={s.article}>
        <nav aria-label="Breadcrumb" className={s.crumbs}>
          <ol>
            <li><Link href={`/${locale}`}>{c.home}</Link></li>
            <li aria-current="page">{g.label}</li>
          </ol>
        </nav>

        <header className={s.head}>
          <p className={ui.eyebrow}>{g.kicker}</p>
          <h1 className={s.title}>{g.title}</h1>
          <p className={s.lead}>{g.intro}</p>
          <p className={s.updated}><time dateTime={GUIDES_UPDATED}>{c.updated.replace("{date}", formatDate(GUIDES_UPDATED, locale))}</time></p>
        </header>

        {lead && <figure className={s.hero}>
          <Photo id={lead} locale={locale} className={s.heroPhoto} sizes="(max-width: 1100px) 100vw, 1100px" priority reveal={false} />
          <figcaption className={ui.caption}>{photoCaption(lead, locale)}</figcaption>
        </figure>}

        <div className={s.body}>
          {g.sections.map((section, index) => <section key={section.heading} aria-labelledby={`section-${index}`}>
            <h2 id={`section-${index}`} className={s.heading}>{section.heading}</h2>
            {section.body.map(paragraph => <p key={paragraph} className={s.text}>{paragraph}</p>)}
            {section.nearby && <>
              <ul className={s.nearby}>
                {nearby.map(place => <li key={place.id}>
                  <span>{place.id === "public-parking" ? neighbourhoodCopy[locale].publicParking : place.name}</span>
                  <span className={s.kind}>{neighbourhoodCopy[locale].categories[place.category]}</span>
                  <span className={s.distance}>{place.distanceMeters} m</span>
                </li>)}
              </ul>
              <p className={s.note}>{c.nearbyNote}</p>
            </>}
            {section.photo && <figure className={s.inline}>
              <Photo id={section.photo} locale={locale} className={s.inlinePhoto} sizes="(max-width: 760px) 100vw, 680px" reveal={false} />
              <figcaption className={ui.caption}>{photoCaption(section.photo, locale)}</figcaption>
            </figure>}
            {section.link && <p className={s.more}>
              <Link className={ui.textLink} href={`/${locale}/${section.link}`}>{c.readAlso}: {guide(section.link, locale).label} <span aria-hidden="true">→</span></Link>
            </p>}
          </section>)}
        </div>
      </article>

      <aside className={s.stay} aria-labelledby="stay-title">
        <p className={ui.eyebrow}>{c.stayEyebrow}</p>
        <h2 id="stay-title" className={s.stayTitle}>{c.stayTitle}</h2>
        <p className={s.stayBody}>{c.stayBody}</p>
        <div className={s.actions}>
          <Link className={ui.buttonSolid} href={`/${locale}`}>{c.seeApartment}<span aria-hidden="true">→</span></Link>
          <a className={ui.button} href={property.bookingLinks.airbnb} target="_blank" rel="noopener noreferrer">Airbnb<span aria-hidden="true">↗</span></a>
          <a className={ui.button} href={property.bookingLinks.booking} target="_blank" rel="noopener noreferrer">Booking.com<span aria-hidden="true">↗</span></a>
        </div>
      </aside>

      <nav className={s.related} aria-labelledby="related-title">
        <h2 id="related-title" className={ui.eyebrow}>{c.readAlso}</h2>
        <ul>
          {others.map(other => {
            const next = guide(other, locale);
            return <li key={other}>
              <Link href={`/${locale}/${other}`}>
                <span className={s.relatedTitle}>{next.title}</span>
                <span className={s.relatedText}>{next.description}</span>
              </Link>
            </li>;
          })}
        </ul>
      </nav>
    </main>

    <footer className={s.footer}>
      <span>© {new Date().getFullYear()} {property.name}</span>
      <span>{site.footer.registration} {property.licenseNumber}</span>
      <Link href={`/${locale}/privacy`}>{site.footer.privacy}</Link>
      <Link href={`/${locale}`}>{c.apartment}</Link>
    </footer>
  </div>;
}
