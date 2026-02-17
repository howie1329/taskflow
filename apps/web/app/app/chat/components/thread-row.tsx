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
  projectIcon?: string;
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
  projectIcon,
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
          "flex items-center gap-2 rounded-md px-2.5 py-2 w-full max-w-full overflow-hidden",
          isActive ? "bg-accent" : "bg-accent/40",
        )}
      >
        <Input
          className="h-7 px-2 py-0 text-[13px] min-w-0 flex-1 w-full max-w-full"
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
        "group relative flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors w-full max-w-full overflow-hidden",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/60",
        isActive
          ? "bg-muted text-foreground"
          : "text-foreground hover:bg-muted/50",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
        {thread.pinned && (
          <HugeiconsIcon
            icon={PinIcon}
            className="size-3 shrink-0 text-muted-foreground/80"
            strokeWidth={2}
          />
        )}
        {projectIcon && (
          <span className="shrink-0 text-xs" title="Project thread">
            {projectIcon}
          </span>
        )}
        <span className="block min-w-0 flex-1 truncate text-[13px] font-normal">
          {thread.title || "Untitled chat"}
        </span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            className="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
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
