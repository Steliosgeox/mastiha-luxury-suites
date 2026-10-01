"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { StayLocale } from "@/content/stay-copy";
import type { ChatEntry, ConversationStatus, Handler } from "@/lib/chat/types";

/*
  The guest's side of a conversation. With the chat database connected, every message is
  stored on the server (for Athina's inbox, 30 days) and the assistant answers there; the
  conversation id and its secret token stay in this browser so a reload continues it.
  Without the database the assistant still answers, statelessly, and nothing is kept.
*/

export const SESSION_KEY = "mastiha.chat.v2";
type Session = { id: string; token: string };

export type ChatItem = {
  id: string;
  kind: ChatEntry["author"];
  text: string;
  at: number;
  offersHost?: boolean;
  state?: "sending" | "failed";
};

export function readSession(): Session | null {
  try {
    const value = JSON.parse(localStorage.getItem(SESSION_KEY) ?? "null") as Session | null;
    return value && typeof value.id === "string" && typeof value.token === "string" ? value : null;
  } catch { return null; }
}
function writeSession(session: Session | null) {
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  } catch { /* storage unavailable: the conversation lasts for this page view */ }
}

const toItem = (entry: ChatEntry): ChatItem => ({ id: `e-${entry.seq}`, kind: entry.author, text: entry.text, at: entry.at, offersHost: entry.offersHost });
let localId = 0;
const nextId = () => `local-${Date.now()}-${localId++}`;

type Poll = { status: ConversationStatus; handler: Handler; entries: ChatEntry[]; hostOnline: boolean; hostTyping: boolean; unread: number };
type Written = { id?: string; token?: string; entries: ChatEntry[]; status: ConversationStatus; handler: Handler };

export function useConcierge({ locale, open, stored }: { locale: StayLocale; open: boolean; stored: boolean }) {
  const [items, setItems] = useState<ChatItem[]>([]);
  const [handler, setHandler] = useState<Handler>("bot");
  const [status, setStatus] = useState<ConversationStatus>("open");
  const [thinking, setThinking] = useState(false);
  const [failed, setFailed] = useState(false);
  const [hostOnline, setHostOnline] = useState(false);
  const [hostTyping, setHostTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const [handingOff, setHandingOff] = useState(false);
  const session = useRef<Session | null>(null);
  const lastSeq = useRef(-1);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  /** Adds server entries, replacing the optimistic copy of the guest's own message. */
  const merge = useCallback((entries: ChatEntry[], replacing?: string) => {
    if (!entries.length && !replacing) return;
    if (entries.length) lastSeq.current = Math.max(lastSeq.current, ...entries.map(entry => entry.seq));
    setItems(current => {
      const known = new Set(current.map(item => item.id));
      const incoming = entries.map(toItem).filter(item => !known.has(item.id));
      const kept = current.filter(item => item.id !== replacing && !(item.state === "sending" && incoming.some(entry => entry.kind === "guest" && entry.text === item.text)));
      return [...kept, ...incoming];
    });
  }, []);

  const reset = useCallback(() => {
    writeSession(null);
    session.current = null;
    lastSeq.current = -1;
    setItems([]);
    setHandler("bot");
    setStatus("open");
    setUnread(0);
    setFailed(false);
  }, []);

  const apply = useCallback((data: Pick<Written, "status" | "handler">) => {
    setStatus(data.status);
    setHandler(data.handler);
  }, []);

  const poll = useCallback(async (markRead: boolean) => {
    const current = session.current;
    if (!current) return;
    const response = await fetch(`/api/chat/conversations/${current.id}?after=${lastSeq.current}${markRead ? "&read=1" : ""}`, {
      headers: { Authorization: `Bearer ${current.token}` },
      cache: "no-store",
    });
    if (response.status === 404) { reset(); return; }
    if (!response.ok) return;
    const data = await response.json() as Poll;
    merge(data.entries);
    apply(data);
    setHostOnline(data.hostOnline);
    setHostTyping(data.hostTyping);
    setUnread(markRead ? 0 : data.unread);
  }, [merge, apply, reset]);

  // Continue the conversation from an earlier visit.
  useEffect(() => {
    if (!stored) return;
    const saved = readSession();
    if (!saved) return;
    session.current = saved;
    void poll(false);
  }, [stored, poll]);

  // Athina's replies arrive by polling, only while she has the conversation: every 3 s with
  // the chat open, every 25 s in the background, never in a hidden tab.
  useEffect(() => {
    if (!stored || handler !== "host" || !session.current) return;
    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;
    const loop = async () => {
      if (document.visibilityState === "visible") await poll(open).catch(() => undefined);
      if (!stopped) timer = setTimeout(loop, open ? 3000 : 25_000);
    };
    const onVisible = () => { if (document.visibilityState === "visible") { clearTimeout(timer); void loop(); } };
    timer = setTimeout(loop, open ? 1500 : 25_000);
    document.addEventListener("visibilitychange", onVisible);
    return () => { stopped = true; clearTimeout(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, [stored, handler, open, poll]);

  /** Opens a conversation on the server (first message, or straight to Athina). */
  const start = useCallback(async (body: { text?: string; handoff?: boolean }): Promise<Written> => {
    const response = await fetch("/api/chat/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale, ...body }),
      signal: AbortSignal.timeout(35_000),
    });
    if (!response.ok) throw new Error(String(response.status));
    const data = await response.json() as Written;
    session.current = { id: data.id!, token: data.token! };
    writeSession(session.current);
    lastSeq.current = -1;
    return data;
  }, [locale]);

  const post = useCallback(async (path: string, body?: unknown): Promise<Written | null> => {
    const current = session.current!;
    const response = await fetch(`/api/chat/conversations/${current.id}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${current.token}` },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(35_000),
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(String(response.status));
    return await response.json() as Written;
  }, []);

  /** Without the database: the assistant answers from the page's own history, nothing is stored. */
  const askStateless = useCallback(async (text: string) => {
    const history = [...itemsRef.current.filter(item => (item.kind === "guest" || item.kind === "bot") && item.state !== "failed"), { kind: "guest", text }]
      .slice(-12)
      .map(item => ({ role: item.kind === "guest" ? "user" : "assistant", content: item.text }));
    const response = await fetch("/api/assistant/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale, messages: history }),
      signal: AbortSignal.timeout(35_000),
    });
    const data = await response.json() as { reply?: string; offersHost?: boolean };
    if (!response.ok || !data.reply) throw new Error("No reply");
    return data;
  }, [locale]);

  const send = useCallback(async (raw: string, retryOf?: string) => {
    const text = raw.trim();
    if (!text) return;
    const id = retryOf ?? nextId();
    setItems(list => retryOf
      ? list.map(item => item.id === retryOf ? { ...item, state: "sending" } : item)
      : [...list, { id, kind: "guest", text, at: Date.now(), state: "sending" }]);
    setFailed(false);
    const answeredByBot = handler === "bot";
    if (answeredByBot) setThinking(true);
    try {
      if (!stored) {
        const data = await askStateless(text);
        setItems(list => [...list.map(item => item.id === id ? { ...item, state: undefined } : item), { id: nextId(), kind: "bot", text: data.reply!, at: Date.now(), offersHost: data.offersHost }]);
        return;
      }
      let data = session.current ? await post("/messages", { text }) : null;
      // No conversation yet, or it expired after 30 days: start a new one with this message.
      if (!data) { if (session.current) reset(); data = await start({ text }); }
      merge(data.entries, id);
      apply(data);
    } catch {
      setItems(list => list.map(item => item.id === id ? { ...item, state: "failed" } : item));
      setFailed(true);
    } finally {
      setThinking(false);
    }
  }, [stored, handler, askStateless, post, start, merge, apply, reset]);

  /** "Talk to Athina": the conversation goes to her inbox and her phone. */
  const handoff = useCallback(async (): Promise<boolean> => {
    if (!stored) return false;
    if (handler === "host" && status === "open") return true;
    setHandingOff(true);
    try {
      let data = session.current ? await post("/handoff") : null;
      if (!data) { if (session.current) reset(); data = await start({ handoff: true }); }
      merge(data.entries);
      apply(data);
      return true;
    } catch { setFailed(true); return false; }
    finally { setHandingOff(false); }
  }, [stored, handler, status, post, start, merge, apply, reset]);

  const saveDetails = useCallback(async (details: { name: string; email: string }) => {
    const current = session.current;
    if (!current) return false;
    const response = await fetch(`/api/chat/conversations/${current.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${current.token}` },
      body: JSON.stringify(details),
    }).catch(() => null);
    return Boolean(response?.ok);
  }, []);

  return { items, handler, status, thinking, failed, hostOnline, hostTyping, unread, handingOff, send, handoff, saveDetails, reset };
}
