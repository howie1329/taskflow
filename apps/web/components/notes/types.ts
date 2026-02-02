export interface MockProject {
  _id: string;
  title: string;
  icon: string;
}

export interface MockNote {
  _id: string;
  projectId: string | "__none__";
  title: string;
  content: string;
  pinned: boolean;
  createdAt: number;
  updatedAt: number;
}

export type ViewMode = "byProject" | "recent" | "pinned";
