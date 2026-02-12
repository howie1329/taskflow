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
      className="flex-1 flex flex-col min-h-0 overflow-hidden"
      aria-label="Inbox tabs"
    >
      <TabsList
        variant="line"
        className="mb-0 w-full justify-start gap-2 border-b border-border/50 bg-background/90 px-1 backdrop-blur supports-backdrop-filter:bg-background/80"
        role="tablist"
      >
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
        className="mt-0 flex-1 overflow-y-auto min-h-0 pt-3"
        role="tabpanel"
        aria-label="Open items"
      >
        <div className="overflow-hidden rounded-xl border border-border/50 bg-background/60">
          {filteredOpenItems.length === 0 ? (
            <div className="p-2">
              <InboxEmptyState
                status="open"
                onCaptureFocus={onCaptureFocus}
                searchQuery={searchQuery}
              />
            </div>
          ) : (
            <div
              className="divide-y divide-border/50"
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
        </div>
      </TabsContent>

      <TabsContent
        value="archived"
        className="mt-0 flex-1 overflow-y-auto min-h-0 pt-3"
        role="tabpanel"
        aria-label="Archived items"
      >
        <div className="overflow-hidden rounded-xl border border-border/50 bg-background/60">
          {filteredArchivedItems.length === 0 ? (
            <div className="p-2">
              <InboxEmptyState status="archived" searchQuery={searchQuery} />
            </div>
          ) : (
            <div
              className="divide-y divide-border/50"
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
        </div>
      </TabsContent>
    </Tabs>
  );
});
