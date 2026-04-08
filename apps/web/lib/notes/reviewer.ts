import { z } from "zod"

export const REVIEWER_SCORE_MIN = 1
export const REVIEWER_SCORE_MAX = 5

export const reviewerScoreSchema = z.number().int().min(REVIEWER_SCORE_MIN).max(REVIEWER_SCORE_MAX)

export const reviewerIssueSchema = z.object({
  title: z.string().min(1).max(120),
  detail: z.string().min(1).max(400),
  severity: z.enum(["low", "medium", "high"]),
})

export const reviewerSuggestionSchema = z.object({
  id: z.string().min(1).max(64),
  title: z.string().min(1).max(120),
  detail: z.string().min(1).max(400),
  kind: z.enum(["clarity", "structure", "scannability", "actionability"]),
})

export const noteReviewerResultSchema = z.object({
  summary: z.string().min(1).max(500),
  noteType: z.string().min(1).max(80),
  scores: z.object({
    clarity: reviewerScoreSchema,
    structure: reviewerScoreSchema,
    scannability: reviewerScoreSchema,
    actionability: reviewerScoreSchema,
  }),
  topIssues: z.array(reviewerIssueSchema).max(4),
  suggestions: z.array(reviewerSuggestionSchema).max(5),
  actionItems: z.array(z.string().min(1).max(200)).max(8),
  openQuestions: z.array(z.string().min(1).max(200)).max(8),
})

export type NoteReviewerResult = z.infer<typeof noteReviewerResultSchema>
export type NoteReviewerIssue = z.infer<typeof reviewerIssueSchema>
export type NoteReviewerSuggestion = z.infer<typeof reviewerSuggestionSchema>

export function createReviewerSignature({
  title,
  contentText,
}: {
  title: string
  contentText: string
}) {
  return `${title.trim()}::${contentText.replace(/\s+/g, " ").trim()}`
}

export function createReviewerChatPrompt(suggestionTitle: string, suggestionDetail: string) {
  return `Apply this reviewer suggestion to the current note: ${suggestionTitle}. ${suggestionDetail}`
}
