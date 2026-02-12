"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  MessageQuestionIcon,
  PinIcon,
  PlusSignIcon,
  SearchIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { ChatProject, ChatThread } from "./mock-data";
import { ProjectThreadGroup } from "./project-thread-group";
import { ThreadRow } from "./thread-row";
import { ThreadSection } from "./thread-section";

interface ThreadsRailProps {
  className?: string;
  variant?: "rail" | "sidebar";
  isNewChat: boolean;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  threads: ChatThread[];
  filteredThreads: ChatThread[];
  pinnedThreads: ChatThread[];
  recentThreads: ChatThread[];
  groupedByProject: { project: ChatProject; threads: ChatThread[] }[];
  projects?: ChatProject[];
  activeThreadId: string | null;
  editingThreadId: string | null;
  editingTitle: string;
  onEditTitleChange: (value: string) => void;
  onStartEdit: (thread: ChatThread) => void;
  onCancelEdit: () => void;
  onCommitEdit: () => void;
  onTogglePin: (threadId: string) => void;
  onDeleteRequest: (threadId: string | null) => void;
}

export function ThreadsRail({
  className,
  variant = "rail",
  isNewChat,
  searchQuery,
  onSearchQueryChange,
  threads,
  filteredThreads,
  pinnedThreads,
  recentThreads,
  groupedByProject,
  projects = [],
  activeThreadId,
  editingThreadId,
  editingTitle,
  onEditTitleChange,
  onStartEdit,
  onCancelEdit,
  onCommitEdit,
  onTogglePin,
  onDeleteRequest,
}: ThreadsRailProps) {
  // Helper to get project info for a thread
  const getThreadProject = (thread: ChatThread) => {
    if (!thread.projectId) return null;
    return projects.find((p) => p.id === thread.projectId) || null;
  };
  const projectThreadCount = groupedByProject.reduce(
    (total, group) => total + group.threads.length,
    0,
  );

  const isSidebar = variant === "sidebar";

  return (
    <nav
      aria-label="Threads"
      className={cn(
        "flex min-h-0 flex-col text-foreground",
        isSidebar
          ? "w-full flex-1 bg-transparent"
          : "w-full shrink-0 border-r border-border/50 bg-background",
        className,
      )}
    >
      <div
        className={cn(
          "sticky top-0 z-10 border-b border-border/50 bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/80 space-y-2",
          isSidebar ? "p-2" : "p-3",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "font-medium text-muted-foreground",
              isSidebar ? "text-xs" : "text-sm",
            )}
          >
            Threads
          </span>
          <Link href="/app/chat">
            <Button
              className={cn(
                "rounded-lg",
                isSidebar ? "h-7 px-2 text-xs" : "h-8 px-3 text-xs",
                isNewChat && "bg-muted text-foreground",
              )}
              variant={isNewChat ? "secondary" : "outline"}
            >
              <HugeiconsIcon
                icon={PlusSignIcon}
                className={cn("mr-1", isSidebar ? "size-3" : "size-3.5 mr-2")}
                strokeWidth={2}
              />
              {isSidebar ? "New" : "New"}
            </Button>
          </Link>
        </div>

        <InputGroup className="w-full">
          <InputGroupAddon>
            <HugeiconsIcon
              icon={SearchIcon}
              className={cn("stroke-2", isSidebar ? "size-3.5" : "size-4")}
            />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search threads..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className={cn("text-xs", isSidebar ? "h-7" : "h-8")}
          />
          {searchQuery && (
            <InputGroupAddon>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => onSearchQueryChange("")}
                className="h-5 w-5"
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  className="size-3"
                  strokeWidth={2}
                />
              </Button>
            </InputGroupAddon>
          )}
        </InputGroup>
      </div>

      <ScrollArea className="flex-1 min-h-0 [&>div>div]:w-full!">
        <div
          className={cn(
            "w-full max-w-full",
            isSidebar ? "space-y-2 p-2" : "space-y-3 p-3",
          )}
        >
          {threads.length === 0 ? (
            <Empty className="min-h-[260px]">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HugeiconsIcon
                    icon={MessageQuestionIcon}
                    className="size-5"
                    strokeWidth={2}
                  />
                </EmptyMedia>
                <EmptyTitle>No conversations yet</EmptyTitle>
                <EmptyDescription>
                  Start a new chat to talk to your workspace
                </EmptyDescription>
              </EmptyHeader>
              <Link href="/app/chat">
                <Button size="sm">New chat</Button>
              </Link>
            </Empty>
          ) : filteredThreads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No threads found</p>
              <Button
                variant="link"
                size="sm"
                onClick={() => onSearchQueryChange("")}
                className="mt-2"
              >
                Clear search
              </Button>
            </div>
          ) : (
            <>
              {pinnedThreads.length > 0 && (
                <div className="space-y-1.5 w-full max-w-full">
                  <ThreadSection
                    label="Pinned"
                    count={pinnedThreads.length}
                    icon={
                      <HugeiconsIcon
                        icon={PinIcon}
                        className="size-3 text-muted-foreground"
                        strokeWidth={2}
                      />
                    }
                  />
                  <div className="space-y-0.5 w-full max-w-full">
                    {pinnedThreads.map((thread) => {
                      const threadProject = getThreadProject(thread);
                      return (
                        <ThreadRow
                          key={thread.id}
                          thread={thread}
                          isActive={thread.id === activeThreadId}
                          isEditing={editingThreadId === thread.id}
                          editingTitle={editingTitle}
                          projectIcon={threadProject?.icon}
                          onEditTitleChange={onEditTitleChange}
                          onStartEdit={() => onStartEdit(thread)}
                          onCancelEdit={onCancelEdit}
                          onCommitEdit={onCommitEdit}
                          onTogglePin={() => onTogglePin(thread.id)}
                          onDeleteRequest={() => onDeleteRequest(thread.id)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {recentThreads.length > 0 && (
                <div className="space-y-1.5 w-full max-w-full">
                  <ThreadSection label="Recent" count={recentThreads.length} />
                  <div className="space-y-0.5 w-full max-w-full">
                    {recentThreads.map((thread) => (
                      <ThreadRow
                        key={thread.id}
                        thread={thread}
                        isActive={thread.id === activeThreadId}
                        isEditing={editingThreadId === thread.id}
                        editingTitle={editingTitle}
                        onEditTitleChange={onEditTitleChange}
                        onStartEdit={() => onStartEdit(thread)}
                        onCancelEdit={onCancelEdit}
                        onCommitEdit={onCommitEdit}
                        onTogglePin={() => onTogglePin(thread.id)}
                        onDeleteRequest={() => onDeleteRequest(thread.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {groupedByProject.length > 0 && (
                <>
                  {(pinnedThreads.length > 0 || recentThreads.length > 0) && <Separator />}
                  <div
                    className={cn(
                      "w-full max-w-full",
                      isSidebar ? "space-y-2" : "space-y-2.5",
                    )}
                  >
                    <ThreadSection
                      label="Projects"
                      count={projectThreadCount}
                    />
                    <div className="space-y-0.5 w-full max-w-full">
                      {groupedByProject.map((group) => (
                        <ProjectThreadGroup
                          key={group.project.id}
                          project={group.project}
                          threads={group.threads}
                        >
                          {group.threads.map((thread) => (
                            <ThreadRow
                              key={thread.id}
                              thread={thread}
                              isActive={thread.id === activeThreadId}
                              isEditing={editingThreadId === thread.id}
                              editingTitle={editingTitle}
                              onEditTitleChange={onEditTitleChange}
                              onStartEdit={() => onStartEdit(thread)}
                              onCancelEdit={onCancelEdit}
                              onCommitEdit={onCommitEdit}
                              onTogglePin={() => onTogglePin(thread.id)}
                              onDeleteRequest={() => onDeleteRequest(thread.id)}
                            />
                          ))}
                        </ProjectThreadGroup>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </nav>
  );
}
