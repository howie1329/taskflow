import { NextResponse } from "next/server"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server"
import { fetchMutation, fetchQuery } from "convex/nextjs"
import { api } from "@/convex/_generated/api"
import { fromStoredThreadMessage } from "@taskflow/chat-content"
import type { UIMessage } from "ai"
import {
  planCompaction,
  formatMessagesForSummarizer,
  generateThreadSummary,
  generateStructuredThreadState,
  DEFAULT_COMPACTION_CONFIG,
} from "@/lib/chat/context-compaction"

const chatApiWithSummary = api as typeof api & {
  chat: typeof api.chat & { setThreadSummary: unknown }
}

const fetchMutationUnsafe = fetchMutation as unknown as (
  mutationRef: unknown,
  args: unknown,
  options: { token: string }
) => Promise<unknown>

export async function POST(req: Request) {
  const token = await convexAuthNextjsToken()
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { threadId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 })
  }

  const { threadId } = body
  if (!threadId || typeof threadId !== "string") {
    return NextResponse.json({ error: "threadId required" }, { status: 400 })
  }

  const googleModel = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_KEY,
  })
  if (!googleModel) {
    return NextResponse.json(
      { error: "Google AI not initialized" },
      { status: 500 }
    )
  }

  const thread = await fetchQuery(api.chat.getThread, { threadId }, { token })
  if (!thread || thread.deletedAt !== undefined) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 })
  }

  const storedMessages = await fetchQuery(
    api.chat.listMessages,
    { threadId },
    { token }
  )
  const messages: UIMessage[] = storedMessages.map((m) =>
    fromStoredThreadMessage({
      messageId: m.messageId,
      role: m.role,
      model: m.model,
      content: m.content,
    })
  )

  const existingSummary = thread.summary
  const previousCompaction = existingSummary
    ? {
        schemaVersion: 1 as const,
        summaryText: existingSummary.summaryText,
        summarizedThroughMessageId: existingSummary.summarizedThroughMessageId,
        updatedAt: existingSummary.updatedAt,
        threadState: existingSummary.threadState ?? undefined,
        compactionMetadata: existingSummary.compactionMetadata ?? undefined,
      }
    : undefined

  const plan = planCompaction({
    messages,
    previousCompaction,
    config: DEFAULT_COMPACTION_CONFIG,
    forceManual: true,
  })

  if (!plan.shouldCompact || plan.messagesToSummarize.length === 0) {
    return NextResponse.json({
      ok: true,
      compacted: false,
      message: "Nothing to compact",
    })
  }

  const transcript = formatMessagesForSummarizer(plan.messagesToSummarize, {
    includeToolText: false,
    maxCharsPerMessage: 8000,
  })

  if (transcript.length < DEFAULT_COMPACTION_CONFIG.minTranscriptChars) {
    return NextResponse.json({
      ok: true,
      compacted: false,
      message: "Not enough content to compact",
    })
  }

  try {
    const [updatedSummary, updatedState] = await Promise.all([
      generateThreadSummary({
        googleModel,
        previousSummary: existingSummary?.summaryText ?? "",
        transcript,
        maxSummaryChars: DEFAULT_COMPACTION_CONFIG.maxSummaryChars,
      }),
      generateStructuredThreadState({
        googleModel,
        previousState: existingSummary?.threadState ?? null,
        transcript,
      }),
    ])

    if (!updatedSummary) {
      return NextResponse.json(
        { error: "Compaction generation failed" },
        { status: 500 }
      )
    }

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
      { token }
    )

    return NextResponse.json({
      ok: true,
      compacted: true,
      messageCountAtCompaction: plan.currentMessageCount,
    })
  } catch (error) {
    console.error("Manual compaction failed:", error)
    return NextResponse.json(
      { error: "Compaction failed" },
      { status: 500 }
    )
  }
}
