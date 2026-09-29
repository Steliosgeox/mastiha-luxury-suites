import { after } from "next/server";
import { guestTokenMatches } from "@/lib/chat/auth";
import { alertHost, cleanText, conversationId, limit, requireStore } from "@/lib/chat/service";
import { LIMITS } from "@/lib/chat/types";
import { failure, json, readJson, RequestFailure, requireJson, sameOrigin } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** A guest message in a live conversation. Writing again reopens a closed conversation. */
export async function POST(request: Request, { params }: Params) {
  try {
    sameOrigin(request);
    requireJson(request);
    const store = requireStore();
    const id = conversationId((await params).id);
    const conversation = await store.getConversation(id);
    if (!conversation || !guestTokenMatches(request, conversation.tokenHash)) throw new RequestFailure(404, "Conversation not found.");
    await limit(store, request, `guest:${id}`, 30, 60);
    const body = await readJson(request, 8192) as { text?: unknown } | null;
    const text = cleanText(body?.text, LIMITS.guestText);
    if (conversation.status === "closed") {
      await store.updateConversation(id, { status: "open" });
      await store.appendEntry(id, { author: "system", text: "reopened" });
    }
    const entry = await store.appendEntry(id, { author: "guest", text });
    after(() => alertHost(store, conversation, text));
    return json({ entry }, { status: 201 });
  } catch (error) { return failure(error); }
}
