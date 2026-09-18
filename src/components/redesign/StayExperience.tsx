"use client";

import dynamic from "next/dynamic";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode, type MouseEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSmoothScroll } from "@/components/layout/SmoothScrollProvider";
import { propertyData } from "@/content/property";
import { stayPhotos, type PhotoId } from "@/content/stay-media";
import { getStayCopy, type StayLocale } from "@/content/stay-copy";
import { trackEvent } from "@/lib/analytics";
import { PremiumDock } from "./PremiumDock";
import s from "./MastihaOdisej.module.css";

const GalleryLightbox = dynamic(() => import("./StayLightbox"), { ssr: false, loading: () => <div className={s.galleryLoading} role="status" aria-label="Loading photographs">Mastiha</div> });
const StayContext = createContext<{ book: (source: string) => void; photo: (id: PhotoId) => void; locale: StayLocale } | null>(null);
function useStay() { const value = useContext(StayContext); if (!value) throw new Error("StayExperience provider missing"); return value; }

export function BookButton({ children, className, source }: { children: ReactNode; className?: string; source: string }) {
  const { book } = useStay();
  return <button type="button" className={className} onClick={() => book(source)}>{children}</button>;
}
export function PhotoButton({ id, children, className }: { id: PhotoId; children: ReactNode; className?: string }) {
  const { photo, locale } = useStay(); const c = getStayCopy(locale);
  return <button type="button" className={className ?? s.photoButton} aria-label={`${c.photoAction}: ${c.captions[id]}`} onClick={() => photo(id)}>{children}</button>;
}
export function MapPanel({ locale }: { locale: StayLocale }) {
  const [loaded, setLoaded] = useState(false); const c = getStayCopy(locale);
  const query = new URL(propertyData.location.googleMapsUrl).searchParams.get("query") ?? "Mastiha Luxury Suites Vrontados Chios";
  return <div><button type="button" className={s.mapButton} aria-expanded={loaded} aria-controls="property-map" onClick={() => { setLoaded((value) => !value); if (!loaded) trackEvent("map_open"); }}>{loaded ? c.close : c.mapLoad}</button>
    {loaded && <iframe id="property-map" className={s.map} title={c.mapTitle} src={`https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />}
    <p className={s.mapNote}>{c.mapNote}</p></div>;
}

export function StayExperience({ locale, children }: { locale: StayLocale; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);
  const { lenis, scrollTo } = useSmoothScroll();
  const c = getStayCopy(locale);
  const openBook = useCallback((source: string) => {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (source === "hero") trackEvent("hero_book_click");
    if (source === "dock") trackEvent("dock_book_click");
    setBookingOpen(true);
  }, []);
  const openPhoto = useCallback((id: PhotoId) => {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const index = stayPhotos.findIndex((photo) => photo.id === id);
    if (index < 0) return;
    trackEvent("gallery_open", { index }); setPhotoIndex(index);
  }, []);
  const restoreFocus = useCallback(() => { requestAnimationFrame(() => opener.current?.focus({ preventScroll: true })); }, []);
  const closeGallery = useCallback(() => { setPhotoIndex(null); restoreFocus(); }, [restoreFocus]);
  const closeBooking = useCallback(() => { setBookingOpen(false); }, []);

  useEffect(() => {
    const element = dialog.current;
    if (bookingOpen && element && !element.open) element.showModal();
    if (!bookingOpen && element?.open) { element.close(); restoreFocus(); }
  }, [bookingOpen, restoreFocus]);

  useEffect(() => {
    if (!bookingOpen && photoIndex === null) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; lenis?.stop();
    return () => { document.body.style.overflow = overflow; lenis?.start(); };
  }, [bookingOpen, photoIndex, lenis]);

  useEffect(() => {
    if (!root.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-reveal]", root.current).forEach((element) => {
          // The hero never waits for animation or media preloading.
          gsap.from(element, { y: 22, duration: .85, ease: "power2.out", scrollTrigger: { trigger: element, start: "top 92%", once: true } });
        });
        gsap.utils.toArray<HTMLElement>("[data-parallax]", root.current).forEach((image) => {
          gsap.fromTo(image, { scale: 1.08, yPercent: -3 }, { scale: 1.08, yPercent: 3, ease: "none", scrollTrigger: { trigger: image.parentElement, start: "top bottom", end: "bottom top", scrub: true } });
        });
      });
    }, root);
    return () => { media.revert(); context.revert(); };
  }, []);

  const navigate = (target: string) => scrollTo(target, { offset: 0 });
  const anchorClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href^='#']") : null;
    const hash = target?.getAttribute("href");
    if (!hash || hash.length < 2 || !document.getElementById(hash.slice(1))) return;
    event.preventDefault(); navigate(hash);
  };

  return <StayContext.Provider value={{ book: openBook, photo: openPhoto, locale }}>
    <div ref={root} className={s.experience} onClick={anchorClick}>
      {children}
      <PremiumDock onNavigate={navigate} onBook={() => openBook("dock")} />
      <dialog ref={dialog} className={s.dialog} aria-labelledby="booking-title" aria-describedby="booking-description" data-lenis-prevent onCancel={(event) => { event.preventDefault(); closeBooking(); }} onClick={(event) => { if (event.target === event.currentTarget) closeBooking(); }}>
        <div className={s.dialogInner}><div className={s.dialogTop}><h2 id="booking-title">{c.bookingTitle}</h2><button type="button" className={s.closeButton} onClick={closeBooking} aria-label={c.close}>×</button></div><p id="booking-description">{c.bookingBody}</p>
          <a className={s.platformLink} href={propertyData.bookingLinks.airbnb} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("booking_outbound_click", { platform: "airbnb" })}>Airbnb<span aria-hidden="true">↗</span></a>
          <a className={s.platformLink} href={propertyData.bookingLinks.booking} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("booking_outbound_click", { platform: "booking" })}>Booking.com<span aria-hidden="true">↗</span></a>
        </div>
      </dialog>
      {photoIndex !== null && <GalleryLightbox index={photoIndex} locale={locale} onClose={closeGallery} />}
    </div>
  </StayContext.Provider>;
}
