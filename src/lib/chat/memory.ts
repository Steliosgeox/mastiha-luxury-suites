import type { ChatStore } from "./store";
import type { ChatEntry, Conversation, StoredConversation } from "./types";

type State = {
  conversations: Map<string, StoredConversation>;
  logs: Map<string, ChatEntry[]>;
  expiring: Map<string, number>;
  push: Map<string, string>;
  version: number;
};

// Survives Next.js hot reloads in development.
const global = globalThis as typeof globalThis & { __mastihaChat?: State };

/** In-memory chat store for local development and tests only. See chatStore(). */
export function createMemoryStore(): ChatStore {
  const state = global.__mastihaChat ??= { conversations: new Map(), logs: new Map(), expiring: new Map(), push: new Map(), version: 0 };
  const publicConversation = ({ tokenHash: _tokenHash, ...conversation }: StoredConversation): Conversation => ({ ...conversation });
  const alive = (name: string) => (state.expiring.get(name) ?? 0) > Date.now();

  const append: ChatStore["appendEntry"] = async (id, entry) => {
    const conversation = state.conversations.get(id);
    if (!conversation) throw new Error("Unknown conversation");
    const log = state.logs.get(id) ?? [];
    const stored: ChatEntry = { seq: log.length, author: entry.author, text: entry.text, at: Date.now() };
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
    state.version++;
    return stored;
  };

  return {
    kind: "memory",

    async createConversation(input, entries) {
      const now = Date.now();
      state.conversations.set(input.id, {
        ...input, status: "open", createdAt: now, updatedAt: now, lastText: "", lastAuthor: "system",
        messageCount: 0, hostUnread: 0, guestUnread: 0, guestSeenAt: now,
      });
      for (const entry of entries) await append(input.id, entry);
      state.version++;
      return publicConversation(state.conversations.get(input.id)!);
    },

    async getConversation(id) {
      const conversation = state.conversations.get(id);
      return conversation ? { ...conversation } : null;
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
      return [...state.conversations.values()].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, limit).map(publicConversation);
    },

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
