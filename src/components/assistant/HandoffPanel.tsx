'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ASSISTANT_COPY } from '@/content/assistant-copy';
import { propertyData } from '@/content/property';
import type { StayLocale } from '@/content/stay-copy';
import type { ContactChannels } from '@/lib/contact';

export function HandoffPanel({ locale, contact, onBack }: { locale: StayLocale; contact: ContactChannels; onBack: () => void }) {
  const c = ASSISTANT_COPY[locale];
  const [sending, setSending] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const id = useRef<string>('');
  const lastPayload = useRef<string>('');
  const controller = useRef<AbortController | null>(null);
  const pending = useRef(false);
  useEffect(() => () => controller.current?.abort(), []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (pending.current || !contact.handoffEnabled) return;
    pending.current = true; setSending(true); setError(false);
    const values = new FormData(event.currentTarget);
    const payload = { locale, name: values.get('name'), email: values.get('email'), message: values.get('message'), consent: values.get('consent') === 'on' };
    const signature = JSON.stringify(payload);
    if (!id.current || lastPayload.current !== signature) { id.current = crypto.randomUUID(); lastPayload.current = signature; }
    const abort = new AbortController(); controller.current = abort;
    const timer = setTimeout(() => abort.abort(), 12_000);
    try {
      const response = await fetch('/api/assistant/handoff', { method: 'POST', signal: abort.signal, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId: id.current, ...payload }) });
      const result = await response.json();
      if (response.status !== 202 || result.accepted !== true || typeof result.reference !== 'string') throw new Error('Unconfirmed');
      setReceipt(result.reference);
    } catch { if (!abort.signal.aborted) setError(true); else if (controller.current === abort) setError(true); }
    finally { clearTimeout(timer); pending.current = false; setSending(false); }
  }
  return <div className="mastiha-handoff" data-testid="representative-panel" data-lenis-prevent>
    <h2 className="chatbot__title">{c.handoffTitle}</h2>
    {!contact.handoffEnabled ? <p>{c.handoffUnavailable}</p> : receipt ? <p role="status">{c.sent}<br/><strong>{receipt}</strong></p> : <>
      <p>{c.handoffInfo}</p>
      <form onSubmit={submit}>
        <label>{c.name}<input className="chatbot__input" name="name" autoComplete="name" minLength={2} maxLength={100} required disabled={sending}/></label>
        <label>{c.email}<input className="chatbot__input" type="email" name="email" autoComplete="email" maxLength={254} required disabled={sending}/></label>
        <label>{c.message}<textarea className="chatbot__textarea" name="message" minLength={10} maxLength={3000} rows={4} required disabled={sending}/></label>
        <label className="mastiha-handoff__consent"><input type="checkbox" name="consent" required disabled={sending}/><span>{c.consent} <a href={`/${locale}/privacy`} target="_blank" rel="noopener noreferrer">{c.privacy}</a></span></label>
        {error && <p role="alert">{c.unconfirmed}</p>}
        <button className="chatbot__quick-action" type="submit" disabled={sending}>{sending ? c.sending : c.submit}</button>
      </form>
    </>}
    <div className="mastiha-handoff__links">
      {contact.whatsapp && <a className="chatbot__quick-action" href={contact.whatsapp} target="_blank" rel="noopener noreferrer">{c.whatsappAction} ↗</a>}
      {contact.email && <a className="chatbot__quick-action" href={`mailto:${contact.email}`}>{c.emailAction} ↗</a>}
      <a className="chatbot__quick-action" href={propertyData.bookingLinks.airbnb} target="_blank" rel="noopener noreferrer">Airbnb ↗</a>
      <a className="chatbot__quick-action" href={propertyData.bookingLinks.booking} target="_blank" rel="noopener noreferrer">Booking.com ↗</a>
    </div>
    <button className="chatbot__quick-action" type="button" onClick={onBack}>← {c.back}</button>
  </div>;
}
