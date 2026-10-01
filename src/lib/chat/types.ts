import type { StayLocale } from "@/content/stay-copy";

/** Who wrote an entry: the guest, Athina (host), the automated assistant, or the system. */
export type Author = "guest" | "host" | "bot" | "system";

/** System entries store an event code; each interface renders it in its own language. */
export type SystemEvent = "handoff" | "takeover" | "returned" | "closed" | "reopened";

export type ConversationStatus = "open" | "closed";
/** Who answers the guest: the automated assistant, or Athina once the chat is handed to her. */
export type Handler = "bot" | "host";
/** Where a bot reply came from: a model, the answer cache, or the built-in property guide. */
export type ReplySource = "ai" | "cache" | "guide";

export type ChatEntry = {
  /** Position in the conversation, starting at 0. Clients poll with the last seq they have. */
  seq: number;
  author: Author;
  text: string;
  at: number;
  source?: ReplySource;
  /** The model that wrote a bot reply, for the host's eyes only. */
  model?: string;
  /** A bot reply that suggests talking to Athina. */
  offersHost?: boolean;
};

export type NewEntry = Omit<ChatEntry, "seq" | "at">;

export type Conversation = {
  id: string;
  status: ConversationStatus;
  handler: Handler;
  /** When the guest asked for Athina (0 = never). */
  escalatedAt: number;
  locale: StayLocale;
  name: string;
  email: string;
  createdAt: number;
  updatedAt: number;
  lastText: string;
  lastAuthor: Author;
  messageCount: number;
  /** Guest entries the host has not read yet, and the reverse. */
  hostUnread: number;
  guestUnread: number;
  /** Last time the guest's widget checked in; used to show "online". */
  guestSeenAt: number;
};

export type StoredConversation = Conversation & { tokenHash: string };

export type GuestSync = {
  status: ConversationStatus;
  handler: Handler;
  entries: ChatEntry[];
  hostOnline: boolean;
  hostTyping: boolean;
};

export type AiStats = {
  /** Replies by source today (UTC): ai, cache, guide; fallback = guide after a model failed. */
  today: Record<string, number>;
  models: string[];
  configured: boolean;
  /** Free requests OpenRouter says the account has left today; null when unknown. */
  freeRemaining: number | null;
};

export type AdminSync = {
  version: number;
  conversations?: Conversation[];
  total?: number;
  conversation?: Conversation;
  entries?: ChatEntry[];
  ai?: AiStats;
};

export const LIMITS = {
  guestText: 1500,
  hostText: 4000,
  name: 80,
  email: 254,
  /** Earlier turns sent to the model with each question. */
  history: 12,
} as const;

/** Conversations are deleted automatically 30 days after their last message. */
export const RETENTION_DAYS = 30;
export const RETENTION_SECONDS = RETENTION_DAYS * 24 * 60 * 60;
