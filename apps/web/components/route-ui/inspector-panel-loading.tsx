import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

/** Loading UI for parallel `@right` inspector slots (chat / notes dossier). */
export default function InspectorPanelLoading({
  className,
}: {
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-4 pt-3",
        className,
      )}
      aria-busy="true"
      aria-label="Loading panel"
    >
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-5 w-24" />
        <Spinner className="size-4 shrink-0 text-muted-foreground" />
      </div>
      <Skeleton className="min-h-[120px] w-full flex-1 rounded-lg" />
      <Skeleton className="h-8 w-full" />
    </div>
  )
}
