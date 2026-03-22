"use client"

import { MoreHorizontalIcon, Delete01Icon, PinIcon } from "@hugeicons/core-free-icons"
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
  onSelect: () => void
  onTogglePin: () => void
  onMove: (newProjectId: string) => void
  onDelete: () => void
  projects: NotesProject[]
}

export function NoteRow({
  note,
  isActive,
  onSelect,
  onTogglePin,
  onMove,
  onDelete,
  projects,
}: NoteRowProps) {
  const noteTemplate = getTemplateByNoteType(note.noteType)
  const showTypeIcon = noteTemplate.noteType !== "blank"

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative flex h-8 min-h-8 w-full max-w-full items-center gap-1.5 overflow-hidden rounded-md px-3 text-left",
        "motion-safe:transition-colors motion-safe:duration-150 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        isActive
          ? "bg-muted font-medium text-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden">
        {note.pinned ? (
          <HugeiconsIcon
            icon={PinIcon}
            className="size-3 shrink-0 text-muted-foreground/80"
            strokeWidth={2}
          />
        ) : null}
        {showTypeIcon ? (
          <HugeiconsIcon
            icon={noteTemplate.icon}
            className="size-3 shrink-0 text-muted-foreground/70"
            strokeWidth={2}
          />
        ) : null}
        <span className="block min-w-0 flex-1 truncate text-xs font-normal">
          {note.title || "Untitled note"}
        </span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            className="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100"
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
