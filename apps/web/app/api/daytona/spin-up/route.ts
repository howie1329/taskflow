import { NextResponse } from "next/server"
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server"
import { fetchMutation, fetchQuery } from "convex/nextjs"
import { api } from "@/convex/_generated/api"
import { createSandboxAndCloneRepo, parseGitHubRepoUrl } from "@/lib/daytona/server"

type SpinUpRequestBody = {
  threadId?: string
  repoUrl?: string
}

const jsonError = (error: string, status: number) =>
  NextResponse.json({ error }, { status })

export async function POST(req: Request) {
  const token = await convexAuthNextjsToken()
  if (!token) {
    return jsonError("Unauthorized", 401)
  }

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

  const thread = await fetchQuery(api.chat.getThread, { threadId }, { token })
  if (!thread) {
    return jsonError("Thread not found", 404)
  }

  if (thread.daytona && thread.daytona.status !== "idle") {
    return jsonError("This thread already has a Daytona instance.", 409)
  }

  const createdAt = thread.daytona?.createdAt ?? Date.now()
  const provisioningState = {
    repoUrl: parsedRepo.repoUrl,
    sandboxId: thread.daytona?.sandboxId,
    status: "provisioning" as const,
    cloneStatus: "running" as const,
    createdAt,
    updatedAt: Date.now(),
    errorMessage: undefined,
  }

  await fetchMutation(
    api.chat.setThreadDaytonaState,
    {
      threadId,
      daytona: provisioningState,
    },
    { token },
  )

  let sandboxId: string | undefined = thread.daytona?.sandboxId

  try {
    const result = await createSandboxAndCloneRepo(parsedRepo.repoUrl)
    sandboxId = result.sandboxId

    const readyState = {
      repoUrl: result.repoUrl,
      sandboxId: result.sandboxId,
      status: "ready" as const,
      cloneStatus: "succeeded" as const,
      createdAt,
      updatedAt: Date.now(),
      errorMessage: undefined,
    }

    await fetchMutation(
      api.chat.setThreadDaytonaState,
      {
        threadId,
        daytona: readyState,
      },
      { token },
    )

    return NextResponse.json({
      success: true,
      daytona: readyState,
    })
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to spin up the Daytona instance."

    const failedState = {
      repoUrl: parsedRepo.repoUrl,
      sandboxId,
      status: "failed" as const,
      cloneStatus: "failed" as const,
      createdAt,
      updatedAt: Date.now(),
      errorMessage: message,
    }

    await fetchMutation(
      api.chat.setThreadDaytonaState,
      {
        threadId,
        daytona: failedState,
      },
      { token },
    )

    return jsonError(message, 500)
  }
}
