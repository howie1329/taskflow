"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams, useParams } from "next/navigation"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Doc } from "@/convex/_generated/dataModel"
import type { NotesProject, Note, ViewMode } from "./types"

type NotesContextValue = {
  notes: Note[]
  filteredNotes: Note[]
  sortedNotes: Note[]
  groupedNotes: { project: NotesProject | null; notes: Note[] }[] | null
  selectedNote: Note | null
  selectedNoteId: string | null
  projectFilter: string
  searchQuery: string
  viewMode: ViewMode
  isSaved: boolean
  isLoading: boolean
  deleteDialogOpen: boolean
  noteToDelete: string | null
  projects: NotesProject[]
  projectForNote: (projectId: string) => NotesProject | null
  setProjectFilter: (value: string) => void
  setSearchQuery: (value: string) => void
  setViewMode: (value: ViewMode) => void
  createNote: () => void
  selectNote: (noteId: string) => void
  updateNote: (noteId: string, updates: Partial<Note>) => void
  pinNote: (noteId: string) => void
  moveNote: (noteId: string, newProjectId: string) => void
  requestDeleteNote: (noteId: string) => void
  confirmDelete: () => void
  cancelDelete: () => void
  closeEditor: () => void
}

const NotesContext = createContext<NotesContextValue | null>(null)

function getViewMode(value: string | null): ViewMode {
  if (value === "recent" || value === "pinned") return value
  return "byProject"
}

function buildQueryString({
  projectFilter,
  searchQuery,
  viewMode,
}: {
  projectFilter: string
  searchQuery: string
  viewMode: ViewMode
}) {
  const params = new URLSearchParams()
  if (projectFilter !== "all") params.set("project", projectFilter)
  if (searchQuery) params.set("q", searchQuery)
  if (viewMode !== "byProject") params.set("view", viewMode)
  const queryString = params.toString()
  return queryString ? `?${queryString}` : ""
}

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const params = useParams()

  const notesData = useQuery(api.notes.listMyNotes)
  const projectsData = useQuery(api.projects.listMyProjects, {
    status: "active",
  })
  const createNoteMutation = useMutation(api.notes.createNote)
  const updateNoteMutation = useMutation(api.notes.updateNote)
  const deleteNoteMutation = useMutation(api.notes.deleteNote)

  const [projectFilter, setProjectFilter] = useState<string>(
    searchParams.get("project") || "all",
  )
  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get("q") || "",
  )
  const [viewMode, setViewMode] = useState<ViewMode>(
    getViewMode(searchParams.get("view")),
  )
  const [isSaved, setIsSaved] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isLoading = notesData === undefined || projectsData === undefined

  const notes = useMemo<Note[]>(
    () =>
      (notesData ?? []).map((note) => ({
        _id: String(note._id),
        projectId: note.projectId ? String(note.projectId) : "__none__",
        title: note.title,
        content: note.content,
        contentText: note.contentText,
        pinned: note.pinned,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
      })),
    [notesData],
  )

  const projects = useMemo<NotesProject[]>(
    () =>
      (projectsData ?? []).map((project) => ({
        _id: String(project._id),
        title: project.title,
        icon: project.icon,
      })),
    [projectsData],
  )

  const selectedNoteId =
    typeof params.noteId === "string" ? params.noteId : null

  const selectedNote = useMemo(
    () => notes.find((n) => n._id === selectedNoteId) || null,
    [notes, selectedNoteId],
  )

  const projectForNote = useCallback(
    (projectId: string) => {
      if (projectId === "__none__") return null
      return projects.find((p) => p._id === projectId) || null
    },
    [projects],
  )

  useEffect(() => {
    const nextProject = searchParams.get("project") || "all"
    const nextQuery = searchParams.get("q") || ""
    const nextView = getViewMode(searchParams.get("view"))

    setProjectFilter((prev) => (prev !== nextProject ? nextProject : prev))
    setSearchQuery((prev) => (prev !== nextQuery ? nextQuery : prev))
    setViewMode((prev) => (prev !== nextView ? nextView : prev))
  }, [searchParams])

  useEffect(() => {
    const queryString = buildQueryString({
      projectFilter,
      searchQuery,
      viewMode,
    })
    if (!pathname.startsWith("/app/notes")) return
    const nextUrl = `${pathname}${queryString}`
    router.replace(nextUrl, { scroll: false })
  }, [projectFilter, searchQuery, viewMode, pathname, router])

  useEffect(() => {
    if (!selectedNoteId) return
    setIsSaved(true)
  }, [selectedNoteId])

  const filteredNotes = useMemo(() => {
    let filtered = notes
    if (projectFilter !== "all") {
      filtered = filtered.filter((n) => n.projectId === projectFilter)
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.contentText.toLowerCase().includes(query),
      )
    }
    return filtered
  }, [notes, projectFilter, searchQuery])

  const sortedNotes = useMemo(() => {
    let sorted = [...filteredNotes]
    if (viewMode === "recent") {
      sorted.sort((a, b) => b.updatedAt - a.updatedAt)
    } else if (viewMode === "pinned") {
      sorted = sorted.filter((n) => n.pinned)
      sorted.sort((a, b) => b.updatedAt - a.updatedAt)
    } else {
      const projectOrder = projects.map((p) => p._id)
      sorted.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
        const aIndex = projectOrder.indexOf(a.projectId)
        const bIndex = projectOrder.indexOf(b.projectId)
        if (aIndex !== bIndex) return aIndex - bIndex
        return b.updatedAt - a.updatedAt
      })
    }
    return sorted
  }, [filteredNotes, viewMode, projects])

  const groupedNotes = useMemo(() => {
    if (viewMode !== "byProject") return null
    const groups: { project: NotesProject | null; notes: Note[] }[] = []

    projects.forEach((project) => {
      const projectNotes = sortedNotes.filter(
        (n) => n.projectId === project._id,
      )
      if (projectNotes.length > 0 || projectFilter === project._id) {
        groups.push({ project, notes: projectNotes })
      }
    })

    const noProjectNotes = sortedNotes.filter(
      (n) => n.projectId === "__none__",
    )
    if (noProjectNotes.length > 0 || projectFilter === "__none__") {
      groups.push({ project: null, notes: noProjectNotes })
    }

    return groups
  }, [sortedNotes, viewMode, projectFilter, projects])

  const buildNotesUrl = useCallback(
    (noteId?: string | null) => {
      const queryString = buildQueryString({
        projectFilter,
        searchQuery,
        viewMode,
      })
      if (!noteId) return `/app/notes${queryString}`
      return `/app/notes/${noteId}${queryString}`
    },
    [projectFilter, searchQuery, viewMode],
  )

  const createNote = useCallback(async () => {
    const newNote = await createNoteMutation({
      title: "",
      projectId:
        projectFilter !== "all" && projectFilter !== "__none__"
          ? (projectFilter as unknown as Doc<"projects">["_id"])
          : undefined,
    })
    if (newNote?._id) {
      router.push(buildNotesUrl(String(newNote._id)))
    }
  }, [buildNotesUrl, createNoteMutation, projectFilter, router])

  const selectNote = useCallback(
    (noteId: string) => {
      router.push(buildNotesUrl(noteId))
    },
    [buildNotesUrl, router],
  )

  const updateNote = useCallback(
    async (noteId: string, updates: Partial<Note>) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      setIsSaved(false)
      saveTimeoutRef.current = setTimeout(() => {
        setIsSaved(true)
      }, 900)

      await updateNoteMutation({
        noteId: noteId as unknown as Doc<"notes">["_id"],
        title: updates.title,
        content: updates.content,
        contentText: updates.contentText,
        pinned: updates.pinned,
        projectId:
          updates.projectId === undefined
            ? undefined
            : updates.projectId === "__none__"
              ? null
              : (updates.projectId as unknown as Doc<"projects">["_id"]),
      })
    },
    [updateNoteMutation],
  )

  const pinNote = useCallback(
    (noteId: string) => {
      const note = notes.find((item) => item._id === noteId)
      if (!note) return
      updateNote(noteId, { pinned: !note.pinned })
    },
    [notes, updateNote],
  )

  const moveNote = useCallback(
    (noteId: string, newProjectId: string) => {
      updateNote(noteId, { projectId: newProjectId })
    },
    [updateNote],
  )

  const requestDeleteNote = useCallback((noteId: string) => {
    setNoteToDelete(noteId)
    setDeleteDialogOpen(true)
  }, [])

  const confirmDelete = useCallback(async () => {
    if (!noteToDelete) return
    await deleteNoteMutation({
      noteId: noteToDelete as unknown as Doc<"notes">["_id"],
    })
    if (selectedNoteId === noteToDelete) {
      router.push(buildNotesUrl(null))
    }
    setNoteToDelete(null)
    setDeleteDialogOpen(false)
  }, [noteToDelete, selectedNoteId, router, buildNotesUrl, deleteNoteMutation])

  const cancelDelete = useCallback(() => {
    setDeleteDialogOpen(false)
    setNoteToDelete(null)
  }, [])

  const closeEditor = useCallback(() => {
    router.push(buildNotesUrl(null))
  }, [router, buildNotesUrl])

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
      isLoading,
      deleteDialogOpen,
      noteToDelete,
      projects,
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
      isLoading,
      deleteDialogOpen,
      noteToDelete,
      projects,
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
  )

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
}

export function useNotes() {
  const context = useContext(NotesContext)
  if (!context) {
    throw new Error("useNotes must be used within a NotesProvider")
  }
  return context
}
