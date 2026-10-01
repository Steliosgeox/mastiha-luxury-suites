"use client";

/* Adapted from Elite Memoriz's EliteAssistant.tsx, itself adapted from assistant-ui's minimal
 * thread.aui.tsx (MIT, (c) 2026 AgentbaseAI Inc., @assistant-ui/react 0.15.22). The thread,
 * message and composer primitives and the viewport anchoring are upstream's; Mastiha owns the
 * data: three speakers instead of two, and system notes between them. */
import { memo, useMemo, useRef, type ReactNode } from "react";
import { AssistantRuntimeProvider, ComposerPrimitive, MessagePrimitive, ThreadPrimitive, useAuiState, useExternalStoreRuntime } from "@assistant-ui/react";
import { ArrowDown, ArrowUp } from "@phosphor-icons/react";
import { RichText } from "@/components/chat/RichText";
import type { AdminCopy } from "@/content/admin-copy";
import type { AdminItem } from "./useAdminInbox";

type Props = Readonly<{
  copy: AdminCopy;
  guestName: string;
  items: readonly AdminItem[];
  onSend: (text: string) => void;
  onRetry: (item: AdminItem) => void;
  onTyping: () => void;
  controls?: ReactNode;
  footer?: ReactNode;
}>;

type Lookup = ReadonlyMap<string, AdminItem>;

const TextPart = memo(({ text }: { text: string }) => <RichText content={text} />);
TextPart.displayName = "TextPart";

const ThreadMessage = memo(({ copy, guestName, lookup, onRetry }: { copy: AdminCopy; guestName: string; lookup: Lookup; onRetry: (item: AdminItem) => void }) => {
  const id = useAuiState(state => state.message.id);
  const item = lookup.get(id);
  if (!item) return null;
  if (item.author === "system") {
    return <MessagePrimitive.Root className="elite-assistant__message admin-thread__event" data-role="system">
      <span>{copy.system[item.text as keyof AdminCopy["system"]] ?? item.text}</span>
      <time>{new Date(item.at).toLocaleTimeString("el-GR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Athens" })}</time>
    </MessagePrimitive.Root>;
  }
  const role = item.author === "host" ? "user" : "assistant";
  const speaker = item.author === "host" ? copy.names.host : item.author === "bot" ? copy.names.bot : guestName;
  const source = item.author === "bot" && item.source ? copy.thread.sources[item.source] : null;
  return <MessagePrimitive.Root className="elite-assistant__message" data-role={role} data-author={item.author} data-state={item.state}>
    <span className="elite-assistant__speaker">
      {speaker}
      {source && <small> · {source}{item.model ? ` · ${item.model.split("/").pop()?.replace(/:free$/, "")}` : ""}</small>}
    </span>
    <div className="elite-assistant__message-content"><MessagePrimitive.Parts components={{ Text: TextPart }} /></div>
    {item.state === "failed" && <button type="button" className="admin-thread__retry" onClick={() => onRetry(item)}>{copy.thread.failed}</button>}
  </MessagePrimitive.Root>;
});
ThreadMessage.displayName = "ThreadMessage";

export function AdminThread({ copy, guestName, items, onSend, onRetry, onTyping, controls, footer }: Props) {
  const submitRef = useRef(false);
  const lookup = useMemo<Lookup>(() => new Map(items.map(item => [item.id, item])), [items]);
  const runtime = useExternalStoreRuntime<AdminItem>({
    messages: items,
    isRunning: false,
    convertMessage: item => ({
      id: item.id,
      role: item.author === "host" ? "user" : item.author === "system" ? "system" : "assistant",
      content: [{ type: "text", text: item.text }],
      createdAt: new Date(item.at),
    }),
    onNew: async message => {
      if (submitRef.current) return;
      const content = message.content.filter(part => part.type === "text").map(part => part.text).join("\n").trim();
      if (!content) return;
      submitRef.current = true;
      try { onSend(content.slice(0, 4000)); } finally { submitRef.current = false; }
    },
  });

  return <AssistantRuntimeProvider runtime={runtime}>
    <ThreadPrimitive.Root role="region" aria-label={guestName} className="elite-assistant admin-thread" data-context="workspace" data-theme="light" data-empty={items.length === 0 || undefined}>
      <ThreadPrimitive.Viewport className="elite-assistant__viewport" autoScroll>
        <div className="elite-assistant__messages">
          <ThreadPrimitive.Messages>{() => <ThreadMessage copy={copy} guestName={guestName} lookup={lookup} onRetry={onRetry} />}</ThreadPrimitive.Messages>
        </div>
        <ThreadPrimitive.ViewportFooter className="elite-assistant__viewport-footer">
          <ThreadPrimitive.ScrollToBottom asChild>
            <button type="button" className="elite-assistant__latest" aria-label={copy.thread.latest}><ArrowDown size={16} aria-hidden="true" /></button>
          </ThreadPrimitive.ScrollToBottom>
          <ComposerPrimitive.Root className="elite-assistant__composer">
            <ComposerPrimitive.Input rows={2} maxLength={4000} className="elite-assistant__input" placeholder={copy.thread.reply} aria-label={copy.thread.reply} onInput={onTyping} />
            <div className="elite-assistant__composer-controls">
              <div className="elite-assistant__controls-start">{controls}</div>
              <ComposerPrimitive.Send asChild>
                <button type="button" className="elite-assistant__send" aria-label={copy.thread.send}><ArrowUp size={19} aria-hidden="true" /></button>
              </ComposerPrimitive.Send>
            </div>
          </ComposerPrimitive.Root>
          <div className="elite-assistant__footer">{footer ?? copy.thread.hint}</div>
        </ThreadPrimitive.ViewportFooter>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  </AssistantRuntimeProvider>;
}
