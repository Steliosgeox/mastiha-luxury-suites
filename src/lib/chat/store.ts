import type { ChatEntry, Conversation, NewEntry, StoredConversation } from "./types";
import { createMemoryStore } from "./memory";
import { createRedisStore } from "./redis";

export type NewConversation = Pick<StoredConversation, "id" | "tokenHash" | "locale">;
export type ConversationPatch = Partial<Pick<Conversation, "status" | "handler" | "escalatedAt" | "name" | "email" | "hostUnread" | "guestUnread" | "guestSeenAt">>;

/**
 * Small shared key-value primitives: rate limits, the model router's counters, the answer
 * cache and server-generated secrets. Names are namespaced by the implementation.
 */
export interface Kv {
  /** Adds `by` to a counter that expires `ttlSeconds` after it was created; returns the new value. */
  bump(name: string, ttlSeconds: number, by?: number): Promise<number>;
  read(names: readonly string[]): Promise<(string | null)[]>;
  /** Stores a value; with `onlyIfMissing`, returns false when one was already there. */
  put(name: string, value: string, ttlSeconds: number | null, onlyIfMissing?: boolean): Promise<boolean>;
  /** Adds to fields of a counter table that expires `ttlSeconds` after its last change. */
  tally(name: string, fields: Record<string, number>, ttlSeconds: number): Promise<void>;
  tallies(name: string): Promise<Record<string, number>>;
}

/** Persistence for every guest conversation, with the assistant or with the host. */
export interface ChatStore extends Kv {
  readonly kind: "redis" | "memory";
  createConversation(input: NewConversation): Promise<Conversation>;
  getConversation(id: string): Promise<StoredConversation | null>;
  updateConversation(id: string, patch: ConversationPatch): Promise<void>;
  deleteConversation(id: string): Promise<void>;
  /** Appends an entry and updates unread counts, the inbox order and the retention clock. */
  appendEntry(id: string, entry: NewEntry): Promise<ChatEntry>;
  listEntries(id: string, afterSeq: number): Promise<ChatEntry[]>;
  /** Most recent first; conversations past retention are dropped from the index. */
  listConversations(limit: number): Promise<Conversation[]>;
  countConversations(): Promise<number>;
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

/** Redis connection details: Upstash's names, or the ones Vercel's Upstash integration sets. */
export function redisConfig(env: NodeJS.ProcessEnv = process.env): { url: string; token: string } | null {
  const url = (env.UPSTASH_REDIS_REST_URL ?? env.KV_REST_API_URL)?.trim();
  const token = (env.UPSTASH_REDIS_REST_TOKEN ?? env.KV_REST_API_TOKEN)?.trim();
  return url && token ? { url, token } : null;
}

/**
 * Upstash Redis (or Vercel KV, which uses the same REST API) in production. The in-memory
 * store only exists for local development and tests: it is lost on restart and not shared
 * between serverless instances, so it is never used on a production deployment.
 */
export function chatStore(): ChatStore | null {
  if (store !== undefined) return store;
  const redis = redisConfig();
  if (redis) store = createRedisStore(redis.url, redis.token);
  else if (process.env.MASTIHA_CHAT_STORE === "memory" && process.env.VERCEL_ENV !== "production") store = createMemoryStore();
  else store = null;
  return store;
}
