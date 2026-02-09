"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
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
} from "@hugeicons/core-free-icons";

export function MobileActionSheet({
  item,
  open,
  onOpenChange,
  onArchive,
  onUnarchive,
  onDelete,
  onConvert,
}) {
  if (!item) return null;
  const isArchived = item.status === "archived";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto">
        <SheetHeader className="text-left">
          <SheetTitle className="text-sm">Actions</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-1 py-4">
          <Button
            variant="ghost"
            className="justify-start gap-2 h-10"
            onClick={() => {
              onConvert("task");
              onOpenChange(false);
            }}
          >
            <HugeiconsIcon icon={Task01Icon} className="size-4" />
            Convert to Task
          </Button>
          <Button
            variant="ghost"
            className="justify-start gap-2 h-10"
            onClick={() => {
              onConvert("note");
              onOpenChange(false);
            }}
          >
            <HugeiconsIcon icon={NoteIcon} className="size-4" />
            Convert to Note
          </Button>
          <Button
            variant="ghost"
            className="justify-start gap-2 h-10"
            onClick={() => {
              onConvert("project");
              onOpenChange(false);
            }}
          >
            <HugeiconsIcon icon={FolderManagementIcon} className="size-4" />
            Convert to Project
          </Button>
          <Separator className="my-2" />
          {isArchived ? (
            <Button
              variant="ghost"
              className="justify-start gap-2 h-10"
              onClick={() => {
                onUnarchive(item._id);
                onOpenChange(false);
              }}
            >
              <HugeiconsIcon icon={Unarchive03Icon} className="size-4" />
              Unarchive
            </Button>
          ) : (
            <Button
              variant="ghost"
              className="justify-start gap-2 h-10"
              onClick={() => {
                onArchive(item._id);
                onOpenChange(false);
              }}
            >
              <HugeiconsIcon icon={ArchiveIcon} className="size-4" />
              Archive
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="justify-start gap-2 h-10 text-destructive hover:text-destructive"
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
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => {
                    onDelete(item._id);
                    onOpenChange(false);
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SheetContent>
    </Sheet>
  );
}
