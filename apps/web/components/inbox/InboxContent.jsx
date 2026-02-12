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
    <div className="space-y-6">
      <InboxCapture
        value={captureText}
        onChange={setCaptureText}
        onCapture={onCapture}
        disabled={isLoading}
      />

      <InboxFilters searchQuery={searchQuery} onSearchChange={setSearchQuery} />

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
