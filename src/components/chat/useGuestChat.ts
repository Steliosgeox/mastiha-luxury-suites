"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { StayLocale } from "@/content/stay-copy";
import type { ChatEntry, ConversationStatus } from "@/lib/chat/types";
import type { ThreadItem } from "./ChatThread";

/*
  State of the guest's conversation. It starts with the automated guide; when the guest
  asks for Athina it becomes a live conversation stored on the server. The conversation id
  and its secret token stay in this browser (localStorage) so a reload continues it.
*/

export const SESSION_KEY = "mastiha.chat.v1";
type Session = { id: string; token: string };
export type ChatMode = "guide" | "form" | "live";

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

const toItem = (entry: ChatEntry): ThreadItem => ({ id: `e-${entry.seq}`, kind: entry.author, text: entry.text, at: entry.at });
let localId = 0;
const nextId = () => `local-${Date.now()}-${localId++}`;

type Poll = { status: ConversationStatus; entries: ChatEntry[]; hostOnline: boolean; hostTyping: boolean; unread: number };

export function useGuestChat({ locale, open, liveEnabled }: { locale: StayLocale; open: boolean; liveEnabled: boolean }) {
  const [mode, setMode] = useState<ChatMode>("guide");
  const [items, setItems] = useState<ThreadItem[]>([]);
  const [thinking, setThinking] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ConversationStatus>("open");
  const [hostOnline, setHostOnline] = useState(false);
  const [hostTyping, setHostTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const session = useRef<Session | null>(null);
  const lastSeq = useRef(-1);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const merge = useCallback((entries: ChatEntry[]) => {
    if (!entries.length) return;
    lastSeq.current = Math.max(lastSeq.current, ...entries.map(entry => entry.seq));
    setItems(current => {
      const known = new Set(current.map(item => item.id));
      const incoming = entries.map(toItem).filter(item => !known.has(item.id));
      // Our own message can come back from a poll before its POST resolved: drop the local copy.
      const settled = current.filter(item => !(item.state === "sending" && incoming.some(entry => entry.kind === "guest" && entry.text === item.text)));
      return incoming.length || settled.length !== current.length ? [...settled, ...incoming] : current;
    });
  }, []);

  const reset = useCallback(() => {
    writeSession(null);
    session.current = null;
    lastSeq.current = -1;
    setItems([]);
    setMode("guide");
    setStatus("open");
    setUnread(0);
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
    setStatus(data.status);
    setHostOnline(data.hostOnline);
    setHostTyping(data.hostTyping);
    setUnread(markRead ? 0 : data.unread);
  }, [merge, reset]);

  // Resume a live conversation from an earlier visit.
  useEffect(() => {
    const saved = readSession();
    if (!saved || !liveEnabled) return;
    session.current = saved;
    setMode("live");
    void poll(false);
  }, [liveEnabled, poll]);

  // Poll while live: every 3 s with the panel open, every 20 s in the background, never when the tab is hidden.
  useEffect(() => {
    if (mode !== "live") return;
    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;
    const loop = async () => {
      if (document.visibilityState === "visible") await poll(open).catch(() => undefined);
      if (!stopped) timer = setTimeout(loop, open ? 3000 : 20_000);
    };
    const onVisible = () => { if (document.visibilityState === "visible") { clearTimeout(timer); void loop(); } };
    void loop();
    document.addEventListener("visibilitychange", onVisible);
    return () => { stopped = true; clearTimeout(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, [mode, open, poll]);

  const askGuide = useCallback(async (text: string, errorText: string) => {
    const question: ThreadItem = { id: nextId(), kind: "guest", text, at: Date.now() };
    const history = [...itemsRef.current, question]
      .filter(item => item.kind === "guest" || item.kind === "bot")
      .slice(-15)
      .map(item => ({ role: item.kind === "guest" ? "user" : "assistant", content: item.text }));
    setItems(current => [...current, question]);
    setThinking(true);
    setError(null);
    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, messages: history }),
        signal: AbortSignal.timeout(15_000),
      });
      const data = await response.json() as { reply?: string; suggestHost?: boolean };
      if (!response.ok || !data.reply) throw new Error("No reply");
      setItems(current => [...current, { id: nextId(), kind: "bot", text: data.reply!, at: Date.now(), offersHost: Boolean(data.suggestHost) }]);
    } catch { setError(errorText); }
    finally { setThinking(false); }
  }, [locale]);

  const sendLive = useCallback(async (text: string, retryOf?: string) => {
    const current = session.current;
    if (!current) return;
    const id = retryOf ?? nextId();
    setItems(list => retryOf
      ? list.map(item => item.id === retryOf ? { ...item, state: "sending" } : item)
      : [...list, { id, kind: "guest", text, at: Date.now(), state: "sending" }]);
    try {
      const response = await fetch(`/api/chat/conversations/${current.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${current.token}` },
        body: JSON.stringify({ text }),
      });
      if (response.status === 404) { reset(); return; }
      if (!response.ok) throw new Error("Not sent");
      const { entry } = await response.json() as { entry: ChatEntry };
      setStatus("open");
      setItems(list => list.some(item => item.id === `e-${entry.seq}`)
        ? list.filter(item => item.id !== id)
        : list.map(item => item.id === id ? toItem(entry) : item));
    } catch {
      setItems(list => list.map(item => item.id === id ? { ...item, state: "failed" } : item));
    }
  }, [reset]);

  const send = useCallback((text: string, errorText: string) => mode === "live" ? sendLive(text) : askGuide(text, errorText), [mode, sendLive, askGuide]);
  const retry = useCallback((item: ThreadItem) => sendLive(item.text, item.id), [sendLive]);

  /** Hand the conversation to Athina, with the questions asked so far. */
  const startLive = useCallback(async (details: { name: string; email: string }): Promise<"ok" | "unavailable" | "error"> => {
    setStarting(true);
    try {
      const transcript = itemsRef.current
        .filter(item => item.kind === "guest" || item.kind === "bot")
        .map(item => ({ role: item.kind === "guest" ? "user" : "assistant", content: item.text }));
      const response = await fetch("/api/chat/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, ...details, transcript }),
      });
      if (response.status === 503) return "unavailable";
      if (!response.ok) return "error";
      const data = await response.json() as { id: string; token: string; entries: ChatEntry[] };
      session.current = { id: data.id, token: data.token };
      writeSession(session.current);
      lastSeq.current = -1;
      setItems([]);
      merge(data.entries);
      setStatus("open");
      setMode("live");
      return "ok";
    } catch { return "error"; }
    finally { setStarting(false); }
  }, [locale, merge]);

  return { mode, setMode, items, thinking, starting, error, status, hostOnline, hostTyping, unread, send, retry, startLive, reset };
}
