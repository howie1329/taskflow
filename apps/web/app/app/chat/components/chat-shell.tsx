"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { ThreadsRail } from "./threads-rail";
import {
  mockThreads,
  mockProjects,
  type ChatThread,
} from "./mock-data";

interface ChatShellProps {
  children: React.ReactNode;
}

export function ChatShell({ children }: ChatShellProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [threads, setThreads] = useState<ChatThread[]>(mockThreads);
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [deleteThreadId, setDeleteThreadId] = useState<string | null>(null);

  const isNewChat = pathname === "/app/chat";
  const isThreadRoute = pathname.startsWith("/app/chat/") && !isNewChat;
  const activeThreadId = isNewChat ? null : pathname.split("/").pop();

  // Filter threads by search
  const filteredThreads = threads.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.snippet.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const pinnedThreads = filteredThreads.filter(
    (t) => t.pinned && !t.projectId,
  );
  const recentThreads = filteredThreads.filter(
    (t) => !t.pinned && !t.projectId,
  );

  const handleStartEdit = (thread: ChatThread) => {
    setEditingThreadId(thread.id);
    setEditingTitle(thread.title);
  };

  const handleCommitEdit = () => {
    if (!editingThreadId) return;
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === editingThreadId
          ? { ...thread, title: editingTitle.trim() || "Untitled chat" }
          : thread,
      ),
    );
    setEditingThreadId(null);
  };

  const handleCancelEdit = () => {
    setEditingThreadId(null);
  };

  const handleTogglePin = (threadId: string) => {
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === threadId ? { ...thread, pinned: !thread.pinned } : thread,
      ),
    );
  };

  const handleDeleteThread = () => {
    if (!deleteThreadId) return;
    setThreads((prev) => prev.filter((thread) => thread.id !== deleteThreadId));
    setDeleteThreadId(null);
  };

  const groupedByProject = mockProjects
    .map((project) => ({
      project,
      threads: filteredThreads.filter(
        (thread) => thread.projectId === project.id,
      ),
    }))
    .filter((group) => group.threads.length > 0);

  return (
    <>
    <div className="flex flex-1 min-h-0 overflow-hidden rounded-xl border border-border/60 bg-card/40 dark:bg-card/20">
        <ThreadsRail
          className={cn(isThreadRoute && "hidden md:flex")}
          isNewChat={isNewChat}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          threads={threads}
          filteredThreads={filteredThreads}
          pinnedThreads={pinnedThreads}
          recentThreads={recentThreads}
          groupedByProject={groupedByProject}
          activeThreadId={activeThreadId}
          editingThreadId={editingThreadId}
          editingTitle={editingTitle}
          onEditTitleChange={setEditingTitle}
          onStartEdit={handleStartEdit}
          onCancelEdit={handleCancelEdit}
          onCommitEdit={handleCommitEdit}
          onTogglePin={handleTogglePin}
          onDeleteRequest={setDeleteThreadId}
        />

        {/* Main Panel */}
        <div
          className={cn(
            "flex-1 min-w-0 flex flex-col bg-background",
            !isThreadRoute && "hidden md:flex",
          )}
        >
          {children}
        </div>
      </div>
      <AlertDialog
        open={!!deleteThreadId}
        onOpenChange={(open) => !open && setDeleteThreadId(null)}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The conversation will be removed
              from your history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteThreadId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteThread}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
