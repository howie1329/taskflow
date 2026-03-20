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
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  const [isPinnedOpen, setIsPinnedOpen] = useState(true)
  const [isProjectsOpen, setIsProjectsOpen] = useState(true)
  const typeOptions = getAllTemplates()
  const primaryTypeKeys = ["all", "blank", "meeting", "research", "idea"]
  const primaryTypeOptions = [
    { key: "all", label: "All" },
    ...typeOptions
      .filter((template) => primaryTypeKeys.includes(template.key))
      .map((template) => ({
        key: template.noteType,
        label: template.label,
      })),
  ]
  const secondaryTypeOptions = typeOptions.filter(
    (template) => !primaryTypeKeys.includes(template.key),
  )
  const activeSecondaryType =
    typeFilter !== "all" &&
    !primaryTypeOptions.some((option) => option.key === typeFilter)
      ? typeOptions.find((template) => template.noteType === typeFilter) ?? null
      : null

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
      showPreview={isSidebar}
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
          isSidebar ? "p-2" : "p-3",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "font-medium text-muted-foreground",
              isSidebar ? "text-[10px] uppercase tracking-[0.12em]" : "text-sm",
            )}
          >
            Notes
          </span>
          <Button
            className={cn(
              "transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]",
              isSidebar
                ? "h-8 gap-1.5 rounded-md px-3 text-sm font-medium"
                : "h-8 rounded-lg px-3 text-xs",
            )}
            variant="outline"
            onClick={onCreateNote}
          >
            <HugeiconsIcon
              icon={PlusSignIcon}
              className={cn(
                "shrink-0",
                isSidebar ? "size-3" : "mr-2 size-3.5",
              )}
              strokeWidth={2}
            />
            New
          </Button>
        </div>

        <InputGroup className="w-full">
          <InputGroupAddon>
            <HugeiconsIcon
              icon={SearchIcon}
              className={cn(
                "stroke-2 shrink-0",
                isSidebar ? "size-3" : "size-4",
              )}
            />
          </InputGroupAddon>
          <InputGroupInput
            ref={searchInputRef}
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="h-8 text-sm"
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

        <div className="space-y-2">
          <Tabs value={typeFilter} onValueChange={onTypeFilterChange} className="gap-0">
            <TabsList
              variant="line"
              className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-none bg-transparent p-0"
            >
              {primaryTypeOptions.map((option) => (
                <TabsTrigger
                  key={option.key}
                  value={option.key}
                  className={cn(
                    "flex-none rounded-full border border-border/50 bg-background data-active:border-border data-active:bg-muted",
                    isSidebar
                      ? "h-8 px-3 text-xs"
                      : "h-7 px-2.5 text-[11px]",
                  )}
                >
                  {option.label}
                </TabsTrigger>
              ))}
              {activeSecondaryType ? (
                <TabsTrigger
                  value={activeSecondaryType.noteType}
                  className={cn(
                    "flex-none rounded-full border border-border/50 bg-background data-active:border-border data-active:bg-muted",
                    isSidebar
                      ? "h-8 px-3 text-xs"
                      : "h-7 px-2.5 text-[11px]",
                  )}
                >
                  {activeSecondaryType.label}
                </TabsTrigger>
              ) : null}
            </TabsList>
          </Tabs>

          {secondaryTypeOptions.length > 0 ? (
            <Select value={activeSecondaryType?.noteType ?? "all"} onValueChange={onTypeFilterChange}>
              <SelectTrigger size="sm" className="w-full justify-start border-dashed">
                <SelectValue placeholder="More types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {secondaryTypeOptions.map((template) => (
                  <SelectItem key={template.key} value={template.noteType}>
                    {template.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0 [&>div>div]:w-full!">
        <div className={cn("w-full max-w-full", isSidebar ? "space-y-2 p-2" : "space-y-3 p-3")}>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-border bg-muted/30 px-3 py-3"
                >
                  <Skeleton className="mb-2 h-3.5 w-2/3" />
                  <Skeleton className="mb-2 h-3 w-full" />
                  <Skeleton className="h-2.5 w-24" />
                </div>
              ))}
            </div>
          ) : (totalNotesCount ?? notes.length) === 0 ? (
            <Empty className="min-h-[260px]">
              <EmptyHeader>
                <EmptyMedia
                  variant="icon"
                  className="size-8 rounded-lg border border-border text-muted-foreground [&_svg]:size-5"
                >
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
                  className="w-full max-w-full space-y-2"
                >
                  <CollapsibleTrigger
                    className={cn(
                      "group w-full text-left transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                      isSidebar
                        ? "flex h-8 items-center rounded-md px-3 hover:bg-muted"
                        : "rounded-lg border border-border/40 bg-muted/20 px-2 py-2 hover:bg-muted/40 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-between",
                        isSidebar && "w-full gap-1.5",
                      )}
                    >
                      <NoteSection
                        label="Pinned"
                        icon={
                          <HugeiconsIcon
                            icon={PinIcon}
                            className="size-3 shrink-0 text-muted-foreground"
                            strokeWidth={2}
                          />
                        }
                      />
                      <HugeiconsIcon
                        icon={ArrowDown01Icon}
                        className="size-3 shrink-0 text-muted-foreground transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-data-[state=open]:rotate-180"
                        strokeWidth={2}
                      />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="w-full max-w-full space-y-1">
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
                    pinnedNotes.length > 0 ? "mt-4 border-t border-border/40 pt-4" : "",
                    isSidebar ? "space-y-2" : "space-y-2.5",
                  )}
                >
                  <CollapsibleTrigger
                    className={cn(
                      "group w-full text-left transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                      isSidebar
                        ? "flex h-8 items-center rounded-md px-3 hover:bg-muted"
                        : "rounded-lg px-2 py-2 hover:bg-muted/40 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-between",
                        isSidebar && "w-full gap-1.5",
                      )}
                    >
                      <NoteSection label="Projects" />
                      <HugeiconsIcon
                        icon={ArrowDown01Icon}
                        className="size-3 shrink-0 text-muted-foreground transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group-data-[state=open]:rotate-180"
                        strokeWidth={2}
                      />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="w-full max-w-full space-y-1">
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
                <div
                  className={cn(
                    "w-full max-w-full space-y-2",
                    projectGroups.length > 0 || pinnedNotes.length > 0
                      ? "mt-4 border-t border-border/40 pt-4"
                      : "",
                  )}
                >
                  <NoteSection label="Latest" />
                  <div className="w-full max-w-full space-y-1">
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
