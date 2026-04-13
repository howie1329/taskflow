import { NextResponse } from "next/server"
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server"
import { fetchQuery } from "convex/nextjs"
import { api } from "@/convex/_generated/api"
import {
  convertStoredMessages,
  runCompactionPipeline,
} from "@/lib/chat/compaction"

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

  const thread = await fetchQuery(api.chat.getThread, { threadId }, { token })
  if (!thread || thread.deletedAt !== undefined) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 })
  }

  const storedMessages = await fetchQuery(
    api.chat.listMessages,
    { threadId },
    { token },
  )
  const messages = convertStoredMessages(storedMessages)

  try {
    const result = await runCompactionPipeline({
      threadId,
      messages,
      existingSummary: thread.summary,
      forceManual: true,
      token,
    })

    if (!result) {
      return NextResponse.json({
        ok: true,
        compacted: false,
        message: "Nothing to compact",
      })
    }

    return NextResponse.json({
      ok: true,
      compacted: true,
    })
  } catch (error) {
    console.error("Manual compaction failed:", error)
    return NextResponse.json(
      { error: "Compaction failed" },
      { status: 500 },
    )
  }
}
