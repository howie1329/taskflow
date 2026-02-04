"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Kbd } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
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
  InboxDownloadIcon,
  Search01Icon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

type InboxItemStatus = "open" | "archived";
type InboxItem = Doc<"inboxItems">;
type InboxItemId = InboxItem["_id"];

function formatRelativeTime(timestamp: number): string {
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

// Auto-resize textarea hook
function useAutoResizeTextarea(
  ref: React.RefObject<HTMLTextAreaElement | null>,
  value: string,
  minHeight = 80,
  maxHeight = 200,
) {
  useEffect(() => {
    const textarea = ref.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const newHeight = Math.min(
      Math.max(textarea.scrollHeight, minHeight),
      maxHeight,
    );
    textarea.style.height = `${newHeight}px`;
  }, [value, ref, minHeight, maxHeight]);
}

// Mobile Action Sheet Component
function MobileActionSheet({
  item,
  open,
  onOpenChange,
  onArchive,
  onUnarchive,
  onDelete,
  onConvert,
}: {
  item: InboxItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onArchive: (id: InboxItemId) => void;
  onUnarchive: (id: InboxItemId) => void;
  onDelete: (id: InboxItemId) => void;
  onConvert: (type: "task" | "note" | "project") => void;
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

function InboxItemRow({
  item,
  onArchive,
  onUnarchive,
  onDelete,
  onConvert,
  onOpenActions,
  isNew = false,
}: {
  item: InboxItem;
  onArchive: (id: InboxItemId) => void;
  onUnarchive: (id: InboxItemId) => void;
  onDelete: (id: InboxItemId) => void;
  onConvert: (id: InboxItemId, type: "task" | "note" | "project") => void;
  onOpenActions: (item: InboxItem) => void;
  isNew?: boolean;
}) {
  const [convertDialog, setConvertDialog] = useState<{
    open: boolean;
    type: "task" | "note" | "project" | null;
  }>({ open: false, type: null });
  const isMobile = useIsMobile();
  const isArchived = item.status === "archived";

  const handleConvert = useCallback(
    (type: "task" | "note" | "project") => {
      if (type === "note") {
        setConvertDialog({ open: true, type });
        return;
      }
      onConvert(item._id, type);
    },
    [item._id, onConvert],
  );

  return (
    <>
      <div
        className={cn(
          "group flex items-start gap-3 rounded-lg border border-border/60 bg-background/30 p-3 transition-[background-color,border-color,transform] duration-200 hover:border-border hover:bg-accent/25 hover:-translate-y-[1px]",
          isArchived && "opacity-60",
          isNew && "animate-in fade-in slide-in-from-top-2 duration-300",
        )}
      >
        <div className="flex-1 min-w-0 space-y-1">
          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
            {item.content}
          </p>
          <p className="text-xs text-muted-foreground tabular-nums">
            {formatRelativeTime(item.createdAt)}
          </p>
        </div>

        {isMobile ? (
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0"
            onClick={() => onOpenActions(item)}
          >
            <HugeiconsIcon icon={MoreVerticalIcon} className="size-4" />
            <span className="sr-only">Actions</span>
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
              >
                <HugeiconsIcon icon={MoreVerticalIcon} className="size-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
                  Convert to
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => handleConvert("task")}>
                    <HugeiconsIcon icon={Task01Icon} className="size-4" />
                    Task
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleConvert("note")}>
                    <HugeiconsIcon icon={NoteIcon} className="size-4" />
                    Note
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleConvert("project")}>
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
                <DropdownMenuItem onClick={() => onUnarchive(item._id)}>
                  <HugeiconsIcon icon={Unarchive03Icon} className="size-4" />
                  Unarchive
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onArchive(item._id)}>
                  <HugeiconsIcon icon={ArchiveIcon} className="size-4" />
                  Archive
                </DropdownMenuItem>
              )}

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={(e) => e.preventDefault()}
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
                      onClick={() => onDelete(item._id)}
                    >
                      Delete
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
}

function InboxEmptyState({
  status,
  onCaptureFocus,
  searchQuery,
}: {
  status: InboxItemStatus;
  onCaptureFocus?: () => void;
  searchQuery?: string;
}) {
  if (searchQuery) {
    return (
      <Empty className="min-h-[200px]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={Search01Icon} className="size-4" />
          </EmptyMedia>
          <EmptyTitle>No matches found</EmptyTitle>
          <EmptyDescription>Try adjusting your search terms</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (status === "archived") {
    return (
      <Empty className="min-h-[200px]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={ArchiveIcon} className="size-4" />
          </EmptyMedia>
          <EmptyTitle>No archived items</EmptyTitle>
          <EmptyDescription>
            Archived items will appear here. You can unarchive them anytime.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Empty className="min-h-[200px]">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={InboxDownloadIcon} className="size-4" />
        </EmptyMedia>
        <EmptyTitle>Your inbox is empty</EmptyTitle>
        <EmptyDescription>
          Use the capture box above to quickly dump thoughts, ideas, and tasks
          to process later.
        </EmptyDescription>
      </EmptyHeader>
      {onCaptureFocus && (
        <Button variant="outline" size="sm" onClick={onCaptureFocus}>
          Start capturing
          <Kbd className="ml-2">C</Kbd>
        </Button>
      )}
    </Empty>
  );
}

// Toast notification component
function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "info";
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg border border-border/60 bg-background/80 px-4 py-3 text-xs shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-in slide-in-from-bottom-2",
        type === "success"
          ? "text-green-700 dark:text-green-400"
          : "text-blue-700 dark:text-blue-400",
      )}
    >
      <HugeiconsIcon
        icon={type === "success" ? CheckmarkCircle02Icon : AlertCircleIcon}
        className="size-4"
      />
      {message}
    </div>
  );
}

export default function InboxPage() {
  const [captureText, setCaptureText] = useState("");
  const [activeTab, setActiveTab] = useState<InboxItemStatus>("open");
  const [searchQuery, setSearchQuery] = useState("");
  const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set());
  const [mobileActionItem, setMobileActionItem] = useState<InboxItem | null>(
    null,
  );
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info";
  } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const createInboxItem = useMutation(api.inbox.createInboxItem);
  const archiveInboxItem = useMutation(api.inbox.archiveInboxItem);
  const unarchiveInboxItem = useMutation(api.inbox.unarchiveInboxItem);
  const deleteInboxItem = useMutation(api.inbox.deleteInboxItem);
  const convertInboxItemToTask = useMutation(api.inbox.convertInboxItemToTask);
  const convertInboxItemToProject = useMutation(
    api.inbox.convertInboxItemToProject,
  );

  const items = useQuery(api.inbox.listMyInboxItems, {});
  const isLoading = items === undefined;

  // Auto-resize textarea
  useAutoResizeTextarea(textareaRef, captureText, 80, 200);

  // Keyboard shortcut: C to focus capture
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (e.key === "c" && !isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const openItems = useMemo(() => {
    if (!items) return [];
    return items.filter((i) => i.status === "open");
  }, [items]);
  const archivedItems = useMemo(() => {
    if (!items) return [];
    return items.filter((i) => i.status === "archived");
  }, [items]);

  const filteredOpenItems = useMemo(() => {
    if (!searchQuery.trim()) return openItems;
    const query = searchQuery.toLowerCase();
    return openItems.filter((item) =>
      item.content.toLowerCase().includes(query),
    );
  }, [openItems, searchQuery]);

  const filteredArchivedItems = useMemo(() => {
    if (!searchQuery.trim()) return archivedItems;
    const query = searchQuery.toLowerCase();
    return archivedItems.filter((item) =>
      item.content.toLowerCase().includes(query),
    );
  }, [archivedItems, searchQuery]);

  const handleCapture = useCallback(async () => {
    const trimmed = captureText.trim();
    if (!trimmed) return;

    try {
      const newItem = await createInboxItem({ content: trimmed });
      setCaptureText("");
      if (newItem?._id) {
        setNewItemIds((prev) => new Set(prev).add(String(newItem._id)));
        setTimeout(() => {
          setNewItemIds((prev) => {
            const next = new Set(prev);
            next.delete(String(newItem._id));
            return next;
          });
        }, 1000);
      }
      setToast({ message: "Item captured", type: "success" });
    } catch (error) {
      setToast({ message: "Failed to capture item", type: "info" });
    }
  }, [captureText, createInboxItem]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleCapture();
      }
      if (e.key === "Escape") {
        setCaptureText("");
        e.currentTarget.blur();
      }
    },
    [handleCapture],
  );

  const handleArchive = useCallback(
    async (id: InboxItemId) => {
      try {
        await archiveInboxItem({ inboxItemId: id });
        setToast({ message: "Item archived", type: "success" });
      } catch (error) {
        setToast({ message: "Failed to archive item", type: "info" });
      }
    },
    [archiveInboxItem],
  );

  const handleUnarchive = useCallback(
    async (id: InboxItemId) => {
      try {
        await unarchiveInboxItem({ inboxItemId: id });
        setToast({ message: "Item unarchived", type: "success" });
      } catch (error) {
        setToast({ message: "Failed to unarchive item", type: "info" });
      }
    },
    [unarchiveInboxItem],
  );

  const handleDelete = useCallback(
    async (id: InboxItemId) => {
      try {
        await deleteInboxItem({ inboxItemId: id });
        setToast({ message: "Item deleted", type: "success" });
      } catch (error) {
        setToast({ message: "Failed to delete item", type: "info" });
      }
    },
    [deleteInboxItem],
  );

  const handleConvert = useCallback(
    async (id: InboxItemId, type: "task" | "note" | "project") => {
      if (type === "note") {
        setToast({ message: "Convert to note coming soon", type: "info" });
        return;
      }

      try {
        if (type === "task") {
          await convertInboxItemToTask({ inboxItemId: id });
          setToast({ message: "Converted to task", type: "success" });
          return;
        }
        await convertInboxItemToProject({ inboxItemId: id });
        setToast({ message: "Converted to project", type: "success" });
      } catch (error) {
        setToast({ message: "Failed to convert item", type: "info" });
      }
    },
    [convertInboxItemToProject, convertInboxItemToTask],
  );

  const focusCapture = useCallback(() => {
    textareaRef.current?.focus();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full w-full min-h-0 flex-col overflow-hidden rounded-xl border border-border/60 bg-card/40 dark:bg-card/20">
        <div className="flex flex-1 min-h-0 flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-20 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-8 w-20" />
          </div>
          <Separator />
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full min-h-0 flex-col overflow-hidden rounded-xl border border-border/60 bg-card/40 dark:bg-card/20">
      <div className="flex flex-1 min-h-0 flex-col gap-4 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Capture fast, triage later
          </p>
        </div>

        {/* Capture composer */}
        <div className="rounded-lg border border-border/60 bg-background/30 p-3 space-y-2">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={captureText}
              onChange={(e) => setCaptureText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What's on your mind?"
              className="min-h-[80px] resize-none pr-12 border-border/60 focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
            {captureText.length > 0 && (
              <div className="absolute bottom-2 right-2 text-xs text-muted-foreground tabular-nums">
                {captureText.length}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Kbd>Enter</Kbd> to capture
              </span>
              <span className="flex items-center gap-1">
                <Kbd>Shift</Kbd> + <Kbd>Enter</Kbd> for new line
              </span>
              <span className="flex items-center gap-1 hidden sm:inline-flex">
                <Kbd>Esc</Kbd> to clear
              </span>
              <span className="flex items-center gap-1 hidden sm:inline-flex">
                <Kbd>C</Kbd> to focus
              </span>
            </div>
            <Button
              size="sm"
              onClick={handleCapture}
              disabled={!captureText.trim()}
            >
              Capture
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="rounded-lg border border-border/60 bg-muted/30 p-2 space-y-2">
          {/* Search bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <HugeiconsIcon
                icon={Search01Icon}
                className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
              />
              <Input
                type="text"
                placeholder="Search inbox..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-xs"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                  onClick={() => setSearchQuery("")}
                >
                  <span className="sr-only">Clear search</span>×
                </Button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as InboxItemStatus)}
            className="flex-1 flex flex-col min-h-0"
          >
            <TabsList variant="line" className="mb-0">
              <TabsTrigger value="open" className="gap-2">
                Open
                <Badge
                  variant="secondary"
                  className="rounded-md tabular-nums bg-muted/70"
                >
                  {openItems.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="archived" className="gap-2">
                Archived
                <Badge
                  variant="secondary"
                  className="rounded-md tabular-nums bg-muted/70"
                >
                  {archivedItems.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="open" className="flex-1 overflow-y-auto min-h-0">
              {filteredOpenItems.length === 0 ? (
                <InboxEmptyState
                  status="open"
                  onCaptureFocus={focusCapture}
                  searchQuery={searchQuery}
                />
              ) : (
                <div className="space-y-2 pb-4">
                  {filteredOpenItems.map((item) => (
                    <InboxItemRow
                      key={item._id}
                      item={item}
                      onArchive={handleArchive}
                      onUnarchive={handleUnarchive}
                      onDelete={handleDelete}
                      onConvert={handleConvert}
                      onOpenActions={(selectedItem) => {
                        setMobileActionItem(selectedItem);
                        setIsMobileSheetOpen(true);
                      }}
                      isNew={newItemIds.has(String(item._id))}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent
              value="archived"
              className="flex-1 overflow-y-auto min-h-0"
            >
              {filteredArchivedItems.length === 0 ? (
                <InboxEmptyState status="archived" searchQuery={searchQuery} />
              ) : (
                <div className="space-y-2 pb-4">
                  {filteredArchivedItems.map((item) => (
                    <InboxItemRow
                      key={item._id}
                      item={item}
                      onArchive={handleArchive}
                      onUnarchive={handleUnarchive}
                      onDelete={handleDelete}
                      onConvert={handleConvert}
                      onOpenActions={(selectedItem) => {
                        setMobileActionItem(selectedItem);
                        setIsMobileSheetOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Mobile action sheet */}
      <MobileActionSheet
        item={mobileActionItem}
        open={isMobileSheetOpen}
        onOpenChange={setIsMobileSheetOpen}
        onArchive={handleArchive}
        onUnarchive={handleUnarchive}
        onDelete={handleDelete}
        onConvert={(type) => {
          if (!mobileActionItem) return;
          handleConvert(mobileActionItem._id, type);
          setIsMobileSheetOpen(false);
        }}
      />

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
