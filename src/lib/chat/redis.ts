import type { ChatStore, ConversationPatch, NewConversation } from "./store";
import { RETENTION_SECONDS, type ChatEntry, type Conversation, type NewEntry, type StoredConversation } from "./types";

/*
  Chat storage on Upstash Redis through its REST API (no client library needed). Vercel KV
  exposes the same API. Layout, all under the "mls:" prefix:

    mls:conv:{id}     hash    conversation fields
    mls:log:{id}      list    JSON entries; an entry's seq is its index
    mls:inbox         zset    conversation ids scored by last activity
    mls:inbox:v       counter bumped on every change (cheap inbox polling)
    mls:host:seen     string  set while the admin portal is open (expires)
    mls:typing:{id}   string  set while the host types (expires)
    mls:push          hash    endpoint -> push subscription JSON
    mls:rl:{key}      counter rate-limit windows
*/

type Command = (string | number)[];
const key = {
  conv: (id: string) => `mls:conv:${id}`,
  log: (id: string) => `mls:log:${id}`,
  typing: (id: string) => `mls:typing:${id}`,
  inbox: "mls:inbox",
  version: "mls:inbox:v",
  hostSeen: "mls:host:seen",
  push: "mls:push",
  limit: (name: string) => `mls:rl:${name}`,
};

function client(url: string, token: string) {
  const send = async (path: "pipeline" | "multi-exec", commands: Command[]) => {
    const response = await fetch(`${url.replace(/\/$/, "")}/${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(commands),
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) throw new Error(`Chat store responded ${response.status}`);
    const results = await response.json() as { result?: unknown; error?: string }[];
    return results.map(item => {
      if (item.error) throw new Error(`Chat store: ${item.error}`);
      return item.result;
    });
  };
  return {
    /** Several commands in one round trip. */
    pipeline: (commands: Command[]) => send("pipeline", commands),
    /** Several commands applied atomically. */
    transaction: (commands: Command[]) => send("multi-exec", commands),
  };
}

function toRecord(flat: unknown): Record<string, string> {
  const record: Record<string, string> = {};
  if (Array.isArray(flat)) for (let i = 0; i + 1 < flat.length; i += 2) record[String(flat[i])] = String(flat[i + 1]);
  return record;
}

function toConversation(record: Record<string, string>): StoredConversation | null {
  if (!record.id) return null;
  const number = (name: string) => Number(record[name] ?? 0) || 0;
  return {
    id: record.id,
    tokenHash: record.tokenHash ?? "",
    status: record.status === "closed" ? "closed" : "open",
    locale: record.locale === "el" || record.locale === "tr" ? record.locale : "en",
    name: record.name ?? "",
    email: record.email ?? "",
    createdAt: number("createdAt"),
    updatedAt: number("updatedAt"),
    lastText: record.lastText ?? "",
    lastAuthor: (record.lastAuthor as Conversation["lastAuthor"]) || "system",
    messageCount: number("messageCount"),
    hostUnread: number("hostUnread"),
    guestUnread: number("guestUnread"),
    guestSeenAt: number("guestSeenAt"),
  };
}

const publicConversation = ({ tokenHash: _tokenHash, ...conversation }: StoredConversation): Conversation => conversation;

function toEntries(raw: unknown, firstSeq: number): ChatEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, index) => {
    const parsed = JSON.parse(String(item)) as Omit<ChatEntry, "seq">;
    return { seq: firstSeq + index, author: parsed.author, text: parsed.text, at: parsed.at };
  });
}

export function createRedisStore(url: string, token: string): ChatStore {
  const redis = client(url, token);

  // Guest entries count as unread for the host, host entries for the guest.
  const counters = (id: string, entry: NewEntry): Command[] =>
    entry.author === "guest" ? [["HINCRBY", key.conv(id), "hostUnread", 1]]
      : entry.author === "host" ? [["HINCRBY", key.conv(id), "guestUnread", 1]]
        : [];

  const touch = (id: string, entry: NewEntry, now: number): Command[] => [
    ["HSET", key.conv(id), "updatedAt", now, "lastText", entry.text.slice(0, 200), "lastAuthor", entry.author],
    ["HINCRBY", key.conv(id), "messageCount", 1],
    ...counters(id, entry),
    ["ZADD", key.inbox, now, id],
    ["INCR", key.version],
    ["EXPIRE", key.conv(id), RETENTION_SECONDS],
    ["EXPIRE", key.log(id), RETENTION_SECONDS],
  ];

  return {
    kind: "redis",

    async createConversation(input: NewConversation, entries: NewEntry[]) {
      const now = Date.now();
      const conversation: StoredConversation = {
        ...input, status: "open", createdAt: now, updatedAt: now, lastText: "", lastAuthor: "system",
        messageCount: 0, hostUnread: 0, guestUnread: 0, guestSeenAt: now,
      };
      const commands: Command[] = [["HSET", key.conv(input.id), ...Object.entries(conversation).flat()]];
      for (const entry of entries) {
        commands.push(["RPUSH", key.log(input.id), JSON.stringify({ ...entry, at: now })], ...touch(input.id, entry, now));
      }
      await redis.transaction(commands);
      return publicConversation((await this.getConversation(input.id))!);
    },

    async getConversation(id) {
      const [raw] = await redis.pipeline([["HGETALL", key.conv(id)]]);
      return toConversation(toRecord(raw));
    },

    async updateConversation(id, patch: ConversationPatch) {
      const fields = Object.entries(patch).flat();
      if (fields.length) await redis.pipeline([["HSET", key.conv(id), ...fields], ["INCR", key.version]]);
    },

    async deleteConversation(id) {
      await redis.transaction([["DEL", key.conv(id), key.log(id), key.typing(id)], ["ZREM", key.inbox, id], ["INCR", key.version]]);
    },

    async appendEntry(id, entry) {
      const now = Date.now();
      const [length] = await redis.transaction([["RPUSH", key.log(id), JSON.stringify({ ...entry, at: now })], ...touch(id, entry, now)]);
      return { seq: Number(length) - 1, author: entry.author, text: entry.text, at: now };
    },

    async listEntries(id, afterSeq) {
      const start = Math.max(0, afterSeq + 1);
      const [raw] = await redis.pipeline([["LRANGE", key.log(id), start, -1]]);
      return toEntries(raw, start);
    },

    async listConversations(limit) {
      const cutoff = Date.now() - RETENTION_SECONDS * 1000;
      const [, ids] = await redis.pipeline([["ZREMRANGEBYSCORE", key.inbox, "-inf", cutoff], ["ZREVRANGE", key.inbox, 0, limit - 1]]);
      if (!Array.isArray(ids) || !ids.length) return [];
      const records = await redis.pipeline(ids.map(id => ["HGETALL", key.conv(String(id))]));
      return records.map(raw => toConversation(toRecord(raw))).filter((item): item is StoredConversation => item !== null).map(publicConversation);
    },

    async inboxVersion() {
      const [value] = await redis.pipeline([["GET", key.version]]);
      return Number(value ?? 0) || 0;
    },

    async markHostPresent() {
      await redis.pipeline([["SET", key.hostSeen, Date.now(), "EX", 45]]);
    },

    async hostPresence(id) {
      const [values] = await redis.pipeline([["MGET", key.hostSeen, key.typing(id)]]);
      const [seen, typing] = Array.isArray(values) ? values : [];
      return { online: seen !== null && seen !== undefined, typing: typing !== null && typing !== undefined };
    },

    async markHostTyping(id) {
      await redis.pipeline([["SET", key.typing(id), 1, "EX", 6]]);
    },

    async savePushSubscription(endpoint, subscription) {
      await redis.pipeline([["HSET", key.push, endpoint, subscription]]);
    },

    async listPushSubscriptions() {
      const [values] = await redis.pipeline([["HVALS", key.push]]);
      return Array.isArray(values) ? values.map(String) : [];
    },

    async removePushSubscription(endpoint) {
      await redis.pipeline([["HDEL", key.push, endpoint]]);
    },

    async allow(name, limit, windowSeconds) {
      const [, count] = await redis.pipeline([["SET", key.limit(name), 0, "EX", windowSeconds, "NX"], ["INCR", key.limit(name)]]);
      return Number(count) <= limit;
    },
  };
}
