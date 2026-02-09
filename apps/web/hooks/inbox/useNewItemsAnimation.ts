"use client";

import { useState, useCallback } from "react";

export interface UseNewItemsAnimationReturn {
  newItemIds: Set<string>;
  animateNewItem: (itemId: string) => void;
}

export function useNewItemsAnimation(): UseNewItemsAnimationReturn {
  const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set());

  const animateNewItem = useCallback((itemId: string) => {
    setNewItemIds((prev) => new Set(prev).add(itemId));

    // Remove animation after 1 second
    setTimeout(() => {
      setNewItemIds((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }, 1000);
  }, []);

  return {
    newItemIds,
    animateNewItem,
  };
}
