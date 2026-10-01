import Image from "next/image";
import Link from "next/link";
import { propertyData as property } from "@/content/property";
import { fillCopy, getStayCopy, type StayLocale } from "@/content/stay-copy";
import { photoCaption, stayPhoto } from "@/content/stay-media";
import { BookButton } from "../SiteShell";
import s from "./hero.module.css";

const locales = ["el", "en", "tr"] as const;

export function Hero({ locale }: { locale: StayLocale }) {
  const c = getStayCopy(locale);
  const photo = stayPhoto("living");
  const facts = fillCopy(c.hero.facts, { area: property.areaM2, bedrooms: property.bedrooms, guests: property.maxGuests });

  return <section id="home" className={s.hero} aria-labelledby="hero-title" data-hero data-testid="landing-hero">
    <div className={s.frame} data-hero-frame>
      <div className={s.media} data-hero-media data-photo-id="living">
        <Image
          src={photo.src}
          alt={photoCaption("living", locale)}
          fill
          priority
          sizes="(max-aspect-ratio: 3/2) 150vh, 100vw"
          className={s.image}
          style={{ objectPosition: photo.position }}
          data-testid="hero-image"
        />
      </div>
      <div className={s.scrim} aria-hidden="true" />

      <header className={s.masthead}>
        <nav className={s.nav} aria-label={c.common.nav}>
          <a href="#suite">{c.suite}</a>
          <a href="#gallery">{c.gallery}</a>
          <a href="#location">{c.location}</a>
        </nav>
        <Link href={`/${locale}`} className={s.wordmark}>{property.name}</Link>
        <div className={s.actions}>
          <nav className={s.locales} aria-label={c.common.language}>
            {locales.map(code => <Link key={code} href={`/${code}`} lang={code} hrefLang={code} aria-current={code === locale ? "page" : undefined}>{code.toUpperCase()}</Link>)}
          </nav>
          <BookButton className={s.cta} source="hero">{c.hero.cta}<span aria-hidden="true">↗</span></BookButton>
        </div>
      </header>

      <div className={s.meta} data-hero-fade>
        <span>{c.hero.place}</span>
        <span>{fillCopy(c.hero.toSea, { distance: property.distanceToSeaMeters })}</span>
      </div>

      <div className={s.identity}>
        <p data-hero-fade>{c.hero.kicker}</p>
        <h1 id="hero-title" data-hero-title>{property.name}</h1>
        <p className={s.facts} data-hero-fade>{facts}</p>
      </div>

      <a href="#film" className={s.scroll} data-hero-fade><span aria-hidden="true">↓</span>{c.hero.scroll}</a>
    </div>
  </section>;
}
