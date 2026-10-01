import { concierge } from "@/lib/ai/concierge";
import type { AssistantRequest } from "@/lib/assistant/contracts";
import { createMemoryKv } from "@/lib/chat/memory";
import { isLocale } from "@/lib/chat/service";
import { chatStore } from "@/lib/chat/store";
import { failure, json, localLimit, readJson, RequestFailure, requireJson, sameOrigin } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * The assistant without storage, for a deployment whose chat database is not connected yet:
 * same models and fallbacks, nothing kept. With the database, the widget uses
 * /api/chat/conversations instead, so every conversation reaches the admin portal.
 */
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    requireJson(request);
    localLimit(request, "assistant", 20, 60_000);
    const body = await readJson(request) as Partial<AssistantRequest> | null;
    const messages = body?.messages;
    const valid = body && isLocale(body.locale) && Array.isArray(messages)
      && messages.length >= 1 && messages.length <= 16 && messages.at(-1)?.role === "user"
      && messages.every(message => message && ["user", "assistant"].includes(message.role) && typeof message.content === "string"
        && message.content.trim() && message.content.length <= (message.role === "user" ? 1500 : 6000));
    if (!valid) throw new RequestFailure(400, "Invalid conversation.");
    const answer = await concierge({ locale: body.locale!, messages: messages!, kv: chatStore() ?? createMemoryKv() });
    return json({ reply: answer.reply, offersHost: answer.offersHost, source: answer.source });
  } catch (error) { return failure(error); }
}
