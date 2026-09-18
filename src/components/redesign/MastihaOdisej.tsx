"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SequenceCanvas, SequenceCanvasHandle } from "@/components/sequence/SequenceCanvas";
import { propertyData } from "@/content/property";
import { reviewStats } from "@/content/reviews";
import { trackEvent } from "@/lib/analytics";
import { useSmoothScroll } from "@/components/layout/SmoothScrollProvider";
import styles from "./MastihaOdisej.module.css";

const spaces = [
  {
    title: "Living room",
    image: "/photography/living-room.webp",
    note: "Light-filled living and dining space",
  },
  {
    title: "Master bedroom",
    image: "/photography/master-bedroom.webp",
    note: "King bed · quiet interior",
  },
  {
    title: "Second bedroom",
    image: "/photography/second-bedroom.webp",
    note: "Single bed · calm morning light",
  },
  {
    title: "Bathroom",
    image: "/photography/bathroom.webp",
    note: "Stone, glass and clean lines",
  },
];

const gallery = [
  ["/photography/living-room.webp", "Living room"],
  ["/photography/master-bedroom.webp", "Master bedroom"],
  ["/photography/second-bedroom.webp", "Second bedroom"],
  ["/photography/bathroom.webp", "Bathroom"],
  ["/photography/hero.webp", "Terrace"],
] as const;

function Icon({ name }: { name: "home" | "suite" | "gallery" | "location" }) {
  if (name === "home") {
    return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 10.8 12 4l8 6.8v8.4H5.2v-7.4" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  }
  if (name === "suite") {
    return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 15.5h16M6 15.5V9.2h5.3c2 0 3.2 1 3.2 3v3.3M4 18.8v-7M20 18.8v-7" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  }
  if (name === "gallery") {
    return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="1.4" stroke="currentColor" strokeWidth="1.35"/><path d="m6.8 16 4-4 3 2.8 2.1-2 2.4 3.2M15.8 9.2h.01" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  }
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20s5.7-5.7 5.7-10A5.7 5.7 0 0 0 6.3 10C6.3 14.3 12 20 12 20Z" stroke="currentColor" strokeWidth="1.35"/><circle cx="12" cy="10" r="1.8" stroke="currentColor" strokeWidth="1.35"/></svg>;
}

function CinematicSequence() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<SequenceCanvasHandle | null>(null);
  const [caption, setCaption] = useState(0);
  const t = useTranslations("sequence");
  const labels = useMemo(() => [t("step1"), t("step3"), t("step5")], [t]);

  useEffect(() => {
    if (!sectionRef.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.25,
      onUpdate: (self) => {
        const count = canvasRef.current?.getFrameCount() || 120;
        canvasRef.current?.setFrame(Math.round(self.progress * (count - 1)));
        const next = self.progress < 0.34 ? 0 : self.progress < 0.7 ? 1 : 2;
        setCaption((current) => current === next ? current : next);
      },
    });
    return () => trigger.kill();
  }, []);

  return (
    <section ref={sectionRef} className={styles.film} aria-label="Apartment film">
      <div className={styles.filmSticky}>
        <div className={styles.filmCanvas}>
          <SequenceCanvas ref={canvasRef} />
        </div>
        <div className={styles.filmLabel} aria-live="polite">
          <span className={styles.filmLabelIndex}>0{caption + 1} / 03</span>
          <span className={styles.filmLabelText}>{labels[caption]}</span>
        </div>
      </div>
    </section>
  );
}

export function MastihaOdisej() {
  const rootRef = useRef<HTMLElement | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [activeSpace, setActiveSpace] = useState(0);
  const { scrollTo } = useSmoothScroll();
  const hero = useTranslations("hero");
  const intro = useTranslations("intro");
  const amenities = useTranslations("amenities");
  const location = useTranslations("location");

  useEffect(() => {
    if (!rootRef.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.fromTo(el, { y: 28, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: 1.05,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 86%", once: true },
        });
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!bookingOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setBookingOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = original;
      window.removeEventListener("keydown", onKey);
    };
  }, [bookingOpen]);

  const openBooking = (source: "hero" | "dock" | "cta") => {
    if (source === "hero") trackEvent("hero_book_click");
    if (source === "dock") trackEvent("dock_book_click");
    setBookingOpen(true);
  };

  const scroll = (id: string) => scrollTo(id, { offset: -20 });

  return (
    <main ref={rootRef} className={styles.site}>
      <section id="home" className={styles.hero}>
        <Image src="/photography/hero.webp" alt="Mastiha Luxury Suites terrace in Vrontados, Chios" fill priority sizes="100vw" className={styles.heroImage} />
        <div className={styles.heroShade} />
        <div className={styles.heroGrain} />

        <header className={styles.masthead}>
          <nav className={styles.navLeft} aria-label="Primary">
            <button className={styles.navLink} onClick={() => scroll("#suite")}>The house</button>
            <button className={styles.navLink} onClick={() => scroll("#spaces")}>Our rooms</button>
            <button className={styles.navLink} onClick={() => scroll("#location")}>The island</button>
          </nav>

          <div className={styles.wordmark} aria-label="Mastiha Luxury Suites">
            <span>Mastiha</span>
            <span>Luxury Suites</span>
          </div>

          <div className={styles.navRight}>
            <div className={styles.localeGroup} aria-label="Language">
              <Link className={styles.localeLink} href="/en">EN</Link>
              <Link className={styles.localeLink} href="/el">EL</Link>
              <Link className={styles.localeLink} href="/tr">TR</Link>
            </div>
            <button className={styles.bookTop} onClick={() => openBooking("hero")}>Check availability ↗</button>
          </div>
        </header>

        <div className={styles.heroLocation}>Vrontados<br />Chios, Greece</div>
        <div className={styles.heroKicker}>{hero("headline")}</div>
        <div className={styles.heroCenter}><small>Private seaside stay · 40 m from the Aegean</small></div>

        <div className={styles.heroTitleWrap}>
          <h1 className={styles.heroTitle}>MASTIHA</h1>
          <div className={styles.heroTitleSub}>
            <span>Luxury Suites</span>
            <span>75 m² · 2 bedrooms · up to 4 guests</span>
          </div>
        </div>

        <button className={styles.discover} onClick={() => scroll("#film")}>
          <span className={styles.discoverIcon}>↓</span>
          <span>Discover the house</span>
        </button>
      </section>

      <div id="film"><CinematicSequence /></div>

      <section id="suite" className={styles.statement}>
        <div className={styles.statementEyebrow}>Mastiha Luxury Suites · Chios</div>
        <h2 className={styles.statementText} data-reveal>{intro("statement")}</h2>
        <div className={styles.statementFoot}>
          <span>Vrontados · North Aegean</span>
          <span>40 metres from the shoreline</span>
        </div>
      </section>

      <section className={`${styles.paper} ${styles.intro}`}>
        <h2 className={styles.introLead} data-reveal>A house shaped around light, quiet and the sea.</h2>
        <div className={styles.introRight} data-reveal>
          <p className={styles.introCopy}>{intro("narrative")}</p>
          <div className={styles.metrics}>
            <div className={styles.metric}><strong>75</strong><span>m² private living space</span></div>
            <div className={styles.metric}><strong>04</strong><span>guests maximum</span></div>
            <div className={styles.metric}><strong>02</strong><span>bedrooms</span></div>
            <div className={styles.metric}><strong>40</strong><span>metres to the Aegean</span></div>
          </div>
        </div>
      </section>

      <section id="spaces" className={`${styles.paper} ${styles.spaces}`}>
        <div className={styles.sectionTop}><span>01 · The house</span><span>Inside Mastiha</span></div>
        <div className={styles.imageEditorial}>
          <figure data-reveal>
            <div className={styles.imageLarge}>
              <Image src="/photography/living-room.webp" alt="Mastiha Luxury Suites living room" fill sizes="(max-width:900px) 100vw, 62vw" className={styles.editorialImage} />
            </div>
            <figcaption className={styles.imageCaption}><span>Living room</span><span>Natural light · open living</span></figcaption>
          </figure>
          <figure data-reveal>
            <div className={styles.imageSmall}>
              <Image src="/photography/master-bedroom.webp" alt="Mastiha Luxury Suites master bedroom" fill sizes="(max-width:900px) 75vw, 32vw" className={styles.editorialImage} />
            </div>
            <figcaption className={styles.imageCaption}><span>Master bedroom</span><span>King bed</span></figcaption>
          </figure>
        </div>
      </section>

      <section className={styles.rooms}>
        <div className={styles.sectionTop}><span>02 · Rooms</span><span>Choose a space</span></div>
        <h2 className={styles.roomsTitle} data-reveal>Small details.<br />Room to exhale.</h2>
        <div className={styles.roomStage}>
          <div className={styles.roomRows}>
            {spaces.map((space, index) => (
              <button
                key={space.title}
                className={`${styles.roomRow} ${activeSpace === index ? styles.roomRowActive : ""}`}
                onMouseEnter={() => setActiveSpace(index)}
                onFocus={() => setActiveSpace(index)}
                onClick={() => setActiveSpace(index)}
              >
                <small>0{index + 1}</small>
                <strong>{space.title}</strong>
                <span>{space.note}</span>
              </button>
            ))}
          </div>
          <div className={styles.roomVisual}>
            <div className={styles.roomImageWrap}>
              <Image key={spaces[activeSpace].image} src={spaces[activeSpace].image} alt={spaces[activeSpace].title} fill sizes="(max-width:900px) 100vw, 52vw" className={styles.editorialImage} />
            </div>
            <div className={styles.roomDesc}><span>{spaces[activeSpace].title}</span><span>{spaces[activeSpace].note}</span></div>
          </div>
        </div>
      </section>

      <section id="gallery" className={styles.gallery}>
        <div className={styles.galleryHead}>
          <h2 data-reveal>The suite</h2>
          <p>Five real views of the property. No stock imagery, no invented rooms, no decorative filler.</p>
        </div>
        <div className={styles.galleryRail} aria-label="Property photographs">
          {gallery.map(([src, label], index) => (
            <figure className={styles.galleryFrame} key={src + index}>
              <div className={styles.galleryPhoto}>
                <Image src={src} alt={label} fill sizes="(max-width:700px) 88vw, 68vw" className={styles.editorialImage} />
              </div>
              <figcaption className={styles.galleryCaption}><span>0{index + 1}</span><span>{label}</span></figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section id="amenities" className={styles.amenities}>
        <div className={styles.sectionTop}><span>03 · Details</span><span>What is included</span></div>
        <div className={styles.amenitiesGrid}>
          <div className={styles.amenitiesTitle}>
            <h2 data-reveal>Everything you need.<br />Nothing you don&apos;t.</h2>
            <p>{amenities("subtitle")}</p>
          </div>
          <div className={styles.amenityList}>
            {propertyData.amenities.slice(0, 10).map((item, index) => (
              <div className={styles.amenity} key={item.id}>
                <span className={styles.amenityNum}>{String(index + 1).padStart(2, "0")}</span>
                <span className={styles.amenityName}>{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="reviews" className={styles.trust}>
        <div className={styles.sectionTop}><span>04 · Guest ratings</span><span>Verified snapshot · September 2026</span></div>
        <h2 className={styles.trustHead} data-reveal>Guests have already said enough.</h2>
        <div className={styles.scores}>
          <div className={styles.score}>
            <div className={styles.scoreNumber}>{reviewStats.airbnb.score.toFixed(1)}</div>
            <div className={styles.scoreMeta}><span>Airbnb</span><span>{reviewStats.airbnb.count} reviews · {reviewStats.airbnb.badge}</span></div>
          </div>
          <div className={styles.score}>
            <div className={styles.scoreNumber}>{reviewStats.booking.score.toFixed(1)}</div>
            <div className={styles.scoreMeta}><span>Booking.com</span><span>{reviewStats.booking.count} reviews · {reviewStats.booking.label}</span></div>
          </div>
        </div>
      </section>

      <section id="location" className={styles.location}>
        <div>
          <p className={styles.locationBig}>40<span className={styles.locationUnit}> m</span></p>
          <span>to the Aegean shoreline</span>
        </div>
        <div className={styles.locationRight} data-reveal>
          <h2>{location("title")}</h2>
          <p>{location("subtitle")}</p>
          <div className={styles.locationActions}>
            <a href={propertyData.location.googleMapsUrl} target="_blank" rel="noreferrer" onClick={() => trackEvent("map_open")}>Open Google Maps ↗</a>
            <a href={propertyData.location.googleDirectionsUrl} target="_blank" rel="noreferrer" onClick={() => trackEvent("directions_click")}>Get directions ↗</a>
          </div>
        </div>
      </section>

      <section className={styles.booking}>
        <Image src="/photography/master-bedroom.webp" alt="Master bedroom at Mastiha Luxury Suites" fill sizes="100vw" className={styles.bookingImage} />
        <div className={styles.bookingShade} />
        <div className={styles.bookingContent}>
          <h2 data-reveal>Stay a little longer.</h2>
          <button className={styles.bookingButton} onClick={() => openBooking("cta")}>Check availability ↗</button>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerBrand}>Mastiha<br />Luxury Suites</div>
        <div className={styles.footerBottom}>
          <span>Vrontados · Chios · Greece</span>
          <span>Greek Tourism Registration<br />{propertyData.licenseNumber}</span>
          <span>Bookings via Airbnb & Booking.com<br />Ratings last verified {reviewStats.lastVerified}</span>
        </div>
      </footer>

      <nav className={styles.dock} aria-label="Quick navigation">
        <button className={styles.dockButton} aria-label="Home" onClick={() => scroll("#home")}><Icon name="home" /></button>
        <button className={styles.dockButton} aria-label="The suite" onClick={() => scroll("#suite")}><Icon name="suite" /></button>
        <button className={styles.dockButton} aria-label="Gallery" onClick={() => scroll("#gallery")}><Icon name="gallery" /></button>
        <button className={styles.dockButton} aria-label="Location" onClick={() => scroll("#location")}><Icon name="location" /></button>
        <button className={`${styles.dockButton} ${styles.dockBook}`} onClick={() => openBooking("dock")}>Book ↗</button>
      </nav>

      {bookingOpen && (
        <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Choose a booking platform" onMouseDown={(event) => {
          if (event.currentTarget === event.target) setBookingOpen(false);
        }}>
          <div className={styles.overlayPanel}>
            <div className={styles.overlayTop}>
              <div className={styles.overlayTitle}>Choose where to book.</div>
              <button className={styles.overlayClose} onClick={() => setBookingOpen(false)} aria-label="Close">×</button>
            </div>
            <a className={styles.bookingRow} href={propertyData.bookingLinks.airbnb} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("booking_outbound_click", { platform: "airbnb" })}>
              <small>01</small><strong>Airbnb</strong><span>5.0 · Guest Favorite ↗</span>
            </a>
            <a className={styles.bookingRow} href={propertyData.bookingLinks.booking} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("booking_outbound_click", { platform: "booking" })}>
              <small>02</small><strong>Booking.com</strong><span>9.9 Exceptional ↗</span>
            </a>
          </div>
        </div>
      )}
    </main>
  );
}
