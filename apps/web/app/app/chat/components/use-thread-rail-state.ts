"use client";

import { useMemo, useState } from "react";
import type { ChatProject, ChatThread } from "./thread-types";

export function useThreadRailState({
  threads,
  projects,
}: {
  threads: ChatThread[];
  projects: ChatProject[];
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const { filteredThreads, pinnedThreads, recentThreads, groupedByProject } =
    useMemo(() => {
      const query = searchQuery.trim().toLowerCase();
      const filteredThreads = query
        ? threads.filter(
            (thread) =>
              thread.title.toLowerCase().includes(query) ||
              thread.snippet.toLowerCase().includes(query),
          )
        : threads;

      const pinnedThreads = filteredThreads.filter((thread) => thread.pinned);
      const recentThreads = filteredThreads.filter(
        (thread) => !thread.pinned && !thread.projectId,
      );
      const groupedByProject = projects
        .map((project) => ({
          project,
          threads: filteredThreads.filter(
            (thread) => thread.projectId === project.id && !thread.pinned,
          ),
        }))
        .filter((group) => group.threads.length > 0);

      return {
        filteredThreads,
        pinnedThreads,
        recentThreads,
        groupedByProject,
      };
    }, [projects, searchQuery, threads]);

  const projectThreadCount = groupedByProject.reduce(
    (sum, group) => sum + group.threads.length,
    0,
  );

  return {
    searchQuery,
    setSearchQuery,
    filteredThreads,
    pinnedThreads,
    recentThreads,
    groupedByProject,
    projectThreadCount,
  };
}
