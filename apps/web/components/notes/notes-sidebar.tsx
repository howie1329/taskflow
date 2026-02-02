"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, Add01Icon, NoteIcon } from "@hugeicons/core-free-icons";
import { NotesList } from "./notes-list";
import type { MockProject, MockNote, ViewMode } from "./types";

interface NotesSidebarProps {
  notes: MockNote[];
  filteredNotes: MockNote[];
  sortedNotes: MockNote[];
  groupedNotes: { project: MockProject | null; notes: MockNote[] }[] | null;
  selectedNoteId: string | null;
  projectFilter: string;
  searchQuery: string;
  viewMode: ViewMode;
  isMobile: boolean;
  onProjectFilterChange: (value: string) => void;
  onSearchQueryChange: (value: string) => void;
  onViewModeChange: (value: ViewMode) => void;
  onSelectNote: (noteId: string) => void;
  onCreateNote: () => void;
  onPinNote: (noteId: string) => void;
  onMoveNote: (noteId: string, newProjectId: string) => void;
  onDeleteNote: (noteId: string) => void;
  projectForNote: (projectId: string) => MockProject | null;
  mockProjects: MockProject[];
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
  mockProjects,
}: NotesSidebarProps) {
  return (
    <div className="flex h-full flex-col gap-4">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between">
        <p className="text-sm text-muted-foreground">Organize your thoughts</p>
        <Button size="sm" className="h-8" onClick={onCreateNote}>
          <HugeiconsIcon icon={Add01Icon} className="size-4 mr-2" />
          New note
        </Button>
      </div>

      {/* Controls */}
      <div className="shrink-0 space-y-3">
        {/* Project Filter */}
        <Select value={projectFilter} onValueChange={onProjectFilterChange}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="All projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All projects</SelectItem>
            {mockProjects.map((project) => (
              <SelectItem key={project._id} value={project._id}>
                <span className="mr-2">{project.icon}</span>
                {project.title}
              </SelectItem>
            ))}
            <SelectItem value="__none__">No project</SelectItem>
          </SelectContent>
        </Select>

        {/* Search */}
        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon-xs"
              className="absolute right-1 top-1/2 -translate-y-1/2"
              onClick={() => onSearchQueryChange("")}
            >
              ×
            </Button>
          )}
        </div>

        {/* View Tabs */}
        <Tabs
          value={viewMode}
          onValueChange={(v) => onViewModeChange(v as ViewMode)}
        >
          <TabsList variant="line" className="w-full">
            <TabsTrigger value="byProject" className="flex-1">
              By project
              <Badge
                variant="secondary"
                className="ml-1.5 rounded-none text-[10px] px-1 py-0 h-4"
              >
                {filteredNotes.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex-1">
              Recent
              <Badge
                variant="secondary"
                className="ml-1.5 rounded-none text-[10px] px-1 py-0 h-4"
              >
                {filteredNotes.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="pinned" className="flex-1">
              Pinned
              <Badge
                variant="secondary"
                className="ml-1.5 rounded-none text-[10px] px-1 py-0 h-4"
              >
                {notes.filter((n) => n.pinned).length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Separator />

      {/* Notes List */}
      <div className="min-h-0 flex-1 overflow-y-auto">
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
          mockProjects={mockProjects}
        />
      </div>
    </div>
  );
}
