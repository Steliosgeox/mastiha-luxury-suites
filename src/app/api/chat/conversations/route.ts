import { randomUUID } from "node:crypto";
import { after } from "next/server";
import { newGuestToken } from "@/lib/chat/auth";
import { cleanText, escalate, guestMessage, isLocale, limit, requireStore } from "@/lib/chat/service";
import { LIMITS } from "@/lib/chat/types";
import { failure, json, readJson, RequestFailure, requireJson, sameOrigin } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** The first answer may wait on the model chain (22 s at most, see lib/ai/router.ts). */
export const maxDuration = 30;

type Body = { locale?: unknown; text?: unknown; handoff?: unknown };

/**
 * A guest's first message (or a straight request for Athina) opens a conversation. It is
 * stored for 30 days after its last message, so Athina sees every chat, not only handoffs.
 */
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    requireJson(request);
    const store = requireStore();
    await limit(store, request, "start", 20, 60 * 60);
    const body = await readJson(request, 8192) as Body | null;
    if (!body || !isLocale(body.locale)) throw new RequestFailure(400, "Invalid request.");
    const handoff = body.handoff === true;
    const text = cleanText(body.text, LIMITS.guestText, { required: !handoff });
    if (text) await limit(store, request, "ask", 40, 10 * 60);

    const { token, hash } = newGuestToken();
    const created = await store.createConversation({ id: randomUUID(), tokenHash: hash, locale: body.locale });
    let conversation = { ...created, tokenHash: hash };
    const entries = [];
    if (text) {
      const result = await guestMessage(store, conversation, text, task => after(task));
      entries.push(...result.entries);
      conversation = result.conversation;
    }
    if (handoff) {
      entries.push(...await escalate(store, conversation, task => after(task)));
      conversation = { ...conversation, handler: "host" };
    }
    return json({ id: conversation.id, token, status: conversation.status, handler: conversation.handler, entries }, { status: 201 });
  } catch (error) { return failure(error); }
}
