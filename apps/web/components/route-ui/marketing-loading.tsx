import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

/** Minimal loading UI for public / marketing routes. */
export default function MarketingLoading({
  className,
}: {
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex min-h-dvh flex-col items-center justify-center gap-3 bg-background",
        className,
      )}
      aria-busy="true"
      aria-label="Loading"
    >
      <Spinner className="size-5 text-muted-foreground" />
      <p className="text-xs text-muted-foreground">Loading…</p>
    </div>
  )
}
