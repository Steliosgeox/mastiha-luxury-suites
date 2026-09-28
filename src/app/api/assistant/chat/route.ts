import { randomUUID } from 'node:crypto';
import { propertyGuide } from '@/lib/assistant/guide';
import { failure, guard, readJson, RequestFailure, responseHeaders } from '@/lib/assistant/http';
import type { AssistantRequest } from '@/lib/assistant/contracts';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  try {
    guard(request, 'chat');
    const value = await readJson(request) as Partial<AssistantRequest> | null;
    if (!value || !['en', 'el', 'tr'].includes(String(value.locale)) || !Array.isArray(value.messages) || value.messages.length < 1 || value.messages.length > 16 || value.messages.some(m => !m || !['user', 'assistant'].includes(m.role) || typeof m.content !== 'string' || !m.content.trim() || m.content.length > (m.role === 'user' ? 1600 : 6000)) || value.messages.at(-1)?.role !== 'user') throw new RequestFailure(400, 'Invalid conversation.');
    const result = await propertyGuide.answer(value as AssistantRequest);
    return Response.json({ ...result, requestId: randomUUID() }, { headers: responseHeaders });
  } catch (error) { return failure(error); }
}
