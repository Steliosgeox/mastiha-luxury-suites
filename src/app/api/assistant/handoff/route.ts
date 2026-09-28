import { getContactChannels } from '@/lib/contact';
import { failure, guard, readJson, RequestFailure, responseHeaders } from '@/lib/assistant/http';
import type { HandoffRequest } from '@/lib/assistant/contracts';
import { webhookGateway } from '@/lib/assistant/handoff';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  try {
    // Fail closed BEFORE accepting personal contact details when no real receiver exists.
    if (!getContactChannels().handoffEnabled) throw new RequestFailure(503, 'Direct messaging is not connected. No message has been sent. Please contact the host through Airbnb or Booking.com.');
    guard(request, 'handoff', 3, 600_000);
    const p = await readJson(request, 8192) as Partial<HandoffRequest> | null;
    if (!p || p.consent !== true || typeof p.requestId !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(p.requestId) || typeof p.name !== 'string' || p.name.trim().length < 2 || p.name.length > 100 || typeof p.email !== 'string' || p.email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(p.email) || typeof p.message !== 'string' || p.message.trim().length < 10 || p.message.length > 3000 || !['en', 'el', 'tr'].includes(String(p.locale))) throw new RequestFailure(400, 'Complete the contact details and consent.');
    const receipt = await webhookGateway.deliver({ requestId: p.requestId, name: p.name.trim(), email: p.email.trim(), message: p.message.trim(), locale: p.locale!, consent: true });
    return Response.json(receipt, { status: 202, headers: responseHeaders });
  } catch (error) { return failure(error); }
}
