"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export interface Thread {
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

export function useThreads(projectId?: Id<"projects">) {
  const threads = useQuery(api.chat.listThreads, { projectId }) as
    | Thread[]
    | undefined;
  const updateTitle = useMutation(api.chat.updateThreadTitle);
  const togglePin = useMutation(api.chat.setThreadPinned);
  const softDelete = useMutation(api.chat.softDeleteThread);

  return {
    threads: threads ?? [],
    isLoading: threads === undefined,
    updateTitle,
    togglePin,
    softDelete,
  };
}
