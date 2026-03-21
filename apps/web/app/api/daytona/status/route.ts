import { NextResponse } from "next/server"
import { getSandboxStatus } from "@/lib/daytona/server"
import { getAuthedThread, jsonError, saveThreadDaytonaState } from "../_shared"

type StatusRequestBody = {
  threadId?: string
}

const mapSandboxState = (value: string | null) => {
  if (value === "stopped") {
    return "stopped" as const
  }

  if (value === "started") {
    return "ready" as const
  }

  return "failed" as const
}

export async function POST(req: Request) {
  let body: StatusRequestBody
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
    const sandboxState = await getSandboxStatus(thread.daytona.sandboxId)
    const status = mapSandboxState(sandboxState)
    const daytona = await saveThreadDaytonaState({
      token,
      threadId,
      repoUrl: thread.daytona.repoUrl,
      clonePath: thread.daytona.clonePath,
      sandboxId: thread.daytona.sandboxId,
      status,
      cloneStatus: thread.daytona.cloneStatus,
      createdAt: thread.daytona.createdAt,
      errorMessage: status === "failed" ? "Unable to confirm Daytona status." : undefined,
    })

    return NextResponse.json({
      success: true,
      daytona: daytona?.daytona ?? null,
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to refresh Daytona status."

    await saveThreadDaytonaState({
      token,
      threadId,
      repoUrl: thread.daytona.repoUrl,
      clonePath: thread.daytona.clonePath,
      sandboxId: thread.daytona.sandboxId,
      status: "failed",
      cloneStatus: thread.daytona.cloneStatus,
      createdAt: thread.daytona.createdAt,
      errorMessage: message,
    })

    return jsonError(message, 500)
  }
}
