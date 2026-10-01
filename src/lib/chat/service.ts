import type { StayLocale } from "@/content/stay-copy";
import { concierge } from "@/lib/ai/concierge";
import { asksForHost } from "@/lib/assistant/guide";
import type { ChatMessage } from "@/lib/assistant/contracts";
import { RequestFailure, clientKey } from "@/lib/http";
import { notifyHost } from "./push";
import { chatStore, type ChatStore } from "./store";
import { LIMITS, type ChatEntry, type Conversation, type StoredConversation } from "./types";

export function requireStore(): ChatStore {
  const store = chatStore();
  if (!store) throw new RequestFailure(503, "Live chat is not connected.");
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
  const email = cleanText(value, LIMITS.email, { required: false });
  if (email && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/.test(email)) throw new RequestFailure(400, "Invalid email address.");
  return email;
}

export const isLocale = (value: unknown): value is StayLocale => value === "el" || value === "en" || value === "tr";

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

/** The conversation so far, as the model reads it. Athina's replies count as the assistant's side. */
function history(entries: ChatEntry[]): ChatMessage[] {
  return entries
    .filter(entry => entry.author === "guest" || entry.author === "bot" || entry.author === "host")
    .slice(-LIMITS.history)
    .map(entry => ({ role: entry.author === "guest" ? "user" : "assistant", content: entry.text }));
}

/** Hand the conversation to Athina: the assistant stops answering and her devices ring. */
export async function escalate(store: ChatStore, conversation: StoredConversation, background: (task: () => Promise<void>) => void): Promise<ChatEntry[]> {
  if (conversation.handler === "host" && conversation.status === "open") return [];
  await store.updateConversation(conversation.id, { handler: "host", status: "open", escalatedAt: Date.now() });
  const entry = await store.appendEntry(conversation.id, { author: "system", text: "handoff" });
  const entries = await store.listEntries(conversation.id, -1);
  const lastQuestion = entries.findLast(item => item.author === "guest")?.text ?? "Ζήτησε να σας μιλήσει";
  background(() => alertHost(store, conversation, lastQuestion, true));
  return [entry];
}

/**
 * A guest message: stored, then answered by the assistant while it handles the conversation,
 * or passed to Athina once she does. Returns every entry written, in order.
 */
export async function guestMessage(store: ChatStore, conversation: StoredConversation, text: string, background: (task: () => Promise<void>) => void): Promise<{ entries: ChatEntry[]; conversation: StoredConversation }> {
  const written: ChatEntry[] = [];
  let current = conversation;
  if (current.status === "closed") {
    await store.updateConversation(current.id, { status: "open" });
    written.push(await store.appendEntry(current.id, { author: "system", text: "reopened" }));
    current = { ...current, status: "open" };
  }
  written.push(await store.appendEntry(current.id, { author: "guest", text }));

  if (current.handler === "host") {
    background(() => alertHost(store, current, text));
    return { entries: written, conversation: current };
  }
  if (asksForHost(text)) {
    written.push(...await escalate(store, current, background));
    return { entries: written, conversation: { ...current, handler: "host", escalatedAt: Date.now() } };
  }

  const answer = await concierge({ locale: current.locale, messages: history(await store.listEntries(current.id, -1)), kv: store });
  written.push(await store.appendEntry(current.id, { author: "bot", text: answer.reply, source: answer.source, model: answer.model, offersHost: answer.offersHost || undefined }));
  return { entries: written, conversation: current };
}
