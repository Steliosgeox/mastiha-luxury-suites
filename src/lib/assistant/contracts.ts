import type { StayLocale } from "@/content/stay-copy";

export type ChatMessage = { role: "user" | "assistant"; content: string };
export type AssistantRequest = { locale: StayLocale; messages: ChatMessage[] };
export type AssistantReply = { reply: string; mode: "guide"; sources: string[]; suggestHost?: boolean; requestId: string };
export interface AssistantProvider { answer(input: AssistantRequest): Promise<Omit<AssistantReply, "requestId">> }
