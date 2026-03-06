export interface NotesProject {
  _id: string
  title: string
  icon: string
}

export interface NoteReviewerIssue {
  title: string
  detail: string
  severity: "low" | "medium" | "high"
}

export interface NoteReviewerSuggestion {
  id: string
  title: string
  detail: string
  kind: "clarity" | "structure" | "scannability" | "actionability"
}

export interface NoteReviewer {
  schemaVersion: number
  contentSignature: string
  summary: string
  noteType: string
  scores: {
    clarity: number
    structure: number
    scannability: number
    actionability: number
  }
  topIssues: NoteReviewerIssue[]
  suggestions: NoteReviewerSuggestion[]
  actionItems: string[]
  openQuestions: string[]
  updatedAt: number
}

export interface NoteReviewerRunState {
  status: "idle" | "reviewing" | "ready" | "error"
  error: string | null
}

export interface Note {
  _id: string
  projectId: string | "__none__"
  title: string
  content: string
  contentText: string
  pinned: boolean
  createdAt: number
  updatedAt: number
  reviewer?: NoteReviewer
}

export type ViewMode = "byProject" | "recent" | "pinned"
