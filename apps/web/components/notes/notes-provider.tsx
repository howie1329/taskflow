"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams, useParams } from "next/navigation";
import type { MockProject, MockNote, ViewMode } from "./types";
import { mockNotesData, mockProjects, generateId } from "@/app/app/notes/components/mock-data";

type NotesContextValue = {
  notes: MockNote[];
  filteredNotes: MockNote[];
  sortedNotes: MockNote[];
  groupedNotes: { project: MockProject | null; notes: MockNote[] }[] | null;
  selectedNote: MockNote | null;
  selectedNoteId: string | null;
  projectFilter: string;
  searchQuery: string;
  viewMode: ViewMode;
  isSaved: boolean;
  deleteDialogOpen: boolean;
  noteToDelete: string | null;
  mockProjects: MockProject[];
  projectForNote: (projectId: string) => MockProject | null;
  setProjectFilter: (value: string) => void;
  setSearchQuery: (value: string) => void;
  setViewMode: (value: ViewMode) => void;
  createNote: () => void;
  selectNote: (noteId: string) => void;
  updateNote: (noteId: string, updates: Partial<MockNote>) => void;
  pinNote: (noteId: string) => void;
  moveNote: (noteId: string, newProjectId: string) => void;
  requestDeleteNote: (noteId: string) => void;
  confirmDelete: () => void;
  cancelDelete: () => void;
  closeEditor: () => void;
};

const NotesContext = createContext<NotesContextValue | null>(null);

function getViewMode(value: string | null): ViewMode {
  if (value === "recent" || value === "pinned") return value;
  return "byProject";
}

function buildQueryString({
  projectFilter,
  searchQuery,
  viewMode,
}: {
  projectFilter: string;
  searchQuery: string;
  viewMode: ViewMode;
}) {
  const params = new URLSearchParams();
  if (projectFilter !== "all") params.set("project", projectFilter);
  if (searchQuery) params.set("q", searchQuery);
  if (viewMode !== "byProject") params.set("view", viewMode);
  const queryString = params.toString();
  return queryString ? `?${queryString}` : "";
}

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();

  const [notes, setNotes] = useState<MockNote[]>(mockNotesData);
  const [projectFilter, setProjectFilter] = useState<string>(
    searchParams.get("project") || "all",
  );
  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get("q") || "",
  );
  const [viewMode, setViewMode] = useState<ViewMode>(
    getViewMode(searchParams.get("view")),
  );
  const [isSaved, setIsSaved] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  const selectedNoteId =
    typeof params.noteId === "string" ? params.noteId : null;

  const selectedNote = useMemo(
    () => notes.find((n) => n._id === selectedNoteId) || null,
    [notes, selectedNoteId],
  );

  const projectForNote = useCallback((projectId: string) => {
    if (projectId === "__none__") return null;
    return mockProjects.find((p) => p._id === projectId) || null;
  }, []);

  useEffect(() => {
    const nextProject = searchParams.get("project") || "all";
    const nextQuery = searchParams.get("q") || "";
    const nextView = getViewMode(searchParams.get("view"));

    setProjectFilter((prev) => (prev !== nextProject ? nextProject : prev));
    setSearchQuery((prev) => (prev !== nextQuery ? nextQuery : prev));
    setViewMode((prev) => (prev !== nextView ? nextView : prev));
  }, [searchParams]);

  useEffect(() => {
    const queryString = buildQueryString({
      projectFilter,
      searchQuery,
      viewMode,
    });
    if (!pathname.startsWith("/app/notes")) return;
    const nextUrl = `${pathname}${queryString}`;
    router.replace(nextUrl, { scroll: false });
  }, [projectFilter, searchQuery, viewMode, pathname, router]);

  useEffect(() => {
    if (!selectedNote) return;
    setIsSaved(false);
    const timer = setTimeout(() => {
      setIsSaved(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, [selectedNote?._id, selectedNote?.title, selectedNote?.content]);

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

  const buildNotesUrl = useCallback(
    (noteId?: string | null) => {
      const queryString = buildQueryString({
        projectFilter,
        searchQuery,
        viewMode,
      });
      if (!noteId) return `/app/notes${queryString}`;
      return `/app/notes/${noteId}${queryString}`;
    },
    [projectFilter, searchQuery, viewMode],
  );

  const createNote = useCallback(() => {
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
    router.push(buildNotesUrl(newNote._id));
  }, [buildNotesUrl, projectFilter, router]);

  const selectNote = useCallback(
    (noteId: string) => {
      router.push(buildNotesUrl(noteId));
    },
    [buildNotesUrl, router],
  );

  const updateNote = useCallback((noteId: string, updates: Partial<MockNote>) => {
    setNotes((prev) =>
      prev.map((n) =>
        n._id === noteId ? { ...n, ...updates, updatedAt: Date.now() } : n,
      ),
    );
  }, []);

  const pinNote = useCallback((noteId: string) => {
    setNotes((prev) =>
      prev.map((n) => (n._id === noteId ? { ...n, pinned: !n.pinned } : n)),
    );
  }, []);

  const moveNote = useCallback(
    (noteId: string, newProjectId: string) => {
      updateNote(noteId, { projectId: newProjectId });
    },
    [updateNote],
  );

  const requestDeleteNote = useCallback((noteId: string) => {
    setNoteToDelete(noteId);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!noteToDelete) return;
    setNotes((prev) => prev.filter((n) => n._id !== noteToDelete));
    if (selectedNoteId === noteToDelete) {
      router.push(buildNotesUrl(null));
    }
    setNoteToDelete(null);
    setDeleteDialogOpen(false);
  }, [noteToDelete, selectedNoteId, router, buildNotesUrl]);

  const cancelDelete = useCallback(() => {
    setDeleteDialogOpen(false);
    setNoteToDelete(null);
  }, []);

  const closeEditor = useCallback(() => {
    router.push(buildNotesUrl(null));
  }, [router, buildNotesUrl]);

  const value = useMemo<NotesContextValue>(
    () => ({
      notes,
      filteredNotes,
      sortedNotes,
      groupedNotes,
      selectedNote,
      selectedNoteId,
      projectFilter,
      searchQuery,
      viewMode,
      isSaved,
      deleteDialogOpen,
      noteToDelete,
      mockProjects,
      projectForNote,
      setProjectFilter,
      setSearchQuery,
      setViewMode,
      createNote,
      selectNote,
      updateNote,
      pinNote,
      moveNote,
      requestDeleteNote,
      confirmDelete,
      cancelDelete,
      closeEditor,
    }),
    [
      notes,
      filteredNotes,
      sortedNotes,
      groupedNotes,
      selectedNote,
      selectedNoteId,
      projectFilter,
      searchQuery,
      viewMode,
      isSaved,
      deleteDialogOpen,
      noteToDelete,
      projectForNote,
      createNote,
      selectNote,
      updateNote,
      pinNote,
      moveNote,
      requestDeleteNote,
      confirmDelete,
      cancelDelete,
      closeEditor,
    ],
  );

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error("useNotes must be used within a NotesProvider");
  }
  return context;
}
