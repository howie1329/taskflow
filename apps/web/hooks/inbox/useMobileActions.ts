"use client";

import { useState, useCallback } from "react";
import type { InboxItem } from "./useInboxItems";

export interface UseMobileActionsReturn {
  selectedItem: InboxItem | null;
  isOpen: boolean;
  openActions: (item: InboxItem) => void;
  closeActions: () => void;
}

export function useMobileActions(): UseMobileActionsReturn {
  const [selectedItem, setSelectedItem] = useState<InboxItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openActions = useCallback((item: InboxItem) => {
    setSelectedItem(item);
    setIsOpen(true);
  }, []);

  const closeActions = useCallback(() => {
    setIsOpen(false);
    // Delay clearing selected item to allow animation to complete
    setTimeout(() => setSelectedItem(null), 300);
  }, []);

  return {
    selectedItem,
    isOpen,
    openActions,
    closeActions,
  };
}
