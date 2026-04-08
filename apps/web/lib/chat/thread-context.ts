export function formatTimestamp(value?: number) {
  if (!value) return "—"
  return new Date(value).toLocaleString()
}

type MessageWithUsage = {
  role?: string
  usage?: {
    inputTokens?: number
  }
}

function trimTrailingZeros(value: number): string {
  return value.toFixed(1).replace(/\.0$/, "")
}

export function formatTokenCount(value?: number): string {
  if (!Number.isFinite(value) || !value || value <= 0) return "—"
  if (value >= 1_000_000) {
    return `${trimTrailingZeros(value / 1_000_000)}M`
  }
  if (value >= 1_000) {
    return `${trimTrailingZeros(value / 1_000)}k`
  }
  return String(value)
}

export function formatUsdMicros(value?: number): string {
  if (!Number.isFinite(value) || value === undefined) return "—"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value / 1_000_000)
}

export type ContextHealthState = "healthy" | "elevated" | "high" | "unknown"

export function getContextUsageRatio({
  totalTokens,
  contextLength,
}: {
  totalTokens?: number
  contextLength?: number
}) {
  if (
    !Number.isFinite(totalTokens) ||
    totalTokens === undefined ||
    totalTokens <= 0 ||
    !Number.isFinite(contextLength) ||
    contextLength === undefined ||
    contextLength <= 0
  ) {
    return null
  }

  return Math.min(100, Math.round((totalTokens / contextLength) * 100))
}

export function getContextHealthState(ratio: number | null): ContextHealthState {
  if (ratio === null) return "unknown"
  if (ratio >= 85) return "high"
  if (ratio >= 60) return "elevated"
  return "healthy"
}

export function getContextHealthLabel(state: ContextHealthState) {
  switch (state) {
    case "healthy":
      return "Healthy"
    case "elevated":
      return "Elevated"
    case "high":
      return "High"
    default:
      return "Unknown"
  }
}

export function getLastAssistantInputTokens(
  messages: MessageWithUsage[] | undefined
) {
  if (!messages) return undefined

  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const message = messages[i]
    if (message.role !== "assistant") continue
    if (typeof message.usage?.inputTokens === "number") {
      return message.usage.inputTokens
    }
  }

  return undefined
}
