"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AdminSync, AiStats, ChatEntry, Conversation } from "@/lib/chat/types";

export type AdminItem = ChatEntry & { id: string; state?: "sending" | "failed" };
type Thread = { items: AdminItem[]; lastSeq: number };
const toItem = (entry: ChatEntry): AdminItem => ({ ...entry, id: `e-${entry.seq}` });
let localId = 0;

/*
  Inbox state for the admin portal, kept in sync by polling /api/admin/sync: every 3 s
  while visible, every 20 s in the background. Most polls cost the server one read (the
  inbox version); presence and the assistant's numbers ride along every few polls.
*/
export function useAdminInbox({ onIncoming }: { onIncoming: (conversation: Conversation) => void }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [current, setCurrent] = useState<Conversation | null>(null);
  const [threads, setThreads] = useState<Record<string, Thread>>({});
  const [ai, setAi] = useState<AiStats | null>(null);
  const [offline, setOffline] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const version = useRef(-1);
  const polls = useRef(0);
  const seen = useRef<Map<string, number> | null>(null);
  const threadsRef = useRef(threads);
  threadsRef.current = threads;
  const incoming = useRef(onIncoming);
  incoming.current = onIncoming;

  const mergeEntries = useCallback((id: string, entries: ChatEntry[]) => {
    if (!entries.length) return;
    setThreads(all => {
      const thread = all[id] ?? { items: [], lastSeq: -1 };
      const known = new Set(thread.items.map(item => item.id));
      const fresh = entries.map(toItem).filter(item => !known.has(item.id));
      const items = thread.items.filter(item => !(item.state === "sending" && fresh.some(entry => entry.author === "host" && entry.text === item.text)));
      return { ...all, [id]: { items: [...items, ...fresh], lastSeq: Math.max(thread.lastSeq, ...entries.map(entry => entry.seq)) } };
    });
  }, []);

  const sync = useCallback(async () => {
    const count = polls.current++;
    const params = new URLSearchParams({ version: String(version.current) });
    if (count % 6 === 0) params.set("present", "1");
    if (count % 10 === 0) params.set("stats", "1");
    if (selected) {
      params.set("conversation", selected);
      params.set("after", String(threadsRef.current[selected]?.lastSeq ?? -1));
    }
    const response = await fetch(`/api/admin/sync?${params}`, { cache: "no-store" });
    if (response.status === 401) { window.location.reload(); return; }
    if (!response.ok) throw new Error("Sync failed");
    const data = await response.json() as AdminSync;
    version.current = data.version;
    if (data.conversations) {
      // Announce conversations whose latest message is new and from a guest who is waiting for Athina.
      const previous = seen.current;
      for (const conversation of data.conversations) {
        const before = previous?.get(conversation.id);
        if (previous && conversation.handler === "host" && conversation.lastAuthor === "guest" && (before === undefined || conversation.updatedAt > before)) incoming.current(conversation);
      }
      seen.current = new Map(data.conversations.map(conversation => [conversation.id, conversation.updatedAt]));
      setConversations(data.conversations);
      setTotal(data.total ?? data.conversations.length);
    }
    if (data.ai) setAi(data.ai);
    if (selected && data.conversation) {
      setCurrent(data.conversation);
      mergeEntries(selected, data.entries ?? []);
      setConversations(list => list.map(item => item.id === selected ? { ...item, ...data.conversation, hostUnread: 0 } : item));
    }
    setOffline(false);
    setLoaded(true);
  }, [selected, mergeEntries]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let stopped = false;
    const loop = async () => {
      try { await sync(); } catch { setOffline(true); }
      if (!stopped) timer = setTimeout(loop, document.visibilityState === "visible" ? 3000 : 20_000);
    };
    const onVisible = () => { if (document.visibilityState === "visible") { clearTimeout(timer); void loop(); } };
    void loop();
    document.addEventListener("visibilitychange", onVisible);
    return () => { stopped = true; clearTimeout(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, [sync]);

  const select = useCallback((id: string | null) => {
    setSelected(id);
    setCurrent(id ? conversations.find(item => item.id === id) ?? null : null);
  }, [conversations]);

  const send = useCallback(async (text: string, retryOf?: string) => {
    const id = selected;
    if (!id) return;
    const temp = retryOf ?? `local-${Date.now()}-${localId++}`;
    setThreads(all => {
      const thread = all[id] ?? { items: [], lastSeq: -1 };
      const items = retryOf
        ? thread.items.map(item => item.id === retryOf ? { ...item, state: "sending" as const } : item)
        : [...thread.items, { id: temp, seq: -1, author: "host" as const, text, at: Date.now(), state: "sending" as const }];
      return { ...all, [id]: { ...thread, items } };
    });
    try {
      const response = await fetch(`/api/admin/conversations/${id}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
      if (!response.ok) throw new Error("Not sent");
      const { entries } = await response.json() as { entries: ChatEntry[] };
      setThreads(all => ({ ...all, [id]: { ...all[id], items: all[id].items.filter(item => item.id !== temp) } }));
      mergeEntries(id, entries);
      setCurrent(conversation => conversation && conversation.id === id ? { ...conversation, handler: "host", status: "open" } : conversation);
    } catch {
      setThreads(all => ({ ...all, [id]: { ...all[id], items: all[id].items.map(item => item.id === temp ? { ...item, state: "failed" as const } : item) } }));
    }
  }, [selected, mergeEntries]);

  const lastTyping = useRef(0);
  const typing = useCallback(() => {
    if (!selected || Date.now() - lastTyping.current < 3000) return;
    lastTyping.current = Date.now();
    void fetch(`/api/admin/conversations/${selected}/typing`, { method: "POST" }).catch(() => undefined);
  }, [selected]);

  const update = useCallback(async (id: string, patch: { status?: "open" | "closed"; handler?: "bot" | "host" }) => {
    await fetch(`/api/admin/conversations/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) });
    await sync().catch(() => undefined);
  }, [sync]);

  const remove = useCallback(async (id: string) => {
    await fetch(`/api/admin/conversations/${id}`, { method: "DELETE" });
    setThreads(({ [id]: _removed, ...rest }) => rest);
    select(null);
    await sync().catch(() => undefined);
  }, [select, sync]);

  return {
    conversations, total, current, selected, select, loaded, offline, ai,
    items: selected ? threads[selected]?.items ?? [] : [],
    send, typing, update, remove,
  };
}
