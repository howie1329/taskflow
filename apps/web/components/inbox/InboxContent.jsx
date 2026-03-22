"use client";

import { memo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import { InboxCapture, InboxFilters, InboxTabs } from "@/components/inbox";
import { cn } from "@/lib/utils";

export const InboxContent = memo(function InboxContent({
  captureText,
  setCaptureText,
  captureInputRef,
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  openItems,
  archivedItems,
  filteredOpenItems,
  filteredArchivedItems,
  openCount,
  archivedCount,
  newItemIds,
  isLoading,
  isRefreshing = false,
  isSearching = false,
  activeMobileItemId = null,
  onCapture,
  onArchive,
  onUnarchive,
  onDelete,
  onConvert,
  onOpenActions,
  onCaptureFocus,
}) {
  const prefersReducedMotion = useReducedMotion();

  const snapEase = [0.16, 1, 0.3, 1];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="sticky top-0 z-10 -mx-6 mb-2 border-b border-border bg-background/95 px-6 pb-3 pt-1 backdrop-blur-sm supports-backdrop-filter:bg-background/90 md:-mx-8 md:px-8">
        <div className="flex flex-col gap-2">
          <InboxCapture
            value={captureText}
            onChange={setCaptureText}
            onCapture={onCapture}
            inputRef={captureInputRef}
            disabled={isLoading}
          />

          <InboxFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isSearching={isSearching}
          />

          {(isRefreshing || isSearching) && (
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, ease: snapEase }}
              className="flex justify-end"
              aria-live="polite"
            >
              <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1 text-xs text-muted-foreground">
                <HugeiconsIcon
                  icon={Loading03Icon}
                  className={cn("size-3.5", !prefersReducedMotion && "animate-spin")}
                />
                {isSearching ? "Searching..." : "Updating..."}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <InboxTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        openItems={openItems}
        archivedItems={archivedItems}
        filteredOpenItems={filteredOpenItems}
        filteredArchivedItems={filteredArchivedItems}
        openCount={openCount}
        archivedCount={archivedCount}
        newItemIds={newItemIds}
        searchQuery={searchQuery}
        onArchive={onArchive}
        onUnarchive={onUnarchive}
        onDelete={onDelete}
        onConvert={onConvert}
        onOpenActions={onOpenActions}
        onCaptureFocus={onCaptureFocus}
        activeMobileItemId={activeMobileItemId}
      />
    </div>
  );
});
