"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  ArchiveIcon,
  InboxDownloadIcon,
} from "@hugeicons/core-free-icons";

export const InboxEmptyState = memo(function InboxEmptyState({
  status,
  onCaptureFocus,
  searchQuery,
}) {
  if (searchQuery) {
    return (
      <Empty className="min-h-[200px] py-16 md:py-24">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={Search01Icon} className="size-4" />
          </EmptyMedia>
          <EmptyTitle className="text-xl font-semibold">
            No matches found
          </EmptyTitle>
          <EmptyDescription className="text-xs text-muted-foreground">
            Try adjusting your search terms
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  if (status === "archived") {
    return (
      <Empty className="min-h-[200px]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={ArchiveIcon} className="size-4" />
          </EmptyMedia>
          <EmptyTitle className="text-xl font-semibold">
            No archived items
          </EmptyTitle>
          <EmptyDescription className="text-xs text-muted-foreground">
            Archived items will appear here. You can unarchive them anytime.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Empty className="min-h-[200px] py-16 md:py-24">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={InboxDownloadIcon} className="size-4" />
        </EmptyMedia>
        <EmptyTitle className="text-xl font-semibold">
          Your inbox is empty
        </EmptyTitle>
        <EmptyDescription className="text-xs text-muted-foreground">
          Use the capture box above to quickly dump thoughts, ideas, and tasks
          to process later.
        </EmptyDescription>
      </EmptyHeader>
      {onCaptureFocus && (
        <Button variant="outline" size="sm" onClick={onCaptureFocus}>
          Start capturing
          <Kbd className="ml-2">C</Kbd>
        </Button>
      )}
    </Empty>
  );
});
