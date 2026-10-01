import { after } from "next/server";
import { guestTokenMatches } from "@/lib/chat/auth";
import { cleanText, conversationId, guestMessage, limit, requireStore } from "@/lib/chat/service";
import { LIMITS } from "@/lib/chat/types";
import { failure, json, readJson, RequestFailure, requireJson, sameOrigin } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** The answer may wait on the model chain (22 s at most, see lib/ai/router.ts). */
export const maxDuration = 30;

type Params = { params: Promise<{ id: string }> };

/** A guest message: answered by the assistant, or passed to Athina once she has the conversation. */
export async function POST(request: Request, { params }: Params) {
  try {
    sameOrigin(request);
    requireJson(request);
    const store = requireStore();
    const id = conversationId((await params).id);
    const conversation = await store.getConversation(id);
    if (!conversation || !guestTokenMatches(request, conversation.tokenHash)) throw new RequestFailure(404, "Conversation not found.");
    await limit(store, request, `guest:${id}`, 20, 60);
    if (conversation.handler === "bot") await limit(store, request, "ask", 40, 10 * 60);
    const body = await readJson(request, 8192) as { text?: unknown } | null;
    const result = await guestMessage(store, conversation, cleanText(body?.text, LIMITS.guestText), task => after(task));
    return json({ entries: result.entries, status: result.conversation.status, handler: result.conversation.handler }, { status: 201 });
  } catch (error) { return failure(error); }
}
