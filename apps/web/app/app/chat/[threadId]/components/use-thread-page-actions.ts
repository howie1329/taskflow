"use client"

import { useCallback } from "react"
import type { UIMessage } from "ai"
import { getMessageText } from "./message-parts"

type ThreadPageActionsArgs = {
  messages: UIMessage[]
  sendText: (text: string) => Promise<void>
  updateTitle: (title: string) => Promise<void>
  softDelete: () => Promise<void>
}

export function useThreadPageActions({
  messages,
  sendText,
  updateTitle,
  softDelete,
}: ThreadPageActionsArgs) {
  const regenerateAssistantResponse = useCallback(async (assistantMessageId: string) => {
    const assistantIndex = messages.findIndex((message) => message.id === assistantMessageId)
    if (assistantIndex < 0) return

    const previousUser = [...messages.slice(0, assistantIndex)]
      .reverse()
      .find((message) => message.role === "user")

    if (!previousUser) return

    const previousText = getMessageText(previousUser)
    if (!previousText.trim()) return

    await sendText(previousText)
  }, [messages, sendText])

  const copyAssistantMessage = useCallback(async (messageText: string) => {
    try {
      await navigator.clipboard.writeText(messageText)
    } catch (copyError) {
      console.error("Failed to copy assistant message", copyError)
    }
  }, [])

  const saveThreadTitle = useCallback(async (title: string) => {
    const trimmed = title.trim()
    if (!trimmed) return false
    await updateTitle(trimmed)
    return true
  }, [updateTitle])

  return {
    copyAssistantMessage,
    regenerateAssistantResponse,
    saveThreadTitle,
    deleteThread: softDelete,
  }
}
