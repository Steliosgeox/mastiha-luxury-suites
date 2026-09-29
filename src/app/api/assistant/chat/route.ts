import { randomUUID } from "node:crypto";
import { propertyGuide } from "@/lib/assistant/guide";
import type { AssistantRequest } from "@/lib/assistant/contracts";
import { failure, json, localLimit, readJson, RequestFailure, requireJson, sameOrigin } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The automated guide: answers from the property data, no external model. */
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    requireJson(request);
    localLimit(request, "guide");
    const body = await readJson(request) as Partial<AssistantRequest> | null;
    const messages = body?.messages;
    const valid = body && ["en", "el", "tr"].includes(String(body.locale)) && Array.isArray(messages)
      && messages.length >= 1 && messages.length <= 16 && messages.at(-1)?.role === "user"
      && messages.every(message => message && ["user", "assistant"].includes(message.role) && typeof message.content === "string"
        && message.content.trim() && message.content.length <= (message.role === "user" ? 1600 : 6000));
    if (!valid) throw new RequestFailure(400, "Invalid conversation.");
    const result = await propertyGuide.answer(body as AssistantRequest);
    return json({ ...result, requestId: randomUUID() });
  } catch (error) { return failure(error); }
}
