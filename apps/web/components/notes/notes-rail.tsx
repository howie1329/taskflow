"use client"

import { type RefObject } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Cancel01Icon,
  NoteIcon,
  PinIcon,
  PlusSignIcon,
  SearchIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
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
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { SHORTCUT_DISPLAY, SHORTCUT_HINT } from "@/lib/keyboard-shortcuts"
import type { Note, NotesProject } from "./types"
import { NoteRow } from "./note-row"
import { NoteSection } from "./note-section"

interface NotesRailProps {
  className?: string
  variant?: "rail" | "sidebar"
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  notes: Note[]
  totalNotesCount?: number
  projects: NotesProject[]
  typeFilter: string
  isLoading?: boolean
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
  isLoading = false,
  onTypeFilterChange,
  activeNoteId,
  onCreateNote,
  onSelectNote,
  onTogglePin,
  onMoveNote,
  onDeleteNote,
  searchInputRef,
}: NotesRailProps) {
  const sortByUpdatedAtDesc = (a: Note, b: Note) => b.updatedAt - a.updatedAt

  const pinnedNotes = notes
    .filter((note) => note.pinned)
    .sort(sortByUpdatedAtDesc)

  const recentNotes = notes
    .filter((note) => !note.pinned)
    .sort(sortByUpdatedAtDesc)

  const isSidebar = variant === "sidebar"
  const hasFilters = searchQuery.trim().length > 0 || typeFilter !== "all"
  const typeLabel =
    typeFilter === "all"
      ? null
      : typeFilter.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())

  const renderNoteRow = (note: Note) => (
    <NoteRow
      key={note._id}
      note={note}
      isActive={note._id === activeNoteId}
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
          "sticky top-0 z-10 space-y-2 bg-transparent",
          isSidebar ? "p-2" : "p-2.5 md:p-3",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Notes
          </span>
          <Button
            className={cn(
              "rounded-md transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]",
              isSidebar ? "size-8 shrink-0 p-0" : "h-8 px-3 text-xs font-medium",
            )}
            variant="ghost"
            onClick={onCreateNote}
            aria-label="New note"
            title={`New note (${SHORTCUT_HINT.createNew})`}
          >
            <HugeiconsIcon
              icon={PlusSignIcon}
              className={cn("shrink-0", isSidebar ? "size-3" : "mr-2 size-3.5")}
              strokeWidth={2}
            />
            {isSidebar ? (
              <span className="sr-only">New note</span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <span>New</span>
                <Kbd className="h-5 text-[10px]">{SHORTCUT_DISPLAY.createNew}</Kbd>
              </span>
            )}
          </Button>
        </div>

        <InputGroup className="w-full">
          <InputGroupAddon>
            <HugeiconsIcon
              icon={SearchIcon}
              className={cn("stroke-2 shrink-0", isSidebar ? "size-3" : "size-4")}
            />
          </InputGroupAddon>
          <InputGroupInput
            ref={searchInputRef}
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="h-8 text-xs"
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
          {!searchQuery && (
            <InputGroupAddon>
              <Kbd className="h-5 text-[10px]">{SHORTCUT_DISPLAY.localSearch}</Kbd>
            </InputGroupAddon>
          )}
        </InputGroup>

        {typeLabel ? (
          <div className="flex items-center justify-between gap-2 rounded-md border border-dashed border-border/50 px-3 py-2 text-xs text-muted-foreground">
            <span className="truncate">
              Filtered by <span className="text-foreground/90">{typeLabel}</span>
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 rounded-md px-2 text-xs"
              onClick={() => onTypeFilterChange("all")}
            >
              Clear
            </Button>
          </div>
        ) : null}
      </div>

      <ScrollArea className="flex-1 min-h-0 [&>div>div]:w-full!">
        <div
          className={cn(
            "w-full max-w-full min-w-0",
            isSidebar ? "space-y-2 p-2" : "space-y-2 p-2 md:space-y-3 md:p-3",
          )}
        >
          {isLoading ? (
            <div className="space-y-1.5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="rounded-md px-3 py-2">
                  <Skeleton className="h-3 w-2/3" />
                </div>
              ))}
            </div>
          ) : (totalNotesCount ?? notes.length) === 0 ? (
            <Empty className="min-h-[260px]">
              <EmptyHeader>
                <EmptyMedia
                  variant="icon"
                  className="size-8 rounded-lg bg-muted/30 text-muted-foreground [&_svg]:size-5"
                >
                  <HugeiconsIcon icon={NoteIcon} className="size-5" strokeWidth={2} />
                </EmptyMedia>
                <EmptyTitle className="text-base font-semibold leading-tight">
                  No notes yet
                </EmptyTitle>
                <EmptyDescription className="text-xs leading-snug">
                  Create your first note to get started
                </EmptyDescription>
              </EmptyHeader>
              <Button size="sm" onClick={onCreateNote}>
                New note
              </Button>
            </Empty>
          ) : notes.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <EmptyHeader>
                <EmptyTitle>No notes found</EmptyTitle>
                <EmptyDescription>{hasFilters ? "Try another query." : "No notes to show."}</EmptyDescription>
              </EmptyHeader>
              {hasFilters ? (
                <Button variant="link" size="sm" onClick={() => {
                  onSearchQueryChange("")
                  onTypeFilterChange("all")
                }}>
                  Clear filters
                </Button>
              ) : null}
            </div>
          ) : (
            <>
              {pinnedNotes.length > 0 ? (
                <section className="space-y-2">
                  <NoteSection
                    label="Pinned"
                    count={pinnedNotes.length}
                    icon={
                      <HugeiconsIcon
                        icon={PinIcon}
                        className="size-3 shrink-0 text-muted-foreground"
                        strokeWidth={2}
                      />
                    }
                  />
                  <div className="space-y-0.5">
                    {pinnedNotes.map((note) => renderNoteRow(note))}
                  </div>
                </section>
              ) : null}

              {recentNotes.length > 0 ? (
                <section
                  className={cn(
                    "space-y-2",
                    pinnedNotes.length > 0 ? "border-t border-border/50 pt-4" : "",
                  )}
                >
                  <NoteSection label="Latest" count={recentNotes.length} />
                  <div className="space-y-0.5">
                    {recentNotes.map((note) => renderNoteRow(note))}
                  </div>
                </section>
              ) : (
                <section
                  className={cn(
                    "space-y-2",
                    pinnedNotes.length > 0 ? "border-t border-border/50 pt-4" : "",
                  )}
                >
                  <NoteSection label="Latest" count={0} />
                  <div className="px-3 py-4 text-xs leading-snug text-muted-foreground">
                    All of your visible notes are pinned.
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </nav>
  )
}
