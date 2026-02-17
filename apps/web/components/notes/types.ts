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
