import Image from "next/image";
import Link from "next/link";
import { propertyData as property } from "@/content/property";
import { reviewStats } from "@/content/reviews";
import { getStayCopy, normalizeStayLocale, fillCopy } from "@/content/stay-copy";
import { stayPhoto, type PhotoId } from "@/content/stay-media";
import { StayExperience, BookButton, PhotoButton, MapPanel } from "./StayExperience";
import { StayFilm } from "./StayFilm";
import { ImmersiveGallery } from "./ImmersiveGallery";
import s from "./MastihaOdisej.module.css";

// Every fill image owns a positioned, size-reserved box. No page-wide absolute posters.
function PropertyPhoto({ id, alt, className = "", sizes = "(max-width: 760px) 100vw, 65vw", priority = false }: { id: PhotoId; alt: string; className?: string; sizes?: string; priority?: boolean }) {
  const photo = stayPhoto(id);
  return <div className={`${s.photo} ${className}`} style={{ position: "relative", isolation: "isolate" }} data-media-frame>
    <Image src={photo.src} alt={alt} fill sizes={sizes} priority={priority} className={s.photoImage} style={{ objectPosition: photo.position }} />
  </div>;
}

export function MastihaOdisej({ locale = "en" }: { locale?: string }) {
  const lang = normalizeStayLocale(locale);
  const c = getStayCopy(lang);
  const values = { guests: property.maxGuests, bedrooms: property.bedrooms, bathrooms: property.bathrooms, distance: property.distanceToSeaMeters };
  const caption = (id: PhotoId) => `${c.captions[id]} · Mastiha Luxury Suites`;
  return <StayExperience locale={lang}>
    <a href="#suite" className={s.skip}>{c.skip}</a>
    <main className={s.site}>
      <section id="home" className={s.hero} style={{ position: "relative", isolation: "isolate" }} aria-labelledby="mastiha-title" data-testid="landing-hero">
        <div className={s.heroMedia} style={{ position: "absolute", inset: 0 }} data-media-frame>
          <Image src={stayPhoto("terrace").src} alt={caption("terrace")} fill priority sizes="(max-aspect-ratio: 16/9) 178vh, 100vw" className={s.heroImage} data-testid="hero-image" />
        </div>
        <div className={s.heroScrim} aria-hidden="true" />
        <header className={s.masthead}>
          <nav className={s.topNav} aria-label={c.nav}>
            <a href="#suite">{c.suite}</a><a href="#gallery">{c.gallery}</a><a href="#location">{c.location}</a>
          </nav>
          <Link href={`/${lang}`} className={s.wordmark} aria-label={property.name}>Mastiha<span>Luxury Suites</span></Link>
          <div className={s.headerActions}>
            <nav className={s.locales} aria-label={c.language}>{(["en", "el", "tr"] as const).map((l) => <Link key={l} href={`/${l}`} lang={l} hrefLang={l} aria-current={lang === l ? "page" : undefined}>{l.toUpperCase()}</Link>)}</nav>
            <BookButton className={s.outlineButton} source="hero">{c.book}<span aria-hidden="true">↗</span></BookButton>
          </div>
        </header>
        <div className={s.heroMeta}><span>{c.place}</span><span>{c.heroSmall}</span></div>
        <div className={s.heroIdentity}>
          <p>{c.heroLine}</p>
          <h1 id="mastiha-title">MASTIHA</h1>
          <div className={s.heroBaseline}><span>Luxury Suites</span><span>{property.areaM2} m² · {property.bedrooms} {c.bedroomsLabel} · {property.maxGuests} {c.guestsLabel}</span></div>
        </div>
        <a href="#film" className={s.discover}><span aria-hidden="true">↓</span>{c.discover}</a>
      </section>
      <StayFilm locale={lang} />
      <section id="suite" className={s.intro} aria-labelledby="suite-title">
        <div className={s.introCopy} data-reveal>
          <p className={s.eyebrow}>{c.introEyebrow}</p><h2 id="suite-title" className={s.heading}>{c.introTitle}</h2><p className={s.body}>{c.introBody}</p>
          <dl className={s.facts}><div><dt>{c.areaLabel}</dt><dd>{property.areaM2}<small> m²</small></dd></div><div><dt>{c.bedroomsLabel}</dt><dd>{property.bedrooms}</dd></div><div><dt>{c.guestsLabel}</dt><dd>{property.maxGuests}</dd></div></dl>
        </div>
        <figure className={s.introPhoto} data-reveal><PhotoButton id="living"><PropertyPhoto id="living" alt={caption("living")} className={s.landscape} /></PhotoButton><figcaption className={s.caption}><span>01</span>{c.captions.living}</figcaption></figure>
      </section>
      <section id="spaces" className={s.rooms} aria-labelledby="rooms-title">
        <div className={s.sectionHeading}><p className={s.eyebrow}>{c.roomsEyebrow}</p><h2 className={s.heading} id="rooms-title">{c.roomsTitle}</h2></div>
        <div className={s.roomSpread}>
          <figure className={s.roomMain} data-reveal><PhotoButton id="master"><PropertyPhoto id="master" alt={caption("master")} className={s.landscape} /></PhotoButton><figcaption className={s.caption}><span>02</span>{c.captions.master}</figcaption></figure>
          <div className={s.roomAside} data-reveal><h3 className={s.subheading}>{c.bedroomTitle}</h3><p className={s.body}>{c.bedroomBody}</p><PhotoButton id="second"><PropertyPhoto id="second" alt={caption("second")} className={s.roomSecondary} sizes="(max-width:760px) 100vw, 32vw" /></PhotoButton><p className={s.caption}>{c.captions.second}</p></div>
        </div>
      </section>
      <section className={s.terraceScene} style={{ position: "relative", isolation: "isolate" }} aria-labelledby="terrace-title" data-testid="terrace-scene">
        <div className={s.sceneMedia} style={{ position: "absolute", inset: 0 }} data-media-frame><Image src={stayPhoto("terrace").src} alt={caption("terrace")} fill sizes="(max-width: 760px) 130vh, 100vw" className={s.sceneImage} data-parallax /></div>
        <div className={s.sceneScrim} aria-hidden="true" /><div className={s.sceneCopy} data-reveal><p className={s.eyebrow}>{c.outsideEyebrow}</p><h2 id="terrace-title" className={s.heading}>{c.outsideTitle}</h2><p>{c.outsideBody}</p><PhotoButton id="terrace" className={s.outlineButton}>{c.photoAction}<span aria-hidden="true">↗</span></PhotoButton></div>
      </section>
      <ImmersiveGallery locale={lang} />
      <section id="amenities" className={s.amenities} aria-labelledby="amenities-title">
        <figure className={s.detailPhoto} data-reveal><PhotoButton id="bathroom"><PropertyPhoto id="bathroom" alt={caption("bathroom")} className={s.portrait} sizes="(max-width:760px) 100vw, 40vw" /></PhotoButton><figcaption className={s.caption}>{c.captions.bathroom}</figcaption></figure>
        <div data-reveal><p className={s.eyebrow}>{c.amenitiesEyebrow}</p><h2 id="amenities-title" className={s.heading}>{c.amenitiesTitle}</h2><p className={s.body}>{c.amenitiesBody}</p><ul className={s.amenityList}>{c.amenities.map((name) => <li key={name}><span aria-hidden="true">✓</span>{name}</li>)}</ul></div>
      </section>
      <section id="reviews" className={s.reviews} aria-labelledby="reviews-title">
        <div><p className={s.eyebrow}>{c.ratingsEyebrow}</p><h2 id="reviews-title" className={s.subheading}>{c.ratingsTitle}</h2></div>
        <div className={s.ratingLinks}>
          <a href={property.bookingLinks.airbnb} target="_blank" rel="noopener noreferrer" aria-label={`Airbnb: ${c.readReviews}`}><span>Airbnb</span><strong data-testid="review-score">{reviewStats.airbnb.score.toFixed(1)}<small> / 5</small></strong><span>{reviewStats.airbnb.count} {c.reviews} <span aria-hidden="true">↗</span></span></a>
          <a href={property.bookingLinks.booking} target="_blank" rel="noopener noreferrer" aria-label={`Booking.com: ${c.readReviews}`}><span>Booking.com</span><strong data-testid="review-score">{reviewStats.booking.score.toFixed(1)}<small> / 10</small></strong><span>{reviewStats.booking.count} {c.reviews} <span aria-hidden="true">↗</span></span></a>
        </div><p className={s.ratingNote}>{fillCopy(c.ratingsNote, { date: reviewStats.lastVerified })}</p>
      </section>
      <section id="location" className={s.location} aria-labelledby="location-title">
        <div data-reveal><p className={s.eyebrow}>{c.locationEyebrow}</p><h2 id="location-title" className={s.heading}>{c.locationTitle}</h2><p className={s.body}>{fillCopy(c.locationBody, values)}</p><div className={s.locationLinks}><a href={property.location.googleMapsUrl} target="_blank" rel="noopener noreferrer">{c.maps} ↗</a><a href={property.location.googleDirectionsUrl} target="_blank" rel="noopener noreferrer">{c.directions} ↗</a></div><MapPanel locale={lang} /></div>
        <figure className={s.locationPhoto}><PhotoButton id="terrace"><PropertyPhoto id="terrace" alt={caption("terrace")} className={s.portrait} sizes="(max-width:760px) 100vw, 45vw" /></PhotoButton><figcaption className={s.caption}>{c.place}</figcaption></figure>
      </section>
      <section id="information" className={s.faq} aria-labelledby="faq-title"><div><p className={s.eyebrow}>{c.faqEyebrow}</p><h2 id="faq-title" className={s.heading}>{c.faqTitle}</h2></div><div>{c.faqs.map((item) => <details key={item.q}><summary>{item.q}<span aria-hidden="true">+</span></summary><p>{fillCopy(item.a, values)}</p></details>)}</div></section>
      <section id="book" className={s.closing} style={{ position: "relative", isolation: "isolate" }} aria-labelledby="closing-title">
        <div className={s.sceneMedia} style={{ position: "absolute", inset: 0 }} data-media-frame><Image src={stayPhoto("master").src} alt={caption("master")} fill sizes="(max-width: 760px) 130vh, 100vw" className={s.sceneImage} /></div><div className={s.sceneScrim} aria-hidden="true" />
        <div className={s.closingContent}><h2 id="closing-title" className={s.heading}>{c.closing}</h2><div><p>{c.closingBody}</p><BookButton source="closing" className={s.solidButton}>{c.bookShort}<span aria-hidden="true">↗</span></BookButton></div></div>
      </section>
      <footer className={s.footer}><div className={s.footerWordmark}>Mastiha<span>Luxury Suites</span></div><div className={s.footerMeta}><span>{c.place}</span><span>{c.registration} {property.licenseNumber}</span><Link href={`/${lang}/privacy`}>{c.privacy}</Link><a href="#home">{c.top} ↑</a></div></footer>
    </main>
  </StayExperience>;
}
