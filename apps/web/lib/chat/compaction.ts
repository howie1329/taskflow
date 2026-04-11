import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { fetchMutation } from "convex/nextjs"
import type { UIMessage } from "ai"
import {
  fromStoredThreadMessage,
  planCompaction,
  selectContextMessages,
  formatMessagesForSummarizer,
  generateThreadSummary,
  generateStructuredThreadState,
  assemblePromptContext,
  DEFAULT_COMPACTION_CONFIG,
  isPastCompactionCooldown,
} from "@taskflow/context-compaction"
import { api } from "@/convex/_generated/api"
import { COMPACTION_MODEL } from "@/lib/ai/models"

const COMPACTION_CONFIG = DEFAULT_COMPACTION_CONFIG

const chatApiWithSummary = api as typeof api & {
  chat: typeof api.chat & { setThreadSummary: unknown }
}

const fetchMutationUnsafe = fetchMutation as unknown as (
  mutationRef: unknown,
  args: unknown,
  options: { token: string },
) => Promise<unknown>

type StoredMessage = {
  messageId: string
  role: string
  model?: string
  content: unknown
}

type ThreadSummary = {
  summaryText: string
  summarizedThroughMessageId: string
  updatedAt: number
  threadState?: unknown
  compactionMetadata?: {
    lastCompactedAt?: number
    lastCompactedMessageId?: string
    messageCountAtCompaction?: number
    tokenEstimateAtCompaction?: number
  }
}

export function convertStoredMessages(storedMessages: StoredMessage[]): UIMessage[] {
  return storedMessages.map((m) =>
    fromStoredThreadMessage({
      messageId: m.messageId,
      role: m.role,
      model: m.model,
      content: m.content,
    }),
  )
}

function buildPreviousCompaction(summary: ThreadSummary | undefined | null) {
  if (!summary) return undefined
  return {
    schemaVersion: 1 as const,
    summaryText: summary.summaryText,
    summarizedThroughMessageId: summary.summarizedThroughMessageId,
    updatedAt: summary.updatedAt,
    threadState: summary.threadState ?? undefined,
    compactionMetadata: summary.compactionMetadata ?? undefined,
  }
}

type RunCompactionResult = {
  summaryText: string
  threadState: unknown
  messagesForContext: UIMessage[]
}

export async function runCompactionPipeline({
  threadId,
  messages,
  existingSummary,
  forceManual,
  token,
}: {
  threadId: string
  messages: UIMessage[]
  existingSummary: ThreadSummary | undefined | null
  forceManual: boolean
  token: string
}): Promise<RunCompactionResult | null> {
  const googleModel = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_AI_KEY,
  })

  const previousCompaction = buildPreviousCompaction(existingSummary)

  const plan = planCompaction({
    messages,
    previousCompaction,
    config: COMPACTION_CONFIG,
    forceManual,
  })

  if (!plan.shouldCompact || plan.messagesToSummarize.length === 0) {
    return null
  }

  const transcript = formatMessagesForSummarizer(plan.messagesToSummarize, {
    includeToolText: false,
    maxCharsPerMessage: 8000,
  })

  if (transcript.length < COMPACTION_CONFIG.minTranscriptChars) {
    return null
  }

  if (!forceManual) {
    const pastCooldown = isPastCompactionCooldown(
      existingSummary?.compactionMetadata?.lastCompactedAt,
      COMPACTION_CONFIG,
    )
    if (!pastCooldown) return null
  }

  const [updatedSummary, updatedState] = await Promise.all([
    generateThreadSummary({
      model: googleModel(COMPACTION_MODEL),
      previousSummary: existingSummary?.summaryText ?? "",
      transcript,
      maxSummaryChars: COMPACTION_CONFIG.maxSummaryChars,
    }),
    generateStructuredThreadState({
      model: googleModel(COMPACTION_MODEL),
      previousState: existingSummary?.threadState ?? null,
      transcript,
    }),
  ])

  if (!updatedSummary) return null

  await fetchMutationUnsafe(
    chatApiWithSummary.chat.setThreadSummary,
    {
      threadId,
      summary: {
        schemaVersion: 1,
        summaryText: updatedSummary,
        summarizedThroughMessageId: plan.nextCursorMessageId!,
        updatedAt: Date.now(),
        threadState: updatedState,
        compactionMetadata: {
          lastCompactedAt: Date.now(),
          lastCompactedMessageId: plan.nextCursorMessageId!,
          messageCountAtCompaction: plan.currentMessageCount,
          tokenEstimateAtCompaction: plan.currentTokenEstimate,
        },
      },
    },
    { token },
  )

  return {
    summaryText: updatedSummary,
    threadState: updatedState,
    messagesForContext: plan.messagesToKeep,
  }
}

export function buildContextMessages({
  messages,
  existingSummary,
}: {
  messages: UIMessage[]
  existingSummary: ThreadSummary | undefined | null
}) {
  return selectContextMessages({
    messages,
    summarizedThroughMessageId: existingSummary?.summarizedThroughMessageId ?? null,
    recentMessageCount: COMPACTION_CONFIG.recentMessageCount,
  })
}

export function assembleContext({
  summaryText,
  threadState,
  messagesToKeep,
}: {
  summaryText: string
  threadState: unknown
  messagesToKeep: UIMessage[]
}) {
  return assemblePromptContext({
    summaryText,
    threadState,
    messagesToKeep,
  })
}

export { COMPACTION_CONFIG }
