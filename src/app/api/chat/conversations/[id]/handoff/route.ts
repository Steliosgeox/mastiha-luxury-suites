import { after } from "next/server";
import { guestTokenMatches } from "@/lib/chat/auth";
import { conversationId, escalate, limit, requireStore } from "@/lib/chat/service";
import { failure, json, RequestFailure, sameOrigin } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** "Talk to Athina": the conversation goes straight to her inbox and her phone. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    sameOrigin(request);
    const store = requireStore();
    const id = conversationId((await params).id);
    const conversation = await store.getConversation(id);
    if (!conversation || !guestTokenMatches(request, conversation.tokenHash)) throw new RequestFailure(404, "Conversation not found.");
    await limit(store, request, `handoff:${id}`, 5, 60 * 60);
    const entries = await escalate(store, conversation, task => after(task));
    return json({ entries, status: "open", handler: "host" }, { status: 201 });
  } catch (error) { return failure(error); }
}
