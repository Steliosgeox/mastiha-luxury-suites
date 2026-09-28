'use client';
import { MessageCircle } from 'lucide-react';
import { Facebook, Instagram } from './SocialMarks';
import type { StayLocale } from '@/content/stay-copy';
import type { ContactChannels } from '@/lib/contact';
import { ASSISTANT_COPY } from '@/content/assistant-copy';
import s from './SocialChannels.module.css';
export function SocialChannels({ locale, contact }: { locale: StayLocale; contact: ContactChannels }) {
  const c = ASSISTANT_COPY[locale];
  return <nav className={s.links} aria-label={c.contact}>
    {contact.facebook && <a href={contact.facebook} target="_blank" rel="noopener noreferrer"><Facebook size={17} aria-hidden="true"/>Facebook</a>}
    {contact.instagram && <a href={contact.instagram} target="_blank" rel="noopener noreferrer"><Instagram size={17} aria-hidden="true"/>Instagram</a>}
    {contact.whatsapp && <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} aria-hidden="true"/>WhatsApp</a>}
    <button type="button" onClick={() => window.dispatchEvent(new Event('mastiha:assistant-open'))}><MessageCircle size={17} aria-hidden="true"/>{c.contactButton}</button>
  </nav>;
}
