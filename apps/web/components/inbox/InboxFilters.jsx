"use client";

import { memo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { AnimatePresence, motion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon, Search01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { SHORTCUT_DISPLAY } from "@/lib/keyboard-shortcuts";

export const InboxFilters = memo(function InboxFilters({
  searchQuery,
  onSearchChange,
  inputRef,
  isSearching = false,
  className = "",
}) {
  const handleClear = useCallback(() => {
    onSearchChange("");
  }, [onSearchChange]);

  const handleChange = useCallback(
    (e) => {
      onSearchChange(e.target.value);
    },
    [onSearchChange],
  );

  return (
    <div className={className}>
      <div className="relative w-full">
        <HugeiconsIcon
          icon={isSearching ? Loading03Icon : Search01Icon}
          className={cn(
            "absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground",
            isSearching && "animate-spin",
          )}
        />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search inbox…"
          value={searchQuery}
          onChange={handleChange}
          className="h-8 rounded-md border-border pl-8 text-xs focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Search inbox items"
        />
        <AnimatePresence>
          {searchQuery ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{
                duration: 0.14,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="absolute right-1.5 top-1/2 -translate-y-1/2"
            >
              <Button
                variant="ghost"
                size="icon-xs"
                className="size-6"
                onClick={handleClear}
                aria-label="Clear search"
              >
                ×
              </Button>
            </motion.div>
          ) : (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Kbd className="h-5 text-[10px]">{SHORTCUT_DISPLAY.localSearch}</Kbd>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});
