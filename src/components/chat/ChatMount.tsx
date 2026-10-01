"use client";

import "./chatbot.css";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { CHAT_COPY } from "@/content/chat-copy";
import type { StayLocale } from "@/content/stay-copy";
import { readSession } from "./useConcierge";

/*
  The assistant's code loads after the page is idle, or at once on a click, so it never
  competes with the hero. Until then this draws the same toggle; a click on it opens the
  assistant as soon as it arrives.
*/
const FloatingAssistant = dynamic(() => import("./FloatingAssistant"), { ssr: false });

export function ChatMount({ locale }: { locale: StayLocale }) {
  const [load, setLoad] = useState(false);
  const [openOnLoad, setOpenOnLoad] = useState(false);
  const [hostOnLoad, setHostOnLoad] = useState(false);

  useEffect(() => {
    const start = () => setLoad(true);
    const onOpen = (event: Event) => {
      setOpenOnLoad(true);
      if ((event as CustomEvent<{ mode?: string }>).detail?.mode === "host") setHostOnLoad(true);
      setLoad(true);
    };
    window.addEventListener("mastiha:assistant-open", onOpen);
    // A returning guest with a conversation loads straight away, so Athina's replies show.
    if (readSession()) start();
    // Safari has no requestIdleCallback; a timer stands in for it.
    const idle = typeof requestIdleCallback === "function" ? requestIdleCallback(start, { timeout: 4000 }) : setTimeout(start, 2500);
    return () => {
      window.removeEventListener("mastiha:assistant-open", onOpen);
      if (typeof cancelIdleCallback === "function") cancelIdleCallback(idle as number); else clearTimeout(idle);
    };
  }, []);

  if (load) return <FloatingAssistant locale={locale} initiallyOpen={openOnLoad} initialHandoff={hostOnLoad} />;
  return <button type="button" className="chatbot-toggle" aria-label={CHAT_COPY[locale].open} onClick={() => { setOpenOnLoad(true); setLoad(true); }} data-testid="assistant-toggle">
    <MessageCircle />
  </button>;
}
