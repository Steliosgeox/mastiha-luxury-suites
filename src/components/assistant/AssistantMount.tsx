'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Commissioner } from 'next/font/google';
import type { StayLocale } from '@/content/stay-copy';
import type { ContactChannels } from '@/lib/contact';
const commissioner = Commissioner({ subsets: ['latin', 'latin-ext', 'greek'], variable: '--font-assistant', display: 'swap', preload: false });
const FloatingAssistant = dynamic(() => import('./FloatingAssistant'), { ssr: false });
export function AssistantMount({ locale, contact }: { locale: StayLocale; contact: ContactChannels }) {
  const [mounted, setMounted] = useState(false);
  const [openSignal, setOpenSignal] = useState(0);
  useEffect(() => {
    setMounted(true);
    const updateViewport = () => {
      const host = document.querySelector<HTMLElement>('.assistant-host');
      const viewport = window.visualViewport;
      if (host && viewport) {
        host.style.setProperty('--assistant-vv-height', `${viewport.height}px`);
        host.style.setProperty('--assistant-vv-top', `${viewport.offsetTop}px`);
      }
    };
    const frame = requestAnimationFrame(updateViewport);
    window.visualViewport?.addEventListener('resize', updateViewport);
    window.visualViewport?.addEventListener('scroll', updateViewport);
    const open = () => setOpenSignal(value => value + 1);
    window.addEventListener('mastiha:assistant-open', open);
    return () => {
      window.removeEventListener('mastiha:assistant-open', open);
      cancelAnimationFrame(frame);
      window.visualViewport?.removeEventListener('resize', updateViewport);
      window.visualViewport?.removeEventListener('scroll', updateViewport);
    };
  }, []);
  return mounted ? createPortal(<div className={`assistant-host ${commissioner.variable}`}><FloatingAssistant locale={locale} contact={contact} openSignal={openSignal}/></div>, document.body) : null;
}
