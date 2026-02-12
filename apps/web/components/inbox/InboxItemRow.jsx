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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export const InboxItemRow = memo(function InboxItemRow({
  item,
  onArchive,
  onUnarchive,
  onDelete,
  onConvert,
  onOpenActions,
  isNew = false,
  isLoading = false,
}) {
  const [convertDialog, setConvertDialog] = useState({
    open: false,
    type: null,
  });
  const [localLoading, setLocalLoading] = useState({
    archive: false,
    delete: false,
    convert: false,
  });

  const isMobile = useIsMobile();
  const isArchived = item.status === "archived";

  const handleConvert = useCallback(
    async (type) => {
      if (type === "note") {
        setConvertDialog({ open: true, type });
        return;
      }
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
      <div
        className={cn(
          "group flex items-start gap-4 rounded-xl bg-card/30 p-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:bg-card/50",
          isArchived && "opacity-60",
          isNew && "animate-in fade-in slide-in-from-top-2 duration-300",
          isAnyLoading && "opacity-70 pointer-events-none",
        )}
        role="listitem"
        aria-busy={isAnyLoading}
      >
        <div className="flex-1 min-w-0 space-y-1">
          <p
            className="text-sm whitespace-pre-wrap break-words leading-relaxed"
            id={`inbox-item-${item._id}-content`}
          >
            {item.content}
          </p>
          <p
            className="text-xs text-muted-foreground tabular-nums"
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
            aria-expanded="false"
          >
            <HugeiconsIcon icon={MoreVerticalIcon} className="size-4" />
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
                aria-label={`Open actions for inbox item: ${item.content.slice(0, 50)}${item.content.length > 50 ? "..." : ""}`}
                aria-haspopup="menu"
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
                    onClick={() => handleConvert("note")}
                    disabled={localLoading.convert}
                  >
                    <HugeiconsIcon icon={NoteIcon} className="size-4" />
                    Note
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
        )}
      </div>

      {/* Coming soon dialog for convert */}
      <Dialog
        open={convertDialog.open}
        onOpenChange={(open) =>
          setConvertDialog({ open, type: open ? convertDialog.type : null })
        }
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Convert to{" "}
              {convertDialog.type
                ? convertDialog.type.charAt(0).toUpperCase() +
                  convertDialog.type.slice(1)
                : ""}
            </DialogTitle>
            <DialogDescription>
              This feature is coming soon. Once implemented, this will create a
              new {convertDialog.type} from this inbox item and archive it.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConvertDialog({ open: false, type: null })}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
});
