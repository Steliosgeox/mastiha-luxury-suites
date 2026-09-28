"use client";
import './chatbot.css';
import './rich-text.css';
import './integration.css';
import {
  memo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useId,
} from 'react';
import {
  ArrowRight,
  CalendarDays,
  Headset,
  Mail,
  MessageCircle,
  Package,
  Sparkles,
  X,
} from 'lucide-react';
import Link from 'next/link';
import type { StayLocale } from '@/content/stay-copy';
import type { ContactChannels } from '@/lib/contact';
import { useSmoothScroll } from '@/components/layout/SmoothScrollProvider';
import { HandoffPanel } from './HandoffPanel';
import { installGlassLens } from './glassLens';

import { LiquidGlassFilter } from './LiquidGlassFilter';
import { ASSISTANT_COPY } from '@/content/assistant-copy';

import { RichText } from './RichText';

/**
 * The floating site assistant — a faithful port of the aerofren two-state
 * chatbot: a compact welcome widget that becomes an expanded conversation
 * workspace once the dialogue starts, and goes full-screen on phones. The
 * provider key never reaches the browser; this component only ever talks to
 * our own /api/assistant/chat route.
 */

type ChatTurn = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const CHAT_NEAR_BOTTOM_THRESHOLD = 72;

const isChatNearBottom = (scroller: HTMLDivElement | null): boolean => {
  if (!scroller) return true;
  const distanceFromBottom = scroller.scrollHeight - (scroller.scrollTop + scroller.clientHeight);
  return distanceFromBottom <= CHAT_NEAR_BOTTOM_THRESHOLD;
};

/**
 * A reply arrives as Markdown -- the concierge answers "what do the packages
 * include" with a table, because that is the right answer to that question.
 * Splitting on blank lines printed the pipes and the asterisks at the reader.
 */
const MessageBody = memo(function MessageBody({ content }: { content: string }) {
  return <RichText content={content} className="chatbot__rich" />;
});

const Loader = () => (
  <svg
    className="chatbot__loader"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path className="chatbot__loader-line" d="m4.9 4.9 2.9 2.9" />
    <path className="chatbot__loader-line" d="M2 12h4" />
    <path className="chatbot__loader-line" d="m4.9 19.1 2.9-2.9" />
    <path className="chatbot__loader-line" d="M12 18v4" />
    <path className="chatbot__loader-line" d="m16.2 16.2 2.9 2.9" />
    <path className="chatbot__loader-line" d="M18 12h4" />
    <path className="chatbot__loader-line" d="m16.2 7.8 2.9-2.9" />
    <path className="chatbot__loader-line" d="M12 2v4" />
  </svg>
);

let turnCounter = 0;
const nextTurnId = () => `turn-${Date.now()}-${turnCounter++}`;

export function FloatingAssistant({ locale, contact, openSignal = 0 }: { locale: StayLocale; contact: ContactChannels; openSignal?: number }) {
  const language = locale;
  const copy = ASSISTANT_COPY[language];
  const { lenis, scrollTo } = useSmoothScroll();
  const [handoff, setHandoff] = useState(false);
  const pendingRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const reactId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chatRootRef = useRef<HTMLDivElement>(null);
  const chatScrollerRef = useRef<HTMLDivElement>(null);
  const inputIdRef = useRef(`mastiha-assistant-${reactId}`);

  const isConversationMode = messages.length > 0 || handoff;

  useEffect(() => {
    if (openSignal > 0) {
      const active = document.activeElement;
      openerRef.current = active instanceof HTMLElement && active !== document.body ? active : null;
      setIsOpen(true);
    }
  }, [openSignal]);
  useEffect(() => { installGlassLens(); return () => abortRef.current?.abort(); }, []);
  useEffect(() => {
    if (!isOpen) return;
    const background = document.querySelector<HTMLElement>('[data-stay-page]');
    const wasInert = background?.inert ?? false;
    const overflow = document.body.style.overflow;
    const stopped = lenis?.isStopped;
    if (background) background.inert = true;
    document.body.style.overflow = 'hidden';
    lenis?.stop();
    const frame = requestAnimationFrame(() => chatRootRef.current?.querySelector<HTMLButtonElement>('.chatbot__header-close')?.focus());
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setIsOpen(false); }
      if (event.key !== 'Tab') return;
      const root = chatRootRef.current;
      const items = [...(root?.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),textarea:not([disabled]),[tabindex="0"]') ?? [])].filter(el => el.getClientRects().length && !el.hasAttribute('hidden'));
      const first = items[0], last = items.at(-1);
      if (!first || !last) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || !root?.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !root?.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', key);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', key);
      if (background) background.inert = wasInert;
      document.body.style.overflow = overflow;
      if (!stopped) lenis?.start();
      requestAnimationFrame(() => {
        if (openerRef.current?.isConnected && !openerRef.current.closest('[inert]')) openerRef.current.focus({ preventScroll: true });
        else document.querySelector<HTMLButtonElement>('[data-testid="assistant-toggle"]')?.focus({ preventScroll: true });
      });
    };
  }, [isOpen, lenis]);
  const navigateTo = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault(); setIsOpen(false);
    requestAnimationFrame(() => scrollTo(id, { offset: 0 }));
  };

  const latestMessageSignature = useMemo(
    () => `${messages.length}:${messages[messages.length - 1]?.id ?? ''}`,
    [messages],
  );
  const prevSignatureRef = useRef<string | null>(null);
  const forceScrollRef = useRef(false);
  const [scrollbarCompensation, setScrollbarCompensation] = useState(0);

  const scrollToLatest = useCallback(() => {
    const scroller = chatScrollerRef.current;
    if (!scroller) return;
    requestAnimationFrame(() => {
      // jsdom and older engines may not implement element.scrollTo.
      if (typeof scroller.scrollTo === 'function') {
        scroller.scrollTo({ top: scroller.scrollHeight, behavior: 'smooth' });
        return;
      }
      scroller.scrollTop = scroller.scrollHeight;
    });
  }, []);

  useEffect(() => {
    if (!isOpen) {
      prevSignatureRef.current = latestMessageSignature;
      forceScrollRef.current = false;
      return;
    }
    const previous = prevSignatureRef.current;
    const changed = previous !== null && previous !== latestMessageSignature;
    if (previous === null || (changed && (forceScrollRef.current || isChatNearBottom(chatScrollerRef.current)))) {
      scrollToLatest();
    }
    prevSignatureRef.current = latestMessageSignature;
    forceScrollRef.current = false;
  }, [isOpen, latestMessageSignature, scrollToLatest]);

  useLayoutEffect(() => {
    if (!isConversationMode) return;
    const frame = requestAnimationFrame(() => {
      const scroller = chatScrollerRef.current;
      if (!scroller) return;
      const messagesEl = scroller.firstElementChild as HTMLElement | null;
      setScrollbarCompensation(scroller.offsetWidth - (messagesEl?.offsetWidth ?? scroller.offsetWidth));
    });
    return () => cancelAnimationFrame(frame);
  }, [isConversationMode]);

  const ask = useCallback(async (question: string) => {
    const text = question.trim();
    if (!text || pendingRef.current || text.length > 1600) return;
    pendingRef.current = true;

    forceScrollRef.current = true;
    setError(null);
    setInput('');

    const userTurn: ChatTurn = { id: nextTurnId(), role: 'user', content: text };
    const history = [...messages.slice(-59), userTurn];
    setMessages(history);
    setIsLoading(true);

    const outbound = history.slice(-16).map(({ role, content }) => ({ role, content }));
    const encode = () => JSON.stringify({ messages: outbound, locale: language });
    while (outbound.length > 1 && new TextEncoder().encode(encode()).byteLength > 14000) outbound.shift();
    const abort = new AbortController(); abortRef.current = abort;
    const timer = setTimeout(() => abort.abort(), 15000);
    try {
      const response = await fetch('/api/assistant/chat', {
        signal: abort.signal,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: encode(),
      });
      const payload = (await response.json().catch(() => null)) as { reply?: string; message?: string } | null;
      if (!response.ok || !payload?.reply) {
        throw new Error(payload?.message || 'The assistant could not answer.');
      }
      setMessages((current) => [...current, { id: nextTurnId(), role: 'assistant', content: payload.reply! }]);
    } catch {
      setError(copy.error);
    } finally {
      clearTimeout(timer); pendingRef.current = false;
      setIsLoading(false);
    }
  }, [messages, language, copy.error]);

  const handleSubmit = useCallback((text?: string) => {
    void ask(text ?? input);
  }, [ask, input]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
        event.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );


  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={(event) => { openerRef.current = event.currentTarget; setIsOpen(true); }}
          className="chatbot-toggle"
          aria-label={copy.openLabel}
          data-testid="assistant-toggle"
        >
          <MessageCircle />
        </button>
      )}

      {isOpen && (
        <div
          aria-label={copy.title}
          className={`chatbot ${isConversationMode ? 'chatbot--conversation' : 'chatbot--welcome'}`}
          data-lenis-prevent
          ref={chatRootRef}
          role="dialog"
          aria-modal="true"
          data-testid="assistant-dialog"
        >
          {/*
            The lens, and only in conversation mode.

            The map is a signed distance field of this panel's silhouette, so it
            has to be baked per shape. Conversation is a fixed 500x700 with a
            14px radius, which is a shape worth baking. Welcome mode is
            height:auto, so it has no fixed aspect to bake for, and below 1024px
            the panel is fullscreen with square corners -- no rim to bend, and a
            displacement pass over a whole phone screen for nothing. The CSS
            gates the effect to match.
          */}
          {isConversationMode && (
            <LiquidGlassFilter id="chat-glass" mapSrc="/assistant/chat-lens-map.png" scale={-24} />
          )}
          {/* ── HEADER ── */}
          <div className="chatbot__header">
            <div className="chatbot__header-info">
              <div className="chatbot__header-icon">
                <Sparkles className="chatbot__header-icon-svg" />
              </div>
              <div className="chatbot__header-text">
                <h3 className="chatbot__header-title">{copy.title}</h3>
                <span className="chatbot__header-status">{copy.status}</span>
              </div>
            </div>
            <button
              type="button"
              className="chatbot__header-close"
              onClick={() => setIsOpen(false)}
              aria-label={copy.closeLabel}
            >
              <X />
            </button>
          </div>

          {/* ── QUICK ACTIONS ── */}
          <div className="chatbot__quick-actions">
            <Link href={`/${language}#suite`} className="chatbot__quick-action" onClick={event => navigateTo(event, "#suite")}>
              <Package className="chatbot__quick-action-icon" />
              <span>{copy.quickActions.packages}</span>
            </Link>
            <Link
              href={`/${language}#nearby`}
              className="chatbot__quick-action"
              onClick={event => navigateTo(event, "#nearby")}
            >
              <CalendarDays className="chatbot__quick-action-icon" />
              <span>{copy.quickActions.howItWorks}</span>
            </Link>
            <button type="button" className="chatbot__quick-action" onClick={() => setHandoff(true)}>
              <Mail className="chatbot__quick-action-icon" />
              <span>{copy.quickActions.contact}</span>
            </button>
          </div>

          {/* ── MAIN CONTAINER ── */}
          <div className="chatbot__container">
            {handoff ? <HandoffPanel locale={language} contact={contact} onBack={() => setHandoff(false)}/> : !isConversationMode ? (
              /* ── WELCOME STATE ── */
              <div className="chatbot__welcome-content">
                <div className="chatbot__icon-wrapper">
                  <div className="chatbot__icon chatbot__icon--gradient">
                    <Sparkles className="chatbot__icon-svg" strokeWidth={1.5} />
                  </div>
                </div>
                <h2 className="chatbot__title">{copy.welcomeHeading}</h2>
                <div className="chatbot__suggestions-box">
                  {copy.welcomeSuggestions.map((suggestion, index) => (
                    <button
                      key={`welcome-${index}`}
                      type="button"
                      className="chatbot__suggestion"
                      onClick={() => handleSubmit(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                  <div className="chatbot__input-wrapper">
                    <label className="chatbot__label" htmlFor={inputIdRef.current}>{copy.inputLabel}</label>
                    <input
                      id={inputIdRef.current}
                      className="chatbot__input"
                      type="text"
                      maxLength={1600}
                      placeholder={copy.placeholder}
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <button
                      type="button"
                      className="chatbot__submit"
                      onClick={() => handleSubmit()}
                      disabled={!input.trim()}
                      aria-label={copy.sendLabel}
                    >
                      <ArrowRight className="chatbot__submit-icon" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* ── CONVERSATION STATE ── */
              <div className="chatbot__conversation-content">
                {/*
                  * `data-lenis-prevent` is what makes the wheel work in here.
                  * Lenis takes the wheel over for the whole document to drive
                  * its smooth scroll and cancels the native event while it
                  * does, so a panel floating above the page received nothing
                  * from the wheel and would not move under the cursor. The
                  * attribute is Lenis's own opt-out: it marks this element as
                  * owning its own scrolling.
                  */}
                <div
                  className="chatbot__message-scroller"
                  data-lenis-prevent
                  ref={chatScrollerRef}
                  role="log" aria-live="polite" aria-relevant="additions"
                >
                  <div
                    className="chatbot__messages"
                    style={{ paddingInlineEnd: `calc(1.5em - ${scrollbarCompensation}px)` }}
                  >
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`chatbot__message chatbot__message--${message.role === 'user' ? 'user' : 'assistant'}`}
                      >
                        {message.role !== 'user' && (
                          <div className="chatbot__message-icon">
                            <div className="chatbot__icon chatbot__icon--small chatbot__icon--gradient">
                              <Headset className="chatbot__icon-svg" />
                            </div>
                          </div>
                        )}
                        <div className="chatbot__message-content">
                          {message.role === 'user' ? (
                            <>
                              <p className="chatbot__message-text">{message.content}</p>
                              <div className="chatbot__message-bubble" />
                              <div className="chatbot__message-bubble chatbot__message-bubble--end" />
                            </>
                          ) : (
                            <MessageBody content={message.content} />
                          )}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="chatbot__message chatbot__message--assistant chatbot__message--ai-loading">
                        <div className="chatbot__message-icon">
                          <div className="chatbot__icon chatbot__icon--small chatbot__icon--gradient">
                            <Headset className="chatbot__icon-svg" />
                          </div>
                        </div>
                        <Loader />
                      </div>
                    )}
                  </div>
                </div>

                <div className="chatbot__input-box">
                  {error && (
                    <p role="alert" className="chatbot__support-pill">{error}</p>
                  )}
                  <div className="chatbot__suggestion-tags">
                    {copy.conversationSuggestions.map((suggestion, index) => (
                      <button
                        key={`conversation-${index}`}
                        type="button"
                        className="chatbot__suggestion-tag"
                        disabled={isLoading}
                        onClick={() => handleSubmit(suggestion)}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                  <div className="chatbot__textarea-wrapper">
                    <label className="chatbot__label" htmlFor={`${inputIdRef.current}-msg`}>{copy.messageLabel}</label>
                    <textarea
                      id={`${inputIdRef.current}-msg`}
                      className="chatbot__textarea"
                      maxLength={1600}
                      placeholder={copy.placeholder}
                      value={input}
                      disabled={isLoading}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={1}
                    />
                    <button
                      type="button"
                      className="chatbot__submit chatbot__submit--textarea"
                      onClick={() => handleSubmit()}
                      disabled={!input.trim() || isLoading}
                      aria-label={copy.sendLabel}
                    >
                      <ArrowRight className="chatbot__submit-icon" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default FloatingAssistant;
