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
  searchInputRef,
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
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <div className="z-10 shrink-0 space-y-2 border-b border-border/50 py-2">
        <InboxCapture
          value={captureText}
          onChange={setCaptureText}
          onCapture={onCapture}
          inputRef={captureInputRef}
          disabled={isLoading}
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <InboxFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            inputRef={searchInputRef}
            isSearching={isSearching}
            className="min-w-0 flex-1"
          />
          {(isRefreshing || isSearching) && (
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15, ease: snapEase }}
              className="inline-flex shrink-0 items-center gap-1.5 text-[11px] text-muted-foreground"
              aria-live="polite"
            >
              <HugeiconsIcon
                icon={Loading03Icon}
                className={cn(
                  "size-3.5",
                  !prefersReducedMotion && "animate-spin",
                )}
              />
              {isSearching ? "Searching…" : "Updating…"}
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
