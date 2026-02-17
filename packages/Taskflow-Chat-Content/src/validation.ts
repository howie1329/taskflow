import { z } from "zod"
import type { UIMessage } from "ai"
import type { StoredThreadMessage } from "./types.js"
import { makeJsonSerializable } from "./serialization.js"

const roleSchema = z.enum(["user", "assistant", "system", "tool"])

export const uiPartSchema = z.unknown()

export const uiMessageSchema = z.object({
  id: z.string().min(1),
  role: roleSchema,
  parts: z.array(uiPartSchema),
})

const uiMessagesSchema = z.array(uiMessageSchema)

export const storedThreadMessageSchema = z.object({
  messageId: z.string().min(1),
  role: z.enum(["user", "assistant", "system"]),
  model: z.string().min(1),
  content: z.unknown(),
  createdAt: z.number().optional(),
  updatedAt: z.number().optional(),
})

export const parseUIMessages = (input: unknown): UIMessage[] => {
  const parsed = uiMessagesSchema.parse(input)
  return parsed as unknown as UIMessage[]
}

export const safeParseUIMessages = (
  input: unknown
): { success: true; data: UIMessage[] } | { success: false; error: z.ZodError } => {
  const parsed = uiMessagesSchema.safeParse(input)
  if (!parsed.success) {
    return { success: false, error: parsed.error }
  }
  return { success: true, data: parsed.data as unknown as UIMessage[] }
}

export const normalizeUIMessages = (messages: UIMessage[]): UIMessage[] => {
  return messages.map((message) => {
    const safeParts = message.parts.map((part) => makeJsonSerializable(part))
    return {
      id: String(message.id),
      role: message.role,
      parts: safeParts,
    } as UIMessage
  })
}

export const toStoredThreadMessage = (
  message: UIMessage,
  meta: { model: string; createdAt?: number; updatedAt?: number }
): StoredThreadMessage => {
  const safeParts = message.parts.map((part) => makeJsonSerializable(part))

  return {
    messageId: message.id,
    role: message.role,
    model: meta.model,
    content: safeParts,
    createdAt: meta.createdAt,
    updatedAt: meta.updatedAt,
  }
}

export const fromStoredThreadMessage = (
  storedMessage: StoredThreadMessage
): UIMessage => {
  const parsed = storedThreadMessageSchema.parse(storedMessage)
  return {
    id: parsed.messageId,
    role: parsed.role,
    parts: Array.isArray(parsed.content) ? parsed.content : [],
  } as UIMessage
}
