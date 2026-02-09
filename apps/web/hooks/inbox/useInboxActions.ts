"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";

export type InboxItem = Doc<"inboxItems">;
export type InboxItemId = InboxItem["_id"];

export interface ToastMessage {
  message: string;
  type: "success" | "info";
}

export interface UseInboxActionsReturn {
  captureItem: (content: string) => Promise<InboxItem | null>;
  archiveItem: (id: InboxItemId) => Promise<void>;
  unarchiveItem: (id: InboxItemId) => Promise<void>;
  deleteItem: (id: InboxItemId) => Promise<void>;
  convertToTask: (id: InboxItemId) => Promise<void>;
  convertToProject: (id: InboxItemId) => Promise<void>;
  toast: ToastMessage | null;
  clearToast: () => void;
}

export function useInboxActions(): UseInboxActionsReturn {
  const [toast, setToast] = useState<ToastMessage | null>(null);

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
        setToast({ message: "Item captured", type: "success" });
        return newItem;
      } catch {
        setToast({ message: "Failed to capture item", type: "info" });
        return null;
      }
    },
    [createInboxItem],
  );

  const archiveItem = useCallback(
    async (id: InboxItemId) => {
      try {
        await archiveInboxItem({ inboxItemId: id });
        setToast({ message: "Item archived", type: "success" });
      } catch {
        setToast({ message: "Failed to archive item", type: "info" });
      }
    },
    [archiveInboxItem],
  );

  const unarchiveItem = useCallback(
    async (id: InboxItemId) => {
      try {
        await unarchiveInboxItem({ inboxItemId: id });
        setToast({ message: "Item unarchived", type: "success" });
      } catch {
        setToast({ message: "Failed to unarchive item", type: "info" });
      }
    },
    [unarchiveInboxItem],
  );

  const deleteItem = useCallback(
    async (id: InboxItemId) => {
      try {
        await deleteInboxItem({ inboxItemId: id });
        setToast({ message: "Item deleted", type: "success" });
      } catch {
        setToast({ message: "Failed to delete item", type: "info" });
      }
    },
    [deleteInboxItem],
  );

  const convertToTask = useCallback(
    async (id: InboxItemId) => {
      try {
        await convertInboxItemToTask({ inboxItemId: id });
        setToast({ message: "Converted to task", type: "success" });
      } catch {
        setToast({ message: "Failed to convert item", type: "info" });
      }
    },
    [convertInboxItemToTask],
  );

  const convertToProject = useCallback(
    async (id: InboxItemId) => {
      try {
        await convertInboxItemToProject({ inboxItemId: id });
        setToast({ message: "Converted to project", type: "success" });
      } catch {
        setToast({ message: "Failed to convert item", type: "info" });
      }
    },
    [convertInboxItemToProject],
  );

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  return {
    captureItem,
    archiveItem,
    unarchiveItem,
    deleteItem,
    convertToTask,
    convertToProject,
    toast,
    clearToast,
  };
}
