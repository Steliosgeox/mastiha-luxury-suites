"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Bell, BellSlash, CheckCircle, EnvelopeSimple, SignOut, SpeakerHigh, SpeakerSlash, Trash, ArrowCounterClockwise, MagnifyingGlass } from "@phosphor-icons/react";
import { ChatThread } from "@/components/chat/ChatThread";
import { ADMIN_COPY, type AdminCopy, type AdminLocale } from "@/content/admin-copy";
import type { Conversation } from "@/lib/chat/types";
import { chime, disablePush, enablePush, pushState, type PushState } from "./notify";
import { useAdminInbox } from "./useAdminInbox";
import s from "./admin.module.css";

type Filter = "open" | "closed" | "all";

function remember<T extends string>(key: string, fallback: T): T {
  try { return (localStorage.getItem(key) as T | null) ?? fallback; } catch { return fallback; }
}
function store(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* ignore */ }
}

function ago(time: number, c: AdminCopy, locale: AdminLocale) {
  const minutes = Math.floor((Date.now() - time) / 60_000);
  if (minutes < 1) return c.time.now;
  if (minutes < 60) return c.time.minutes.replace("{n}", String(minutes));
  if (minutes < 24 * 60) return c.time.hours.replace("{n}", String(Math.floor(minutes / 60)));
  if (minutes < 48 * 60) return c.time.yesterday;
  return new Date(time).toLocaleDateString(locale === "el" ? "el-GR" : "en-GB", { day: "numeric", month: "short", timeZone: "Europe/Athens" });
}

const nameOf = (conversation: Conversation, c: AdminCopy) => conversation.name || `${c.guest} ${conversation.id.slice(0, 4).toUpperCase()}`;
const guestOnline = (conversation: Conversation) => Date.now() - conversation.guestSeenAt < 35_000;

export function AdminApp() {
  const [locale, setLocale] = useState<AdminLocale>("el");
  const [filter, setFilter] = useState<Filter>("open");
  const [query, setQuery] = useState("");
  const [sound, setSound] = useState(true);
  const [push, setPush] = useState<PushState | null>(null);
  const [, tick] = useState(0);
  const c = ADMIN_COPY[locale];

  useEffect(() => {
    setLocale(remember<AdminLocale>("mastiha.admin.locale", "el"));
    setSound(remember("mastiha.admin.sound", "on") === "on");
    void pushState().then(setPush).catch(() => setPush("unsupported"));
    const timer = setInterval(() => tick(value => value + 1), 30_000); // refresh relative times
    return () => clearInterval(timer);
  }, []);

  const onIncoming = useCallback((conversation: Conversation) => {
    if (sound) chime();
    if (document.visibilityState === "hidden" && push !== "on" && "Notification" in window && Notification.permission === "granted") {
      new Notification(`${ADMIN_COPY[locale].newMessage} · ${nameOf(conversation, ADMIN_COPY[locale])}`, { body: conversation.lastText, tag: conversation.id });
    }
  }, [sound, push, locale]);

  const inbox = useAdminInbox({ onIncoming });
  const { select } = inbox;

  // Open the conversation named in the URL (from a notification).
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("c");
    if (id) select(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const unread = inbox.conversations.reduce((sum, conversation) => sum + conversation.hostUnread, 0);
  useEffect(() => { document.title = `${unread ? `(${unread}) ` : ""}${c.title} · ${c.brand}`; }, [unread, c]);

  const visible = useMemo(() => {
    const term = query.trim().toLocaleLowerCase();
    return inbox.conversations.filter(conversation =>
      (filter === "all" || conversation.status === filter)
      && (!term || `${conversation.name} ${conversation.email} ${conversation.lastText}`.toLocaleLowerCase().includes(term)));
  }, [inbox.conversations, filter, query]);

  const togglePush = async () => {
    setPush(push === "on" ? await disablePush() : await enablePush().catch(() => "unsupported" as const));
  };
  const toggleSound = () => { setSound(!sound); store("mastiha.admin.sound", sound ? "off" : "on"); };
  const switchLocale = () => { const next = locale === "el" ? "en" : "el"; setLocale(next); store("mastiha.admin.locale", next); };
  const logout = async () => { await fetch("/api/admin/session", { method: "DELETE" }); window.location.reload(); };

  const current = inbox.current;
  const pushHint = push && push !== "on" && push !== "off" ? c.notifications[push === "ios" ? "ios" : push] : null;

  return <div className={s.app} data-view={inbox.selected ? "thread" : "list"}>
    <aside className={s.sidebar}>
      <header className={s.top}>
        <div className={s.brand}><span aria-hidden="true">M</span><div><strong>{c.brand}</strong><small>{c.title}</small></div></div>
        <div className={s.tools}>
          <button type="button" onClick={switchLocale} className={s.icon} aria-label="EL / EN">{locale === "el" ? "EN" : "EL"}</button>
          <button type="button" onClick={toggleSound} className={s.icon} aria-pressed={sound} aria-label={c.sound}>{sound ? <SpeakerHigh /> : <SpeakerSlash />}</button>
          <button type="button" onClick={logout} className={s.icon} aria-label={c.logout}><SignOut /></button>
        </div>
      </header>

      <button type="button" className={s.push} data-on={push === "on"} onClick={togglePush} disabled={push === "unsupported" || push === "ios"}>
        {push === "on" ? <Bell weight="fill" /> : <BellSlash />}
        <span>{push === "on" ? c.notifications.on : c.notifications.enable}</span>
        <span className={s.switch} aria-hidden="true" />
      </button>
      {pushHint && <p className={s.hint}>{pushHint}</p>}

      <div className={s.filters} role="tablist">
        {(["open", "closed", "all"] as const).map(id => <button key={id} type="button" role="tab" aria-selected={filter === id} onClick={() => setFilter(id)}>{c.filters[id]}</button>)}
      </div>
      <label className={s.search}><MagnifyingGlass aria-hidden="true" /><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={c.search} aria-label={c.search} /></label>
      {inbox.offline && <p className={s.offline} role="status">{c.offline}</p>}

      <ul className={s.list} data-testid="admin-conversations">
        {visible.map(conversation => <li key={conversation.id}>
          <button type="button" className={s.row} aria-current={inbox.selected === conversation.id} onClick={() => select(conversation.id)}>
            <span className={s.avatar} data-online={guestOnline(conversation)}>{nameOf(conversation, c).charAt(0).toUpperCase()}</span>
            <span className={s.rowText}>
              <span className={s.rowTop}><strong>{nameOf(conversation, c)}</strong><time>{ago(conversation.updatedAt, c, locale)}</time></span>
              <span className={s.preview}>{conversation.lastAuthor === "host" ? `${c.names.host}: ` : ""}{conversation.lastAuthor === "system" ? c.system[conversation.lastText as keyof AdminCopy["system"]] ?? "" : conversation.lastText}</span>
            </span>
            {conversation.hostUnread > 0 && <span className={s.unread}>{conversation.hostUnread}</span>}
          </button>
        </li>)}
      </ul>
      {inbox.loaded && !visible.length && <div className={s.empty}><p>{c.empty}</p><small>{c.emptyHint}</small></div>}
    </aside>

    <main className={s.main}>
      {current ? <>
        <header className={s.threadTop}>
          <button type="button" className={`${s.icon} ${s.backButton}`} onClick={() => select(null)} aria-label={c.back}><ArrowLeft /></button>
          <span className={s.avatar} data-online={guestOnline(current)}>{nameOf(current, c).charAt(0).toUpperCase()}</span>
          <div className={s.guest}>
            <strong>{nameOf(current, c)}</strong>
            <small>
              {guestOnline(current) ? c.online : c.seen.replace("{time}", ago(current.guestSeenAt, c, locale))}
              {" · "}{c.writesIn.replace("{language}", c.languages[current.locale])}
            </small>
          </div>
          <div className={s.actions}>
            {current.email && <a className={s.icon} href={`mailto:${current.email}`} aria-label={current.email} title={current.email}><EnvelopeSimple /></a>}
            {current.status === "open"
              ? <button type="button" className={s.pill} onClick={() => inbox.setStatus(current.id, "closed")}><CheckCircle />{c.close}</button>
              : <button type="button" className={s.pill} onClick={() => inbox.setStatus(current.id, "open")}><ArrowCounterClockwise />{c.reopen}</button>}
            <button type="button" className={s.icon} aria-label={c.remove} onClick={() => { if (confirm(c.confirmRemove)) void inbox.remove(current.id); }}><Trash /></button>
          </div>
        </header>
        <div className={s.thread} onInput={inbox.typing}>
          <ChatThread
            key={current.id}
            items={inbox.items}
            self="host"
            locale={locale === "el" ? "el-GR" : "en-GB"}
            names={{ guest: nameOf(current, c), host: c.names.host, bot: c.names.bot }}
            systemText={code => c.system[code as keyof AdminCopy["system"]] ?? code}
            failedLabel={c.failed}
            onRetry={item => inbox.send(item.text, item.id)}
            onSend={text => inbox.send(text)}
            placeholder={c.reply}
            sendLabel={c.send}
          />
        </div>
      </> : <div className={s.placeholder}><span aria-hidden="true">M</span><p>{c.select}</p></div>}
    </main>
  </div>;
}
