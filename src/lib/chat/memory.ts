import type { ChatStore, Kv } from "./store";
import { RETENTION_SECONDS, type ChatEntry, type Conversation, type StoredConversation } from "./types";

type Timed = { value: string; expires: number };
type State = {
  conversations: Map<string, StoredConversation>;
  logs: Map<string, ChatEntry[]>;
  expiring: Map<string, number>;
  push: Map<string, string>;
  kv: Map<string, Timed>;
  version: number;
};

// Survives Next.js hot reloads in development.
const global = globalThis as typeof globalThis & { __mastihaChat?: State; __mastihaKv?: Map<string, Timed> };

/** Key-value primitives in this process's memory: per instance, lost on restart. */
export function createMemoryKv(entries: Map<string, Timed> = (global.__mastihaKv ??= new Map())): Kv {
  const live = (name: string) => {
    const item = entries.get(name);
    if (item && item.expires <= Date.now()) { entries.delete(name); return undefined; }
    return item;
  };
  const expiry = (ttlSeconds: number | null) => (ttlSeconds ? Date.now() + ttlSeconds * 1000 : Number.MAX_SAFE_INTEGER);
  return {
    async bump(name, ttlSeconds, by = 1) {
      const item = live(name) ?? { value: "0", expires: expiry(ttlSeconds) };
      item.value = String(Number(item.value) + by);
      entries.set(name, item);
      return Number(item.value);
    },
    async read(names) { return names.map(name => live(name)?.value ?? null); },
    async put(name, value, ttlSeconds, onlyIfMissing = false) {
      if (onlyIfMissing && live(name)) return false;
      entries.set(name, { value, expires: expiry(ttlSeconds) });
      return true;
    },
    async tally(name, fields, ttlSeconds) {
      const table = JSON.parse(live(name)?.value ?? "{}") as Record<string, number>;
      for (const [field, by] of Object.entries(fields)) table[field] = (table[field] ?? 0) + by;
      entries.set(name, { value: JSON.stringify(table), expires: expiry(ttlSeconds) });
    },
    async tallies(name) { return JSON.parse(live(name)?.value ?? "{}") as Record<string, number>; },
  };
}

/** In-memory chat store for local development and tests only. See chatStore(). */
export function createMemoryStore(): ChatStore {
  const state = global.__mastihaChat ??= { conversations: new Map(), logs: new Map(), expiring: new Map(), push: new Map(), kv: new Map(), version: 0 };
  const publicConversation = ({ tokenHash: _tokenHash, ...conversation }: StoredConversation): Conversation => ({ ...conversation });
  const alive = (name: string) => (state.expiring.get(name) ?? 0) > Date.now();
  const expired = (conversation: StoredConversation) => conversation.updatedAt < Date.now() - RETENTION_SECONDS * 1000;

  const append: ChatStore["appendEntry"] = async (id, entry) => {
    const conversation = state.conversations.get(id);
    if (!conversation) throw new Error("Unknown conversation");
    const log = state.logs.get(id) ?? [];
    const stored: ChatEntry = { ...entry, seq: log.length, at: Date.now() };
    log.push(stored);
    state.logs.set(id, log);
    Object.assign(conversation, {
      updatedAt: stored.at,
      lastText: entry.text.slice(0, 200),
      lastAuthor: entry.author,
      messageCount: log.length,
      hostUnread: conversation.hostUnread + (entry.author === "guest" ? 1 : 0),
      guestUnread: conversation.guestUnread + (entry.author === "host" ? 1 : 0),
    });
    if (entry.author === "host") state.expiring.delete(`typing:${id}`);
    state.version++;
    return { ...stored };
  };

  return {
    kind: "memory",
    ...createMemoryKv(state.kv),

    async createConversation(input) {
      const now = Date.now();
      const conversation: StoredConversation = {
        ...input, status: "open", handler: "bot", escalatedAt: 0, name: "", email: "", createdAt: now, updatedAt: now,
        lastText: "", lastAuthor: "system", messageCount: 0, hostUnread: 0, guestUnread: 0, guestSeenAt: now,
      };
      state.conversations.set(input.id, conversation);
      state.version++;
      return publicConversation(conversation);
    },

    async getConversation(id) {
      const conversation = state.conversations.get(id);
      return conversation && !expired(conversation) ? { ...conversation } : null;
    },

    async updateConversation(id, patch) {
      const conversation = state.conversations.get(id);
      if (conversation) { Object.assign(conversation, patch); state.version++; }
    },

    async deleteConversation(id) {
      state.conversations.delete(id);
      state.logs.delete(id);
      state.version++;
    },

    appendEntry: append,

    async listEntries(id, afterSeq) {
      const log: ChatEntry[] = state.logs.get(id) ?? [];
      return log.slice(Math.max(0, afterSeq + 1)).map(entry => ({ ...entry }));
    },

    async listConversations(limit) {
      for (const [id, conversation] of state.conversations) if (expired(conversation)) { state.conversations.delete(id); state.logs.delete(id); }
      return [...state.conversations.values()].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, limit).map(publicConversation);
    },

    async countConversations() { return state.conversations.size; },
    async inboxVersion() { return state.version; },
    async markHostPresent() { state.expiring.set("host", Date.now() + 45_000); },
    async hostPresence(id) { return { online: alive("host"), typing: alive(`typing:${id}`) }; },
    async markHostTyping(id) { state.expiring.set(`typing:${id}`, Date.now() + 6_000); },
    async savePushSubscription(endpoint, subscription) { state.push.set(endpoint, subscription); },
    async listPushSubscriptions() { return [...state.push.values()]; },
    async removePushSubscription(endpoint) { state.push.delete(endpoint); },

    async allow(name, limit, windowSeconds) {
      const windowKey = `limit:${name}`;
      if (!alive(windowKey)) { state.expiring.set(windowKey, Date.now() + windowSeconds * 1000); state.expiring.set(`${windowKey}:count`, 0); }
      const count = (state.expiring.get(`${windowKey}:count`) ?? 0) + 1;
      state.expiring.set(`${windowKey}:count`, count);
      return count <= limit;
    },
  };
}
