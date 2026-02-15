"use client";

import { useState, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
  DropdownMenuLabel,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  MoreVerticalIcon,
  ArrowRight01Icon,
  ArchiveIcon,
  Unarchive03Icon,
  Delete01Icon,
  Task01Icon,
  NoteIcon,
  FolderManagementIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion, useReducedMotion } from "motion/react";

function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function truncateWithEllipsis(text, maxLength) {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
}

function getConversationRowCopy(content) {
  const normalized = content.replace(/\s+/g, " ").trim();
  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const firstLine = lines[0] || normalized || "Inbox item";
  const remainder = normalized.startsWith(firstLine)
    ? normalized.slice(firstLine.length).trim()
    : lines.slice(1).join(" ").trim();

  return {
    title: truncateWithEllipsis(firstLine, 64),
    snippet: truncateWithEllipsis(remainder || "Captured note", 120),
  };
}

export const InboxItemRow = memo(function InboxItemRow({
  item,
  onArchive,
  onUnarchive,
  onDelete,
  onConvert,
  onOpenActions,
  isNew = false,
  isLoading = false,
  isMobileActionsOpen = false,
}) {
  const [localLoading, setLocalLoading] = useState({
    archive: false,
    delete: false,
    convert: false,
  });

  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const isArchived = item.status === "archived";
  const rowCopy = getConversationRowCopy(item.content);

  const handleConvert = useCallback(
    async (type) => {
      setLocalLoading((prev) => ({ ...prev, convert: true }));
      try {
        await onConvert(item._id, type);
      } finally {
        setLocalLoading((prev) => ({ ...prev, convert: false }));
      }
    },
    [item._id, onConvert],
  );

  const handleArchive = useCallback(async () => {
    setLocalLoading((prev) => ({ ...prev, archive: true }));
    try {
      await onArchive(item._id);
    } finally {
      setLocalLoading((prev) => ({ ...prev, archive: false }));
    }
  }, [item._id, onArchive]);

  const handleUnarchive = useCallback(async () => {
    setLocalLoading((prev) => ({ ...prev, archive: true }));
    try {
      await onUnarchive(item._id);
    } finally {
      setLocalLoading((prev) => ({ ...prev, archive: false }));
    }
  }, [item._id, onUnarchive]);

  const handleDelete = useCallback(async () => {
    setLocalLoading((prev) => ({ ...prev, delete: true }));
    try {
      await onDelete(item._id);
    } finally {
      setLocalLoading((prev) => ({ ...prev, delete: false }));
    }
  }, [item._id, onDelete]);

  const isAnyLoading = isLoading || Object.values(localLoading).some(Boolean);

  return (
    <>
      <motion.div
        initial={
          isNew && !prefersReducedMotion ? { opacity: 0, y: 8 } : false
        }
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(
          "group flex items-start gap-2.5 px-3 py-2.5 transition-colors hover:bg-muted/50",
          isArchived && "opacity-70",
          isAnyLoading && "opacity-70",
        )}
        role="listitem"
        aria-busy={isAnyLoading}
      >
        <div className="flex-1 min-w-0 space-y-0.5 pr-1">
          <p
            className="text-[13px] font-medium truncate leading-5"
            id={`inbox-item-${item._id}-content`}
          >
            {rowCopy.title}
          </p>
          <p
            className="text-[11px] text-muted-foreground leading-4 line-clamp-1"
            id={`inbox-item-${item._id}-snippet`}
          >
            {rowCopy.snippet}
          </p>
          <p
            className="text-[11px] text-muted-foreground tabular-nums sm:hidden"
            id={`inbox-item-${item._id}-time`}
          >
            {formatRelativeTime(item.createdAt)}
          </p>
        </div>

        {isAnyLoading ? (
          <div className="shrink-0 p-2" aria-hidden="true">
            <HugeiconsIcon
              icon={Loading03Icon}
              className="size-4 animate-spin text-muted-foreground"
            />
          </div>
        ) : isMobile ? (
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0 touch-manipulation"
            onClick={() => onOpenActions(item)}
            aria-label={`Open actions for inbox item: ${item.content.slice(0, 50)}${item.content.length > 50 ? "..." : ""}`}
            aria-haspopup="menu"
            aria-expanded={isMobileActionsOpen}
            disabled={isAnyLoading}
          >
            <HugeiconsIcon icon={MoreVerticalIcon} className="size-4" />
          </Button>
        ) : (
          <div className="shrink-0 flex items-center gap-1">
            <p
              className="text-[11px] text-muted-foreground tabular-nums hidden sm:block"
              id={`inbox-item-${item._id}-time-desktop`}
            >
              {formatRelativeTime(item.createdAt)}
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                  aria-label={`Open actions for inbox item: ${item.content.slice(0, 50)}${item.content.length > 50 ? "..." : ""}`}
                  aria-haspopup="menu"
                  disabled={isAnyLoading}
                >
                  <HugeiconsIcon icon={MoreVerticalIcon} className="size-4" />
                </Button>
              </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger aria-haspopup="menu">
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
                  Convert to
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    onClick={() => handleConvert("task")}
                    disabled={localLoading.convert}
                  >
                    <HugeiconsIcon icon={Task01Icon} className="size-4" />
                    Task
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled
                  >
                    <HugeiconsIcon icon={NoteIcon} className="size-4" />
                    Note
                    <span className="ml-auto text-[10px] text-muted-foreground">
                      Soon
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleConvert("project")}
                    disabled={localLoading.convert}
                  >
                    <HugeiconsIcon
                      icon={FolderManagementIcon}
                      className="size-4"
                    />
                    Project
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              {isArchived ? (
                <DropdownMenuItem
                  onClick={handleUnarchive}
                  disabled={localLoading.archive}
                >
                  <HugeiconsIcon icon={Unarchive03Icon} className="size-4" />
                  Unarchive
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={handleArchive}
                  disabled={localLoading.archive}
                >
                  <HugeiconsIcon icon={ArchiveIcon} className="size-4" />
                  Archive
                </DropdownMenuItem>
              )}

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={(e) => e.preventDefault()}
                    disabled={localLoading.delete}
                  >
                    <HugeiconsIcon icon={Delete01Icon} className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete inbox item?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. The item will be permanently
                      removed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={localLoading.delete}
                    >
                      {localLoading.delete ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </motion.div>
    </>
  );
});
