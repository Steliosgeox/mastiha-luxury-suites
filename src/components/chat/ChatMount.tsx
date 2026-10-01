"use client";

import "./chatbot.css";
import { useCallback, useEffect, useRef, useState, type ComponentType } from "react";
import { MessageCircle } from "lucide-react";
import { CHAT_COPY } from "@/content/chat-copy";
import type { StayLocale } from "@/content/stay-copy";
import type { AssistantProps } from "./FloatingAssistant";
import { readSession } from "./useConcierge";

/*
  The chat's toggle, and the assistant behind it. The assistant's code loads after the page
  is idle, as soon as the guest reaches for the toggle (hover, focus, touch), or on a click,
  so it never competes with the hero. The toggle is drawn here and stays the same element
  before and after the code arrives: a press that began before the swap still clicks.
*/
let loading: Promise<ComponentType<AssistantProps>> | null = null;
const loadAssistant = () => (loading ??= import("./FloatingAssistant").then(module => module.default));

export function ChatMount({ locale }: { locale: StayLocale }) {
  const [Assistant, setAssistant] = useState<ComponentType<AssistantProps> | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hostSignal, setHostSignal] = useState(0);
  const [unread, setUnread] = useState(0);
  const toggle = useRef<HTMLButtonElement>(null);

  const load = useCallback(() => {
    void loadAssistant().then(component => setAssistant(() => component)).catch(() => { loading = null; });
  }, []);
  const open = useCallback(() => { setIsOpen(true); load(); }, [load]);
  const close = useCallback(() => {
    setIsOpen(false);
    requestAnimationFrame(() => toggle.current?.focus({ preventScroll: true }));
  }, []);

  useEffect(() => {
    // Page buttons open the chat ("Talk to Athina" also hands it straight to her).
    const onOpen = (event: Event) => {
      if ((event as CustomEvent<{ mode?: string }>).detail?.mode === "host") setHostSignal(value => value + 1);
      open();
    };
    window.addEventListener("mastiha:assistant-open", onOpen);
    // A returning guest with a conversation loads straight away, so Athina's replies show.
    if (readSession()) load();
    // Safari has no requestIdleCallback; a timer stands in for it.
    const idle = typeof requestIdleCallback === "function" ? requestIdleCallback(load, { timeout: 4000 }) : setTimeout(load, 2000);
    return () => {
      window.removeEventListener("mastiha:assistant-open", onOpen);
      if (typeof cancelIdleCallback === "function") cancelIdleCallback(idle as number); else clearTimeout(idle);
    };
  }, [load, open]);

  // Hidden while the panel is open (it has its own close button); busy while its code loads.
  const waiting = isOpen && !Assistant;
  return <>
    {(!isOpen || waiting) && <button
      ref={toggle}
      type="button"
      className={`chatbot-toggle${waiting ? " chatbot-toggle--loading" : ""}`}
      aria-label={CHAT_COPY[locale].open}
      aria-busy={waiting || undefined}
      onClick={open}
      onPointerEnter={load}
      onFocus={load}
      onTouchStart={load}
      data-testid="assistant-toggle"
    >
      <MessageCircle />
      {unread > 0 && <span className="chatbot-toggle__badge">{unread}</span>}
    </button>}
    {Assistant && <Assistant locale={locale} open={isOpen} onClose={close} hostSignal={hostSignal} onUnread={setUnread} />}
  </>;
}
