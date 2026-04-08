"use client"

import { useMemo, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { NotesProject } from "./types"
import { getAllTemplates, type NoteType } from "./note-templates"

type CreateNoteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateNote: (options: {
    noteType: NoteType
    templateKey: string
    projectId?: string
  }) => Promise<void>
  projectFilter: string
  projects: NotesProject[]
}

export function CreateNoteDialog({
  open,
  onOpenChange,
  onCreateNote,
  projectFilter,
  projects,
}: CreateNoteDialogProps) {
  const [pendingTemplateKey, setPendingTemplateKey] = useState<string | null>(null)
  const templates = getAllTemplates()
  const quickStartTemplates = useMemo(
    () => templates.filter((template) => template.category === "quick"),
    [templates],
  )
  const structuredTemplates = useMemo(
    () => templates.filter((template) => template.category === "structured"),
    [templates],
  )
  const scopedProject =
    projectFilter !== "all" && projectFilter !== "__none__"
      ? projects.find((project) => project._id === projectFilter) ?? null
      : null

  const handleCreate = async (options: {
    noteType: NoteType
    templateKey: string
    projectId?: string
  }) => {
    setPendingTemplateKey(options.templateKey)
    try {
      await onCreateNote(options)
    } finally {
      setPendingTemplateKey(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grid max-h-[min(88vh,820px)] max-w-[calc(100%-1.5rem)] grid-rows-[auto_auto_minmax(0,1fr)] gap-0 overflow-hidden rounded-xl border-border p-0 shadow-lg sm:max-w-3xl">
        <DialogHeader className="border-b border-border px-5 pb-4 pt-5 pr-12 sm:px-6 sm:pb-4 sm:pt-6">
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Create note
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Pick a starting point. You can change the note type later without
            rewriting any content.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2 border-b border-border/60 px-5 py-3 sm:px-6">
          <Badge
            variant="outline"
            className="rounded-md border-border bg-muted/40 text-xs font-normal"
          >
            {templates.length} templates
          </Badge>
          <Badge
            variant="outline"
            className="rounded-md border-border bg-muted/40 text-xs font-normal"
          >
            {scopedProject
              ? `${scopedProject.icon} ${scopedProject.title}`
              : projectFilter === "__none__"
                ? "No project"
                : "All projects"}
          </Badge>
        </div>

        <div className="min-h-0 overflow-y-auto px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                    Quick create
                  </div>
                  <div className="mt-1 text-sm font-medium text-foreground">
                    Start a blank note instantly
                  </div>
                </div>
                <Button
                  size="default"
                  className="h-8 px-3 text-sm font-medium active:scale-[0.98] motion-safe:transition-transform motion-safe:duration-100"
                  disabled={pendingTemplateKey !== null}
                  onClick={() =>
                    void handleCreate({
                      noteType: "blank",
                      templateKey: "blank",
                      projectId: scopedProject?._id,
                    })
                  }
                >
                  <HugeiconsIcon
                    icon={quickStartTemplates[0]?.icon}
                    className="mr-2 size-4"
                    strokeWidth={2}
                  />
                  Blank note
                </Button>
              </div>
            </div>

            {[
              { title: "Quick start", templates: quickStartTemplates },
              { title: "Structured", templates: structuredTemplates },
            ].map((group) => (
              <div key={group.title} className="space-y-3">
                <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {group.title}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {group.templates.map((template) => {
                    const isPending = pendingTemplateKey === template.key

                    return (
                      <button
                        key={template.key}
                        type="button"
                        disabled={pendingTemplateKey !== null}
                        onClick={() => {
                          void handleCreate({
                            noteType: template.noteType,
                            templateKey: template.key,
                            projectId: scopedProject?._id,
                          })
                        }}
                        className={cn(
                          "group rounded-lg border border-border bg-card p-4 text-left",
                          "motion-safe:transition-[border-color,background-color,transform] motion-safe:duration-150 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]",
                          "hover:border-border hover:bg-muted/40",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                          "active:scale-[0.99]",
                          isPending && "pointer-events-none border-border bg-muted/50",
                        )}
                      >
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted/50 text-muted-foreground">
                              <HugeiconsIcon icon={template.icon} className="size-4" strokeWidth={2} />
                            </span>
                            <div>
                              <div className="text-sm font-medium">{template.label}</div>
                              <div className="text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                                {template.noteType.replace("_", " ")}
                              </div>
                            </div>
                          </div>
                          {template.key === "blank" ? (
                            <Badge
                              variant="outline"
                              className="rounded-md border-border bg-muted/30 text-[10px] font-normal"
                            >
                              Default
                            </Badge>
                          ) : null}
                        </div>
                        {isPending ? (
                          <div className="space-y-2">
                            <Skeleton className="h-3.5 w-24" />
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-5/6" />
                          </div>
                        ) : (
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {template.description}
                          </p>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}

            <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
              Templates only shape the starting structure. You can switch note type later without losing content.
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
