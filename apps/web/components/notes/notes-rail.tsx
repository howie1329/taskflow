"use client"

import { useState, type RefObject } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  Cancel01Icon,
  NoteIcon,
  PinIcon,
  PlusSignIcon,
  SearchIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { getAllTemplates } from "./note-templates"
import type { Note, NotesProject } from "./types"
import { NoteRow } from "./note-row"
import { NoteSection } from "./note-section"
import { ProjectNoteGroup } from "./project-note-group"

interface NotesRailProps {
  className?: string
  variant?: "rail" | "sidebar"
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  notes: Note[]
  totalNotesCount?: number
  projects: NotesProject[]
  typeFilter: string
  onTypeFilterChange: (value: string) => void
  activeNoteId: string | null
  onCreateNote: () => void
  onSelectNote: (noteId: string) => void
  onTogglePin: (noteId: string) => void
  onMoveNote: (noteId: string, newProjectId: string) => void
  onDeleteNote: (noteId: string) => void
  searchInputRef?: RefObject<HTMLInputElement | null>
}

export function NotesRail({
  className,
  variant = "rail",
  searchQuery,
  onSearchQueryChange,
  notes,
  totalNotesCount,
  projects,
  typeFilter,
  onTypeFilterChange,
  activeNoteId,
  onCreateNote,
  onSelectNote,
  onTogglePin,
  onMoveNote,
  onDeleteNote,
  searchInputRef,
}: NotesRailProps) {
  const [isPinnedOpen, setIsPinnedOpen] = useState(true)
  const [isProjectsOpen, setIsProjectsOpen] = useState(true)
  const typeOptions = getAllTemplates()

  const normalizedQuery = searchQuery.trim().toLowerCase()

  const filteredNotes = normalizedQuery
    ? notes.filter(
        (note) =>
          note.title.toLowerCase().includes(normalizedQuery) ||
          note.contentText.toLowerCase().includes(normalizedQuery),
      )
    : notes

  const sortByUpdatedAtDesc = (a: Note, b: Note) => b.updatedAt - a.updatedAt

  const pinnedNotes = filteredNotes
    .filter((note) => note.pinned)
    .sort(sortByUpdatedAtDesc)

  const nonPinnedNotes = filteredNotes
    .filter((note) => !note.pinned)
    .sort(sortByUpdatedAtDesc)

  const projectNotes = nonPinnedNotes.filter((note) => note.projectId !== "__none__")
  const restNotes = nonPinnedNotes.filter((note) => note.projectId === "__none__")

  const projectGroups = projects
    .map((project) => ({
      project,
      notes: projectNotes.filter((note) => note.projectId === project._id),
    }))
    .filter((group) => group.notes.length > 0)

  const isSidebar = variant === "sidebar"

  const renderNoteRow = (note: Note, projectIcon?: string) => (
    <NoteRow
      key={note._id}
      note={note}
      isActive={note._id === activeNoteId}
      projectIcon={projectIcon}
      onSelect={() => onSelectNote(note._id)}
      onTogglePin={() => onTogglePin(note._id)}
      onMove={(newProjectId) => onMoveNote(note._id, newProjectId)}
      onDelete={() => onDeleteNote(note._id)}
      projects={projects}
    />
  )

  return (
    <nav
      aria-label="Notes"
      className={cn(
        "flex min-h-0 flex-col text-foreground",
        isSidebar ? "w-full flex-1 bg-transparent" : "w-full shrink-0 bg-background",
        className,
      )}
    >
      <div
        className={cn(
          "sticky top-0 z-10 bg-transparent space-y-2",
          isSidebar ? "p-2.5" : "p-3",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "font-medium text-muted-foreground",
              isSidebar ? "text-xs" : "text-sm",
            )}
          >
            Notes
          </span>
          <Button
            className={cn("rounded-lg", isSidebar ? "h-7 px-2 text-xs" : "h-8 px-3 text-xs")}
            variant="outline"
            onClick={onCreateNote}
          >
            <HugeiconsIcon
              icon={PlusSignIcon}
              className={cn("mr-1", isSidebar ? "size-3" : "mr-2 size-3.5")}
              strokeWidth={2}
            />
            New
          </Button>
        </div>

        <InputGroup className="w-full">
          <InputGroupAddon>
            <HugeiconsIcon
              icon={SearchIcon}
              className={cn("stroke-2", isSidebar ? "size-3.5" : "size-4")}
            />
          </InputGroupAddon>
          <InputGroupInput
            ref={searchInputRef}
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className={cn("text-xs", isSidebar ? "h-7" : "h-8")}
          />
          {searchQuery && (
            <InputGroupAddon>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => onSearchQueryChange("")}
                className="h-5 w-5"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-3" strokeWidth={2} />
              </Button>
            </InputGroupAddon>
          )}
        </InputGroup>

        <Select value={typeFilter} onValueChange={onTypeFilterChange}>
          <SelectTrigger size="sm" className="w-full justify-start">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {typeOptions.map((template) => (
              <SelectItem key={template.key} value={template.noteType}>
                {template.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="flex-1 min-h-0 [&>div>div]:w-full!">
        <div className={cn("w-full max-w-full", isSidebar ? "space-y-2 p-2" : "space-y-3 p-3")}>
          {(totalNotesCount ?? notes.length) === 0 ? (
            <Empty className="min-h-[260px]">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HugeiconsIcon icon={NoteIcon} className="size-5" strokeWidth={2} />
                </EmptyMedia>
                <EmptyTitle>No notes yet</EmptyTitle>
                <EmptyDescription>Create your first note to get started</EmptyDescription>
              </EmptyHeader>
              <Button size="sm" onClick={onCreateNote}>
                New note
              </Button>
            </Empty>
          ) : filteredNotes.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p className="text-sm">No notes found</p>
              <Button
                variant="link"
                size="sm"
                onClick={() => onSearchQueryChange("")}
                className="mt-2"
              >
                Clear search
              </Button>
            </div>
          ) : (
            <>
              {pinnedNotes.length > 0 && (
                <Collapsible
                  open={isPinnedOpen}
                  onOpenChange={setIsPinnedOpen}
                  className="w-full max-w-full space-y-1.5"
                >
                  <CollapsibleTrigger className="group w-full rounded-sm px-1 py-1 text-left hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                    <div className="flex items-center justify-between">
                      <NoteSection
                        label="Pinned"
                        icon={
                          <HugeiconsIcon
                            icon={PinIcon}
                            className="size-3 text-muted-foreground"
                            strokeWidth={2}
                          />
                        }
                      />
                      <HugeiconsIcon
                        icon={ArrowDown01Icon}
                        className="size-3 text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
                        strokeWidth={2}
                      />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="w-full max-w-full space-y-0.5">
                    {pinnedNotes.map((note) => renderNoteRow(note))}
                  </CollapsibleContent>
                </Collapsible>
              )}

              {projectGroups.length > 0 && (
                <Collapsible
                  open={isProjectsOpen}
                  onOpenChange={setIsProjectsOpen}
                  className={cn(
                    "w-full max-w-full",
                    pinnedNotes.length > 0 ? "mt-3 pt-2" : "",
                    isSidebar ? "space-y-2" : "space-y-2.5",
                  )}
                >
                  <CollapsibleTrigger className="group w-full rounded-sm px-1 py-1 text-left hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                    <div className="flex items-center justify-between">
                      <NoteSection label="Projects" />
                      <HugeiconsIcon
                        icon={ArrowDown01Icon}
                        className="size-3 text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
                        strokeWidth={2}
                      />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="w-full max-w-full space-y-0.5">
                    {projectGroups.map((group) => (
                      <ProjectNoteGroup
                        key={group.project._id}
                        project={group.project}
                        notes={group.notes}
                      >
                        {group.notes.map((note) => renderNoteRow(note, group.project.icon))}
                      </ProjectNoteGroup>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}

              {restNotes.length > 0 && (
                <div className="w-full max-w-full space-y-1.5">
                  <NoteSection label="Latest" />
                  <div className="w-full max-w-full space-y-0.5">
                    {restNotes.map((note) => renderNoteRow(note))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </nav>
  )
}
