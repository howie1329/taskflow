"use client";

import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const InboxHeader = memo(function InboxHeader() {
  return (
    <header className="shrink-0 pb-2">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Inbox
      </h1>
      <p className="text-xs text-muted-foreground">
        Capture fast, triage later
      </p>
    </header>
  );
});

export function InboxHeaderSkeleton() {
  return (
    <div className="shrink-0 space-y-2 pb-2">
      <Skeleton className="h-7 w-28 rounded-md" />
      <Skeleton className="h-3 w-48 max-w-full rounded-md" />
    </div>
  );
}
