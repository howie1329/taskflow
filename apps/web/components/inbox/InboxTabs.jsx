"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { InboxItemRow } from "./InboxItemRow";
import { InboxEmptyState } from "./InboxEmptyState";

export function InboxTabs({
  activeTab,
  onTabChange,
  openItems,
  archivedItems,
  filteredOpenItems,
  filteredArchivedItems,
  newItemIds,
  searchQuery,
  onArchive,
  onUnarchive,
  onDelete,
  onConvert,
  onOpenActions,
  onCaptureFocus,
}) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={onTabChange}
      className="flex-1 flex flex-col min-h-0"
    >
      <TabsList variant="line" className="mb-0">
        <TabsTrigger value="open" className="gap-2">
          Open
          <Badge
            variant="secondary"
            className="rounded-md tabular-nums bg-muted/70"
          >
            {openItems.length}
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="archived" className="gap-2">
          Archived
          <Badge
            variant="secondary"
            className="rounded-md tabular-nums bg-muted/70"
          >
            {archivedItems.length}
          </Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="open" className="flex-1 overflow-y-auto min-h-0">
        {filteredOpenItems.length === 0 ? (
          <InboxEmptyState
            status="open"
            onCaptureFocus={onCaptureFocus}
            searchQuery={searchQuery}
          />
        ) : (
          <div className="space-y-2 pb-4">
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

      <TabsContent value="archived" className="flex-1 overflow-y-auto min-h-0">
        {filteredArchivedItems.length === 0 ? (
          <InboxEmptyState status="archived" searchQuery={searchQuery} />
        ) : (
          <div className="space-y-2 pb-4">
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
}
