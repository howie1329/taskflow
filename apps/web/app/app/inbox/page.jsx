"use client";

import { useState, useCallback } from "react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  InboxCapture,
  InboxFilters,
  InboxTabs,
  MobileActionSheet,
  Toast,
} from "@/components/inbox";
import {
  useInboxItems,
  useInboxActions,
  useInboxFilters,
  useNewItemsAnimation,
  useMobileActions,
} from "@/hooks/inbox";

export default function InboxPage() {
  // State for capture input
  const [captureText, setCaptureText] = useState("");

  // Custom hooks
  const { items, isLoading } = useInboxItems();
  const {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    openItems,
    archivedItems,
    filteredOpenItems,
    filteredArchivedItems,
  } = useInboxFilters(items);
  const {
    captureItem,
    archiveItem,
    unarchiveItem,
    deleteItem,
    convertToTask,
    convertToProject,
    toast,
    clearToast,
  } = useInboxActions();
  const { newItemIds, animateNewItem } = useNewItemsAnimation();
  const { selectedItem, isOpen, openActions, closeActions } =
    useMobileActions();

  // Handle capture with animation
  const handleCapture = useCallback(async () => {
    const newItem = await captureItem(captureText);
    if (newItem?._id) {
      setCaptureText("");
      animateNewItem(String(newItem._id));
    }
  }, [captureText, captureItem, animateNewItem]);

  // Handle convert with note support
  const handleConvert = useCallback(
    async (id, type) => {
      if (type === "note") {
        // Note conversion not yet implemented
        return;
      }
      if (type === "task") {
        await convertToTask(id);
      } else if (type === "project") {
        await convertToProject(id);
      }
    },
    [convertToTask, convertToProject],
  );

  // Handle mobile convert
  const handleMobileConvert = useCallback(
    (type) => {
      if (!selectedItem) return;
      handleConvert(selectedItem._id, type);
      closeActions();
    },
    [selectedItem, handleConvert, closeActions],
  );

  // Loading state
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
            onTabChange={setActiveTab}
            openItems={openItems}
            archivedItems={archivedItems}
            filteredOpenItems={filteredOpenItems}
            filteredArchivedItems={filteredArchivedItems}
            newItemIds={newItemIds}
            searchQuery={searchQuery}
            onArchive={archiveItem}
            onUnarchive={unarchiveItem}
            onDelete={deleteItem}
            onConvert={handleConvert}
            onOpenActions={openActions}
            onCaptureFocus={() => setCaptureText("")}
          />
        </div>
      </div>

      {/* Mobile action sheet */}
      <MobileActionSheet
        item={selectedItem}
        open={isOpen}
        onOpenChange={closeActions}
        onArchive={archiveItem}
        onUnarchive={unarchiveItem}
        onDelete={deleteItem}
        onConvert={handleMobileConvert}
      />

      {/* Toast notification */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={clearToast} />
      )}
    </div>
  );
}
