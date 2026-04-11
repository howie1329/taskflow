import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

/**
 * Default loading UI for authenticated workspace routes (`/app/*`).
 * Server Component — used from route `loading.tsx` files (Suspense fallback).
 */
export default function WorkspaceLoading({
  className,
}: {
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-2 md:p-2",
        className,
      )}
      aria-busy="true"
      aria-label="Loading"
    >
      <div className="flex shrink-0 items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-20" />
        </div>
        <Spinner className="size-4 shrink-0 text-muted-foreground" />
      </div>
      <div className="grid min-h-0 flex-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="flex min-h-[200px] flex-col gap-2 rounded-lg border border-border/60 bg-muted/20 p-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex min-h-[200px] flex-col gap-2 rounded-lg border border-border/60 bg-muted/20 p-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="min-h-[120px] w-full flex-1" />
          <Skeleton className="h-9 w-full max-w-md" />
        </div>
      </div>
    </div>
  )
}
