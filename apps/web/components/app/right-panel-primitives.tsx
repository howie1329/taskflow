import type { ReactNode } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { ChevronDownIcon } from "lucide-react"

export function RightPanelShell({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>{children}</div>
  )
}

export function RightPanelScrollBody({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn("min-h-0 flex-1 overflow-y-auto px-1 pb-6", className)}>
      <div className="space-y-3 pr-1">{children}</div>
    </div>
  )
}

export function RightPanelSummaryBar({
  eyebrow = "Summary",
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {eyebrow}
            </span>
            <div className="min-w-0 text-base font-semibold leading-snug text-foreground">
              {title}
            </div>
          </div>
          {description ? (
            <div className="text-sm leading-relaxed text-muted-foreground">
              {description}
            </div>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
    </div>
  )
}

export function RightPanelChipRow({
  chips,
  className,
}: {
  chips: Array<ReactNode | null | false | undefined>
  className?: string
}) {
  const visibleChips = chips.filter(Boolean)
  if (visibleChips.length === 0) return null

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {visibleChips.map((chip, index) => (
        <div
          key={index}
          className="rounded-md border border-border bg-muted/30 px-2 py-1 font-mono text-xs font-medium text-foreground"
        >
          {chip}
        </div>
      ))}
    </div>
  )
}

export function RightPanelSection({
  title,
  description,
  children,
  className,
  actions,
}: {
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  className?: string
  actions?: ReactNode
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-card px-4 py-4",
        className,
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3 className="text-sm font-medium tracking-[-0.01em] text-foreground">
            {title}
          </h3>
          {description ? (
            <p className="text-sm leading-6 text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {children}
    </section>
  )
}

export function RightPanelCollapsibleSection({
  title,
  description,
  children,
  defaultOpen = true,
  actions,
}: {
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  defaultOpen?: boolean
  actions?: ReactNode
}) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="group">
      <div className="rounded-lg border border-border bg-card px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <CollapsibleTrigger className="flex min-w-0 flex-1 items-start gap-3 text-left">
            <ChevronDownIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-data-[state=open]:rotate-180" />
            <div className="min-w-0 space-y-1">
              <div className="text-sm font-medium tracking-[-0.01em] text-foreground">
                {title}
              </div>
              {description ? (
                <div className="text-sm leading-6 text-muted-foreground">
                  {description}
                </div>
              ) : null}
            </div>
          </CollapsibleTrigger>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
        <CollapsibleContent className="pt-4 data-[state=closed]:animate-out data-[state=open]:animate-in">
          {children}
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

export function RightPanelList({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-border", className)}>
      {children}
    </div>
  )
}

export function RightPanelListRow({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "border-b border-border bg-background px-4 py-3 last:border-b-0",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function RightPanelEmptyState({
  title,
  description,
}: {
  title: ReactNode
  description: ReactNode
}) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/15 px-4 py-4">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  )
}
