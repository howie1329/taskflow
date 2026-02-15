"use client";

import { memo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
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
  ArchiveIcon,
  Unarchive03Icon,
  Delete01Icon,
  Task01Icon,
  NoteIcon,
  FolderManagementIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";

export const MobileActionSheet = memo(function MobileActionSheet({
  item,
  open,
  onOpenChange,
  onArchive,
  onUnarchive,
  onDelete,
  onConvert,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [actionType, setActionType] = useState(null);
  const isArchived = item?.status === "archived";

  const handleSheetOpenChange = useCallback(
    (nextOpen) => {
      onOpenChange(nextOpen);
    },
    [onOpenChange],
  );

  const handleConvert = useCallback(
    async (type) => {
      setIsLoading(true);
      setActionType(`convert-${type}`);
      try {
        await onConvert(type);
        handleSheetOpenChange(false);
      } finally {
        setIsLoading(false);
        setActionType(null);
      }
    },
    [onConvert, handleSheetOpenChange],
  );

  const handleArchive = useCallback(async () => {
    if (!item) return;
    setIsLoading(true);
    setActionType("archive");
    try {
      await onArchive(item._id);
      handleSheetOpenChange(false);
    } finally {
      setIsLoading(false);
      setActionType(null);
    }
  }, [onArchive, item, handleSheetOpenChange]);

  const handleUnarchive = useCallback(async () => {
    if (!item) return;
    setIsLoading(true);
    setActionType("unarchive");
    try {
      await onUnarchive(item._id);
      handleSheetOpenChange(false);
    } finally {
      setIsLoading(false);
      setActionType(null);
    }
  }, [onUnarchive, item, handleSheetOpenChange]);

  const handleDelete = useCallback(async () => {
    if (!item) return;
    setIsLoading(true);
    setActionType("delete");
    try {
      await onDelete(item._id);
      handleSheetOpenChange(false);
    } finally {
      setIsLoading(false);
      setActionType(null);
    }
  }, [onDelete, item, handleSheetOpenChange]);

  const getButtonContent = (icon, label, loadingKey) => {
    const isBtnLoading = isLoading && actionType === loadingKey;
    return (
      <>
        {isBtnLoading ? (
          <HugeiconsIcon icon={Loading03Icon} className="size-4 animate-spin" />
        ) : (
          <HugeiconsIcon icon={icon} className="size-4" />
        )}
        {isBtnLoading ? `${label}...` : label}
      </>
    );
  };

  if (!item) return null;

  return (
    <Sheet open={open} onOpenChange={handleSheetOpenChange}>
      <SheetContent
        side="bottom"
        className="h-auto"
        role="dialog"
        aria-modal="true"
        aria-label={`Actions for inbox item: ${item.content.slice(0, 50)}${item.content.length > 50 ? "..." : ""}`}
      >
        <SheetHeader className="text-left">
          <SheetTitle className="text-sm">Actions</SheetTitle>
          <SheetDescription className="sr-only">
            Choose an action to perform on this inbox item
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-1 py-4">
          <Button
            variant="ghost"
            className="justify-start gap-2 h-12 touch-manipulation min-h-[44px]"
            onClick={() => handleConvert("task")}
            disabled={isLoading}
            aria-busy={isLoading && actionType === "convert-task"}
          >
            {getButtonContent(Task01Icon, "Convert to Task", "convert-task")}
          </Button>
          <Button
            variant="ghost"
            className="justify-start gap-2 h-12 touch-manipulation min-h-[44px]"
            disabled
            aria-disabled="true"
          >
            <HugeiconsIcon icon={NoteIcon} className="size-4" />
            Convert to Note
            <span className="ml-auto text-[10px] text-muted-foreground">Soon</span>
          </Button>
          <Button
            variant="ghost"
            className="justify-start gap-2 h-12 touch-manipulation min-h-[44px]"
            onClick={() => handleConvert("project")}
            disabled={isLoading}
            aria-busy={isLoading && actionType === "convert-project"}
          >
            {getButtonContent(
              FolderManagementIcon,
              "Convert to Project",
              "convert-project",
            )}
          </Button>
          <Separator className="my-2" />
          {isArchived ? (
            <Button
              variant="ghost"
              className="justify-start gap-2 h-12 touch-manipulation min-h-[44px]"
              onClick={handleUnarchive}
              disabled={isLoading}
              aria-busy={isLoading && actionType === "unarchive"}
            >
              {getButtonContent(Unarchive03Icon, "Unarchive", "unarchive")}
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="justify-start gap-2 h-12 touch-manipulation min-h-[44px]"
              onClick={handleArchive}
              disabled={isLoading}
              aria-busy={isLoading && actionType === "archive"}
            >
              {getButtonContent(ArchiveIcon, "Archive", "archive")}
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="justify-start gap-2 h-12 touch-manipulation min-h-[44px] text-destructive hover:text-destructive"
                disabled={isLoading}
              >
                <HugeiconsIcon icon={Delete01Icon} className="size-4" />
                Delete
              </Button>
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
                <AlertDialogCancel disabled={isLoading}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isLoading}
                  aria-busy={isLoading && actionType === "delete"}
                >
                  {isLoading && actionType === "delete" ? (
                    <>
                      <HugeiconsIcon
                        icon={Loading03Icon}
                        className="size-4 animate-spin mr-2"
                      />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SheetContent>
    </Sheet>
  );
});
