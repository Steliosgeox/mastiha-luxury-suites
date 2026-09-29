"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { X } from "@phosphor-icons/react";
import { CHAT_COPY } from "@/content/chat-copy";
import { propertyData as property } from "@/content/property";
import type { StayLocale } from "@/content/stay-copy";
import { ChatThread } from "./ChatThread";
import { useGuestChat } from "./useGuestChat";
import s from "./widget.module.css";

export type FallbackLinks = { whatsapp: string | null; email: string | null };

type Props = {
  locale: StayLocale;
  open: boolean;
  liveEnabled: boolean;
  fallback: FallbackLinks;
  /** Increments when a page button asks for Athina directly. */
  hostRequest: number;
  onClose: () => void;
  onUnread: (count: number) => void;
};

export default function GuestChat({ locale, open, liveEnabled, fallback, hostRequest, onClose, onUnread }: Props) {
  const c = CHAT_COPY[locale];
  const chat = useGuestChat({ locale, open, liveEnabled });
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const { mode, setMode } = chat;

  useEffect(() => onUnread(chat.unread), [chat.unread, onUnread]);
  useEffect(() => { if (hostRequest && mode === "guide") setMode("form"); }, [hostRequest]); // eslint-disable-line react-hooks/exhaustive-deps

  // Focus the composer on open; Escape closes; Tab stays inside the panel.
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>("textarea, input, button")?.focus());
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
      if (event.key !== "Tab" || !panel.current) return;
      const focusable = [...panel.current.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], input, textarea")].filter(element => element.getClientRects().length);
      const first = focusable[0], last = focusable.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { cancelAnimationFrame(frame); document.removeEventListener("keydown", onKey); };
  }, [open, mode, onClose]);

  const statusText = mode !== "live" ? c.status.bot
    : chat.status === "closed" ? c.status.closed
      : chat.hostTyping ? c.status.typing
        : chat.hostOnline ? c.status.hostOnline : c.status.hostAway;

  const welcome = <div className={s.welcome}>
    <h2>{c.welcome.title}</h2>
    <p>{c.welcome.body}</p>
    <div className={s.suggestions}>
      {c.welcome.suggestions.map(question => <button type="button" key={question} onClick={() => void chat.send(question, c.error)}>{question}</button>)}
    </div>
    <button type="button" className={s.hostCard} onClick={() => setMode("form")}>
      <span className={s.hostAvatar} aria-hidden="true">{c.names.host.charAt(0)}</span>
      <span><strong>{c.talkToHost}</strong><small>{c.talkToHostBody}</small></span>
      <span aria-hidden="true">→</span>
    </button>
  </div>;

  return <div
    ref={panel}
    className={s.panel}
    role="dialog"
    aria-modal="true"
    aria-labelledby={titleId}
    hidden={!open}
    data-lenis-prevent
    data-testid="assistant-dialog"
    data-mode={mode}
  >
    <header className={s.header}>
      <span className={s.logo} data-live={mode === "live"} aria-hidden="true">{mode === "live" ? c.names.host.charAt(0) : "M"}</span>
      <div className={s.identity}>
        <strong id={titleId}>{mode === "live" ? c.names.host : c.title}</strong>
        <span className={s.status} data-online={mode === "live" && chat.hostOnline && chat.status === "open"}>{statusText}</span>
      </div>
      {mode === "guide" && <button type="button" className={s.hostButton} onClick={() => setMode("form")} aria-label={c.talkToHost} title={c.talkToHost}>
        <span aria-hidden="true">{c.names.host.charAt(0)}</span>{c.names.host}
      </button>}
      <button type="button" className={s.close} onClick={onClose} aria-label={c.close}><X /></button>
    </header>

    {mode === "form"
      ? <HandoffForm locale={locale} liveEnabled={liveEnabled} fallback={fallback} starting={chat.starting} onBack={() => setMode("guide")} onStart={chat.startLive} />
      : <ChatThread
        items={chat.items}
        self="guest"
        locale={locale}
        names={{ guest: "", host: c.names.host, bot: c.names.bot }}
        systemText={code => c.system[code as keyof typeof c.system] ?? code}
        failedLabel={c.failed}
        actionLabel={liveEnabled ? c.talkToHost : undefined}
        onAction={() => setMode("form")}
        onRetry={chat.retry}
        onSend={text => chat.send(text, c.error)}
        placeholder={mode === "live" ? (chat.status === "closed" ? c.placeholder.closed : c.placeholder.live) : c.placeholder.bot}
        sendLabel={c.send}
        busy={chat.thinking}
        typing={chat.thinking ? c.names.bot : mode === "live" && chat.hostTyping ? c.status.typing : null}
        empty={welcome}
        beforeComposer={<>
          {chat.error && <p className={s.error} role="alert">{chat.error}</p>}
          {mode === "live" && chat.status === "closed" && <button type="button" className={s.newChat} onClick={chat.reset}>{c.newChat}</button>}
        </>}
      />}
  </div>;
}

function HandoffForm({ locale, liveEnabled, fallback, starting, onBack, onStart }: {
  locale: StayLocale;
  liveEnabled: boolean;
  fallback: FallbackLinks;
  starting: boolean;
  onBack: () => void;
  onStart: (details: { name: string; email: string }) => Promise<"ok" | "unavailable" | "error">;
}) {
  const c = CHAT_COPY[locale];
  const [unavailable, setUnavailable] = useState(!liveEnabled);
  const [failed, setFailed] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setFailed(false);
    const result = await onStart({ name: String(form.get("name") ?? ""), email: String(form.get("email") ?? "") });
    if (result === "unavailable") setUnavailable(true);
    if (result === "error") setFailed(true);
  };

  return <div className={s.form} data-testid="representative-panel">
    <h2>{c.handoff.title}</h2>
    {unavailable ? <>
      <p>{c.handoff.unavailable}</p>
      <div className={s.platforms}>
        <a href={property.bookingLinks.airbnb} target="_blank" rel="noopener noreferrer">Airbnb ↗</a>
        <a href={property.bookingLinks.booking} target="_blank" rel="noopener noreferrer">Booking.com ↗</a>
        {fallback.whatsapp && <a href={fallback.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp ↗</a>}
        {fallback.email && <a href={`mailto:${fallback.email}`}>{fallback.email}</a>}
      </div>
    </> : <form onSubmit={submit}>
      <p>{c.handoff.body}</p>
      <label><span>{c.handoff.name} <small>({c.handoff.optional})</small></span><input name="name" autoComplete="name" maxLength={80} disabled={starting} /></label>
      <label><span>{c.handoff.email} <small>({c.handoff.optional})</small></span><input name="email" type="email" autoComplete="email" maxLength={254} disabled={starting} /></label>
      <p className={s.privacy}>{c.handoff.privacy} <a href={`/${locale}/privacy`} target="_blank" rel="noopener noreferrer">{c.handoff.privacyLink}</a></p>
      {failed && <p className={s.error} role="alert">{c.error}</p>}
      <button type="submit" className={s.start} disabled={starting}>{starting ? c.handoff.starting : c.handoff.start}<span aria-hidden="true">→</span></button>
    </form>}
    <button type="button" className={s.back} onClick={onBack}>← {c.handoff.back}</button>
  </div>;
}
