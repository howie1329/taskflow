"use client";

import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const InboxHeader = memo(function InboxHeader() {
  return (
    <header>
      <h1 className="sr-only">Inbox</h1>
      <p className="text-sm text-muted-foreground">Capture fast, triage later</p>
    </header>
  );
});

export function InboxHeaderSkeleton() {
  return (
    <div>
      <Skeleton className="h-4 w-56 max-w-full" />
    </div>
  );
}
