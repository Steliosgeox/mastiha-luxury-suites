import { RequestFailure, clientKey } from "@/lib/http";
import { adminConfigured } from "./auth";
import { notifyHost } from "./push";
import { chatStore, type ChatStore } from "./store";
import type { Conversation } from "./types";

/** Live chat needs somewhere to keep conversations and a host who can sign in to answer. */
export function liveChatEnabled(): boolean {
  return chatStore() !== null && adminConfigured();
}

export function requireStore(): ChatStore {
  const store = chatStore();
  if (!store || !adminConfigured()) throw new RequestFailure(503, "Live chat is not connected.");
  return store;
}

const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export function conversationId(value: string): string {
  if (!ID.test(value)) throw new RequestFailure(404, "Conversation not found.");
  return value;
}

/** Trimmed text within limits, with control characters removed (newlines kept). */
export function cleanText(value: unknown, max: number, { required = true } = {}): string {
  if (value === undefined || value === null || value === "") {
    if (required) throw new RequestFailure(400, "Message is empty.");
    return "";
  }
  if (typeof value !== "string") throw new RequestFailure(400, "Invalid text.");
  const text = value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").replace(/\n{4,}/g, "\n\n\n").trim();
  if (required && !text) throw new RequestFailure(400, "Message is empty.");
  if (text.length > max) throw new RequestFailure(413, "Message is too long.");
  return text;
}

export function cleanEmail(value: unknown): string {
  const email = cleanText(value, 254, { required: false });
  if (email && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(email)) throw new RequestFailure(400, "Invalid email address.");
  return email;
}

export async function limit(store: ChatStore, request: Request, bucket: string, max: number, windowSeconds: number) {
  if (!(await store.allow(`${bucket}:${clientKey(request)}`, max, windowSeconds))) throw new RequestFailure(429, "Please try again later.");
}

export function guestName(conversation: Pick<Conversation, "name" | "id">): string {
  return conversation.name || `Επισκέπτης ${conversation.id.slice(0, 4).toUpperCase()}`;
}

/** Push to Athina's devices. Notifications are in Greek: the host reads them. */
export async function alertHost(store: ChatStore, conversation: Pick<Conversation, "name" | "id">, text: string, isNew = false) {
  const name = guestName(conversation);
  await notifyHost(store, {
    conversationId: conversation.id,
    title: isNew ? `${name} θέλει να σας μιλήσει` : `Μήνυμα από ${name}`,
    body: text.length > 140 ? `${text.slice(0, 139)}…` : text,
  }).catch(error => console.error("Push notification failed", error));
}
