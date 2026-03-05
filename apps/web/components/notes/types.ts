export interface NotesProject {
  _id: string
  title: string
  icon: string
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
}

export type ViewMode = "byProject" | "recent" | "pinned"

export type NoteCollabSuggestionKind =
  | "clarity"
  | "structure"
  | "action_items"

export interface NoteCollabSuggestion {
  id: string
  title: string
  detail: string
  kind: NoteCollabSuggestionKind
  confidence: number
}

export interface NoteCollabState {
  status: "idle" | "running" | "ready" | "error"
  summary: string
  suggestions: NoteCollabSuggestion[]
  actionItems: string[]
  updatedAt: number | null
  error: string | null
}
