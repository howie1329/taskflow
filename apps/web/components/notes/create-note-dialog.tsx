"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  const templates = getAllTemplates()
  const scopedProject =
    projectFilter !== "all" && projectFilter !== "__none__"
      ? projects.find((project) => project._id === projectFilter) ?? null
      : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create note</DialogTitle>
          <DialogDescription>
            Pick a starting point. You can change the note type later without
            rewriting any content.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="rounded-md border-border/40 bg-background/70 text-[10px]"
          >
            {templates.length} templates
          </Badge>
          <Badge
            variant="outline"
            className="rounded-md border-border/40 bg-background/70 text-[10px]"
          >
            {scopedProject
              ? `${scopedProject.icon} ${scopedProject.title}`
              : projectFilter === "__none__"
                ? "No project"
                : "All projects"}
          </Badge>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {templates.map((template) => (
            <button
              key={template.key}
              type="button"
              onClick={() => {
                void onCreateNote({
                  noteType: template.noteType,
                  templateKey: template.key,
                  projectId: scopedProject?._id,
                })
              }}
              className={cn(
                "group rounded-xl border border-border/50 bg-background/70 px-4 py-4 text-left transition-colors",
                "hover:border-border hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
              )}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border/40 bg-muted/60 text-muted-foreground">
                    <HugeiconsIcon icon={template.icon} className="size-4" />
                  </span>
                  <div>
                    <div className="text-sm font-medium">{template.label}</div>
                    <div className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                      {template.noteType.replace("_", " ")}
                    </div>
                  </div>
                </div>
                {template.key === "blank" && (
                  <Badge
                    variant="outline"
                    className="rounded-md border-border/40 bg-background/70 text-[10px]"
                  >
                    Default
                  </Badge>
                )}
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {template.description}
              </p>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
