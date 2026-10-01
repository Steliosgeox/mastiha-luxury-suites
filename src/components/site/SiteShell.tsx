"use client";

import dynamic from "next/dynamic";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { useSmoothScroll } from "@/components/layout/SmoothScrollProvider";
import { propertyData } from "@/content/property";
import { getStayCopy, type StayLocale } from "@/content/stay-copy";
import { photoCaption, stayPhotos, type PhotoId } from "@/content/stay-media";
import { trackEvent } from "@/lib/analytics";
import { PremiumDock } from "./dock/PremiumDock";
import { AirbnbMark, BookingMark } from "./icons";
import { useSiteMotion } from "./motion";
import ui from "./ui.module.css";
import s from "./shell.module.css";

const Lightbox = dynamic(() => import("./Lightbox"), { ssr: false });

type SiteContext = { locale: StayLocale; book: (source: string) => void; photo: (id: PhotoId) => void };
const Context = createContext<SiteContext | null>(null);

function useSite() {
  const value = useContext(Context);
  if (!value) throw new Error("SiteShell is missing");
  return value;
}

export function BookButton({ children, className, source }: { children: ReactNode; className?: string; source: string }) {
  const { book } = useSite();
  return <button type="button" className={className} onClick={() => book(source)}>{children}</button>;
}

export function PhotoButton({ id, children, className }: { id: PhotoId; children: ReactNode; className?: string }) {
  const { photo, locale } = useSite();
  const label = `${getStayCopy(locale).common.openPhoto}: ${photoCaption(id, locale)}`;
  return <button type="button" className={className ?? ui.photoButton} aria-label={label} onClick={() => photo(id)}>{children}</button>;
}

/** Opens the chat panel. The assistant listens for this event wherever it is mounted. */
export function ChatButton({ children, className, mode = "guide" }: { children: ReactNode; className?: string; mode?: "guide" | "host" }) {
  return <button type="button" className={className} onClick={() => window.dispatchEvent(new CustomEvent("mastiha:assistant-open", { detail: { mode } }))}>{children}</button>;
}

export function SiteShell({ locale, children }: { locale: StayLocale; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);
  const { lenis, scrollTo } = useSmoothScroll();
  const c = getStayCopy(locale);
  useSiteMotion(root);

  const rememberOpener = () => { opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; };
  const restoreFocus = useCallback(() => requestAnimationFrame(() => opener.current?.focus({ preventScroll: true })), []);

  const book = useCallback((source: string) => {
    rememberOpener();
    trackEvent(source === "dock" ? "dock_book_click" : "hero_book_click", { source });
    setBookingOpen(true);
  }, []);

  const photo = useCallback((id: PhotoId) => {
    const index = stayPhotos.findIndex(item => item.id === id);
    if (index < 0) return;
    rememberOpener();
    trackEvent("gallery_open", { index });
    setPhotoIndex(index);
  }, []);

  const closeGallery = useCallback(() => { setPhotoIndex(null); restoreFocus(); }, [restoreFocus]);

  // The chat's "Book" action, from outside this context.
  useEffect(() => {
    const onBook = () => book("chat");
    window.addEventListener("mastiha:book-open", onBook);
    return () => window.removeEventListener("mastiha:book-open", onBook);
  }, [book]);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (bookingOpen && !element.open) element.showModal();
    if (!bookingOpen && element.open) { element.close(); restoreFocus(); }
  }, [bookingOpen, restoreFocus]);

  // Freeze page scrolling (and Lenis) behind the dialog and the lightbox.
  useEffect(() => {
    if (!bookingOpen && photoIndex === null) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop();
    return () => { document.body.style.overflow = overflow; lenis?.start(); };
  }, [bookingOpen, photoIndex, lenis]);

  const trapFocus = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== "Tab") return;
    const controls = [...event.currentTarget.querySelectorAll<HTMLElement>("button, a[href]")].filter(control => control.getClientRects().length > 0);
    const first = controls[0], last = controls.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  };

  // In-page links scroll through Lenis, and keyboard focus follows the destination.
  const onAnchorClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href^='#']") : null;
    const hash = link?.getAttribute("href");
    const destination = hash && hash.length > 1 ? document.getElementById(hash.slice(1)) : null;
    if (!destination) return;
    event.preventDefault();
    scrollTo(`#${destination.id}`, { offset: 0 });
    if (event.detail === 0 || link?.classList.contains(ui.skip)) {
      const addTabIndex = !destination.hasAttribute("tabindex");
      if (addTabIndex) destination.setAttribute("tabindex", "-1");
      destination.focus({ preventScroll: true });
      if (addTabIndex) destination.addEventListener("blur", () => destination.removeAttribute("tabindex"), { once: true });
    }
  };

  return <Context.Provider value={{ locale, book, photo }}>
    <div ref={root} className={ui.page} data-stay-page onClick={onAnchorClick}>
      {children}
      <PremiumDock locale={locale} onNavigate={target => scrollTo(target, { offset: 0 })} onBook={() => book("dock")} />
      <dialog
        ref={dialog}
        className={s.dialog}
        aria-labelledby="booking-title"
        aria-describedby="booking-description"
        data-lenis-prevent
        onKeyDown={trapFocus}
        onCancel={event => { event.preventDefault(); setBookingOpen(false); }}
        onClick={event => { if (event.target === event.currentTarget) setBookingOpen(false); }}
      >
        <div className={s.dialogInner}>
          <div className={s.dialogTop}>
            <h2 id="booking-title">{c.booking.title}</h2>
            <button type="button" className={s.close} onClick={() => setBookingOpen(false)} aria-label={c.common.close}>×</button>
          </div>
          <p id="booking-description">{c.booking.body}</p>
          <a className={s.platform} href={propertyData.bookingLinks.airbnb} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("booking_outbound_click", { platform: "airbnb" })}>
            <span><AirbnbMark className={s.platformIcon} style={{ color: "#ff385c" }} />Airbnb</span><span aria-hidden="true">↗</span>
          </a>
          <a className={s.platform} href={propertyData.bookingLinks.booking} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("booking_outbound_click", { platform: "booking" })}>
            <span><BookingMark className={s.platformIcon} style={{ color: "#003b95" }} />Booking.com</span><span aria-hidden="true">↗</span>
          </a>
        </div>
      </dialog>
      {photoIndex !== null && <Lightbox index={photoIndex} locale={locale} onClose={closeGallery} />}
    </div>
  </Context.Provider>;
}
