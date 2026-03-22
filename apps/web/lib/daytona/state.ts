export type DaytonaStatus =
  | "idle"
  | "provisioning"
  | "ready"
  | "stopped"
  | "failed"

export type DaytonaCloneStatus =
  | "not_started"
  | "running"
  | "succeeded"
  | "failed"

export type DaytonaThreadState = {
  repoUrl: string
  clonePath?: string
  sandboxId?: string
  status: DaytonaStatus
  cloneStatus: DaytonaCloneStatus
  createdAt: number
  updatedAt: number
  errorMessage?: string
}

export type DaytonaStatusPayload = {
  exists: boolean
  repoUrl: string | null
  sandboxId: string | null
  status: DaytonaStatus
  cloneStatus: DaytonaCloneStatus
  updatedAt: number | null
  errorMessage: string | null
}

export const EMPTY_DAYTONA_STATUS: DaytonaStatusPayload = {
  exists: false,
  repoUrl: null,
  sandboxId: null,
  status: "idle",
  cloneStatus: "not_started",
  updatedAt: null,
  errorMessage: null,
}

export const buildDaytonaState = ({
  repoUrl,
  status,
  cloneStatus,
  createdAt,
  clonePath,
  sandboxId,
  errorMessage,
}: {
  repoUrl: string
  clonePath?: string
  status: DaytonaStatus
  cloneStatus: DaytonaCloneStatus
  createdAt: number
  sandboxId?: string
  errorMessage?: string
}): DaytonaThreadState => ({
  repoUrl,
  clonePath,
  sandboxId,
  status,
  cloneStatus,
  createdAt,
  updatedAt: Date.now(),
  errorMessage,
})

export const toDaytonaStatusPayload = (
  daytona?: DaytonaThreadState | null,
): DaytonaStatusPayload => {
  if (!daytona) {
    return EMPTY_DAYTONA_STATUS
  }

  return {
    exists: true,
    repoUrl: daytona.repoUrl,
    sandboxId: daytona.sandboxId ?? null,
    status: daytona.status,
    cloneStatus: daytona.cloneStatus,
    updatedAt: daytona.updatedAt,
    errorMessage: daytona.errorMessage ?? null,
  }
}
