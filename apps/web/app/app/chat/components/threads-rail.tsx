"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Cancel01Icon,
  MessageQuestionIcon,
  PinIcon,
  PlusSignIcon,
  SearchIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { ChatProject, ChatThread } from "./mock-data"
import { ProjectThreadGroup } from "./project-thread-group"
import { ThreadRow } from "./thread-row"
import { ThreadSection } from "./thread-section"

interface ThreadsRailProps {
  className?: string
  isNewChat: boolean
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  threads: ChatThread[]
  filteredThreads: ChatThread[]
  pinnedThreads: ChatThread[]
  recentThreads: ChatThread[]
  groupedByProject: { project: ChatProject; threads: ChatThread[] }[]
  activeThreadId: string | null
  editingThreadId: string | null
  editingTitle: string
  onEditTitleChange: (value: string) => void
  onStartEdit: (thread: ChatThread) => void
  onCancelEdit: () => void
  onCommitEdit: () => void
  onTogglePin: (threadId: string) => void
  onDeleteRequest: (threadId: string | null) => void
}

export function ThreadsRail({
  className,
  isNewChat,
  searchQuery,
  onSearchQueryChange,
  threads,
  filteredThreads,
  pinnedThreads,
  recentThreads,
  groupedByProject,
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
  const projectThreadCount = groupedByProject.reduce(
    (total, group) => total + group.threads.length,
    0,
  )

  return (
    <nav
      aria-label="Threads"
      className={cn(
        "w-full md:w-[300px] shrink-0 border-r border-border/60 flex flex-col bg-background/40 text-foreground",
        className,
      )}
    >
      <div className="sticky top-0 z-10 border-b border-border/60 bg-background/70 p-3 backdrop-blur supports-[backdrop-filter]:bg-background/60 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Threads
          </span>
          <Link href="/app/chat">
            <Button
              className={cn(
                "h-8 rounded-md px-3 text-xs",
                isNewChat && "bg-accent text-accent-foreground",
              )}
              variant={isNewChat ? "secondary" : "default"}
            >
              <HugeiconsIcon
                icon={PlusSignIcon}
                className="size-3.5 mr-2"
                strokeWidth={2}
              />
              New
            </Button>
          </Link>
        </div>

        <InputGroup className="w-full">
          <InputGroupAddon>
            <HugeiconsIcon icon={SearchIcon} className="size-4" strokeWidth={2} />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search threads..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="text-xs"
          />
          {searchQuery && (
            <InputGroupAddon>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => onSearchQueryChange("")}
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

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
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
                <div className="space-y-2">
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
                  <div className="space-y-1">
                    {pinnedThreads.map((thread) => (
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

              {recentThreads.length > 0 && (
                <div className="space-y-2">
                  <ThreadSection label="Recent" count={recentThreads.length} />
                  <div className="space-y-1">
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
                  {(pinnedThreads.length > 0 || recentThreads.length > 0) && (
                    <Separator className="bg-sidebar-border/70" />
                  )}
                  <div className="space-y-3">
                    <ThreadSection label="Projects" count={projectThreadCount} />
                    <div className="space-y-2">
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
  )
}
