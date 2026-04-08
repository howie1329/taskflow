"use client";

import { useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { toast } from "sonner";

export type InboxItem = Doc<"inboxItems">;
export type InboxItemId = InboxItem["_id"];

export interface UseInboxActionsReturn {
  captureItem: (content: string) => Promise<InboxItem | null>;
  archiveItem: (id: InboxItemId) => Promise<void>;
  unarchiveItem: (id: InboxItemId) => Promise<void>;
  deleteItem: (id: InboxItemId) => Promise<void>;
  convertToTask: (id: InboxItemId) => Promise<void>;
  convertToProject: (id: InboxItemId) => Promise<void>;
}

export function useInboxActions(): UseInboxActionsReturn {
  const createInboxItem = useMutation(api.inbox.createInboxItem);
  const archiveInboxItem = useMutation(api.inbox.archiveInboxItem);
  const unarchiveInboxItem = useMutation(api.inbox.unarchiveInboxItem);
  const deleteInboxItem = useMutation(api.inbox.deleteInboxItem);
  const convertInboxItemToTask = useMutation(api.inbox.convertInboxItemToTask);
  const convertInboxItemToProject = useMutation(
    api.inbox.convertInboxItemToProject,
  );

  const captureItem = useCallback(
    async (content: string): Promise<InboxItem | null> => {
      const trimmed = content.trim();
      if (!trimmed) return null;

      try {
        const newItem = await createInboxItem({ content: trimmed });
        toast.success("Item captured");
        return newItem;
      } catch {
        toast.error("Failed to capture item");
        return null;
      }
    },
    [createInboxItem],
  );

  const archiveItem = useCallback(
    async (id: InboxItemId) => {
      try {
        await archiveInboxItem({ inboxItemId: id });
        toast.success("Item archived", {
          action: {
            label: "Undo",
            onClick: async () => {
              try {
                await unarchiveInboxItem({ inboxItemId: id });
                toast.success("Archive undone");
              } catch {
                toast.error("Failed to undo archive");
              }
            },
          },
        });
      } catch {
        toast.error("Failed to archive item");
      }
    },
    [archiveInboxItem, unarchiveInboxItem],
  );

  const unarchiveItem = useCallback(
    async (id: InboxItemId) => {
      try {
        await unarchiveInboxItem({ inboxItemId: id });
        toast.success("Item unarchived");
      } catch {
        toast.error("Failed to unarchive item");
      }
    },
    [unarchiveInboxItem],
  );

  const deleteItem = useCallback(
    async (id: InboxItemId) => {
      try {
        await deleteInboxItem({ inboxItemId: id });
        toast.success("Item deleted");
      } catch {
        toast.error("Failed to delete item");
      }
    },
    [deleteInboxItem],
  );

  const convertToTask = useCallback(
    async (id: InboxItemId) => {
      try {
        await convertInboxItemToTask({ inboxItemId: id });
        toast.success("Converted to task");
      } catch {
        toast.error("Failed to convert item");
      }
    },
    [convertInboxItemToTask],
  );

  const convertToProject = useCallback(
    async (id: InboxItemId) => {
      try {
        await convertInboxItemToProject({ inboxItemId: id });
        toast.success("Converted to project");
      } catch {
        toast.error("Failed to convert item");
      }
    },
    [convertInboxItemToProject],
  );

  return {
    captureItem,
    archiveItem,
    unarchiveItem,
    deleteItem,
    convertToTask,
    convertToProject,
  };
}
