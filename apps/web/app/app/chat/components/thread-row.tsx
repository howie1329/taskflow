"use client"

import Link from "next/link"
import { PinIcon, MoreHorizontalIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { ChatThread } from "./mock-data"

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}d`
}

interface ThreadRowProps {
  thread: ChatThread
  isActive: boolean
  isEditing: boolean
  editingTitle: string
  onEditTitleChange: (value: string) => void
  onStartEdit: () => void
  onCancelEdit: () => void
  onCommitEdit: () => void
  onTogglePin: () => void
  onDeleteRequest: () => void
}

export function ThreadRow({
  thread,
  isActive,
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
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
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
                    e.preventDefault()
                    onCommitEdit()
                  }
                  if (e.key === "Escape") {
                    e.preventDefault()
                    onCancelEdit()
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
          <span className="text-xs text-muted-foreground tabular-nums shrink-0">
            {formatTimeAgo(thread.updatedAt)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-1">
          {thread.snippet}
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <HugeiconsIcon icon={MoreHorizontalIcon} className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
              onStartEdit()
            }}
          >
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
              onTogglePin()
            }}
          >
            {thread.pinned ? "Unpin" : "Pin"}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onSelect={(e) => {
              e.preventDefault()
              onDeleteRequest()
            }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

  const classes = cn(
    "group relative block rounded-none px-3 py-2.5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    isActive
      ? "bg-accent/60 text-foreground"
      : "hover:bg-accent/40 text-foreground",
  )

  if (isEditing) {
    return (
      <div className={classes}>
        <span
          className={cn(
            "absolute left-0 top-0 h-full w-0.5 bg-transparent",
            isActive && "bg-primary"
          )}
        />
        {content}
      </div>
    )
  }

  return (
    <Link
      href={`/app/chat/${thread.id}`}
      className={classes}
      aria-current={isActive ? "page" : undefined}
    >
      <span
        className={cn(
          "absolute left-0 top-0 h-full w-0.5 bg-transparent",
          isActive && "bg-primary"
        )}
      />
      {content}
    </Link>
  )
}
