"use client";

import Link from "next/link";
import {
  PinIcon,
  MoreHorizontalIcon,
  Delete01Icon,
  PencilEdit01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { ChatThread } from "./mock-data";

interface ThreadRowProps {
  thread: ChatThread;
  isActive: boolean;
  isEditing: boolean;
  editingTitle: string;
  onEditTitleChange: (value: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onCommitEdit: () => void;
  onTogglePin: () => void;
  onDeleteRequest: () => void;
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
  if (isEditing) {
    return (
      <div
        className={cn(
          "group flex items-center gap-2 rounded-md px-2 py-1.5",
          isActive ? "bg-accent" : "bg-accent/40",
        )}
      >
        <span
          className={cn(
            "absolute left-0 top-0 h-full w-0.5",
            isActive ? "bg-primary" : "bg-transparent",
          )}
        />
        <Input
          className="h-6 px-2 py-0 text-xs"
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
      </div>
    );
  }

  return (
    <Link
      href={`/app/chat/${thread.id}`}
      className={cn(
        "group relative flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-foreground hover:bg-muted",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <span
        className={cn(
          "absolute left-0 top-0 h-full w-0.5 rounded-l-md",
          isActive ? "bg-primary" : "bg-transparent",
        )}
      />

      <div className="flex items-center gap-2 min-w-0 flex-1">
        {thread.pinned && (
          <HugeiconsIcon
            icon={PinIcon}
            className="size-3 shrink-0 text-muted-foreground"
            strokeWidth={2}
          />
        )}
        <span className="truncate text-xs font-medium">
          {thread.title || "Untitled chat"}
        </span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            className="h-5 w-5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <HugeiconsIcon icon={MoreHorizontalIcon} className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              onStartEdit();
            }}
          >
            <HugeiconsIcon icon={PencilEdit01Icon} className="size-3 mr-2" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              onTogglePin();
            }}
          >
            <HugeiconsIcon icon={PinIcon} className="size-3 mr-2" />
            {thread.pinned ? "Unpin" : "Pin"}
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={(e) => {
              e.preventDefault();
              onDeleteRequest();
            }}
          >
            <HugeiconsIcon icon={Delete01Icon} className="size-3 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Link>
  );
}
