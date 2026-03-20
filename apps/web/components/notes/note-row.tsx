"use client"

import { PinIcon, MoreHorizontalIcon, Delete01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { getTemplateByNoteType } from "./note-templates"
import type { Note, NotesProject } from "./types"

interface NoteRowProps {
  note: Note
  isActive: boolean
  projectIcon?: string
  showPreview?: boolean
  onSelect: () => void
  onTogglePin: () => void
  onMove: (newProjectId: string) => void
  onDelete: () => void
  projects: NotesProject[]
}

export function NoteRow({
  note,
  isActive,
  projectIcon,
  showPreview = false,
  onSelect,
  onTogglePin,
  onMove,
  onDelete,
  projects,
}: NoteRowProps) {
  const noteTemplate = getTemplateByNoteType(note.noteType)
  const showTypeIcon = noteTemplate.noteType !== "blank"
  const preview = note.contentText.replace(/\s+/g, " ").trim()
  const timeLabel = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(note.updatedAt)

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative flex w-full max-w-full items-center gap-2 overflow-hidden rounded-lg px-2 py-1.5 text-left transition-colors duration-150",
        showPreview ? "text-xs" : "text-sm",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/60",
        isActive
          ? "bg-muted/80 text-foreground"
          : "text-foreground hover:bg-muted/45",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <div className="flex min-w-0 w-full max-w-full flex-1 items-center gap-2">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-w-0 items-center gap-1.5">
            {note.pinned && (
              <HugeiconsIcon
                icon={PinIcon}
                className="size-3 shrink-0 text-muted-foreground/75"
                strokeWidth={2}
              />
            )}
            {projectIcon && (
              <span className="shrink-0 text-[11px]" title="Project note">
                {projectIcon}
              </span>
            )}
            {showTypeIcon && (
              <HugeiconsIcon
                icon={noteTemplate.icon}
                className="size-3 shrink-0 text-muted-foreground/65"
                strokeWidth={2}
              />
            )}
            <span
              className={cn(
                "min-w-0 truncate font-medium",
                showPreview ? "text-xs" : "text-[12.5px]",
              )}
            >
              {note.title || "Untitled note"}
            </span>
          </div>
          {showPreview ? (
            <span className="mt-0.5 line-clamp-1 min-w-0 pr-2 text-[10.5px] leading-4 text-muted-foreground">
              {preview || "No content yet"}
            </span>
          ) : null}
        </div>
        <span className="shrink-0 text-[10px] text-muted-foreground/75">{timeLabel}</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            className="h-5 w-5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            <HugeiconsIcon icon={MoreHorizontalIcon} className="size-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault()
              onTogglePin()
            }}
          >
            <HugeiconsIcon icon={PinIcon} className="mr-2 size-3" />
            {note.pinned ? "Unpin" : "Pin"}
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Move to...</DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-40">
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault()
                  onMove("__none__")
                }}
              >
                No project
              </DropdownMenuItem>
              {projects.map((project) => (
                <DropdownMenuItem
                  key={project._id}
                  onSelect={(e) => {
                    e.preventDefault()
                    onMove(project._id)
                  }}
                >
                  {project.icon} {project.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={(e) => {
              e.preventDefault()
              onDelete()
            }}
          >
            <HugeiconsIcon icon={Delete01Icon} className="mr-2 size-3" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </button>
  )
}
