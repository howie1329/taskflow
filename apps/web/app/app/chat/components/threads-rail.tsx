"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  Cancel01Icon,
  MessageQuestionIcon,
  PinIcon,
  PlusSignIcon,
  SearchIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { SHORTCUT_DISPLAY, SHORTCUT_HINT, SHORTCUT_KEYS } from "@/lib/keyboard-shortcuts";
import { shouldIgnoreGlobalShortcut } from "@/lib/should-ignore-global-shortcut";
import type { ChatProject, ChatThread } from "./thread-types";
import { ProjectThreadGroup } from "./project-thread-group";
import { ThreadRow } from "./thread-row";
import { ThreadSection } from "./thread-section";
import { useThreadRailState } from "./use-thread-rail-state";

interface ThreadsRailProps {
  className?: string;
  variant?: "rail" | "sidebar";
  isNewChat: boolean;
  threads: ChatThread[];
  projects?: ChatProject[];
  activeThreadId: string | null;
  onRename: (threadId: string, title: string) => Promise<void>;
  onTogglePin: (threadId: string, pinned: boolean) => Promise<void>;
  onDeleteRequest: (threadId: string | null) => void;
}

export function ThreadsRail({
  className,
  variant = "rail",
  isNewChat,
  threads,
  projects = [],
  activeThreadId,
  onRename,
  onTogglePin,
  onDeleteRequest,
}: ThreadsRailProps) {
  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isPinnedOpen, setIsPinnedOpen] = useState(true);
  const [isProjectsOpen, setIsProjectsOpen] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isSidebar = variant === "sidebar";
  const {
    searchQuery,
    setSearchQuery,
    filteredThreads,
    pinnedThreads,
    recentThreads,
    groupedByProject,
    projectThreadCount,
  } = useThreadRailState({
    threads,
    projects,
  });

  // Editing handlers
  const handleStartEdit = (thread: ChatThread) => {
    setEditingThreadId(thread.id);
    setEditingTitle(thread.title);
  };

  const handleCancelEdit = () => {
    setEditingThreadId(null);
  };

  const handleCommitEdit = async () => {
    if (!editingThreadId) return;
    const trimmed = editingTitle.trim() || "Untitled chat";
    await onRename(editingThreadId, trimmed);
    setEditingThreadId(null);
  };

  const handleTogglePin = (thread: ChatThread) => {
    void onTogglePin(thread.id, !thread.pinned);
  };

  const getThreadProject = (thread: ChatThread) =>
    thread.projectId
      ? (projects.find((p) => p.id === thread.projectId) ?? null)
      : null;

  const renderThreadRow = (thread: ChatThread) => (
    <ThreadRow
      key={thread.id}
      thread={thread}
      isActive={thread.id === activeThreadId}
      isEditing={editingThreadId === thread.id}
      editingTitle={editingTitle}
      projectIcon={getThreadProject(thread)?.icon}
      onEditTitleChange={setEditingTitle}
      onStartEdit={() => handleStartEdit(thread)}
      onCancelEdit={handleCancelEdit}
      onCommitEdit={() => void handleCommitEdit()}
      onTogglePin={() => handleTogglePin(thread)}
      onDeleteRequest={() => onDeleteRequest(thread.id)}
    />
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SHORTCUT_KEYS.localSearch &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey &&
        !shouldIgnoreGlobalShortcut(event.target)
      ) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <nav
      aria-label="Threads"
      className={cn(
        "flex min-h-0 min-w-0 flex-col overflow-hidden text-foreground",
        isSidebar
          ? "w-full flex-1 bg-transparent"
          : "w-full shrink-0 bg-background",
        className,
      )}
    >
      {/* Header: label + new button + search */}
      <div
        className={cn(
          "sticky top-0 z-10 bg-transparent space-y-2",
          isSidebar ? "p-2" : "p-2.5 md:p-3",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "font-medium text-muted-foreground",
              isSidebar
                ? "text-[9px] uppercase tracking-wide"
                : "text-sm",
            )}
          >
            Threads
          </span>
          <Link href="/app/chat">
            <Button
              className={cn(
                "rounded-md transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]",
                isSidebar
                  ? "size-7 shrink-0 p-0"
                  : "h-8 px-3 text-xs font-medium",
                isNewChat && "bg-muted text-foreground",
              )}
              variant={isNewChat ? "secondary" : "outline"}
              aria-label="New chat"
              title={`New chat (${SHORTCUT_HINT.createNew})`}
            >
              <HugeiconsIcon
                icon={PlusSignIcon}
                className={cn(
                  "shrink-0",
                  isSidebar ? "size-3" : "mr-2 size-3.5",
                )}
                strokeWidth={2}
              />
              {isSidebar ? (
                <span className="sr-only">New chat</span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <span>New</span>
                  <Kbd className="h-5 text-[10px]">{SHORTCUT_DISPLAY.createNew}</Kbd>
                </span>
              )}
            </Button>
          </Link>
        </div>

        <InputGroup className="w-full">
          <InputGroupAddon>
            <HugeiconsIcon
              icon={SearchIcon}
              className={cn(
                "stroke-2 shrink-0",
                isSidebar ? "size-3" : "size-4",
              )}
            />
          </InputGroupAddon>
          <InputGroupInput
            ref={searchInputRef}
            placeholder="Search threads..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 text-xs"
          />
          {searchQuery && (
            <InputGroupAddon>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setSearchQuery("")}
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
          {!searchQuery && (
            <InputGroupAddon>
              <Kbd className="h-5 text-[10px]">{SHORTCUT_DISPLAY.localSearch}</Kbd>
            </InputGroupAddon>
          )}
        </InputGroup>
      </div>

      {/* Thread list */}
      <div className="no-scrollbar flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden">
        <div
          className={cn(
            "w-full max-w-full min-w-0",
            isSidebar ? "space-y-1.5 p-2" : "space-y-2 p-2 md:space-y-3 md:p-3",
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
                onClick={() => setSearchQuery("")}
                className="mt-2"
              >
                Clear search
              </Button>
            </div>
          ) : (
            <>
              {pinnedThreads.length > 0 && (
                <Collapsible
                  open={isPinnedOpen}
                  onOpenChange={setIsPinnedOpen}
                  className="space-y-1.5 w-full max-w-full"
                >
                  <CollapsibleTrigger className="group flex h-8 w-full items-center rounded-md px-3 text-left transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
                    <div className="flex w-full items-center justify-between gap-1.5">
                      <ThreadSection
                        label="Pinned"
                        count={pinnedThreads.length}
                        icon={
                          <HugeiconsIcon
                            icon={PinIcon}
                            className="size-3 shrink-0 text-muted-foreground"
                            strokeWidth={2}
                          />
                        }
                      />
                      <HugeiconsIcon
                        icon={ArrowDown01Icon}
                        className="size-3 shrink-0 text-muted-foreground transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-data-[state=open]:rotate-180"
                        strokeWidth={2}
                      />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-0.5 w-full max-w-full">
                    {pinnedThreads.map(renderThreadRow)}
                  </CollapsibleContent>
                </Collapsible>
              )}

              {groupedByProject.length > 0 && (
                <Collapsible
                  open={isProjectsOpen}
                  onOpenChange={setIsProjectsOpen}
                  className={cn(
                    "w-full max-w-full",
                    pinnedThreads.length > 0 ? "mt-3 pt-2" : "",
                    isSidebar ? "space-y-2" : "space-y-2.5",
                  )}
                >
                  <CollapsibleTrigger className="group flex h-8 w-full items-center rounded-md px-3 text-left transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
                    <div className="flex w-full items-center justify-between gap-1.5">
                      <ThreadSection
                        label="Projects"
                        count={projectThreadCount}
                      />
                      <HugeiconsIcon
                        icon={ArrowDown01Icon}
                        className="size-3 shrink-0 text-muted-foreground transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-data-[state=open]:rotate-180"
                        strokeWidth={2}
                      />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-0.5 w-full max-w-full">
                    {groupedByProject.map((group) => (
                      <ProjectThreadGroup
                        key={group.project.id}
                        project={group.project}
                        threads={group.threads}
                      >
                        {group.threads.map(renderThreadRow)}
                      </ProjectThreadGroup>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}

              {recentThreads.length > 0 && (
                <div className="space-y-1.5 w-full max-w-full">
                  <ThreadSection label="Latest" count={recentThreads.length} />
                  <div className="space-y-0.5 w-full max-w-full">
                    {recentThreads.map(renderThreadRow)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
