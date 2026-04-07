"use client";

import { memo } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { InboxItemRow } from "./InboxItemRow";
import { InboxEmptyState } from "./InboxEmptyState";

const tabTriggerClass =
  "group h-7 rounded-md px-2.5 text-xs font-medium text-muted-foreground data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-none data-[state=active]:after:hidden sm:px-3";

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
  activeMobileItemId,
}) {
  const displayOpenCount = openCount ?? openItems.length;
  const displayArchivedCount = archivedCount ?? archivedItems.length;

  return (
    <Tabs
      value={activeTab}
      onValueChange={onTabChange}
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      aria-label="Inbox tabs"
    >
      <TabsList
        variant="line"
        className="mb-2 h-8 w-max min-w-0 shrink-0 flex-nowrap rounded-md border border-border/70 bg-transparent p-0.5"
        role="tablist"
      >
        <TabsTrigger
          value="open"
          className={cn(tabTriggerClass, "gap-1.5")}
          role="tab"
          aria-label={`Open items (${displayOpenCount})`}
          aria-selected={activeTab === "open"}
        >
          Open
          <span
            className="tabular-nums text-[11px] text-muted-foreground group-data-[state=active]:text-accent-foreground"
            aria-hidden="true"
          >
            {displayOpenCount}
          </span>
        </TabsTrigger>
        <TabsTrigger
          value="archived"
          className={cn(tabTriggerClass, "gap-1.5")}
          role="tab"
          aria-label={`Archived items (${displayArchivedCount})`}
          aria-selected={activeTab === "archived"}
        >
          Archived
          <span
            className="tabular-nums text-[11px] text-muted-foreground group-data-[state=active]:text-accent-foreground"
            aria-hidden="true"
          >
            {displayArchivedCount}
          </span>
        </TabsTrigger>
      </TabsList>

      <TabsContent
        value="open"
        className="mt-0 flex min-h-0 flex-1 flex-col"
        role="tabpanel"
        aria-label="Open items"
      >
        {filteredOpenItems.length === 0 ? (
          <div className="flex min-h-0 flex-1 items-center justify-center p-4">
            <InboxEmptyState
              status="open"
              onCaptureFocus={onCaptureFocus}
              searchQuery={searchQuery}
            />
          </div>
        ) : (
          <div
            className="min-h-0 flex-1 overflow-y-auto"
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
                isMobileActionsOpen={
                  activeMobileItemId === String(item._id)
                }
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent
        value="archived"
        className="mt-0 flex min-h-0 flex-1 flex-col"
        role="tabpanel"
        aria-label="Archived items"
      >
        {filteredArchivedItems.length === 0 ? (
          <div className="flex min-h-0 flex-1 items-center justify-center p-4">
            <InboxEmptyState status="archived" searchQuery={searchQuery} />
          </div>
        ) : (
          <div
            className="min-h-0 flex-1 overflow-y-auto"
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
                isMobileActionsOpen={
                  activeMobileItemId === String(item._id)
                }
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
});
