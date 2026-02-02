"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlusSignIcon,
  SearchIcon,
  Cancel01Icon,
  PinIcon,
  MessageQuestionIcon,
  MoreHorizontalIcon,
} from "@hugeicons/core-free-icons";
import {
  mockThreads,
  mockProjects,
  type ChatThread,
  type ChatProject,
} from "./mock-data";

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

interface ThreadRowProps {
  thread: ChatThread;
  isActive: boolean;
  project?: ChatProject;
  isEditing: boolean;
  editingTitle: string;
  onEditTitleChange: (value: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onCommitEdit: () => void;
  onTogglePin: () => void;
  onDeleteRequest: () => void;
}

function ThreadRow({
  thread,
  isActive,
  project,
  isEditing,
  editingTitle,
  onEditTitleChange,
  onStartEdit,
  onCancelEdit,
  onCommitEdit,
  onTogglePin,
  onDeleteRequest,
}: ThreadRowProps) {
  const content = (
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {thread.pinned && (
            <HugeiconsIcon
              icon={PinIcon}
              className="size-3 text-muted-foreground shrink-0"
              strokeWidth={2}
            />
          )}
          {isEditing ? (
            <Input
              className="h-7 px-2 text-sm"
              value={editingTitle}
              onChange={(e) => onEditTitleChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onCommitEdit();
                }
                if (e.key === "Escape") {
                  e.preventDefault();
                  onCancelEdit();
                }
              }}
              onBlur={onCommitEdit}
              autoFocus
            />
          ) : (
            <span className="text-sm font-medium truncate">
              {thread.title || "Untitled chat"}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
          {thread.snippet}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatTimeAgo(thread.updatedAt)}
          </span>
          {project && (
            <Badge
              variant="outline"
              className="rounded-none text-[10px] h-4 px-1"
            >
              {project.icon} {project.title}
            </Badge>
          )}
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            className="opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <HugeiconsIcon icon={MoreHorizontalIcon} className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              onStartEdit();
            }}
          >
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              onTogglePin();
            }}
          >
            {thread.pinned ? "Unpin" : "Pin"}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onSelect={(e) => {
              e.preventDefault();
              onDeleteRequest();
            }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  const classes = cn(
    "group block rounded-none border p-3 transition-all duration-200",
    isActive
      ? "border-foreground/40 bg-accent"
      : "border-border hover:border-foreground/20 hover:bg-accent/50",
  );

  if (isEditing) {
    return <div className={classes}>{content}</div>;
  }

  return (
    <Link href={`/app/chat/${thread.id}`} className={classes}>
      {content}
    </Link>
  );
}

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

  const pinnedThreads = filteredThreads.filter((t) => t.pinned);
  const recentThreads = filteredThreads.filter((t) => !t.pinned);

  const getProject = (thread: ChatThread) =>
    thread.projectId
      ? mockProjects.find((p) => p.id === thread.projectId)
      : undefined;

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

  const unassignedThreads = filteredThreads.filter(
    (thread) => !thread.projectId,
  );

  return (
    <>
      <div className="flex flex-1 min-h-0 overflow-hidden rounded-none border">
        {/* Left Rail */}
        <div
          className={cn(
            "w-full md:w-[340px] shrink-0 border-r flex flex-col",
            isThreadRoute && "hidden md:flex",
          )}
        >
          {/* Header */}
          <div className="p-4 border-b space-y-3">
            <Link href="/app/chat">
              <Button
                className={cn(
                  "w-full h-9 rounded-none",
                  isNewChat && "bg-accent text-accent-foreground",
                )}
                variant={isNewChat ? "secondary" : "default"}
              >
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  className="size-4 mr-2"
                  strokeWidth={2}
                />
                New chat
              </Button>
            </Link>

            <InputGroup className="w-full">
              <InputGroupAddon>
                <HugeiconsIcon
                  icon={SearchIcon}
                  className="size-4"
                  strokeWidth={2}
                />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Search threads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-sm"
              />
              {searchQuery && (
                <InputGroupAddon>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setSearchQuery("")}
                    className="h-6 w-6"
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

          {/* Thread List */}
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-4">
              {threads.length === 0 ? (
                <Empty className="min-h-[300px]">
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
                  {/* Pinned Section */}
                  {pinnedThreads.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 px-1">
                        <HugeiconsIcon
                          icon={PinIcon}
                          className="size-3 text-muted-foreground"
                          strokeWidth={2}
                        />
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Pinned
                        </span>
                        <Badge
                          variant="secondary"
                          className="rounded-none text-[10px] h-4 px-1"
                        >
                          {pinnedThreads.length}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {pinnedThreads.map((thread) => (
                          <ThreadRow
                            key={thread.id}
                            thread={thread}
                            isActive={thread.id === activeThreadId}
                            project={getProject(thread)}
                            isEditing={editingThreadId === thread.id}
                            editingTitle={editingTitle}
                            onEditTitleChange={setEditingTitle}
                            onStartEdit={() => handleStartEdit(thread)}
                            onCancelEdit={handleCancelEdit}
                            onCommitEdit={handleCommitEdit}
                            onTogglePin={() => handleTogglePin(thread.id)}
                            onDeleteRequest={() => setDeleteThreadId(thread.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Section */}
                  {recentThreads.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Recent
                        </span>
                        <Badge
                          variant="secondary"
                          className="rounded-none text-[10px] h-4 px-1"
                        >
                          {recentThreads.length}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        {recentThreads.map((thread) => (
                          <ThreadRow
                            key={thread.id}
                            thread={thread}
                            isActive={thread.id === activeThreadId}
                            project={getProject(thread)}
                            isEditing={editingThreadId === thread.id}
                            editingTitle={editingTitle}
                            onEditTitleChange={setEditingTitle}
                            onStartEdit={() => handleStartEdit(thread)}
                            onCancelEdit={handleCancelEdit}
                            onCommitEdit={handleCommitEdit}
                            onTogglePin={() => handleTogglePin(thread.id)}
                            onDeleteRequest={() => setDeleteThreadId(thread.id)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {(groupedByProject.length > 0 ||
                    unassignedThreads.length > 0) && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            By project
                          </span>
                        </div>

                        <div className="space-y-4">
                          {groupedByProject.map((group) => (
                            <div key={group.project.id} className="space-y-2">
                              <div className="flex items-center gap-2 px-1">
                                <span className="text-xs">
                                  {group.project.icon}
                                </span>
                                <span className="text-xs font-medium text-muted-foreground">
                                  {group.project.title}
                                </span>
                                <Badge
                                  variant="secondary"
                                  className="rounded-none text-[10px] h-4 px-1"
                                >
                                  {group.threads.length}
                                </Badge>
                              </div>
                              <div className="space-y-1">
                                {group.threads.map((thread) => (
                                  <ThreadRow
                                    key={thread.id}
                                    thread={thread}
                                    isActive={thread.id === activeThreadId}
                                    project={getProject(thread)}
                                    isEditing={editingThreadId === thread.id}
                                    editingTitle={editingTitle}
                                    onEditTitleChange={setEditingTitle}
                                    onStartEdit={() => handleStartEdit(thread)}
                                    onCancelEdit={handleCancelEdit}
                                    onCommitEdit={handleCommitEdit}
                                    onTogglePin={() =>
                                      handleTogglePin(thread.id)
                                    }
                                    onDeleteRequest={() =>
                                      setDeleteThreadId(thread.id)
                                    }
                                  />
                                ))}
                              </div>
                            </div>
                          ))}

                          {unassignedThreads.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 px-1">
                                <span className="text-xs">📌</span>
                                <span className="text-xs font-medium text-muted-foreground">
                                  No project
                                </span>
                                <Badge
                                  variant="secondary"
                                  className="rounded-none text-[10px] h-4 px-1"
                                >
                                  {unassignedThreads.length}
                                </Badge>
                              </div>
                              <div className="space-y-1">
                                {unassignedThreads.map((thread) => (
                                  <ThreadRow
                                    key={thread.id}
                                    thread={thread}
                                    isActive={thread.id === activeThreadId}
                                    project={getProject(thread)}
                                    isEditing={editingThreadId === thread.id}
                                    editingTitle={editingTitle}
                                    onEditTitleChange={setEditingTitle}
                                    onStartEdit={() => handleStartEdit(thread)}
                                    onCancelEdit={handleCancelEdit}
                                    onCommitEdit={handleCommitEdit}
                                    onTogglePin={() =>
                                      handleTogglePin(thread.id)
                                    }
                                    onDeleteRequest={() =>
                                      setDeleteThreadId(thread.id)
                                    }
                                  />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </div>

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
