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
    <div className={cn("min-h-0 flex-1 overflow-y-auto px-1 pb-8", className)}>
      <div className="space-y-4 pr-1">{children}</div>
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
    <div className="rounded-lg border border-border/50 bg-card px-4 py-3">
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
          className="rounded-md border border-border/50 bg-muted/20 px-2 py-1 font-mono text-xs font-medium text-foreground"
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
        "rounded-lg border border-border/50 bg-card px-4 py-4",
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
      <div className="rounded-lg border border-border/50 bg-card px-4 py-4">
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
    <div className={cn("overflow-hidden rounded-lg border border-border/50", className)}>
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

export function RightPanelDossierHeader({
  title,
  description,
  meta,
  actions,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  meta?: ReactNode
  actions?: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "sticky top-0 z-10 -mx-1 border-b border-border/55 bg-background/95 px-1 pb-4 pt-1 backdrop-blur supports-backdrop-filter:bg-background/88",
        className,
      )}
    >
      <div className="space-y-3 px-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Inspector
            </p>
            <div className="text-[18px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
              {title}
            </div>
            {description ? (
              <p className="max-w-[28rem] text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
        {meta ? <div>{meta}</div> : null}
      </div>
    </section>
  )
}

export function RightPanelSectionDivider({
  label,
  className,
}: {
  label: ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex items-center gap-3 px-2", className)}>
      <div className="h-px flex-1 bg-border/60" />
      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <div className="h-px flex-1 bg-border/60" />
    </div>
  )
}

export function RightPanelSectionBlock({
  title,
  description,
  actions,
  children,
  className,
}: {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn("space-y-3 px-2", className)}>
      <div className="flex items-start justify-between gap-3">
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

export function RightPanelSurface({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/45 bg-muted/10 px-4 py-4",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function RightPanelMetaList({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn("space-y-2", className)}>{children}</div>
}

export function RightPanelMetaRow({
  label,
  value,
  className,
}: {
  label: ReactNode
  value: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-border/40 pb-2 text-sm last:border-b-0 last:pb-0",
        className,
      )}
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[16rem] text-right font-medium text-foreground">
        {value}
      </span>
    </div>
  )
}

export function RightPanelTagRow({
  tags,
  className,
}: {
  tags: Array<ReactNode | null | false | undefined>
  className?: string
}) {
  const visibleTags = tags.filter(Boolean)
  if (visibleTags.length === 0) return null

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {visibleTags.map((tag, index) => (
        <span
          key={index}
          className="inline-flex min-h-6 items-center rounded-full border border-border/50 bg-background px-2.5 text-[11px] font-medium text-muted-foreground"
        >
          {tag}
        </span>
      ))}
    </div>
  )
}
