"use client";

import { memo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export const InboxHeader = memo(function InboxHeader() {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-medium tracking-tight">Inbox</h1>
      <p className="text-sm text-muted-foreground">
        Capture fast, triage later
      </p>
    </div>
  );
});

export function InboxHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-56" />
    </div>
  );
}
