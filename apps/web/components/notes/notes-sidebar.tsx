"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon, Add01Icon } from "@hugeicons/core-free-icons"
import { ChevronDownIcon } from "lucide-react"
import { NotesRows } from "./notes-list"
import type { NotesProject, Note, ViewMode } from "./types"

interface NotesSidebarProps {
  notes: Note[]
  filteredNotes: Note[]
  sortedNotes: Note[]
  groupedNotes: { project: NotesProject | null; notes: Note[] }[] | null
  selectedNoteId: string | null
  projectFilter: string
  searchQuery: string
  viewMode: ViewMode
  isMobile: boolean
  onProjectFilterChange: (value: string) => void
  onSearchQueryChange: (value: string) => void
  onViewModeChange: (value: ViewMode) => void
  onSelectNote: (noteId: string) => void
  onCreateNote: () => void
  onPinNote: (noteId: string) => void
  onMoveNote: (noteId: string, newProjectId: string) => void
  onDeleteNote: (noteId: string) => void
  projectForNote: (projectId: string) => NotesProject | null
  projects: NotesProject[]
  searchInputRef?: React.RefObject<HTMLInputElement | null>
}

export function NotesSidebar({
  notes,
  selectedNoteId,
  searchQuery,
  isMobile,
  onSearchQueryChange,
  onSelectNote,
  onCreateNote,
  onPinNote,
  onMoveNote,
  onDeleteNote,
  projectForNote,
  projects,
  searchInputRef,
}: NotesSidebarProps) {
  const normalizedQuery = searchQuery.trim().toLowerCase()
  const visibleNotes = normalizedQuery
    ? notes.filter(
        (note) =>
          note.title.toLowerCase().includes(normalizedQuery) ||
          note.contentText.toLowerCase().includes(normalizedQuery),
      )
    : notes

  const sortByUpdatedAtDesc = (a: Note, b: Note) => b.updatedAt - a.updatedAt

  const pinnedNotes = visibleNotes
    .filter((note) => note.pinned)
    .sort(sortByUpdatedAtDesc)

  const unpinnedNotes = visibleNotes
    .filter((note) => !note.pinned)
    .sort(sortByUpdatedAtDesc)

  const projectGroups = projects
    .map((project) => ({
      project,
      notes: unpinnedNotes.filter((note) => note.projectId === project._id),
    }))
    .filter((group) => group.notes.length > 0)

  const knownProjectIds = new Set(projects.map((project) => project._id))
  const otherNotes = unpinnedNotes.filter(
    (note) => note.projectId === "__none__" || !knownProjectIds.has(note.projectId),
  )

  const hasAnySection =
    pinnedNotes.length > 0 || projectGroups.length > 0 || otherNotes.length > 0

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="sticky top-0 z-10 shrink-0 space-y-2 border-b border-border/40 bg-background/80 pb-2 backdrop-blur supports-backdrop-filter:bg-background/70">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Notes</p>
          <Button size="sm" className="h-8" onClick={onCreateNote}>
            <HugeiconsIcon icon={Add01Icon} className="mr-2 size-4" />
            New note
          </Button>
        </div>

        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="h-8 border-border/50 pl-8 text-xs"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon-xs"
              className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2"
              onClick={() => onSearchQueryChange("")}
            >
              ×
            </Button>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {!hasAnySection ? (
            <div className="flex min-h-[220px] items-center justify-center px-4 text-center text-xs text-muted-foreground">
              {normalizedQuery ? "No notes found for your search." : "No notes yet."}
            </div>
          ) : (
            <div>
              {pinnedNotes.length > 0 && (
                <Collapsible defaultOpen>
                  <CollapsibleTrigger className="group sticky top-0 z-10 flex w-full items-center justify-between border-b border-border/30 bg-background/80 px-3 py-1.5 text-left text-[11px] font-medium text-muted-foreground backdrop-blur supports-backdrop-filter:bg-background/70">
                    <span className="flex items-center gap-2">
                      Pinned
                      <Badge
                        variant="secondary"
                        className="h-4 rounded-md bg-muted/50 px-1 py-0 text-[10px] tabular-nums"
                      >
                        {pinnedNotes.length}
                      </Badge>
                    </span>
                    <ChevronDownIcon className="size-3.5 transition-transform group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <NotesRows
                      notes={pinnedNotes}
                      selectedNoteId={selectedNoteId}
                      isMobile={isMobile}
                      onSelectNote={onSelectNote}
                      onPinNote={onPinNote}
                      onMoveNote={onMoveNote}
                      onDeleteNote={onDeleteNote}
                      projectForNote={projectForNote}
                      projects={projects}
                    />
                  </CollapsibleContent>
                </Collapsible>
              )}

              {projectGroups.length > 0 && (
                <Collapsible defaultOpen>
                  <CollapsibleTrigger className="group sticky top-0 z-10 flex w-full items-center justify-between border-b border-border/30 bg-background/80 px-3 py-1.5 text-left text-[11px] font-medium text-muted-foreground backdrop-blur supports-backdrop-filter:bg-background/70">
                    <span className="flex items-center gap-2">
                      Projects
                      <Badge
                        variant="secondary"
                        className="h-4 rounded-md bg-muted/50 px-1 py-0 text-[10px] tabular-nums"
                      >
                        {projectGroups.reduce((total, group) => total + group.notes.length, 0)}
                      </Badge>
                    </span>
                    <ChevronDownIcon className="size-3.5 transition-transform group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    {projectGroups.map((group) => (
                      <div key={group.project._id}>
                        <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border/30 bg-background/75 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur supports-backdrop-filter:bg-background/65">
                          <span>
                            {group.project.icon} {group.project.title}
                          </span>
                          <Badge
                            variant="secondary"
                            className="h-4 rounded-md bg-muted/50 px-1 py-0 text-[10px] tabular-nums"
                          >
                            {group.notes.length}
                          </Badge>
                        </div>
                        <NotesRows
                          notes={group.notes}
                          selectedNoteId={selectedNoteId}
                          isMobile={isMobile}
                          onSelectNote={onSelectNote}
                          onPinNote={onPinNote}
                          onMoveNote={onMoveNote}
                          onDeleteNote={onDeleteNote}
                          projectForNote={projectForNote}
                          projects={projects}
                        />
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}

              {otherNotes.length > 0 && (
                <Collapsible defaultOpen>
                  <CollapsibleTrigger className="group sticky top-0 z-10 flex w-full items-center justify-between border-b border-border/30 bg-background/80 px-3 py-1.5 text-left text-[11px] font-medium text-muted-foreground backdrop-blur supports-backdrop-filter:bg-background/70">
                    <span className="flex items-center gap-2">
                      Other
                      <Badge
                        variant="secondary"
                        className="h-4 rounded-md bg-muted/50 px-1 py-0 text-[10px] tabular-nums"
                      >
                        {otherNotes.length}
                      </Badge>
                    </span>
                    <ChevronDownIcon className="size-3.5 transition-transform group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <NotesRows
                      notes={otherNotes}
                      selectedNoteId={selectedNoteId}
                      isMobile={isMobile}
                      onSelectNote={onSelectNote}
                      onPinNote={onPinNote}
                      onMoveNote={onMoveNote}
                      onDeleteNote={onDeleteNote}
                      projectForNote={projectForNote}
                      projects={projects}
                    />
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
