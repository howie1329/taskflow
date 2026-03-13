import type { Id } from "@/convex/_generated/dataModel";

export interface ChatThread {
  id: string;
  title: string;
  snippet: string;
  updatedAt: number;
  createdAt: number;
  pinned: boolean;
  projectId?: string;
}

export interface ConvexThread {
  _id: Id<"thread">;
  userId: string;
  threadId: string;
  title: string;
  snippet?: string;
  pinned?: boolean;
  projectId?: Id<"projects">;
  model?: string;
  scope?: "workspace" | "project";
  deletedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export function convertToChatThread(thread: ConvexThread): ChatThread {
  return {
    id: thread.threadId,
    title: thread.title,
    snippet: thread.snippet || "",
    updatedAt: thread.updatedAt,
    createdAt: thread.createdAt,
    pinned: thread.pinned || false,
    projectId: thread.projectId,
  };
}

export interface ChatProject {
  id: string;
  title: string;
  icon: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}
