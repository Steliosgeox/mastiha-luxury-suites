import type { ChatEntry, Conversation, NewEntry, StoredConversation } from "./types";
import { createMemoryStore } from "./memory";
import { createRedisStore } from "./redis";

export type NewConversation = Pick<StoredConversation, "id" | "tokenHash" | "locale" | "name" | "email">;
export type ConversationPatch = Partial<Pick<Conversation, "status" | "hostUnread" | "guestUnread" | "guestSeenAt">>;

/** Persistence for live conversations between guests and the host. */
export interface ChatStore {
  readonly kind: "redis" | "memory";
  createConversation(input: NewConversation, entries: NewEntry[]): Promise<Conversation>;
  getConversation(id: string): Promise<StoredConversation | null>;
  updateConversation(id: string, patch: ConversationPatch): Promise<void>;
  deleteConversation(id: string): Promise<void>;
  /** Appends an entry and updates unread counts and the inbox order. */
  appendEntry(id: string, entry: NewEntry): Promise<ChatEntry>;
  listEntries(id: string, afterSeq: number): Promise<ChatEntry[]>;
  listConversations(limit: number): Promise<Conversation[]>;
  /** Changes whenever any conversation changes, so the inbox can poll cheaply. */
  inboxVersion(): Promise<number>;
  markHostPresent(): Promise<void>;
  hostPresence(id: string): Promise<{ online: boolean; typing: boolean }>;
  markHostTyping(id: string): Promise<void>;
  savePushSubscription(endpoint: string, subscription: string): Promise<void>;
  listPushSubscriptions(): Promise<string[]>;
  removePushSubscription(endpoint: string): Promise<void>;
  /** Fixed-window rate limit shared by every server instance. Returns false when exceeded. */
  allow(key: string, limit: number, windowSeconds: number): Promise<boolean>;
}

let store: ChatStore | null | undefined;

/**
 * Upstash Redis (or Vercel KV, which uses the same REST API) in production. The in-memory
 * store only exists for local development and tests: it is lost on restart and not shared
 * between serverless instances, so it is never used on a production deployment.
 */
export function chatStore(): ChatStore | null {
  if (store !== undefined) return store;
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (url && token) store = createRedisStore(url, token);
  else if (process.env.MASTIHA_CHAT_STORE === "memory" && process.env.VERCEL_ENV !== "production") store = createMemoryStore();
  else store = null;
  return store;
}
