"use client";

import { useState, useCallback, useEffect, useMemo } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  InboxHeader,
  InboxHeaderSkeleton,
  InboxContent,
  MobileActionSheet,
  Toast,
} from "@/components/inbox";
import {
  useInboxItems,
  useInboxCounts,
  useInboxActions,
  useNewItemsAnimation,
  useMobileActions,
} from "@/hooks/inbox";

// Container component with loading state
function InboxContainer({ children, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex h-full w-full min-h-0 flex-col overflow-hidden">
        <div className="flex flex-1 min-h-0 flex-col gap-6 p-6 md:p-8">
          <InboxHeaderSkeleton />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full min-h-0 flex-col overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col gap-8 p-6 md:p-8">
        {children}
      </div>
    </div>
  );
}

// Custom hook for search with debouncing
function useSearchState() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return { searchQuery, setSearchQuery, debouncedSearchQuery };
}

// Custom hook for capture state
function useCaptureState() {
  const [captureText, setCaptureText] = useState("");

  const clearCapture = useCallback(() => {
    setCaptureText("");
  }, []);

  return { captureText, setCaptureText, clearCapture };
}

// Custom hook for items filtering
function useFilteredItems(items) {
  return useMemo(() => {
    const openItems = items?.filter((item) => item.status === "open") ?? [];
    const archivedItems =
      items?.filter((item) => item.status === "archived") ?? [];
    return { openItems, archivedItems };
  }, [items]);
}

// Custom hook for client-side filtering
function useClientSideFiltering(
  openItems,
  archivedItems,
  searchQuery,
  debouncedSearchQuery,
) {
  return useMemo(() => {
    if (!searchQuery || debouncedSearchQuery) {
      return {
        filteredOpenItems: openItems,
        filteredArchivedItems: archivedItems,
      };
    }

    const filterItems = (items) =>
      items.filter((item) =>
        item.content.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    return {
      filteredOpenItems: filterItems(openItems),
      filteredArchivedItems: filterItems(archivedItems),
    };
  }, [openItems, archivedItems, searchQuery, debouncedSearchQuery]);
}

export default function InboxPage() {
  const { captureText, setCaptureText, clearCapture } = useCaptureState();
  const { searchQuery, setSearchQuery, debouncedSearchQuery } =
    useSearchState();
  const [activeTab, setActiveTab] = useState("open");

  const { items, isLoading: isItemsLoading } = useInboxItems({
    status: activeTab,
    searchQuery: debouncedSearchQuery,
    limit: 50,
  });

  const { open, archived, isLoading: isCountsLoading } = useInboxCounts();
  const { openItems, archivedItems } = useFilteredItems(items);
  const { filteredOpenItems, filteredArchivedItems } = useClientSideFiltering(
    openItems,
    archivedItems,
    searchQuery,
    debouncedSearchQuery,
  );

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

  const handleCapture = useCallback(async () => {
    const newItem = await captureItem(captureText);
    if (newItem?._id) {
      setCaptureText("");
      animateNewItem(String(newItem._id));
    }
  }, [captureText, captureItem, animateNewItem, setCaptureText]);

  const handleConvert = useCallback(
    async (id, type) => {
      if (type === "note") {
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

  const handleMobileConvert = useCallback(
    (type) => {
      if (!selectedItem) return;
      handleConvert(selectedItem._id, type);
      closeActions();
    },
    [selectedItem, handleConvert, closeActions],
  );

  const isLoading = isItemsLoading || isCountsLoading;

  return (
    <InboxContainer isLoading={isLoading}>
      <InboxHeader />
      <InboxContent
        captureText={captureText}
        setCaptureText={setCaptureText}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openItems={openItems}
        archivedItems={archivedItems}
        filteredOpenItems={filteredOpenItems}
        filteredArchivedItems={filteredArchivedItems}
        openCount={open}
        archivedCount={archived}
        newItemIds={newItemIds}
        isLoading={isLoading}
        onCapture={handleCapture}
        onClearCapture={clearCapture}
        onArchive={archiveItem}
        onUnarchive={unarchiveItem}
        onDelete={deleteItem}
        onConvert={handleConvert}
        onOpenActions={openActions}
      />
      <MobileActionSheet
        item={selectedItem}
        open={isOpen}
        onOpenChange={closeActions}
        onArchive={archiveItem}
        onUnarchive={unarchiveItem}
        onDelete={deleteItem}
        onConvert={handleMobileConvert}
      />
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={clearToast} />
      )}
    </InboxContainer>
  );
}
