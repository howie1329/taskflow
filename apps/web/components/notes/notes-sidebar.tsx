"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon, Add01Icon } from "@hugeicons/core-free-icons"
import { NotesList } from "./notes-list"
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
  filteredNotes,
  sortedNotes,
  groupedNotes,
  selectedNoteId,
  projectFilter,
  searchQuery,
  viewMode,
  isMobile,
  onProjectFilterChange,
  onSearchQueryChange,
  onViewModeChange,
  onSelectNote,
  onCreateNote,
  onPinNote,
  onMoveNote,
  onDeleteNote,
  projectForNote,
  projects,
  searchInputRef,
}: NotesSidebarProps) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 space-y-2 border-b border-border/40 bg-background/70 pb-2 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Organize your thoughts</p>
          <Button size="sm" className="h-8" onClick={onCreateNote}>
            <HugeiconsIcon icon={Add01Icon} className="mr-2 size-4" />
            New note
          </Button>
        </div>

        <div className="space-y-2 rounded-lg border border-border/40 bg-background/50 p-2">
          <Select value={projectFilter} onValueChange={onProjectFilterChange}>
            <SelectTrigger className="h-8 border-border/50 text-xs">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project._id} value={project._id}>
                  <span className="mr-2">{project.icon}</span>
                  {project.title}
                </SelectItem>
              ))}
              <SelectItem value="__none__">No project</SelectItem>
            </SelectContent>
          </Select>

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

          <Tabs
            value={viewMode}
            onValueChange={(v) => onViewModeChange(v as ViewMode)}
          >
            <TabsList
              variant="line"
              className="w-full justify-start gap-1 border-b border-border/40 bg-transparent px-0"
            >
              <TabsTrigger value="byProject" className="flex-1 px-1.5">
                By project
                <Badge
                  variant="secondary"
                  className="ml-1.5 h-4 rounded-md bg-muted/60 px-1 py-0 text-[10px]"
                >
                  {filteredNotes.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex-1 px-1.5">
                Recent
                <Badge
                  variant="secondary"
                  className="ml-1.5 h-4 rounded-md bg-muted/60 px-1 py-0 text-[10px]"
                >
                  {filteredNotes.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="pinned" className="flex-1 px-1.5">
                Pinned
                <Badge
                  variant="secondary"
                  className="ml-1.5 h-4 rounded-md bg-muted/60 px-1 py-0 text-[10px]"
                >
                  {notes.filter((n) => n.pinned).length}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden pt-2">
        <div className="h-full overflow-y-auto rounded-xl border border-border/40 bg-background/50">
          <NotesList
            sortedNotes={sortedNotes}
            groupedNotes={groupedNotes}
            viewMode={viewMode}
            selectedNoteId={selectedNoteId}
            projectFilter={projectFilter}
            searchQuery={searchQuery}
            isMobile={isMobile}
            onSelectNote={onSelectNote}
            onCreateNote={onCreateNote}
            onPinNote={onPinNote}
            onMoveNote={onMoveNote}
            onDeleteNote={onDeleteNote}
            projectForNote={projectForNote}
            projects={projects}
          />
        </div>
      </div>
    </div>
  )
}
