import { generateText, Output } from "ai"
import type { LanguageModel } from "ai"
import { z } from "zod"
import type { ThreadState } from "./types.js"

const THREAD_STATE_SCHEMA = z.object({
  activeGoal: z.string().optional(),
  currentTopic: z.string().optional(),
  importantFacts: z.array(z.string()),
  decisions: z.array(z.string()),
  unresolvedItems: z.array(z.string()),
  referencedEntities: z.array(z.string()),
  userPreferences: z.array(z.string()),
  recentToolFindings: z.array(z.string()),
  warningsOrRisks: z.array(z.string()),
})

function emptyThreadState(): ThreadState {
  return {
    importantFacts: [],
    decisions: [],
    unresolvedItems: [],
    referencedEntities: [],
    userPreferences: [],
    recentToolFindings: [],
    warningsOrRisks: [],
  }
}

/** Generate rolling summary from transcript. Returns empty string on failure. */
export async function generateThreadSummary({
  model,
  previousSummary,
  transcript,
  maxSummaryChars,
}: {
  model: LanguageModel
  previousSummary: string
  transcript: string
  maxSummaryChars: number
}): Promise<string> {
  if (!model) return ""

  const boundedPrevious = previousSummary.trim().slice(0, maxSummaryChars)
  const boundedTranscript = transcript.trim().slice(-12000)

  try {
    const { text } = await generateText({
      model,
      system:
        "You maintain a rolling conversation summary for context compression. Keep it concise, factual, action-oriented. Preserve: user goals, decisions, unresolved items, important tool outputs, preferences.",
      prompt: `Update the rolling summary.

Structure (plain markdown):
- **User profile & preferences**
- **Decisions & outcomes**
- **Open tasks & unresolved questions**
- **Active context for next reply**

Rules: Keep only useful info. Remove stale items. Short bullets. No tool JSON dumps. Under ${maxSummaryChars} chars total.

Existing summary:
${boundedPrevious || "None"}

New transcript:
${boundedTranscript}

Return only the updated markdown summary.`,
      temperature: 0.2,
      maxRetries: 2,
    })

    return (text?.trim() ?? "").slice(0, maxSummaryChars)
  } catch (error) {
    console.error("Context compaction: generateThreadSummary failed", error)
    return ""
  }
}

/** Generate structured thread state from transcript. Returns empty state on failure. */
export async function generateStructuredThreadState({
  model,
  previousState,
  transcript,
}: {
  model: LanguageModel
  previousState: ThreadState | null
  transcript: string
}): Promise<ThreadState> {
  if (!model) return emptyThreadState()

  const boundedTranscript = transcript.trim().slice(-8000)

  try {
    const { output } = await generateText({
      model,
      output: Output.object({ schema: THREAD_STATE_SCHEMA }),
      system: `Extract structured thread memory from conversation. Be concise. Each array item should be a short string (1-2 sentences max). Merge with previous state when provided.`,
      prompt: `Previous state (merge/update): ${JSON.stringify(previousState ?? emptyThreadState())}

Transcript:
${boundedTranscript}

Extract and return the updated structured state.`,
      temperature: 0.2,
      maxRetries: 2,
    })

    return {
      activeGoal: output.activeGoal,
      currentTopic: output.currentTopic,
      importantFacts: output.importantFacts ?? [],
      decisions: output.decisions ?? [],
      unresolvedItems: output.unresolvedItems ?? [],
      referencedEntities: output.referencedEntities ?? [],
      userPreferences: output.userPreferences ?? [],
      recentToolFindings: output.recentToolFindings ?? [],
      warningsOrRisks: output.warningsOrRisks ?? [],
    }
  } catch (error) {
    console.error("Context compaction: generateStructuredThreadState failed", error)
    return previousState ?? emptyThreadState()
  }
}
