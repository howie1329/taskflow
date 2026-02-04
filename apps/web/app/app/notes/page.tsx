"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { NotesSidebar } from "@/components/notes/notes-sidebar";
import { NoteEditor } from "@/components/notes/note-editor";
import type { MockProject, MockNote, ViewMode } from "@/components/notes/types";

// Mock data
const mockProjects: MockProject[] = [
  { _id: "p1", title: "Website Redesign", icon: "🎨" },
  { _id: "p2", title: "Q1 Planning", icon: "📊" },
  { _id: "p3", title: "Personal", icon: "🏠" },
];

const mockNotesData: MockNote[] = [
  {
    _id: "n1",
    projectId: "p1",
    title: "Color palette ideas",
    content:
      "Consider using a blue-grey primary with orange accents for the new landing page. Need to check contrast ratios.",
    pinned: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    updatedAt: Date.now() - 1000 * 60 * 30,
  },
  {
    _id: "n2",
    projectId: "p1",
    title: "Typography research",
    content:
      "Look into Inter and Geist as options. Also consider system font stack for performance.",
    pinned: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    _id: "n3",
    projectId: "__none__",
    title: "Random idea",
    content: "What if we added voice notes? Could be useful for quick capture.",
    pinned: false,
    createdAt: Date.now() - 1000 * 60 * 60,
    updatedAt: Date.now() - 1000 * 60 * 60,
  },
  {
    _id: "n4",
    projectId: "p2",
    title: "Meeting notes",
    content:
      "Discussed roadmap priorities. Focus on stability before new features.",
    pinned: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
    updatedAt: Date.now() - 1000 * 60 * 60 * 4,
  },
];

function generateId(): string {
  return Math.random().toString(36).slice(2);
}

export default function NotesPage() {
  const isMobile = useIsMobile();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Initialize state from URL params
  const [notes, setNotes] = useState<MockNote[]>(mockNotesData);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    searchParams.get("note") || null,
  );
  const [projectFilter, setProjectFilter] = useState<string>(
    searchParams.get("project") || "all",
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [viewMode, setViewMode] = useState<ViewMode>(
    (searchParams.get("view") as ViewMode) || "byProject",
  );
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(true);

  // Derived data
  const filteredNotes = useMemo(() => {
    let filtered = notes;

    if (projectFilter !== "all") {
      filtered = filtered.filter((n) => n.projectId === projectFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.content.toLowerCase().includes(query),
      );
    }

    return filtered;
  }, [notes, projectFilter, searchQuery]);

  const sortedNotes = useMemo(() => {
    let sorted = [...filteredNotes];

    if (viewMode === "recent") {
      sorted.sort((a, b) => b.updatedAt - a.updatedAt);
    } else if (viewMode === "pinned") {
      sorted = sorted.filter((n) => n.pinned);
      sorted.sort((a, b) => b.updatedAt - a.updatedAt);
    } else {
      const projectOrder = mockProjects.map((p) => p._id);
      sorted.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        const aIndex = projectOrder.indexOf(a.projectId);
        const bIndex = projectOrder.indexOf(b.projectId);
        if (aIndex !== bIndex) return aIndex - bIndex;
        return b.updatedAt - a.updatedAt;
      });
    }

    return sorted;
  }, [filteredNotes, viewMode]);

  const groupedNotes = useMemo(() => {
    if (viewMode !== "byProject") return null;

    const groups: { project: MockProject | null; notes: MockNote[] }[] = [];

    mockProjects.forEach((project) => {
      const projectNotes = sortedNotes.filter(
        (n) => n.projectId === project._id,
      );
      if (projectNotes.length > 0 || projectFilter === project._id) {
        groups.push({ project, notes: projectNotes });
      }
    });

    const noProjectNotes = sortedNotes.filter(
      (n) => n.projectId === "__none__",
    );
    if (noProjectNotes.length > 0 || projectFilter === "__none__") {
      groups.push({ project: null, notes: noProjectNotes });
    }

    return groups;
  }, [sortedNotes, viewMode, projectFilter]);

  const selectedNote = useMemo(
    () => notes.find((n) => n._id === selectedNoteId) || null,
    [notes, selectedNoteId],
  );

  const projectForNote = useCallback((projectId: string) => {
    if (projectId === "__none__") return null;
    return mockProjects.find((p) => p._id === projectId) || null;
  }, []);

  // Sync state to URL params
  useEffect(() => {
    const params = new URLSearchParams();

    if (selectedNoteId) params.set("note", selectedNoteId);
    if (projectFilter !== "all") params.set("project", projectFilter);
    if (searchQuery) params.set("q", searchQuery);
    if (viewMode !== "byProject") params.set("view", viewMode);

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }, [selectedNoteId, projectFilter, searchQuery, viewMode, router, pathname]);

  // Simulate save state - track when content changes
  useEffect(() => {
    if (!selectedNote) return;

    setIsSaved(false);
    const timer = setTimeout(() => {
      setIsSaved(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [selectedNote?._id, selectedNote?.title, selectedNote?.content]);

  // Actions
  const handleCreateNote = useCallback(() => {
    const newNote: MockNote = {
      _id: generateId(),
      projectId: projectFilter === "all" ? "__none__" : projectFilter,
      title: "",
      content: "",
      pinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setNotes((prev) => [newNote, ...prev]);
    setSelectedNoteId(newNote._id);
    if (isMobile) {
      setIsEditorOpen(true);
    }
  }, [projectFilter, isMobile]);

  const handleSelectNote = useCallback(
    (noteId: string) => {
      setSelectedNoteId(noteId);
      if (isMobile) {
        setIsEditorOpen(true);
      }
    },
    [isMobile],
  );

  const handleUpdateNote = useCallback(
    (noteId: string, updates: Partial<MockNote>) => {
      setNotes((prev) =>
        prev.map((n) =>
          n._id === noteId ? { ...n, ...updates, updatedAt: Date.now() } : n,
        ),
      );
    },
    [],
  );

  const handlePinNote = useCallback((noteId: string) => {
    setNotes((prev) =>
      prev.map((n) => (n._id === noteId ? { ...n, pinned: !n.pinned } : n)),
    );
  }, []);

  const handleMoveNote = useCallback(
    (noteId: string, newProjectId: string) => {
      handleUpdateNote(noteId, { projectId: newProjectId });
    },
    [handleUpdateNote],
  );

  const handleDeleteNote = useCallback((noteId: string) => {
    setNoteToDelete(noteId);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (noteToDelete) {
      setNotes((prev) => prev.filter((n) => n._id !== noteToDelete));
      if (selectedNoteId === noteToDelete) {
        setSelectedNoteId(null);
      }
      setNoteToDelete(null);
    }
    setDeleteDialogOpen(false);
  }, [noteToDelete, selectedNoteId]);

  const handleCloseSheet = useCallback(() => {
    setIsEditorOpen(false);
    setSelectedNoteId(null);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + N for new note
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        handleCreateNote();
      }
      // / for search focus
      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement;
        if (
          target.tagName !== "INPUT" &&
          target.tagName !== "TEXTAREA" &&
          !target.isContentEditable
        ) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
      // Esc to deselect
      if (e.key === "Escape" && selectedNoteId && !isMobile) {
        setSelectedNoteId(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleCreateNote, selectedNoteId, isMobile]);

  return (
    <div className="flex h-full w-full flex-col">
      {isMobile ? (
        <>
          <div className="flex h-full flex-col gap-4 p-4">
            <NotesSidebar
              notes={notes}
              filteredNotes={filteredNotes}
              sortedNotes={sortedNotes}
              groupedNotes={groupedNotes}
              selectedNoteId={selectedNoteId}
              projectFilter={projectFilter}
              searchQuery={searchQuery}
              viewMode={viewMode}
              isMobile={isMobile}
              onProjectFilterChange={setProjectFilter}
              onSearchQueryChange={setSearchQuery}
              onViewModeChange={setViewMode}
              onSelectNote={handleSelectNote}
              onCreateNote={handleCreateNote}
              onPinNote={handlePinNote}
              onMoveNote={handleMoveNote}
              onDeleteNote={handleDeleteNote}
              projectForNote={projectForNote}
              mockProjects={mockProjects}
              searchInputRef={searchInputRef}
            />
          </div>

          <Sheet open={isEditorOpen} onOpenChange={setIsEditorOpen}>
            <SheetContent
              side="bottom"
              className="h-[85vh] p-4"
              showCloseButton={false}
            >
              <div className="h-full overflow-y-auto">
                <NoteEditor
                  note={selectedNote}
                  isSaved={isSaved}
                  isInSheet={true}
                  mockProjects={mockProjects}
                  projectForNote={projectForNote}
                  onUpdateNote={handleUpdateNote}
                  onPinNote={handlePinNote}
                  onMoveNote={handleMoveNote}
                  onDeleteNote={handleDeleteNote}
                  onCreateNote={handleCreateNote}
                  onCloseSheet={handleCloseSheet}
                />
              </div>
            </SheetContent>
          </Sheet>
        </>
      ) : (
        <div className="flex h-full w-full min-h-0 overflow-hidden rounded-xl border border-border/60 bg-card/40 dark:bg-card/20">
          <div className="flex w-[350px] shrink-0 flex-col border-r border-border/60 p-4">
            <NotesSidebar
              notes={notes}
              filteredNotes={filteredNotes}
              sortedNotes={sortedNotes}
              groupedNotes={groupedNotes}
              selectedNoteId={selectedNoteId}
              projectFilter={projectFilter}
              searchQuery={searchQuery}
              viewMode={viewMode}
              isMobile={isMobile}
              onProjectFilterChange={setProjectFilter}
              onSearchQueryChange={setSearchQuery}
              onViewModeChange={setViewMode}
              onSelectNote={handleSelectNote}
              onCreateNote={handleCreateNote}
              onPinNote={handlePinNote}
              onMoveNote={handleMoveNote}
              onDeleteNote={handleDeleteNote}
              projectForNote={projectForNote}
              mockProjects={mockProjects}
              searchInputRef={searchInputRef}
            />
          </div>

          <div className="flex min-h-0 flex-1 min-w-0 flex-col p-4">
            <NoteEditor
              note={selectedNote}
              isSaved={isSaved}
              isInSheet={false}
              mockProjects={mockProjects}
              projectForNote={projectForNote}
              onUpdateNote={handleUpdateNote}
              onPinNote={handlePinNote}
              onMoveNote={handleMoveNote}
              onDeleteNote={handleDeleteNote}
              onCreateNote={handleCreateNote}
              onCloseSheet={handleCloseSheet}
            />
          </div>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete note?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The note will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNoteToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
