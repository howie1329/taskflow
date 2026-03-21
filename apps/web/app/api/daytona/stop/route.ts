import { NextResponse } from "next/server"
import { stopSandbox } from "@/lib/daytona/server"
import { getAuthedThread, jsonError, saveThreadDaytonaState } from "../_shared"

type StopRequestBody = {
  threadId?: string
}

export async function POST(req: Request) {
  let body: StopRequestBody
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

  if (thread.daytona.status === "stopped") {
    return jsonError("This Daytona instance is already stopped.", 409)
  }

  try {
    await stopSandbox(thread.daytona.sandboxId)
    const daytona = await saveThreadDaytonaState({
      token,
      threadId,
      repoUrl: thread.daytona.repoUrl,
      clonePath: thread.daytona.clonePath,
      sandboxId: thread.daytona.sandboxId,
      status: "stopped",
      cloneStatus: thread.daytona.cloneStatus,
      createdAt: thread.daytona.createdAt,
    })

    return NextResponse.json({
      success: true,
      daytona: daytona?.daytona ?? null,
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to stop the Daytona instance."

    return jsonError(message, 500)
  }
}
