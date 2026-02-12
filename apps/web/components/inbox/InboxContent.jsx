"use client";

import { memo } from "react";
import { InboxCapture, InboxFilters, InboxTabs } from "@/components/inbox";

export const InboxContent = memo(function InboxContent({
  captureText,
  setCaptureText,
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
  onCapture,
  onClearCapture,
  onArchive,
  onUnarchive,
  onDelete,
  onConvert,
  onOpenActions,
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="-mx-4 mb-3 border-b border-border/50 bg-background/80 px-4 pb-4 backdrop-blur supports-backdrop-filter:bg-background/70">
        <div className="space-y-3">
          <InboxCapture
            value={captureText}
            onChange={setCaptureText}
            onCapture={onCapture}
            disabled={isLoading}
          />

          <InboxFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            className="pb-1"
          />
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
        onCaptureFocus={onClearCapture}
      />
    </div>
  );
});
