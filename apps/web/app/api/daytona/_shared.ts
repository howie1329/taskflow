import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server"
import { fetchMutation, fetchQuery } from "convex/nextjs"
import { NextResponse } from "next/server"
import { api } from "@/convex/_generated/api"
import { buildDaytonaState, type DaytonaCloneStatus, type DaytonaStatus } from "@/lib/daytona/state"

export const jsonError = (error: string, status: number) =>
  NextResponse.json({ error }, { status })

export const getAuthedThread = async (threadId: string) => {
  const token = await convexAuthNextjsToken()
  if (!token) {
    return { token: null, thread: null, error: jsonError("Unauthorized", 401) }
  }

  const thread = await fetchQuery(api.chat.getThread, { threadId }, { token })
  if (!thread) {
    return { token, thread: null, error: jsonError("Thread not found", 404) }
  }

  return { token, thread, error: null }
}

export const saveThreadDaytonaState = async ({
  token,
  threadId,
  repoUrl,
  clonePath,
  createdAt,
  status,
  cloneStatus,
  sandboxId,
  errorMessage,
}: {
  token: string
  threadId: string
  repoUrl: string
  clonePath?: string
  createdAt: number
  status: DaytonaStatus
  cloneStatus: DaytonaCloneStatus
  sandboxId?: string
  errorMessage?: string
}) =>
  fetchMutation(
    api.chat.setThreadDaytonaState,
    {
      threadId,
      daytona: buildDaytonaState({
        repoUrl,
        clonePath,
        status,
        cloneStatus,
        createdAt,
        sandboxId,
        errorMessage,
      }),
    },
    { token },
  )

export const clearThreadDaytonaState = async ({
  token,
  threadId,
}: {
  token: string
  threadId: string
}) =>
  fetchMutation(
    api.chat.clearThreadDaytonaState,
    { threadId },
    { token },
  )
