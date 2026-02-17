"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import {
  InboxHeader,
  InboxHeaderSkeleton,
  InboxContent,
  MobileActionSheet,
} from "@/components/inbox";
import {
  useInboxItems,
  useInboxCounts,
  useInboxActions,
  useNewItemsAnimation,
  useMobileActions,
} from "@/hooks/inbox";

// Container component with loading state
function InboxContainer({ children, isInitialLoading }) {
  if (isInitialLoading) {
    return (
      <div className="flex h-full w-full min-h-0 flex-col overflow-hidden">
        <div className="flex w-full flex-1 min-h-0 flex-col gap-3 px-3 py-3 md:px-4 md:py-4">
          <InboxHeaderSkeleton />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-9 w-full" />
          <div className="space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full min-h-0 flex-col overflow-hidden">
      <div className="flex w-full flex-1 min-h-0 flex-col gap-3 px-3 py-3 md:px-4 md:py-4">
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
    const normalizedSearch = searchQuery.trim().toLowerCase();
    const normalizedDebounced = debouncedSearchQuery.trim().toLowerCase();
    const isTypingAhead = Boolean(normalizedSearch) && normalizedSearch !== normalizedDebounced;

    if (!isTypingAhead) {
      return {
        filteredOpenItems: openItems,
        filteredArchivedItems: archivedItems,
        isTypingAhead: false,
      };
    }

    const filterItems = (items) =>
      items.filter((item) =>
        item.content.toLowerCase().includes(normalizedSearch),
      );

    return {
      filteredOpenItems: filterItems(openItems),
      filteredArchivedItems: filterItems(archivedItems),
      isTypingAhead: true,
    };
  }, [openItems, archivedItems, searchQuery, debouncedSearchQuery]);
}

export default function InboxPage() {
  const [captureText, setCaptureText] = useState("");
  const { searchQuery, setSearchQuery, debouncedSearchQuery } =
    useSearchState();
  const [activeTab, setActiveTab] = useState("open");
  const captureInputRef = useRef(null);
  const lastItemsRef = useRef(null);
  const lastCountsRef = useRef({ open: 0, archived: 0 });

  const { items, isLoading: isItemsLoading } = useInboxItems({
    status: activeTab,
    searchQuery: debouncedSearchQuery,
    limit: 50,
  });
  const { open, archived, isLoading: isCountsLoading } = useInboxCounts();

  useEffect(() => {
    if (items !== undefined) {
      lastItemsRef.current = items;
    }
  }, [items]);

  useEffect(() => {
    if (!isCountsLoading) {
      lastCountsRef.current = { open, archived };
    }
  }, [open, archived, isCountsLoading]);

  const visibleItems = items ?? lastItemsRef.current ?? [];
  const visibleOpenCount = isCountsLoading ? lastCountsRef.current.open : open;
  const visibleArchivedCount = isCountsLoading
    ? lastCountsRef.current.archived
    : archived;

  const { openItems, archivedItems } = useFilteredItems(visibleItems);
  const {
    filteredOpenItems,
    filteredArchivedItems,
    isTypingAhead,
  } = useClientSideFiltering(
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
  } = useInboxActions();

  const { newItemIds, animateNewItem } = useNewItemsAnimation();
  const { selectedItem, isOpen, openActions, closeActions } =
    useMobileActions();

  const handleCapture = useCallback(async () => {
    const newItem = await captureItem(captureText);
    if (newItem?._id) {
      setCaptureText("");
      animateNewItem(String(newItem._id));
      return true;
    }
    return false;
  }, [captureText, captureItem, animateNewItem]);

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
    async (type) => {
      if (!selectedItem) return;
      await handleConvert(selectedItem._id, type);
    },
    [selectedItem, handleConvert],
  );

  const handleCaptureFocus = useCallback(() => {
    captureInputRef.current?.focus();
  }, []);

  const handleMobileActionOpenChange = useCallback(
    (nextOpen) => {
      if (!nextOpen) {
        closeActions();
      }
    },
    [closeActions],
  );

  const isInitialLoading = isItemsLoading && !lastItemsRef.current;
  const isRefreshing = isItemsLoading && !!lastItemsRef.current;
  const isSearching = isTypingAhead || (searchQuery !== debouncedSearchQuery && isItemsLoading);

  return (
    <InboxContainer isInitialLoading={isInitialLoading}>
      <InboxHeader />
      <InboxContent
        captureText={captureText}
        setCaptureText={setCaptureText}
        captureInputRef={captureInputRef}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openItems={openItems}
        archivedItems={archivedItems}
        filteredOpenItems={filteredOpenItems}
        filteredArchivedItems={filteredArchivedItems}
        openCount={visibleOpenCount}
        archivedCount={visibleArchivedCount}
        newItemIds={newItemIds}
        isLoading={isInitialLoading}
        isRefreshing={isRefreshing}
        isSearching={isSearching}
        activeMobileItemId={isOpen && selectedItem ? String(selectedItem._id) : null}
        onCapture={handleCapture}
        onArchive={archiveItem}
        onUnarchive={unarchiveItem}
        onDelete={deleteItem}
        onConvert={handleConvert}
        onOpenActions={openActions}
        onCaptureFocus={handleCaptureFocus}
      />
      <MobileActionSheet
        item={selectedItem}
        open={isOpen}
        onOpenChange={handleMobileActionOpenChange}
        onArchive={archiveItem}
        onUnarchive={unarchiveItem}
        onDelete={deleteItem}
        onConvert={handleMobileConvert}
      />
    </InboxContainer>
  );
}
