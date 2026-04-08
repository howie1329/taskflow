"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { ProfileForm } from "./profile-form";
import { useViewer } from "../hooks/use-viewer";

export function ProfileTab() {
  const { isLoading, displayValues } = useViewer();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40 rounded-md" />
          <Skeleton className="h-3 w-64 max-w-full rounded-md" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-3 w-20 rounded-md" />
            <Skeleton className="h-8 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-20 rounded-md" />
            <Skeleton className="h-8 w-full rounded-md" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-24 rounded-md" />
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      </div>
    );
  }

  return <ProfileForm initialData={displayValues} />;
}
