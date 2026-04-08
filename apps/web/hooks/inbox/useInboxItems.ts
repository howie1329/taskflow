"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";

export type InboxItem = Doc<"inboxItems">;
export type InboxItemId = InboxItem["_id"];
export type InboxItemStatus = "open" | "archived";

export interface UseInboxItemsOptions {
  status?: InboxItemStatus;
  searchQuery?: string;
  limit?: number;
}

export interface UseInboxItemsReturn {
  items: InboxItem[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function useInboxItems(
  options: UseInboxItemsOptions = {},
): UseInboxItemsReturn {
  const { status, searchQuery, limit = 50 } = options;

  const result = useQuery(api.inbox.listMyInboxItems, {
    status,
    searchQuery: searchQuery || undefined,
    limit,
  });

  return {
    items: result?.items,
    isLoading: result === undefined,
    error: null,
  };
}

export interface UseInboxCountsReturn {
  open: number;
  archived: number;
  isLoading: boolean;
}

export function useInboxCounts(): UseInboxCountsReturn {
  const counts = useQuery(api.inbox.getInboxCounts, {});

  return {
    open: counts?.open ?? 0,
    archived: counts?.archived ?? 0,
    isLoading: counts === undefined,
  };
}
