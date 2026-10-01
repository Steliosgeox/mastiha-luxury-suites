"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowCounterClockwise, ArrowLeft, ArrowRight, ArrowUpRight, Bell, CalendarBlank, CheckCircle, EnvelopeSimple, List, MagnifyingGlass, Robot, SidebarSimple, SignOut, Trash, UserCircle, X } from "@phosphor-icons/react";
import { ADMIN_COPY, type AdminCopy, type AdminLocale } from "@/content/admin-copy";
import { propertyData as property } from "@/content/property";
import type { Conversation } from "@/lib/chat/types";
import { AdminThread } from "./AdminThread";
import { chime, disablePush, enablePush, pushState, type PushState } from "./notify";
import { useAdminInbox } from "./useAdminInbox";

/*
  The host's portal, in Elite Memoriz's workroom: a rail of destinations, a top bar, and
  screens that are either the desk (the dashboard), an inbox with the Elite Assistant
  thread, or settings. Every conversation is here, the assistant's included, for 30 days.
*/

type View = "desk" | "needs" | "all" | "bot" | "closed" | "settings";
type Filter = Exclude<View, "desk" | "settings">;
const VIEWS: readonly View[] = ["desk", "needs", "all", "bot", "closed", "settings"];
const GLYPH: Record<View, string> = { desk: "command-center", needs: "community", all: "overview", bot: "ai-studio", closed: "overview", settings: "settings" };

function remember<T extends string>(key: string, fallback: T): T {
  try { return (localStorage.getItem(key) as T | null) ?? fallback; } catch { return fallback; }
}
function keep(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* site data blocked */ }
}

const Glyph = ({ name }: { name: string }) => (
  // eslint-disable-next-line @next/next/no-img-element -- fixed-size artwork with density variants
  <img className="host-workroom__glyph" src={`/admin/glyphs/${name}-24.webp`} srcSet={`/admin/glyphs/${name}-48.webp 2x, /admin/glyphs/${name}-72.webp 3x, /admin/glyphs/${name}-96.webp 4x`} width={24} height={24} alt="" decoding="async" draggable={false} />
);

function ago(time: number, c: AdminCopy, locale: AdminLocale) {
  const minutes = Math.floor((Date.now() - time) / 60_000);
  if (minutes < 1) return c.time.now;
  if (minutes < 60) return c.time.minutes.replace("{n}", String(minutes));
  if (minutes < 24 * 60) return c.time.hours.replace("{n}", String(Math.floor(minutes / 60)));
  if (minutes < 48 * 60) return c.time.yesterday;
  return new Date(time).toLocaleDateString(locale === "el" ? "el-GR" : "en-GB", { day: "numeric", month: "short", timeZone: "Europe/Athens" });
}

const nameOf = (conversation: Pick<Conversation, "name" | "id">, c: AdminCopy) => conversation.name || `${c.names.guest} ${conversation.id.slice(0, 4).toUpperCase()}`;
const guestOnline = (conversation: Conversation) => Date.now() - conversation.guestSeenAt < 35_000;
/** Athina has the conversation and the guest spoke last: it is waiting for her. */
const waiting = (conversation: Conversation) => conversation.status === "open" && conversation.handler === "host"
  && (conversation.lastAuthor === "guest" || (conversation.lastAuthor === "system" && conversation.lastText === "handoff") || conversation.hostUnread > 0);
const matches: Record<Filter, (conversation: Conversation) => boolean> = {
  needs: waiting,
  all: () => true,
  bot: conversation => conversation.handler === "bot" && conversation.status === "open",
  closed: conversation => conversation.status === "closed",
};

function preview(conversation: Conversation, c: AdminCopy) {
  if (conversation.lastAuthor === "system") return c.system[conversation.lastText as keyof AdminCopy["system"]] ?? "";
  const prefix = conversation.lastAuthor === "host" ? `${c.names.host}: ` : conversation.lastAuthor === "bot" ? `${c.names.bot}: ` : "";
  return `${prefix}${conversation.lastText}`;
}

function Chip({ conversation, c }: { conversation: Conversation; c: AdminCopy }) {
  const tone = conversation.status === "closed" ? "closed" : conversation.handler === "bot" ? "bot" : waiting(conversation) ? "waiting" : "host";
  const label = { closed: c.list.closed, bot: c.list.withBot, waiting: c.list.waiting, host: c.list.withHost }[tone];
  return <span className="admin-chip" data-tone={tone}>{label}</span>;
}

export function AdminApp() {
  const [locale, setLocale] = useState<AdminLocale>("el");
  const [view, setView] = useState<View>("desk");
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [query, setQuery] = useState("");
  const [sound, setSound] = useState(true);
  const [push, setPush] = useState<PushState | null>(null);
  const [, tick] = useState(0);
  const c = ADMIN_COPY[locale];

  useEffect(() => {
    setLocale(remember<AdminLocale>("mastiha.admin.locale", "el"));
    setSound(remember("mastiha.admin.sound", "on") === "on");
    setCollapsed(remember<string>("mastiha.admin.rail", "open") === "collapsed");
    void pushState().then(setPush).catch(() => setPush("unsupported"));
    const timer = setInterval(() => tick(value => value + 1), 30_000); // relative times
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

  // The view and conversation live in the URL, so a notification can open one directly.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("view") as View | null;
    const id = params.get("c");
    if (id) { setView(requested && requested !== "desk" && requested !== "settings" ? requested : "all"); select(id); }
    else if (requested && VIEWS.includes(requested)) setView(requested);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const go = useCallback((next: View, id: string | null = null) => {
    setView(next);
    select(id);
    setDrawer(false);
    const url = new URL(window.location.href);
    url.searchParams.set("view", next);
    if (id) url.searchParams.set("c", id); else url.searchParams.delete("c");
    window.history.replaceState(null, "", url);
  }, [select]);

  const openConversation = useCallback((id: string | null) => go(view === "desk" || view === "settings" ? "all" : view, id), [go, view]);

  const counts = useMemo(() => ({
    needs: inbox.conversations.filter(waiting).length,
    bot: inbox.conversations.filter(matches.bot).length,
  }), [inbox.conversations]);
  useEffect(() => { document.title = `${counts.needs ? `(${counts.needs}) ` : ""}${c.views[view]} · ${c.brand}`; }, [counts.needs, c, view]);

  const visible = useMemo(() => {
    if (view === "desk" || view === "settings") return [];
    const term = query.trim().toLocaleLowerCase();
    return inbox.conversations.filter(conversation => matches[view](conversation)
      && (!term || `${conversation.name} ${conversation.email} ${conversation.lastText}`.toLocaleLowerCase().includes(term)));
  }, [inbox.conversations, view, query]);

  const togglePush = async () => setPush(push === "on" ? await disablePush() : await enablePush().catch(() => "unsupported" as const));
  const toggleSound = () => { setSound(!sound); keep("mastiha.admin.sound", sound ? "off" : "on"); };
  const switchLocale = (next: AdminLocale) => { setLocale(next); keep("mastiha.admin.locale", next); };
  const toggleRail = () => { setCollapsed(!collapsed); keep("mastiha.admin.rail", collapsed ? "open" : "collapsed"); };
  const logout = async () => { await fetch("/api/admin/session", { method: "DELETE" }); window.location.reload(); };

  const navigation: { id: string; label: string; items: View[] }[] = [
    { id: "conversations", label: c.groups.conversations, items: ["desk", "needs", "all", "bot", "closed"] },
    { id: "manage", label: c.groups.manage, items: ["settings"] },
  ];

  const site = <a className="admin-button admin-button--accent" href="/" target="_blank" rel="noopener">{c.site}<ArrowUpRight size={15} aria-hidden="true" /></a>;
  const actions = push !== "on" && view !== "settings"
    ? <><button type="button" className="admin-button" onClick={() => go("settings")}><Bell size={16} aria-hidden="true" />{c.settings.notifications}</button>{site}</>
    : site;

  return <div className="host-workroom mls-admin" data-rail={collapsed ? "collapsed" : undefined} data-drawer={drawer ? "open" : undefined} data-layout="page">
    <div className="host-workroom__scrim" data-open={drawer || undefined} aria-hidden="true" onClick={() => setDrawer(false)} />

    <div className="host-workroom__rail" data-open={drawer || undefined} role="region" aria-label={c.workroom}>
      <div className="host-workroom__identity">
        <Link href="/admin" className="host-workroom__brand" onClick={event => { event.preventDefault(); go("desk"); }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- the site's own vector mark */}
          <img src="/icon.svg" alt="" className="host-workroom__brand-mark" width={24} height={24} />
          <span className="host-workroom__wordmark">{c.brand}</span>
        </Link>
        <button type="button" className="host-workroom__rail-toggle" aria-expanded={!collapsed} aria-label={collapsed ? c.rail.expand : c.rail.collapse} onClick={toggleRail}>
          <SidebarSimple size={18} weight="duotone" aria-hidden="true" />
        </button>
        <button type="button" className="host-workroom__close" aria-label={c.rail.close} onClick={() => setDrawer(false)}>
          <X size={18} weight="bold" aria-hidden="true" />
        </button>
      </div>

      <div className="host-workroom__event">
        <a href="/" target="_blank" rel="noopener" className="host-workroom__event-switcher" aria-label={c.property}>
          <span className="host-workroom__event-thumb" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element -- 32px thumbnail of our own photo */}
            <img src="/photography/airbnb/living-640.webp" alt="" width={32} height={32} decoding="async" />
          </span>
          <span className="host-workroom__event-copy"><strong>{c.property}</strong><small>{c.place}</small></span>
        </a>
      </div>

      <nav className="host-workroom__navigation" aria-label={c.workroom}>
        {navigation.map(group => <div key={group.id} className="host-workroom__nav-group" role="group" aria-labelledby={`nav-${group.id}`}>
          <p id={`nav-${group.id}`} className="host-workroom__nav-heading">{group.label}</p>
          <ul>
            {group.items.map(item => {
              const count = item === "needs" ? counts.needs : 0;
              return <li key={item}>
                <Link href={`/admin?view=${item}`} className="host-workroom__nav-item" data-current={view === item || undefined} aria-current={view === item ? "page" : undefined}
                  onClick={event => { if (event.metaKey || event.ctrlKey) return; event.preventDefault(); go(item); }}>
                  <Glyph name={GLYPH[item]} />
                  <span className="host-workroom__nav-label">{c.views[item]}</span>
                  {count > 0 && <b className="host-workroom__nav-count" aria-label={String(count)}>{count}</b>}
                </Link>
              </li>;
            })}
          </ul>
        </div>)}
      </nav>

      <div className="host-workroom__rail-footer">
        <div className="host-workroom__rail-controls">
          <button type="button" className="admin-rail-control" onClick={() => switchLocale(locale === "el" ? "en" : "el")} aria-label={c.settings.language}>{locale === "el" ? "EL" : "EN"}</button>
          <button type="button" className="admin-rail-control" onClick={logout} aria-label={c.settings.logout} title={c.settings.logout}><SignOut size={18} aria-hidden="true" /></button>
        </div>
      </div>
    </div>

    <div className="host-workroom__frame" inert={drawer || undefined}>
      <header className="host-workroom__topbar">
        <button type="button" className="host-workroom__menu" aria-label={c.rail.open} aria-expanded={drawer} onClick={() => setDrawer(true)}><List size={20} aria-hidden="true" /></button>
        <div className="host-workroom__topbar-copy"><div><p>{c.property}</p><strong>{c.views[view]}</strong></div></div>
        <div className="host-workroom__topbar-actions">{actions}</div>
      </header>
      <p className="admin-notice"><span className="admin-notice__dot" aria-hidden="true" />{inbox.offline ? c.offline : c.notice}<span className="admin-notice__live" data-offline={inbox.offline || undefined}>{c.live}</span></p>

      <div className="host-workroom__content admin-content" data-view={view}>
        {view === "desk" && <Desk c={c} locale={locale} inbox={inbox} counts={counts} open={id => go("all", id)} go={go} />}
        {view === "settings" && <Settings c={c} locale={locale} push={push} sound={sound} onPush={togglePush} onSound={toggleSound} onLocale={switchLocale} onLogout={logout} ai={inbox.ai} />}
        {view !== "desk" && view !== "settings" && <div className="admin-inbox" data-thread={inbox.selected ? "open" : undefined}>
          <section className="admin-panel admin-inbox__list" aria-label={c.views[view]}>
            <label className="admin-search"><MagnifyingGlass size={16} aria-hidden="true" /><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={c.list.search} aria-label={c.list.search} /></label>
            <ul className="admin-rows" data-testid="admin-conversations">
              {visible.map(conversation => <li key={conversation.id}>
                <button type="button" className="admin-row" aria-current={inbox.selected === conversation.id || undefined} onClick={() => openConversation(conversation.id)}>
                  <span className="admin-row__avatar" data-online={guestOnline(conversation) || undefined} data-bot={conversation.handler === "bot" || undefined}>{nameOf(conversation, c).charAt(0).toUpperCase()}</span>
                  <span className="admin-row__text">
                    <span className="admin-row__top"><strong>{nameOf(conversation, c)}</strong><time>{ago(conversation.updatedAt, c, locale)}</time></span>
                    <span className="admin-row__preview">{preview(conversation, c)}</span>
                  </span>
                  <span className="admin-row__meta"><Chip conversation={conversation} c={c} />{conversation.hostUnread > 0 && conversation.handler === "host" && <b className="admin-row__unread">{conversation.hostUnread}</b>}</span>
                </button>
              </li>)}
            </ul>
            {inbox.loaded && !visible.length && <div className="admin-empty"><Glyph name={GLYPH[view]} /><p>{c.list.empty[view]}</p><small>{c.list.emptyHint}</small></div>}
          </section>
          <section className="admin-panel admin-inbox__thread">
            {inbox.current ? <ConversationView c={c} locale={locale} inbox={inbox} onBack={() => openConversation(null)} /> : <div className="admin-placeholder"><Glyph name="community" /><p>{c.thread.select}</p></div>}
          </section>
        </div>}
      </div>
    </div>
  </div>;
}

type Inbox = ReturnType<typeof useAdminInbox>;

function ConversationView({ c, locale, inbox, onBack }: { c: AdminCopy; locale: AdminLocale; inbox: Inbox; onBack: () => void }) {
  const current = inbox.current!;
  const name = nameOf(current, c);
  const meta = [guestOnline(current) ? c.thread.online : c.thread.seen.replace("{time}", ago(current.guestSeenAt, c, locale)), c.thread.language.replace("{language}", c.thread.languages[current.locale])];
  const pill = (label: string, icon: ReactNode, onClick: () => void) => <button type="button" className="elite-assistant__context-label" onClick={onClick}>{icon}<span>{label}</span></button>;
  return <>
    <header className="admin-thread__head">
      <button type="button" className="admin-icon admin-thread__back" onClick={onBack} aria-label={c.thread.back}><ArrowLeft size={18} aria-hidden="true" /></button>
      <span className="admin-row__avatar" data-online={guestOnline(current) || undefined}>{name.charAt(0).toUpperCase()}</span>
      <div className="admin-thread__who"><strong>{name}</strong><small>{meta.join(" · ")}</small></div>
      <Chip conversation={current} c={c} />
      <div className="admin-thread__actions">
        {current.email && <a className="admin-icon" href={`mailto:${current.email}`} aria-label={`${c.thread.email}: ${current.email}`} title={current.email}><EnvelopeSimple size={18} aria-hidden="true" /></a>}
        <button type="button" className="admin-icon" aria-label={c.thread.remove} title={c.thread.remove} onClick={() => { if (confirm(c.thread.confirmRemove)) void inbox.remove(current.id); }}><Trash size={18} aria-hidden="true" /></button>
      </div>
    </header>
    <AdminThread
      key={current.id}
      copy={c}
      guestName={name}
      items={inbox.items}
      onSend={text => void inbox.send(text)}
      onRetry={item => void inbox.send(item.text, item.id)}
      onTyping={inbox.typing}
      footer={current.handler === "bot" && current.status === "open" ? c.thread.botHint : undefined}
      controls={<>
        {current.handler === "bot"
          ? pill(c.thread.takeOver, <UserCircle size={16} aria-hidden="true" />, () => void inbox.update(current.id, { handler: "host" }))
          : pill(c.thread.giveBack, <Robot size={16} aria-hidden="true" />, () => void inbox.update(current.id, { handler: "bot" }))}
        {current.status === "open"
          ? pill(c.thread.close, <CheckCircle size={16} aria-hidden="true" />, () => void inbox.update(current.id, { status: "closed" }))
          : pill(c.thread.reopen, <ArrowCounterClockwise size={16} aria-hidden="true" />, () => void inbox.update(current.id, { status: "open" }))}
      </>}
    />
  </>;
}

function Desk({ c, locale, inbox, counts, open, go }: { c: AdminCopy; locale: AdminLocale; inbox: Inbox; counts: { needs: number; bot: number }; open: (id: string) => void; go: (view: View) => void }) {
  const now = new Date();
  const hour = Number(now.toLocaleString("en-GB", { hour: "2-digit", hour12: false, timeZone: "Europe/Athens" }));
  const greeting = hour < 12 ? c.greeting.morning : hour < 18 ? c.greeting.afternoon : c.greeting.evening;
  const day = (time: number | Date) => new Date(time).toLocaleDateString("en-CA", { timeZone: "Europe/Athens" });
  const today = inbox.conversations.filter(conversation => day(conversation.updatedAt) === day(now)).length;
  const stats = inbox.ai?.today ?? {};
  const answered = (stats.ai ?? 0) + (stats.cache ?? 0) + (stats.guide ?? 0) + (stats.fallback ?? 0);
  const metrics: { label: string; value: number; view: View }[] = [
    { label: c.desk.metrics.needs, value: counts.needs, view: "needs" },
    { label: c.desk.metrics.today, value: today, view: "all" },
    { label: c.desk.metrics.month, value: inbox.total, view: "all" },
    { label: c.desk.metrics.answered, value: answered, view: "bot" },
  ];
  const recent = inbox.conversations.slice(0, 6);
  return <div className="admin-desk">
    <section className="admin-desk__heading">
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative photo of our coast */}
      <img className="admin-desk__photo" src="/photography/airbnb/coast-1280.webp" alt="" decoding="async" />
      <div>
        <span>{c.desk.eyebrow}</span>
        <h1>{greeting}</h1>
        <p><CalendarBlank size={14} aria-hidden="true" />{now.toLocaleDateString(locale === "el" ? "el-GR" : "en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Athens" })}<i aria-hidden="true" />{c.place}</p>
      </div>
    </section>
    <div className="admin-desk__grid">
      <section className="admin-panel admin-desk__panel">
        <dl className="admin-desk__metrics">
          {metrics.map(metric => <div key={metric.label}>
            <dt>{metric.label}</dt>
            <dd><button type="button" onClick={() => go(metric.view)}>{metric.value}<ArrowUpRight size={14} aria-hidden="true" /></button></dd>
          </div>)}
        </dl>
        <div className="admin-desk__recent">
          <header><h2>{c.desk.recent}</h2><button type="button" onClick={() => go("all")}>{c.desk.seeAll}<ArrowRight size={14} aria-hidden="true" /></button></header>
          {recent.length ? <ul className="admin-rows">
            {recent.map(conversation => <li key={conversation.id}>
              <button type="button" className="admin-row" onClick={() => open(conversation.id)}>
                <span className="admin-row__avatar" data-bot={conversation.handler === "bot" || undefined}>{nameOf(conversation, c).charAt(0).toUpperCase()}</span>
                <span className="admin-row__text">
                  <span className="admin-row__top"><strong>{nameOf(conversation, c)}</strong><time>{ago(conversation.updatedAt, c, locale)}</time></span>
                  <span className="admin-row__preview">{preview(conversation, c)}</span>
                </span>
                <span className="admin-row__meta"><Chip conversation={conversation} c={c} /></span>
              </button>
            </li>)}
          </ul> : <p className="admin-desk__empty">{c.desk.empty}</p>}
        </div>
      </section>
      <section className="admin-panel admin-desk__assistant">
        <span className="admin-desk__mark"><Glyph name="ai-studio" /></span>
        <span>{c.desk.assistant}</span>
        <h2>{c.desk.assistantTitle}</h2>
        <p>{c.desk.assistantBody}</p>
        <dl className="admin-desk__facts">
          <div><dt>{c.desk.assistant}</dt><dd><span className="admin-status" data-on={inbox.ai?.configured || undefined} />{inbox.ai?.configured ? c.desk.assistantOn : c.desk.assistantOff}</dd></div>
          {inbox.ai?.configured && <div><dt>{c.desk.model}</dt><dd>{inbox.ai.models[0]?.split("/").pop()?.replace(/:free$/, "")}</dd></div>}
          {typeof inbox.ai?.freeRemaining === "number" && <div><dt>{c.desk.free}</dt><dd>{inbox.ai.freeRemaining}</dd></div>}
          {(["ai", "cache", "guide", "fallback"] as const).filter(source => stats[source]).map(source => <div key={source}><dt>{c.desk.sources[source]}</dt><dd>{stats[source]}</dd></div>)}
        </dl>
        <button type="button" className="admin-desk__entry" onClick={() => go("bot")}><span>{c.desk.open}</span><ArrowRight size={16} aria-hidden="true" /></button>
      </section>
    </div>
  </div>;
}

/** Copies text to the clipboard and says so for a moment. */
function CopyButton({ c, text }: { c: AdminCopy; text: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);
  const copy = () => { void navigator.clipboard?.writeText(text).then(() => setCopied(true)).catch(() => undefined); };
  return <button type="button" onClick={copy} aria-live="polite">{copied ? <CheckCircle size={16} aria-hidden="true" /> : null}{copied ? c.settings.copied : c.settings.copy}</button>;
}

function Settings({ c, locale, push, sound, onPush, onSound, onLocale, onLogout, ai }: {
  c: AdminCopy; locale: AdminLocale; push: PushState | null; sound: boolean;
  onPush: () => void; onSound: () => void; onLocale: (locale: AdminLocale) => void; onLogout: () => void; ai: Inbox["ai"];
}) {
  const pushNote = push === "on" ? c.settings.on : push === "off" || push === null ? c.settings.off : c.settings[push];
  return <div className="host-settings-page admin-settings">
    <header className="host-settings-page__masthead"><p>{c.property}</p><h1>{c.settings.title}</h1></header>

    <section className="host-settings-page__block">
      <div className="host-settings-page__block-head"><h2>{c.settings.notifications}</h2><p>{c.settings.notificationsBody}</p></div>
      <p className="admin-settings__state" data-on={push === "on" || undefined}>{pushNote}</p>
      <div className="host-settings__actions">
        <button type="button" onClick={onPush} disabled={push === "unsupported" || push === "ios" || push === "blocked"}>{push === "on" ? c.settings.disable : c.settings.enable}</button>
      </div>
    </section>

    <section className="host-settings-page__block">
      <div className="host-settings-page__block-head"><h2>{c.settings.sound}</h2><p>{c.settings.soundBody}</p></div>
      <div className="admin-settings__toggle" role="group" aria-label={c.settings.sound}>
        <button type="button" aria-pressed={sound} onClick={() => !sound && onSound()}>{c.settings.on_}</button>
        <button type="button" aria-pressed={!sound} onClick={() => sound && onSound()}>{c.settings.off_}</button>
      </div>
    </section>

    <section className="host-settings-page__block">
      <div className="host-settings-page__block-head"><h2>{c.settings.language}</h2></div>
      <div className="admin-settings__toggle" role="group" aria-label={c.settings.language}>
        <button type="button" aria-pressed={locale === "el"} onClick={() => onLocale("el")}>Ελληνικά</button>
        <button type="button" aria-pressed={locale === "en"} onClick={() => onLocale("en")}>English</button>
      </div>
    </section>

    <section className="host-settings-page__block">
      <div className="host-settings-page__block-head"><h2>{c.settings.assistant}</h2><p>{c.settings.assistantBody}</p></div>
      <dl className="host-settings-page__facts">
        <div><dt>{c.desk.assistant}</dt><dd>{ai?.configured ? c.desk.assistantOn : c.desk.assistantOff}</dd></div>
        {ai?.models.map((model, index) => <div key={model}><dt>{c.desk.model} {index + 1}</dt><dd className="host-settings-page__mono">{model}</dd></div>)}
        {typeof ai?.freeRemaining === "number" && <div><dt>{c.desk.free}</dt><dd className="host-settings-page__mono">{ai.freeRemaining}</dd></div>}
      </dl>
    </section>

    <section className="host-settings-page__block" data-testid="admin-reviews">
      <div className="host-settings-page__block-head"><h2>{c.settings.reviews}</h2><p>{c.settings.reviewsBody}</p></div>
      <dl className="host-settings-page__facts">
        <div><dt>{c.settings.reviewLink}</dt><dd className="host-settings-page__mono admin-settings__link">{property.location.googleReviewUrl}</dd></div>
      </dl>
      <div className="host-settings__actions">
        <CopyButton c={c} text={property.location.googleReviewUrl} />
        <a href={property.location.googleReviewUrl} target="_blank" rel="noopener noreferrer"><ArrowUpRight size={16} aria-hidden="true" />{c.settings.open}</a>
      </div>
      {c.settings.reviewMessages.map(message => {
        const text = message.text.replace("{link}", property.location.googleReviewUrl);
        return <div key={message.label} className="admin-settings__message">
          <p className="admin-settings__message-label">{message.label}</p>
          <p>{text}</p>
          <div className="host-settings__actions"><CopyButton c={c} text={text} /></div>
        </div>;
      })}
      <p className="admin-settings__note">{c.settings.reviewsRule}</p>
    </section>

    <section className="host-settings-page__block">
      <div className="host-settings-page__block-head"><h2>{c.settings.retention}</h2><p>{c.settings.retentionBody}</p></div>
    </section>

    <section className="host-settings-page__block">
      <div className="host-settings__actions"><button type="button" onClick={onLogout}><SignOut size={16} aria-hidden="true" />{c.settings.logout}</button></div>
    </section>
  </div>;
}
