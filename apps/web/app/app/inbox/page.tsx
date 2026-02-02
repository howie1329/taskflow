"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
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

interface InboxItem {
  id: string;
  content: string;
  status: InboxItemStatus;
  createdAt: number;
}

// Mock initial items for UI iteration
const mockItems: InboxItem[] = [
  {
    id: "1",
    content: "Brainstorm feature ideas for Q1 roadmap",
    status: "open",
    createdAt: Date.now() - 1000 * 60 * 30, // 30 min ago
  },
  {
    id: "2",
    content:
      "Research competitor pricing\n- Check linear.so\n- Check notion.so\n- Check asana.com",
    status: "open",
    createdAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
  },
  {
    id: "3",
    content: "Schedule user interviews for next week",
    status: "archived",
    createdAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
  },
];

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
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => void;
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
                onUnarchive(item.id);
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
                onArchive(item.id);
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
                    onDelete(item.id);
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
  isNew = false,
}: {
  item: InboxItem;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onDelete: (id: string) => void;
  onConvert: (id: string, type: "task" | "note" | "project") => void;
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
      onConvert(item.id, type);
      setConvertDialog({ open: true, type });
    },
    [item.id, onConvert],
  );

  return (
    <>
      <div
        className={cn(
          "group flex items-start gap-3 rounded-none border border-border p-3 transition-all duration-200 hover:border-foreground/20 hover:shadow-sm",
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
            onClick={() => handleConvert("task")}
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
                className="shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
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
                <DropdownMenuItem onClick={() => onUnarchive(item.id)}>
                  <HugeiconsIcon icon={Unarchive03Icon} className="size-4" />
                  Unarchive
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onArchive(item.id)}>
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
                      onClick={() => onDelete(item.id)}
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
        "fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-none border px-4 py-3 text-xs shadow-lg animate-in slide-in-from-bottom-2",
        type === "success"
          ? "border-green-500/20 bg-green-500/10 text-green-700 dark:text-green-400"
          : "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-400",
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
  const [items, setItems] = useState<InboxItem[]>(mockItems);
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
  const [isLoading, setIsLoading] = useState(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isMobile = useIsMobile();

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

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

  const openItems = useMemo(
    () => items.filter((i) => i.status === "open"),
    [items],
  );
  const archivedItems = useMemo(
    () => items.filter((i) => i.status === "archived"),
    [items],
  );

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

  const handleCapture = useCallback(() => {
    const trimmed = captureText.trim();
    if (!trimmed) return;

    const newItem: InboxItem = {
      id: Math.random().toString(36).slice(2),
      content: trimmed,
      status: "open",
      createdAt: Date.now(),
    };

    setItems((prev) => [newItem, ...prev]);
    setCaptureText("");
    setNewItemIds((prev) => new Set(prev).add(newItem.id));
    setToast({ message: "Item captured", type: "success" });

    // Remove "new" animation class after animation completes
    setTimeout(() => {
      setNewItemIds((prev) => {
        const next = new Set(prev);
        next.delete(newItem.id);
        return next;
      });
    }, 1000);
  }, [captureText]);

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

  const handleArchive = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "archived" } : item,
      ),
    );
    setToast({ message: "Item archived", type: "success" });
  }, []);

  const handleUnarchive = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "open" } : item)),
    );
    setToast({ message: "Item unarchived", type: "success" });
  }, []);

  const handleDelete = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setToast({ message: "Item deleted", type: "success" });
  }, []);

  const handleConvert = useCallback(
    (id: string, _type: "task" | "note" | "project") => {
      // In mobile view, open the sheet instead of dialog
      if (isMobile) {
        const item = items.find((i) => i.id === id);
        if (item) {
          setMobileActionItem(item);
          setIsMobileSheetOpen(true);
        }
      }
      // Dialog is handled in InboxItemRow component
    },
    [items, isMobile],
  );

  const focusCapture = useCallback(() => {
    textareaRef.current?.focus();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 h-full">
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
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Capture fast, triage later
        </p>
      </div>

      {/* Capture composer */}
      <div className="space-y-2">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={captureText}
            onChange={(e) => setCaptureText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind?"
            className="min-h-[80px] resize-none pr-12 transition-shadow focus:shadow-sm"
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

      <Separator />

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
              className="absolute right-1 top-1/2 -translate-y-1/2"
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
        <TabsList variant="line" className="mb-4">
          <TabsTrigger value="open" className="gap-2">
            Open
            <Badge variant="secondary" className="rounded-none">
              {openItems.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="archived" className="gap-2">
            Archived
            <Badge variant="secondary" className="rounded-none">
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
                  key={item.id}
                  item={item}
                  onArchive={handleArchive}
                  onUnarchive={handleUnarchive}
                  onDelete={handleDelete}
                  onConvert={handleConvert}
                  isNew={newItemIds.has(item.id)}
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
                  key={item.id}
                  item={item}
                  onArchive={handleArchive}
                  onUnarchive={handleUnarchive}
                  onDelete={handleDelete}
                  onConvert={handleConvert}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Mobile action sheet */}
      <MobileActionSheet
        item={mobileActionItem}
        open={isMobileSheetOpen}
        onOpenChange={setIsMobileSheetOpen}
        onArchive={handleArchive}
        onUnarchive={handleUnarchive}
        onDelete={handleDelete}
        onConvert={(_type) => {
          if (mobileActionItem) {
            setIsMobileSheetOpen(false);
            // Trigger convert dialog after sheet closes
            setTimeout(() => {
              // The convert dialog will be handled by the item row
            }, 200);
          }
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
