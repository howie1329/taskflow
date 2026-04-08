import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
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
    <div className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain px-0 pb-8", className)}>
      <div className="space-y-4 pr-0">{children}</div>
    </div>
  )
}

export function RightPanelSummaryBar({
  eyebrow,
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
    <div className="border-b border-border/50 pb-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {eyebrow ? (
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {eyebrow}
              </span>
            ) : null}
            <div className="min-w-0 text-base font-semibold leading-snug tracking-tight text-foreground">
              {title}
            </div>
          </div>
          {description ? (
            <div className="text-xs leading-snug text-muted-foreground">{description}</div>
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
          className="rounded-md bg-muted/30 px-2 py-1 font-mono text-[11px] font-medium text-foreground"
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
    <section className={cn("space-y-3 border-b border-border/50 pb-4 last:border-b-0", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3 className="text-xs font-semibold tracking-tight text-foreground">{title}</h3>
          {description ? (
            <p className="text-xs leading-snug text-muted-foreground">{description}</p>
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
    <Collapsible defaultOpen={defaultOpen} className="group border-b border-border/50 pb-4 last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <CollapsibleTrigger className="flex min-w-0 flex-1 items-start gap-2 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <ChevronDownIcon className="mt-0.5 size-3 shrink-0 text-muted-foreground transition-transform duration-150 group-data-[state=open]:rotate-180" />
          <div className="min-w-0 space-y-1">
            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {title}
            </div>
            {description ? (
              <div className="text-xs leading-snug text-muted-foreground">{description}</div>
            ) : null}
          </div>
        </CollapsibleTrigger>
        {actions ? <div className="shrink-0 pt-0.5">{actions}</div> : null}
      </div>
      <CollapsibleContent className="data-[state=closed]:animate-out data-[state=open]:animate-in">
        <div className="mt-3 space-y-3 pl-5">{children}</div>
      </CollapsibleContent>
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
  return <div className={cn("flex flex-col gap-0", className)}>{children}</div>
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
        "rounded-md px-3 py-2 text-xs transition-colors hover:bg-accent/50",
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
    <div className="rounded-md border border-dashed border-border/60 px-3 py-3">
      <p className="text-xs font-medium text-foreground">{title}</p>
      <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{description}</p>
    </div>
  )
}

export function RightPanelDossierHeader({
  title,
  description,
  meta,
  actions,
  className,
  eyebrow,
}: {
  title: ReactNode
  description?: ReactNode
  meta?: ReactNode
  actions?: ReactNode
  className?: string
  eyebrow?: ReactNode
}) {
  return (
    <section className={cn("px-0 pt-0", className)}>
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            {eyebrow ? (
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {eyebrow}
              </p>
            ) : null}
            <div className="text-base font-semibold leading-snug tracking-tight text-foreground">
              {title}
            </div>
            {description ? (
              <p className="max-w-[28rem] text-xs leading-snug text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </div>
        {meta ? <div>{meta}</div> : null}
        <Separator className="bg-border/45" />
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
    <div className={cn("flex items-center gap-3 px-0", className)}>
      <div className="h-px flex-1 bg-border/60" />
      <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
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
    <section className={cn("space-y-3 border-b border-border/50 px-0 pb-4 last:border-b-0", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3 className="text-xs font-semibold tracking-tight text-foreground">{title}</h3>
          {description ? (
            <p className="text-xs leading-snug text-muted-foreground">{description}</p>
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
    <div className={cn("rounded-md bg-muted/30 px-3 py-3", className)}>{children}</div>
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
        "flex items-start justify-between gap-4 pb-2 text-xs last:pb-0",
        className,
      )}
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[16rem] text-right text-[11px] font-medium text-foreground">
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
        <Badge
          key={index}
          variant="ghost"
          className="h-6 rounded-full border border-border/45 bg-transparent px-2.5 text-[11px] font-medium text-muted-foreground hover:bg-transparent"
        >
          {tag}
        </Badge>
      ))}
    </div>
  )
}

export function RightPanelInlineMeta({
  items,
  className,
}: {
  items: Array<ReactNode | null | false | undefined>
  className?: string
}) {
  const visibleItems = items.filter(Boolean)
  if (visibleItems.length === 0) return null

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground",
        className,
      )}
    >
      {visibleItems.map((item, index) => (
        <div key={index} className="inline-flex items-center gap-3">
          {index > 0 ? <span className="text-border">/</span> : null}
          <span>{item}</span>
        </div>
      ))}
    </div>
  )
}
