"use client"

import { ThreadContext } from "@/app/app/chat/components/thread-context"
import {
  getContextHealthState,
  getContextUsageRatio,
  getLastAssistantInputTokens,
  formatTokenCount,
} from "@/lib/chat/thread-context"
import { useChatConfig, useChatThreadMessages } from "../../components/chat-provider"

export function ThreadContextFooterBadge() {
  const { thread, project, selectedModelId, availableModels } = useChatConfig()
  const threadMessages = useChatThreadMessages()

  const activeModel =
    availableModels.find((model) => model.modelId === selectedModelId) ??
    availableModels.find((model) => model.modelId === thread?.model) ??
    null

  if (!thread) return null

  const lastPromptTokens = getLastAssistantInputTokens(threadMessages)
  const summaryText = thread.summary?.summaryText?.trim() ?? ""
  const hasSummary = Boolean(summaryText)
  const contextUsageRatio = getContextUsageRatio({
    totalTokens: lastPromptTokens,
    contextLength: activeModel?.contextLength,
  })
  const contextHealthState = getContextHealthState(contextUsageRatio)
  const contextLabel = activeModel?.contextLength
    ? `${formatTokenCount(lastPromptTokens)} / ${formatTokenCount(activeModel.contextLength)}`
    : formatTokenCount(lastPromptTokens)
  const scopeLabel =
    thread.scope === "project" && project
      ? project.title
      : "All workspace"
  const lastCompactedAt =
    thread.summary?.compactionMetadata?.lastCompactedAt ?? thread.summary?.updatedAt

  const value = {
    state: {
      thread,
      project,
      activeModel,
      usageTotals: thread.usageTotals,
      lastPromptTokens,
      summaryText,
      hasSummary,
      lastCompactedAt,
      contextUsageRatio,
      contextHealthState,
      contextLabel,
      scopeLabel,
    },
    actions: {},
    meta: {},
  }

  return (
    <ThreadContext.Provider value={value}>
      <ThreadContext.BadgePopover />
    </ThreadContext.Provider>
  )
}
