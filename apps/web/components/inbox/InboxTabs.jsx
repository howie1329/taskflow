"use client";

import { memo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { InboxItemRow } from "./InboxItemRow";
import { InboxEmptyState } from "./InboxEmptyState";

export const InboxTabs = memo(function InboxTabs({
  activeTab,
  onTabChange,
  openItems,
  archivedItems,
  filteredOpenItems,
  filteredArchivedItems,
  openCount,
  archivedCount,
  newItemIds,
  searchQuery,
  onArchive,
  onUnarchive,
  onDelete,
  onConvert,
  onOpenActions,
  onCaptureFocus,
}) {
  // Use total counts if provided, otherwise fall back to filtered items length
  const displayOpenCount = openCount ?? openItems.length;
  const displayArchivedCount = archivedCount ?? archivedItems.length;

  return (
    <Tabs
      value={activeTab}
      onValueChange={onTabChange}
      className="flex-1 flex flex-col min-h-0"
      aria-label="Inbox tabs"
    >
      <TabsList variant="line" className="mb-2" role="tablist">
        <TabsTrigger
          value="open"
          className="gap-2"
          role="tab"
          aria-label={`Open items (${displayOpenCount})`}
          aria-selected={activeTab === "open"}
        >
          Open
          <Badge
            variant="secondary"
            className="rounded-md tabular-nums bg-muted/70"
            aria-hidden="true"
          >
            {displayOpenCount}
          </Badge>
        </TabsTrigger>
        <TabsTrigger
          value="archived"
          className="gap-2"
          role="tab"
          aria-label={`Archived items (${displayArchivedCount})`}
          aria-selected={activeTab === "archived"}
        >
          Archived
          <Badge
            variant="secondary"
            className="rounded-md tabular-nums bg-muted/70"
            aria-hidden="true"
          >
            {displayArchivedCount}
          </Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent
        value="open"
        className="flex-1 overflow-y-auto min-h-0"
        role="tabpanel"
        aria-label="Open items"
      >
        {filteredOpenItems.length === 0 ? (
          <InboxEmptyState
            status="open"
            onCaptureFocus={onCaptureFocus}
            searchQuery={searchQuery}
          />
        ) : (
          <div
            className="space-y-3"
            role="list"
            aria-label={`${filteredOpenItems.length} open inbox items`}
          >
            {filteredOpenItems.map((item) => (
              <InboxItemRow
                key={item._id}
                item={item}
                onArchive={onArchive}
                onUnarchive={onUnarchive}
                onDelete={onDelete}
                onConvert={onConvert}
                onOpenActions={onOpenActions}
                isNew={newItemIds.has(String(item._id))}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent
        value="archived"
        className="flex-1 overflow-y-auto min-h-0"
        role="tabpanel"
        aria-label="Archived items"
      >
        {filteredArchivedItems.length === 0 ? (
          <InboxEmptyState status="archived" searchQuery={searchQuery} />
        ) : (
          <div
            className="space-y-3"
            role="list"
            aria-label={`${filteredArchivedItems.length} archived inbox items`}
          >
            {filteredArchivedItems.map((item) => (
              <InboxItemRow
                key={item._id}
                item={item}
                onArchive={onArchive}
                onUnarchive={onUnarchive}
                onDelete={onDelete}
                onConvert={onConvert}
                onOpenActions={onOpenActions}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
});
