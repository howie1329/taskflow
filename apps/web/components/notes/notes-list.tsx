"use client"

import { useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  NoteIcon,
  Add01Icon,
  PinIcon,
  MoreVerticalIcon,
  Delete01Icon,
  FolderManagementIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import type { NotesProject, Note, ViewMode } from "./types"

interface NoteRowProps {
  note: Note
  isSelected: boolean
  isMobile: boolean
  projectForNote: (projectId: string) => NotesProject | null
  onSelect: (noteId: string) => void
  onPin: (noteId: string) => void
  onMove: (noteId: string, newProjectId: string) => void
  onDelete: (noteId: string) => void
  projects: NotesProject[]
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function NoteRow({
  note,
  isSelected,
  isMobile,
  projectForNote,
  onSelect,
  onPin,
  onMove,
  onDelete,
  projects,
}: NoteRowProps) {
  const project = projectForNote(note.projectId)
  const snippet =
    note.contentText.slice(0, 60) +
    (note.contentText.length > 60 ? "..." : "")

  return (
    <div
      onClick={() => onSelect(note._id)}
      className={cn(
        "group relative flex cursor-pointer flex-col gap-1 px-3 py-2.5 transition-colors",
        "hover:bg-muted/45",
        isSelected && "bg-muted/55",
      )}
    >
      <span
        className={cn(
          "absolute left-0 top-0 h-full w-0.5 bg-transparent",
          isSelected && "bg-primary/65",
        )}
      />
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {note.pinned && (
            <HugeiconsIcon
              icon={PinIcon}
              className="size-3 shrink-0 text-primary"
            />
          )}
          <span className="truncate text-sm font-medium">
            {note.title || "Untitled"}
          </span>
        </div>
        {!isMobile && (
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={(e) => {
                e.stopPropagation()
                onPin(note._id)
              }}
              className={cn(note.pinned && "text-primary")}
            >
              <HugeiconsIcon icon={PinIcon} className="size-3" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={(e) => e.stopPropagation()}
                >
                  <HugeiconsIcon icon={MoreVerticalIcon} className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onPin(note._id)
                  }}
                >
                  <HugeiconsIcon icon={PinIcon} className="size-4 mr-2" />
                  {note.pinned ? "Unpin" : "Pin"}
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <HugeiconsIcon
                      icon={FolderManagementIcon}
                      className="size-4 mr-2"
                    />
                    Move to...
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-48">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        onMove(note._id, "__none__")
                      }}
                    >
                      No project
                    </DropdownMenuItem>
                    {projects.map((p) => (
                      <DropdownMenuItem
                        key={p._id}
                        onClick={(e) => {
                          e.stopPropagation()
                          onMove(note._id, p._id)
                        }}
                      >
                        {p.icon} {p.title}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(note._id)
                  }}
                  className="text-destructive"
                >
                  <HugeiconsIcon icon={Delete01Icon} className="size-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
      {snippet && (
        <p className="line-clamp-1 text-xs text-muted-foreground">{snippet}</p>
      )}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="tabular-nums">
          {formatRelativeTime(note.updatedAt)}
        </span>
        {project && (
          <span className="flex items-center gap-1">
            {project.icon} {project.title}
          </span>
        )}
      </div>
    </div>
  )
}

interface NotesListProps {
  sortedNotes: Note[]
  groupedNotes: { project: NotesProject | null; notes: Note[] }[] | null
  viewMode: ViewMode
  selectedNoteId: string | null
  projectFilter: string
  searchQuery: string
  isMobile: boolean
  onSelectNote: (noteId: string) => void
  onCreateNote: () => void
  onPinNote: (noteId: string) => void
  onMoveNote: (noteId: string, newProjectId: string) => void
  onDeleteNote: (noteId: string) => void
  projectForNote: (projectId: string) => NotesProject | null
  projects: NotesProject[]
}

export function NotesList({
  sortedNotes,
  groupedNotes,
  viewMode,
  selectedNoteId,
  projectFilter,
  searchQuery,
  isMobile,
  onSelectNote,
  onCreateNote,
  onPinNote,
  onMoveNote,
  onDeleteNote,
  projectForNote,
  projects,
}: NotesListProps) {
  const renderNoteRow = useCallback(
    (note: Note) => (
      <NoteRow
        key={note._id}
        note={note}
        isSelected={selectedNoteId === note._id}
        isMobile={isMobile}
        projectForNote={projectForNote}
        onSelect={onSelectNote}
        onPin={onPinNote}
        onMove={onMoveNote}
        onDelete={onDeleteNote}
        projects={projects}
      />
    ),
    [
      selectedNoteId,
      isMobile,
      projectForNote,
      onSelectNote,
      onPinNote,
      onMoveNote,
      onDeleteNote,
      projects,
    ],
  )

  if (sortedNotes.length === 0) {
    return (
      <Empty className="min-h-[220px]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={NoteIcon} className="size-4" />
          </EmptyMedia>
          <EmptyTitle>No notes found</EmptyTitle>
          <EmptyDescription>
            {searchQuery
              ? "Try adjusting your search"
              : projectFilter !== "all"
                ? "Create a note in this project"
                : "Create your first note to get started"}
          </EmptyDescription>
        </EmptyHeader>
        {!searchQuery && (
          <Button size="sm" onClick={onCreateNote}>
            <HugeiconsIcon icon={Add01Icon} className="size-4 mr-2" />
            New note
          </Button>
        )}
      </Empty>
    )
  }

  if (viewMode === "byProject" && groupedNotes) {
    return (
      <div className="space-y-3 p-2">
        {groupedNotes.map((group) => (
          <div
            key={group.project?._id || "__none__"}
            className="overflow-hidden rounded-lg border border-border/40 bg-background/40"
          >
            <div className="mb-2 flex items-center gap-2 px-1">
              <span className="text-[11px] font-medium text-muted-foreground">
                {group.project ? (
                  <>
                    {group.project.icon} {group.project.title}
                  </>
                ) : (
                  "No project"
                )}
              </span>
              <Badge
                variant="secondary"
                className="rounded-md bg-muted/60 text-[10px] tabular-nums"
              >
                {group.notes.length}
              </Badge>
            </div>
            <div className="divide-y divide-border/40">{group.notes.map(renderNoteRow)}</div>
          </div>
        ))}
      </div>
    )
  }

  return <div className="divide-y divide-border/40">{sortedNotes.map(renderNoteRow)}</div>
}
