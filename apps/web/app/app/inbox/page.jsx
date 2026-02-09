"use client";
import { useState, useMemo, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  InboxCapture,
  InboxFilters,
  InboxTabs,
  MobileActionSheet,
  Toast,
} from "@/components/inbox";

export default function InboxPage() {
  const [captureText, setCaptureText] = useState("");
  const [activeTab, setActiveTab] = useState("open");
  const [searchQuery, setSearchQuery] = useState("");
  const [newItemIds, setNewItemIds] = useState(new Set());
  const [mobileActionItem, setMobileActionItem] = useState(null);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const [toast, setToast] = useState(null);

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

  const handleArchive = useCallback(
    async (id) => {
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
    async (id) => {
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
    async (id) => {
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
    async (id, type) => {
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

  const handleOpenActions = useCallback((item) => {
    setMobileActionItem(item);
    setIsMobileSheetOpen(true);
  }, []);

  const handleTabChange = useCallback((value) => {
    setActiveTab(value);
  }, []);

  const handleMobileConvert = useCallback(
    (type) => {
      if (!mobileActionItem) return;
      handleConvert(mobileActionItem._id, type);
      setIsMobileSheetOpen(false);
    },
    [mobileActionItem, handleConvert],
  );

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
        <InboxCapture
          value={captureText}
          onChange={setCaptureText}
          onCapture={handleCapture}
          disabled={isLoading}
        />

        {/* Toolbar */}
        <div className="rounded-lg border border-border/60 bg-muted/30 p-2 space-y-2">
          {/* Search bar */}
          <InboxFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Tabs with items */}
          <InboxTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            openItems={openItems}
            archivedItems={archivedItems}
            filteredOpenItems={filteredOpenItems}
            filteredArchivedItems={filteredArchivedItems}
            newItemIds={newItemIds}
            searchQuery={searchQuery}
            onArchive={handleArchive}
            onUnarchive={handleUnarchive}
            onDelete={handleDelete}
            onConvert={handleConvert}
            onOpenActions={handleOpenActions}
            onCaptureFocus={() => setCaptureText("")}
          />
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
        onConvert={handleMobileConvert}
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
