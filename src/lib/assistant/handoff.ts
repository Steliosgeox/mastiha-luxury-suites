import type { HandoffGateway } from './contracts';
/** Receiver contract: durable enqueue + idempotency + abuse controls BEFORE accepted:true. */
export const webhookGateway: HandoffGateway = {
  async deliver(input) {
    const endpoint = new URL(process.env.MASTIHA_SUPPORT_WEBHOOK_URL!);
    if (endpoint.protocol !== 'https:' || endpoint.username || endpoint.password || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(endpoint.hostname) || /(^|\.)(localhost|local|internal)$/.test(endpoint.hostname)) throw new Error('Invalid support endpoint.');
    const res = await fetch(endpoint, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(8000), headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.MASTIHA_SUPPORT_WEBHOOK_TOKEN}`, 'Idempotency-Key': input.requestId }, body: JSON.stringify({ schemaVersion: 1, property: 'mastiha-luxury-suites', ...input, consentVersion: 'support-contact-v1' }) });
    const receipt: unknown = await res.json().catch(() => null);
    if (!res.ok || !receipt || typeof receipt !== 'object' || !('accepted' in receipt) || receipt.accepted !== true || !('reference' in receipt) || typeof receipt.reference !== 'string' || !/^[a-zA-Z0-9._-]{1,80}$/.test(receipt.reference)) throw new Error('Delivery not confirmed.');
    return { accepted: true, reference: receipt.reference };
  },
};
