"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import {
  AssistantRuntimeProvider,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  useAuiState,
  useExternalStoreRuntime,
  type AppendMessage,
  type ThreadMessageLike,
} from "@assistant-ui/react";
import { ArrowDown, PaperPlaneRight } from "@phosphor-icons/react";
import { RichText } from "./RichText";
import "./rich-text.css";
import s from "./chat.module.css";

/*
  One conversation view for both sides of the chat, built on assistant-ui
  (github.com/assistant-ui/assistant-ui): its runtime owns scrolling, the composer and
  keyboard handling, while our state stays in a plain array of items. `self` decides
  whose messages sit on the right: the guest in the widget, Athina in the admin portal.
*/

export type Speaker = "guest" | "host" | "bot";
export type ThreadItem = {
  id: string;
  kind: Speaker | "system";
  text: string;
  at?: number;
  state?: "sending" | "failed";
  /** A guide answer that offers to hand the conversation to Athina. */
  offersHost?: boolean;
};

type Options = {
  names: Record<Speaker, string>;
  systemText: (code: string) => string;
  locale: string;
  failedLabel: string;
  actionLabel?: string;
  onAction?: () => void;
  onRetry?: (item: ThreadItem) => void;
};
const Context = createContext<(Options & { byId: Map<string, ThreadItem> }) | null>(null);
const useOptions = () => useContext(Context)!;

type Props = Options & {
  items: ThreadItem[];
  self: "guest" | "host";
  onSend: (text: string) => Promise<void> | void;
  placeholder: string;
  sendLabel: string;
  /** Shows a typing indicator after the last message. */
  typing?: string | null;
  /** Blocks sending while the guide is answering. */
  busy?: boolean;
  empty?: ReactNode;
  beforeComposer?: ReactNode;
  className?: string;
};

export function ChatThread({ items, self, onSend, placeholder, sendLabel, typing, busy = false, empty, beforeComposer, className = "", ...options }: Props) {
  const runtime = useExternalStoreRuntime<ThreadItem>({
    messages: items,
    isRunning: busy,
    convertMessage: (item): ThreadMessageLike => ({
      id: item.id,
      role: item.kind === "system" ? "system" : item.kind === self ? "user" : "assistant",
      content: [{ type: "text", text: item.text }],
      createdAt: item.at ? new Date(item.at) : undefined,
    }),
    onNew: async (message: AppendMessage) => {
      const text = message.content.map(part => part.type === "text" ? part.text : "").join("\n").trim();
      if (text) await onSend(text);
    },
  });

  // Follow new messages when the reader is at the bottom, and always after sending.
  const viewport = useRef<HTMLDivElement>(null);
  const last = items.at(-1);
  useEffect(() => {
    const element = viewport.current;
    if (!element || !last) return;
    const nearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 160;
    if (nearBottom || last.kind === self) requestAnimationFrame(() => element.scrollTo({ top: element.scrollHeight, behavior: "smooth" }));
  }, [last?.id, typing, self]); // eslint-disable-line react-hooks/exhaustive-deps

  // Messages look their item up by id: assistant-ui keeps ids stable through its conversion.
  const byId = new Map(items.map(item => [item.id, item]));
  return <Context.Provider value={{ ...options, byId }}>
    <AssistantRuntimeProvider runtime={runtime}>
      <ThreadPrimitive.Root className={`${s.thread} ${className}`}>
        <ThreadPrimitive.Viewport ref={viewport} className={s.viewport} data-lenis-prevent>
          <ThreadPrimitive.Empty>{empty}</ThreadPrimitive.Empty>
          <ThreadPrimitive.Messages components={{ UserMessage: Message, AssistantMessage: Message, SystemMessage }} />
          {typing && <div className={s.typing} role="status"><span className={s.dots} aria-hidden="true"><i /><i /><i /></span>{typing}</div>}
          <ThreadPrimitive.ScrollToBottom className={s.scrollDown} aria-label="↓"><ArrowDown weight="bold" /></ThreadPrimitive.ScrollToBottom>
        </ThreadPrimitive.Viewport>
        {beforeComposer}
        <ComposerPrimitive.Root className={s.composer}>
          <ComposerPrimitive.Input className={s.input} placeholder={placeholder} aria-label={placeholder} rows={1} maxRows={6} submitMode="enter" maxLength={self === "host" ? 4000 : 2000} />
          <ComposerPrimitive.Send className={s.send} aria-label={sendLabel}><PaperPlaneRight weight="fill" /></ComposerPrimitive.Send>
        </ComposerPrimitive.Root>
      </ThreadPrimitive.Root>
    </AssistantRuntimeProvider>
  </Context.Provider>;
}

function Message() {
  const { names, locale, failedLabel, actionLabel, onAction, onRetry, byId } = useOptions();
  const id = useAuiState(state => state.message.id);
  const role = useAuiState(state => state.message.role);
  const item = byId.get(id);
  if (!item || item.kind === "system") return null;
  const mine = role === "user";
  const speaker = item.kind;
  const time = item.at ? new Date(item.at).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: "Europe/Athens" }) : null;

  return <MessagePrimitive.Root className={s.message} data-mine={mine} data-speaker={speaker} data-state={item.state}>
    {!mine && <span className={s.avatar} aria-hidden="true">{speaker === "bot" ? "M" : names[speaker].charAt(0)}</span>}
    <div className={s.column}>
      {!mine && <span className={s.author}>{names[speaker]}</span>}
      <div className={s.bubble}>
        {speaker === "bot" ? <RichText content={item.text} className={s.rich} /> : <p>{item.text}</p>}
      </div>
      {item.state === "failed"
        ? <button type="button" className={s.failed} onClick={() => onRetry?.(item)}>{failedLabel}</button>
        : time && <span className={s.time}>{item.state === "sending" ? "…" : time}</span>}
      {item.offersHost && onAction && actionLabel && <button type="button" className={s.action} onClick={onAction}>{actionLabel}<span aria-hidden="true">→</span></button>}
    </div>
  </MessagePrimitive.Root>;
}

function SystemMessage() {
  const { systemText, byId } = useOptions();
  const id = useAuiState(state => state.message.id);
  const code = byId.get(id)?.text ?? "";
  return <MessagePrimitive.Root className={s.system}><span>{systemText(code)}</span></MessagePrimitive.Root>;
}
