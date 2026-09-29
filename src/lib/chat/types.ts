import type { StayLocale } from "@/content/stay-copy";

/** Who wrote an entry: the guest, Athina (host), the automated guide, or the system. */
export type Author = "guest" | "host" | "bot" | "system";

/** System entries store an event code; each interface renders it in its own language. */
export type SystemEvent = "handoff" | "closed" | "reopened";

export type ConversationStatus = "open" | "closed";

export type ChatEntry = {
  /** Position in the conversation, starting at 0. Clients poll with the last seq they have. */
  seq: number;
  author: Author;
  text: string;
  at: number;
};

export type NewEntry = Omit<ChatEntry, "seq" | "at">;

export type Conversation = {
  id: string;
  status: ConversationStatus;
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
  entries: ChatEntry[];
  hostOnline: boolean;
  hostTyping: boolean;
};

export type AdminSync = {
  version: number;
  conversations?: Conversation[];
  conversation?: Conversation;
  entries?: ChatEntry[];
};

export const LIMITS = {
  guestText: 2000,
  hostText: 4000,
  name: 80,
  email: 254,
  transcript: 20,
} as const;

/** Conversations are deleted automatically this long after their last message. */
export const RETENTION_SECONDS = 90 * 24 * 60 * 60;
