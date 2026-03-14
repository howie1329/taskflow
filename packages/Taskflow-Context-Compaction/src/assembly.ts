import type { UIMessage } from "ai"
import type { ThreadState } from "./types.js"

const SUMMARY_MESSAGE_ID = "compaction_summary_v1"

function formatThreadStateForPrompt(state: ThreadState): string {
  const parts: string[] = []

  if (state.activeGoal) parts.push(`Active goal: ${state.activeGoal}`)
  if (state.currentTopic) parts.push(`Current topic: ${state.currentTopic}`)
  if (state.importantFacts?.length)
    parts.push(`Facts: ${state.importantFacts.join("; ")}`)
  if (state.decisions?.length)
    parts.push(`Decisions: ${state.decisions.join("; ")}`)
  if (state.unresolvedItems?.length)
    parts.push(`Unresolved: ${state.unresolvedItems.join("; ")}`)
  if (state.referencedEntities?.length)
    parts.push(`Entities: ${state.referencedEntities.join("; ")}`)
  if (state.userPreferences?.length)
    parts.push(`Preferences: ${state.userPreferences.join("; ")}`)
  if (state.recentToolFindings?.length)
    parts.push(`Tool findings: ${state.recentToolFindings.join("; ")}`)
  if (state.warningsOrRisks?.length)
    parts.push(`Warnings: ${state.warningsOrRisks.join("; ")}`)

  if (parts.length === 0) return ""
  return parts.join("\n")
}

/** Assemble final context: summary + structured state + recent messages */
export function assemblePromptContext({
  summaryText,
  threadState,
  messagesToKeep,
}: {
  summaryText: string
  threadState?: ThreadState | null
  messagesToKeep: UIMessage[]
}): UIMessage[] {
  const summaryParts: string[] = []

  if (summaryText?.trim()) {
    summaryParts.push(`Conversation summary:\n${summaryText.trim()}`)
  }

  if (threadState) {
    const stateBlock = formatThreadStateForPrompt(threadState)
    if (stateBlock) {
      summaryParts.push(`\nThread memory:\n${stateBlock}`)
    }
  }

  if (summaryParts.length === 0) return messagesToKeep

  const combined = summaryParts.join("\n\n").trim()
  if (!combined) return messagesToKeep

  const summaryMessage: UIMessage = {
    id: SUMMARY_MESSAGE_ID,
    role: "system",
    parts: [{ type: "text", text: combined }],
  } as UIMessage

  return [summaryMessage, ...messagesToKeep]
}
