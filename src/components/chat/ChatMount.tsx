"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChatCircleDots, X } from "@phosphor-icons/react";
import { useSmoothScroll } from "@/components/layout/SmoothScrollProvider";
import { CHAT_COPY } from "@/content/chat-copy";
import type { StayLocale } from "@/content/stay-copy";
import type { FallbackLinks } from "./GuestChat";
import { readSession } from "./useGuestChat";
import s from "./widget.module.css";

// The chat panel (and assistant-ui) loads on first use, or straight away for a returning
// guest with a live conversation, so their unread replies show on the launcher.
const GuestChat = dynamic(() => import("./GuestChat"), { ssr: false });

export function ChatMount({ locale, liveEnabled, fallback }: { locale: StayLocale; liveEnabled: boolean; fallback: FallbackLinks }) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [unread, setUnread] = useState(0);
  const [hostRequest, setHostRequest] = useState(0);
  const launcher = useRef<HTMLButtonElement>(null);
  const { lenis } = useSmoothScroll();
  const c = CHAT_COPY[locale];

  useEffect(() => {
    if (liveEnabled && readSession()) setLoaded(true);
    const onOpen = (event: Event) => {
      setLoaded(true);
      setOpen(true);
      if ((event as CustomEvent<{ mode?: string }>).detail?.mode === "host") setHostRequest(value => value + 1);
    };
    window.addEventListener("mastiha:assistant-open", onOpen);
    return () => window.removeEventListener("mastiha:assistant-open", onOpen);
  }, [liveEnabled]);

  // The panel is full screen on phones: freeze the page behind it.
  useEffect(() => {
    if (!open || !matchMedia("(max-width: 640px)").matches) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop();
    return () => { document.body.style.overflow = overflow; lenis?.start(); };
  }, [open, lenis]);

  const close = useCallback(() => {
    setOpen(false);
    requestAnimationFrame(() => launcher.current?.focus({ preventScroll: true }));
  }, []);

  return <div className={s.mount}>
    {loaded && <GuestChat locale={locale} open={open} liveEnabled={liveEnabled} fallback={fallback} hostRequest={hostRequest} onClose={close} onUnread={setUnread} />}
    <button
      ref={launcher}
      type="button"
      className={s.launcher}
      data-open={open}
      aria-expanded={open}
      aria-label={open ? c.close : c.open}
      onClick={() => { setLoaded(true); setOpen(value => !value); }}
      data-testid="assistant-toggle"
    >
      {open ? <X weight="bold" /> : <ChatCircleDots weight="fill" />}
      {!open && unread > 0 && <span className={s.badge} aria-label={`${unread}`}>{unread}</span>}
    </button>
  </div>;
}
