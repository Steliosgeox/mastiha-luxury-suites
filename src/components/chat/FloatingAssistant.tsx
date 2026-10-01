"use client";

import "./chatbot.css";
import { Fragment, memo, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowRight, CalendarDays, Check, Headset, MapPin, MessageCircle, Sparkles, X } from "lucide-react";
import { useSmoothScroll } from "@/components/layout/SmoothScrollProvider";
import { CHAT_COPY } from "@/content/chat-copy";
import { propertyData as property } from "@/content/property";
import type { StayLocale } from "@/content/stay-copy";
import { RichText } from "./RichText";
import { useConcierge, type ChatItem } from "./useConcierge";

/**
 * The floating site assistant: Elite Memoriz's FloatingAssistant (itself a port of the
 * aerofren two-state chatbot), on Mastiha's light palette. A compact welcome widget becomes
 * an expanded conversation once the dialogue starts, and goes full screen below 1024px.
 * Added for Mastiha: Athina's replies (the admin style the original carries), system notes,
 * the handoff and its optional contact card. The provider key never reaches the browser.
 */

const CHAT_NEAR_BOTTOM_THRESHOLD = 72;

const isChatNearBottom = (scroller: HTMLDivElement | null): boolean => {
  if (!scroller) return true;
  const distanceFromBottom = scroller.scrollHeight - (scroller.scrollTop + scroller.clientHeight);
  return distanceFromBottom <= CHAT_NEAR_BOTTOM_THRESHOLD;
};

const MessageBody = memo(function MessageBody({ content }: { content: string }) {
  return <RichText content={content} className="chatbot__rich" />;
});

const Loader = () => (
  <svg className="chatbot__loader" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path className="chatbot__loader-line" d="m4.9 4.9 2.9 2.9" />
    <path className="chatbot__loader-line" d="M2 12h4" />
    <path className="chatbot__loader-line" d="m4.9 19.1 2.9-2.9" />
    <path className="chatbot__loader-line" d="M12 18v4" />
    <path className="chatbot__loader-line" d="m16.2 16.2 2.9 2.9" />
    <path className="chatbot__loader-line" d="M18 12h4" />
    <path className="chatbot__loader-line" d="m16.2 7.8 2.9-2.9" />
    <path className="chatbot__loader-line" d="M12 2v4" />
  </svg>
);

type Props = { locale: StayLocale; stored: boolean; initiallyOpen?: boolean; initialHandoff?: boolean };

export default function FloatingAssistant({ locale, stored, initiallyOpen = false, initialHandoff = false }: Props) {
  const copy = CHAT_COPY[locale];
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [input, setInput] = useState("");
  const [detailsState, setDetailsState] = useState<"ask" | "saved" | "dismissed">("ask");
  const chat = useConcierge({ locale, open: isOpen, stored });
  const { lenis } = useSmoothScroll();

  const chatScrollerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputId = useId();
  const titleId = useId();

  const isConversationMode = chat.items.length > 0;
  const withHost = chat.handler === "host";
  const latestMessageSignature = useMemo(() => `${chat.items.length}:${chat.items.at(-1)?.id ?? ""}:${chat.thinking}`, [chat.items, chat.thinking]);
  const prevSignatureRef = useRef<string | null>(null);
  const forceScrollRef = useRef(false);
  const [scrollbarCompensation, setScrollbarCompensation] = useState(0);

  const scrollToLatest = useCallback(() => {
    const scroller = chatScrollerRef.current;
    if (!scroller) return;
    requestAnimationFrame(() => {
      if (typeof scroller.scrollTo === "function") {
        scroller.scrollTo({ top: scroller.scrollHeight, behavior: "smooth" });
        return;
      }
      scroller.scrollTop = scroller.scrollHeight;
    });
  }, []);

  useEffect(() => {
    if (!isOpen) {
      prevSignatureRef.current = latestMessageSignature;
      forceScrollRef.current = false;
      return;
    }
    const previous = prevSignatureRef.current;
    const changed = previous !== null && previous !== latestMessageSignature;
    if (previous === null || (changed && (forceScrollRef.current || isChatNearBottom(chatScrollerRef.current)))) scrollToLatest();
    prevSignatureRef.current = latestMessageSignature;
    forceScrollRef.current = false;
  }, [isOpen, latestMessageSignature, scrollToLatest]);

  useLayoutEffect(() => {
    if (!isConversationMode || !isOpen) return;
    const frame = requestAnimationFrame(() => {
      const scroller = chatScrollerRef.current;
      if (!scroller) return;
      const messagesEl = scroller.firstElementChild as HTMLElement | null;
      setScrollbarCompensation(scroller.offsetWidth - (messagesEl?.offsetWidth ?? scroller.offsetWidth));
    });
    return () => cancelAnimationFrame(frame);
  }, [isConversationMode, isOpen]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    requestAnimationFrame(() => toggleRef.current?.focus({ preventScroll: true }));
  }, []);

  const handoff = useCallback(async () => {
    forceScrollRef.current = true;
    await chat.handoff();
  }, [chat]);

  // Page buttons ("Talk to Athina", the dock) open the assistant, or hand straight to Athina.
  useEffect(() => {
    const onOpen = (event: Event) => {
      setIsOpen(true);
      if ((event as CustomEvent<{ mode?: string }>).detail?.mode === "host") void handoff();
    };
    window.addEventListener("mastiha:assistant-open", onOpen);
    return () => window.removeEventListener("mastiha:assistant-open", onOpen);
  }, [handoff]);

  // A "Talk to Athina" click that arrived while this code was still loading.
  const handedOff = useRef(false);
  useEffect(() => {
    if (!initialHandoff || handedOff.current) return;
    handedOff.current = true;
    void handoff();
  }, [initialHandoff, handoff]);

  // Focus the field on open; Escape closes.
  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>("textarea, input")?.focus({ preventScroll: true }));
    const onKey = (event: globalThis.KeyboardEvent) => { if (event.key === "Escape") { event.preventDefault(); close(); } };
    document.addEventListener("keydown", onKey);
    return () => { cancelAnimationFrame(frame); document.removeEventListener("keydown", onKey); };
  }, [isOpen, isConversationMode, close]);

  // Full screen below 1024px: freeze the page behind it.
  useEffect(() => {
    if (!isOpen || !matchMedia("(max-width: 1023px)").matches) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lenis?.stop();
    return () => { document.body.style.overflow = overflow; lenis?.start(); };
  }, [isOpen, lenis]);

  const handleSubmit = useCallback((text?: string) => {
    const value = (text ?? input).trim();
    if (!value || chat.thinking) return;
    forceScrollRef.current = true;
    setInput("");
    void chat.send(value);
  }, [input, chat]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const saveDetails = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const ok = await chat.saveDetails({ name: String(form.get("name") ?? ""), email: String(form.get("email") ?? "") });
    if (ok) setDetailsState("saved");
  };

  const statusText = !withHost ? copy.status.bot
    : chat.status === "closed" ? copy.status.closed
      : chat.hostTyping ? copy.status.typing
        : chat.hostOnline ? copy.status.hostOnline : copy.status.hostAway;
  const placeholder = !withHost ? copy.placeholder.bot : chat.status === "closed" ? copy.placeholder.closed : copy.placeholder.live;
  const lastHandoff = chat.items.findLastIndex(item => item.kind === "system" && item.text === "handoff");

  const hostAction = <button
    type="button"
    className={`chatbot__quick-action${withHost ? " chatbot__quick-action--success" : ""}${chat.handingOff ? " chatbot__quick-action--loading" : ""}`}
    onClick={() => void handoff()}
    disabled={!stored || chat.handingOff || (withHost && chat.status === "open")}
    data-testid="assistant-handoff"
  >
    {chat.handingOff ? <span className="chatbot__quick-action-spinner" aria-hidden="true" />
      : withHost ? <Check className="chatbot__quick-action-icon chatbot__quick-action-icon--success" aria-hidden="true" />
        : <Headset className="chatbot__quick-action-icon" aria-hidden="true" />}
    <span>{withHost ? copy.quick.hostDone : copy.quick.host}</span>
  </button>;

  const renderItem = (message: ChatItem, index: number) => {
    if (message.kind === "system") {
      return <div key={message.id} className="chatbot__message chatbot__message--system">
        <p className="chatbot__system-pill">{copy.system[message.text as keyof typeof copy.system] ?? message.text}</p>
      </div>;
    }
    if (message.kind === "guest") {
      return <div key={message.id} className="chatbot__message chatbot__message--user" data-mine="true" data-state={message.state}>
        <div className="chatbot__message-content">
          <p className="chatbot__message-text">{message.text}</p>
          <div className="chatbot__message-bubble" />
          <div className="chatbot__message-bubble chatbot__message-bubble--end" />
          {message.state === "failed" && <button type="button" className="chatbot__retry" onClick={() => void chat.send(message.text, message.id)}>{copy.failed}</button>}
        </div>
      </div>;
    }
    const host = message.kind === "host";
    return <div key={message.id} className={`chatbot__message ${host ? "chatbot__message--admin" : "chatbot__message--assistant"}`} data-speaker={host ? "host" : "bot"}>
      <div className="chatbot__message-icon">
        <div className={`chatbot__icon chatbot__icon--small ${host ? "chatbot__icon--support" : "chatbot__icon--gradient"}`}>
          {host ? <span className="chatbot__icon-initial" aria-hidden="true">{copy.names.host.charAt(0)}</span> : <Headset className="chatbot__icon-svg" aria-hidden="true" />}
        </div>
      </div>
      <div className="chatbot__message-content">
        {host && <p className="chatbot__message-sender">{copy.names.host}</p>}
        <MessageBody content={message.text} />
        {message.offersHost && !withHost && stored && index === chat.items.length - 1 && <div className="chatbot__message-actions">{hostAction}</div>}
      </div>
    </div>;
  };

  return <>
    {!isOpen && (
      <button ref={toggleRef} type="button" onClick={open} className="chatbot-toggle" aria-label={copy.open} data-testid="assistant-toggle">
        <MessageCircle />
        {chat.unread > 0 && <span className="chatbot-toggle__badge">{chat.unread}</span>}
      </button>
    )}

    {isOpen && (
      <div
        ref={panelRef}
        aria-labelledby={titleId}
        className={`chatbot ${isConversationMode ? "chatbot--conversation" : "chatbot--welcome"}`}
        data-theme="light"
        data-lenis-prevent
        role="dialog"
        data-testid="assistant-dialog"
        data-handler={chat.handler}
      >
        {/* ── HEADER ── */}
        <div className="chatbot__header">
          <div className="chatbot__header-info">
            <div className="chatbot__header-icon">
              {withHost ? <Headset className="chatbot__header-icon-svg" aria-hidden="true" /> : <Sparkles className="chatbot__header-icon-svg" aria-hidden="true" />}
            </div>
            <div className="chatbot__header-text">
              <h3 id={titleId} className="chatbot__header-title">{withHost ? copy.names.host : copy.title}</h3>
              <span className="chatbot__header-status" aria-live="polite">{statusText}</span>
            </div>
          </div>
          <button type="button" className="chatbot__header-close" onClick={close} aria-label={copy.close}>
            <X />
          </button>
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div className="chatbot__quick-actions">
          <button type="button" className="chatbot__quick-action" onClick={() => { close(); window.dispatchEvent(new Event("mastiha:book-open")); }}>
            <CalendarDays className="chatbot__quick-action-icon" aria-hidden="true" />
            <span>{copy.quick.book}</span>
          </button>
          <a href={property.location.googleDirectionsUrl} target="_blank" rel="noopener noreferrer" className="chatbot__quick-action">
            <MapPin className="chatbot__quick-action-icon" aria-hidden="true" />
            <span>{copy.quick.directions}</span>
          </a>
          {stored && hostAction}
        </div>

        {/* ── MAIN CONTAINER ── */}
        <div className="chatbot__container">
          {!isConversationMode ? (
            /* ── WELCOME STATE ── */
            <div className="chatbot__welcome-content">
              <div className="chatbot__icon-wrapper">
                <div className="chatbot__icon chatbot__icon--gradient">
                  <Sparkles className="chatbot__icon-svg" strokeWidth={1.5} aria-hidden="true" />
                </div>
              </div>
              <h2 className="chatbot__title">{copy.welcome.title}</h2>
              <div className="chatbot__suggestions-box">
                {copy.welcome.suggestions.map(suggestion => (
                  <button key={suggestion} type="button" className="chatbot__suggestion" onClick={() => handleSubmit(suggestion)}>{suggestion}</button>
                ))}
                <div className="chatbot__input-wrapper">
                  <label className="chatbot__label" htmlFor={inputId}>{copy.inputLabel}</label>
                  <input
                    id={inputId}
                    className="chatbot__input"
                    type="text"
                    placeholder={copy.placeholder.bot}
                    value={input}
                    maxLength={1500}
                    onChange={event => setInput(event.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button type="button" className="chatbot__submit" onClick={() => handleSubmit()} disabled={!input.trim()} aria-label={copy.send}>
                    <ArrowRight className="chatbot__submit-icon" />
                  </button>
                </div>
              </div>
              <p className="chatbot__notice">{copy.notice} <a href={`/${locale}/privacy`} target="_blank" rel="noopener">{copy.privacy}</a></p>
            </div>
          ) : (
            /* ── CONVERSATION STATE ── */
            <div className="chatbot__conversation-content">
              {/* `data-lenis-prevent`: Lenis owns the page wheel; this element owns its own scrolling. */}
              <div className="chatbot__message-scroller" data-lenis-prevent ref={chatScrollerRef}>
                <div className="chatbot__messages" style={{ paddingInlineEnd: `calc(1.5em - ${scrollbarCompensation}px)` }}>
                  {chat.items.map((message, index) => <Fragment key={message.id}>
                    {renderItem(message, index)}
                    {index === lastHandoff && withHost && detailsState !== "dismissed" && (
                      <div className="chatbot__message chatbot__message--system">
                        {detailsState === "saved" ? <p className="chatbot__system-pill">{copy.details.saved}</p> : (
                          <form className="chatbot__details" onSubmit={saveDetails}>
                            <strong>{copy.details.title}</strong>
                            <p>{copy.details.body}</p>
                            <label><span>{copy.details.name}</span><input name="name" autoComplete="name" maxLength={80} /></label>
                            <label><span>{copy.details.email}</span><input name="email" type="email" autoComplete="email" maxLength={254} /></label>
                            <div>
                              <button type="submit" className="chatbot__details-save">{copy.details.save}</button>
                              <button type="button" className="chatbot__details-skip" onClick={() => setDetailsState("dismissed")}>{copy.details.skip}</button>
                            </div>
                          </form>
                        )}
                      </div>
                    )}
                  </Fragment>)}
                  {chat.thinking && (
                    <div className="chatbot__message chatbot__message--assistant chatbot__message--ai-loading" role="status" aria-label={copy.names.bot}>
                      <div className="chatbot__message-icon">
                        <div className="chatbot__icon chatbot__icon--small chatbot__icon--gradient"><Headset className="chatbot__icon-svg" aria-hidden="true" /></div>
                      </div>
                      <Loader />
                    </div>
                  )}
                  {withHost && chat.hostTyping && <p className="chatbot__typing" role="status">{copy.status.typing}</p>}
                </div>
              </div>

              <div className="chatbot__input-box">
                {chat.failed && <p role="alert" className="chatbot__support-pill chatbot__support-pill--error">{copy.error}</p>}
                {!withHost && (
                  <div className="chatbot__suggestion-tags">
                    {copy.tags.map(tag => (
                      <button key={tag} type="button" className="chatbot__suggestion-tag" disabled={chat.thinking} onClick={() => handleSubmit(tag)}>{tag}</button>
                    ))}
                  </div>
                )}
                {withHost && chat.status === "closed" && (
                  <div className="chatbot__suggestion-tags"><button type="button" className="chatbot__suggestion-tag" onClick={chat.reset}>{copy.newChat}</button></div>
                )}
                <div className="chatbot__textarea-wrapper">
                  <label className="chatbot__label" htmlFor={`${inputId}-msg`}>{copy.messageLabel}</label>
                  <textarea
                    id={`${inputId}-msg`}
                    className="chatbot__textarea"
                    placeholder={placeholder}
                    value={input}
                    maxLength={1500}
                    disabled={chat.thinking}
                    onChange={event => setInput(event.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                  />
                  <button type="button" className="chatbot__submit chatbot__submit--textarea" onClick={() => handleSubmit()} disabled={!input.trim() || chat.thinking} aria-label={copy.send}>
                    <ArrowRight className="chatbot__submit-icon" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )}
  </>;
}
