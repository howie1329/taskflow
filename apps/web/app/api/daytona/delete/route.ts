import { NextResponse } from "next/server"
import { deleteSandbox } from "@/lib/daytona/server"
import { clearThreadDaytonaState, getAuthedThread, jsonError } from "../_shared"

type DeleteRequestBody = {
  threadId?: string
}

export async function POST(req: Request) {
  let body: DeleteRequestBody
  try {
    body = await req.json()
  } catch {
    return jsonError("Invalid request body", 400)
  }

  const threadId = body.threadId?.trim()
  if (!threadId) {
    return jsonError("threadId is required", 400)
  }

  const { token, thread, error } = await getAuthedThread(threadId)
  if (!token || !thread) {
    return error ?? jsonError("Thread not found", 404)
  }

  if (!thread.daytona?.sandboxId) {
    return jsonError("This thread does not have a Daytona instance.", 409)
  }

  try {
    await deleteSandbox(thread.daytona.sandboxId)
    await clearThreadDaytonaState({
      token,
      threadId,
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to delete the Daytona instance."

    return jsonError(message, 500)
  }
}
