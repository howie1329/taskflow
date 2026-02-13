"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChatThreadInspectorPage() {
  const params = useParams();
  const threadId = typeof params.threadId === "string" ? params.threadId : "";
  const thread = useQuery(
    api.chat.getThread,
    threadId ? { threadId } : "skip",
  );

  if (!threadId) {
    return (
      <div className="space-y-2">
        <h2 className="text-sm font-semibold">Thread</h2>
        <p className="text-xs text-muted-foreground">No active thread.</p>
      </div>
    );
  }

  if (thread === undefined) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  if (thread === null) {
    return (
      <div className="space-y-2">
        <h2 className="text-sm font-semibold">Thread</h2>
        <p className="text-xs text-muted-foreground">
          Conversation details are unavailable.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="space-y-1.5">
        <h2 className="text-sm font-semibold">Thread</h2>
        <p className="text-sm">{thread.title}</p>
      </section>

      <section className="space-y-1.5">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Scope
        </h3>
        <p className="text-sm capitalize">{thread.scope ?? "workspace"}</p>
      </section>

      <section className="space-y-1.5">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Model
        </h3>
        <p className="text-sm">{thread.model ?? "Auto"}</p>
      </section>

      <section className="space-y-1.5">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Last updated
        </h3>
        <p className="text-sm">{new Date(thread.updatedAt).toLocaleString()}</p>
      </section>
    </div>
  );
}
