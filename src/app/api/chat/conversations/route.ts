import { randomUUID } from "node:crypto";
import { after } from "next/server";
import { newGuestToken } from "@/lib/chat/auth";
import { alertHost, cleanEmail, cleanText, limit, requireStore } from "@/lib/chat/service";
import { LIMITS, type NewEntry } from "@/lib/chat/types";
import { failure, json, readJson, RequestFailure, requireJson, sameOrigin } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = { locale?: string; name?: unknown; email?: unknown; transcript?: { role?: string; content?: unknown }[] };

/** A guest asks for Athina: open a live conversation, carrying over the guide transcript. */
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    requireJson(request);
    const store = requireStore();
    await limit(store, request, "start", 5, 60 * 60);
    const body = await readJson(request, 32_768) as Body | null;
    if (!body || !["en", "el", "tr"].includes(String(body.locale))) throw new RequestFailure(400, "Invalid request.");
    const transcript = Array.isArray(body.transcript) ? body.transcript.slice(-LIMITS.transcript) : [];
    const entries: NewEntry[] = transcript.flatMap(item => {
      if (item?.role !== "user" && item?.role !== "assistant") return [];
      const text = cleanText(item.content, 6000, { required: false });
      return text ? [{ author: item.role === "user" ? "guest" as const : "bot" as const, text }] : [];
    });
    entries.push({ author: "system", text: "handoff" });

    const { token, hash } = newGuestToken();
    const conversation = await store.createConversation({
      id: randomUUID(),
      tokenHash: hash,
      locale: body.locale as "en" | "el" | "tr",
      name: cleanText(body.name, LIMITS.name, { required: false }),
      email: cleanEmail(body.email),
    }, entries);
    const lastQuestion = entries.findLast(entry => entry.author === "guest")?.text ?? "Νέα συζήτηση από το site";
    after(() => alertHost(store, conversation, lastQuestion, true));

    const log = await store.listEntries(conversation.id, -1);
    return json({ id: conversation.id, token, status: conversation.status, entries: log }, { status: 201 });
  } catch (error) { return failure(error); }
}
