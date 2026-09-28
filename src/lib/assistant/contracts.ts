import type { StayLocale } from '@/content/stay-copy';
export type ChatMessage = { role: 'user' | 'assistant'; content: string };
export type AssistantRequest = { locale: StayLocale; messages: ChatMessage[] };
export type AssistantReply = { reply: string; mode: 'guide'; sources: string[]; requestId: string };
export interface AssistantProvider { answer(input: AssistantRequest): Promise<Omit<AssistantReply, 'requestId'>> }
export type HandoffRequest = { requestId: string; name: string; email: string; message: string; locale: StayLocale; consent: true };
export type HandoffReceipt = { accepted: true; reference: string };
export interface HandoffGateway { deliver(input: HandoffRequest): Promise<HandoffReceipt> }
