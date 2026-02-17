"use client";

import { useState, useMemo, useCallback } from "react";
import type { InboxItem } from "./useInboxItems";

export interface UseInboxFiltersReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: "open" | "archived";
  setActiveTab: (tab: "open" | "archived") => void;
  openItems: InboxItem[];
  archivedItems: InboxItem[];
  filteredOpenItems: InboxItem[];
  filteredArchivedItems: InboxItem[];
  openCount: number;
  archivedCount: number;
}

export function useInboxFilters(
  items: InboxItem[] | undefined,
): UseInboxFiltersReturn {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"open" | "archived">("open");

  const openItems = useMemo(() => {
    if (!items) return [];
    return items.filter((item) => item.status === "open");
  }, [items]);

  const archivedItems = useMemo(() => {
    if (!items) return [];
    return items.filter((item) => item.status === "archived");
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

  const handleSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSetActiveTab = useCallback((tab: "open" | "archived") => {
    setActiveTab(tab);
  }, []);

  return {
    searchQuery,
    setSearchQuery: handleSetSearchQuery,
    activeTab,
    setActiveTab: handleSetActiveTab,
    openItems,
    archivedItems,
    filteredOpenItems,
    filteredArchivedItems,
    openCount: openItems.length,
    archivedCount: archivedItems.length,
  };
}
