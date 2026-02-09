"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";

export type InboxItem = Doc<"inboxItems">;
export type InboxItemId = InboxItem["_id"];
export type InboxItemStatus = "open" | "archived";

export interface UseInboxItemsReturn {
  items: InboxItem[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

export function useInboxItems(status?: InboxItemStatus): UseInboxItemsReturn {
  const items = useQuery(api.inbox.listMyInboxItems, status ? { status } : {});

  return {
    items,
    isLoading: items === undefined,
    error: null,
  };
}
