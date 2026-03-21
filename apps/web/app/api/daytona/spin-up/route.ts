import { NextResponse } from "next/server"
import { createSandboxAndCloneRepo, parseGitHubRepoUrl } from "@/lib/daytona/server"
import { getAuthedThread, jsonError, saveThreadDaytonaState } from "../_shared"

type SpinUpRequestBody = {
  threadId?: string
  repoUrl?: string
}

export async function POST(req: Request) {
  let body: SpinUpRequestBody
  try {
    body = await req.json()
  } catch {
    return jsonError("Invalid request body", 400)
  }

  const threadId = body.threadId?.trim()
  const repoUrlInput = body.repoUrl?.trim()

  if (!threadId || !repoUrlInput) {
    return jsonError("threadId and repoUrl are required", 400)
  }

  let parsedRepo
  try {
    parsedRepo = parseGitHubRepoUrl(repoUrlInput)
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Invalid repository URL",
      400,
    )
  }

  const { token, thread, error } = await getAuthedThread(threadId)
  if (!token || !thread) {
    return error ?? jsonError("Thread not found", 404)
  }

  if (thread.daytona && thread.daytona.status !== "idle") {
    return jsonError("This thread already has a Daytona instance.", 409)
  }

  const createdAt = thread.daytona?.createdAt ?? Date.now()
  await saveThreadDaytonaState({
    token,
    threadId,
    repoUrl: parsedRepo.repoUrl,
    sandboxId: thread.daytona?.sandboxId,
    status: "provisioning",
    cloneStatus: "running",
    createdAt,
  })

  try {
    const result = await createSandboxAndCloneRepo(parsedRepo.repoUrl)
    const daytona = await saveThreadDaytonaState({
      token,
      threadId,
      repoUrl: result.repoUrl,
      sandboxId: result.sandboxId,
      status: "ready",
      cloneStatus: "succeeded",
      createdAt,
    })

    return NextResponse.json({
      success: true,
      daytona: daytona?.daytona ?? null,
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to spin up the Daytona instance."

    await saveThreadDaytonaState({
      token,
      threadId,
      repoUrl: parsedRepo.repoUrl,
      sandboxId: thread.daytona?.sandboxId,
      status: "failed",
      cloneStatus: "failed",
      createdAt,
      errorMessage: message,
    })

    return jsonError(message, 500)
  }
}
