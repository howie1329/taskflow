"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Doc } from "@/convex/_generated/dataModel"
import { createReviewerSignature } from "@/lib/notes/reviewer"
import type {
  NotesProject,
  Note,
  NoteReviewerRunState,
  ViewMode,
} from "./types"

const REVIEWER_DEBOUNCE_MS = 1400
const REVIEWER_MIN_WORDS = 5
const REVIEWER_MIN_LENGTH = 32

type ReviewerRunStateMap = Record<string, NoteReviewerRunState>
type PendingChatPrompt = {
  noteId: string
  prompt: string
  nonce: number
} | null

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
  reviewerRunStateByNoteId: ReviewerRunStateMap
  pendingChatPrompt: PendingChatPrompt
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
  handoffReviewerSuggestionToChat: (noteId: string, prompt: string) => void
  clearPendingChatPrompt: (noteId: string) => void
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
  const searchParams = useSearchParams()
  const params = useParams()

  const notesData = useQuery(api.notes.listMyNotes)
  const projectsData = useQuery(api.projects.listMyProjects, {
    status: "active",
  })
  const createNoteMutation = useMutation(api.notes.createNote)
  const updateNoteMutation = useMutation(api.notes.updateNote)
  const deleteNoteMutation = useMutation(api.notes.deleteNote)

  const [isSaved, setIsSaved] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)
  const [reviewerRunStateByNoteId, setReviewerRunStateByNoteId] =
    useState<ReviewerRunStateMap>({})
  const [pendingChatPrompt, setPendingChatPrompt] =
    useState<PendingChatPrompt>(null)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const reviewerTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const reviewerAbortControllersRef = useRef<Record<string, AbortController>>({})

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
        reviewer: note.reviewer,
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
  const projectFilter = searchParams.get("project") || "all"
  const searchQuery = searchParams.get("q") || ""
  const viewMode = getViewMode(searchParams.get("view"))

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
    (
      noteId?: string | null,
      overrides?: {
        projectFilter?: string
        searchQuery?: string
        viewMode?: ViewMode
      },
    ) => {
      const queryString = buildQueryString({
        projectFilter: overrides?.projectFilter ?? projectFilter,
        searchQuery: overrides?.searchQuery ?? searchQuery,
        viewMode: overrides?.viewMode ?? viewMode,
      })
      if (!noteId) return `/app/notes${queryString}`
      return `/app/notes/${noteId}${queryString}`
    },
    [projectFilter, searchQuery, viewMode],
  )

  const setProjectFilter = useCallback(
    (value: string) => {
      router.replace(
        buildNotesUrl(selectedNoteId ? selectedNoteId : null, {
          projectFilter: value,
        }),
        { scroll: false },
      )
    },
    [buildNotesUrl, router, selectedNoteId],
  )

  const setSearchQuery = useCallback(
    (value: string) => {
      router.replace(
        buildNotesUrl(selectedNoteId ? selectedNoteId : null, {
          searchQuery: value,
        }),
        { scroll: false },
      )
    },
    [buildNotesUrl, router, selectedNoteId],
  )

  const setViewMode = useCallback(
    (value: ViewMode) => {
      router.replace(
        buildNotesUrl(selectedNoteId ? selectedNoteId : null, {
          viewMode: value,
        }),
        { scroll: false },
      )
    },
    [buildNotesUrl, router, selectedNoteId],
  )

  const createNote = useCallback(async () => {
    setIsSaved(true)
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
      setIsSaved(true)
      router.push(buildNotesUrl(noteId))
    },
    [buildNotesUrl, router],
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
      setIsSaved(true)
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
    setIsSaved(true)
    router.push(buildNotesUrl(null))
  }, [router, buildNotesUrl])

  const updateReviewerRunState = useCallback(
    (noteId: string, nextState: NoteReviewerRunState) => {
      setReviewerRunStateByNoteId((current) => {
        const previous = current[noteId]
        if (
          previous?.status === nextState.status &&
          previous?.error === nextState.error
        ) {
          return current
        }

        return {
          ...current,
          [noteId]: nextState,
        }
      })
    },
    [],
  )

  const runReviewer = useCallback(
    async (noteId: string, signature: string) => {
      const previousController = reviewerAbortControllersRef.current[noteId]
      if (previousController) {
        previousController.abort()
      }

      const controller = new AbortController()
      reviewerAbortControllersRef.current[noteId] = controller
      updateReviewerRunState(noteId, {
        status: "reviewing",
        error: null,
      })

      try {
        const response = await fetch("/api/note-reviewer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            noteId,
            signature,
          }),
          signal: controller.signal,
        })

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null
          throw new Error(payload?.error || "Reviewer request failed")
        }

        updateReviewerRunState(noteId, {
          status: "ready",
          error: null,
        })
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }

        updateReviewerRunState(noteId, {
          status: "error",
          error:
            error instanceof Error
              ? error.message
              : "Reviewer analysis failed.",
        })
      } finally {
        if (reviewerAbortControllersRef.current[noteId] === controller) {
          delete reviewerAbortControllersRef.current[noteId]
        }
      }
    },
    [updateReviewerRunState],
  )

  const scheduleReviewer = useCallback(
    (note: Note, nextTitle: string, nextContentText: string) => {
      const normalizedText = nextContentText.replace(/\s+/g, " ").trim()
      const wordCount = normalizedText.split(" ").filter(Boolean).length
      const isMeaningful =
        normalizedText.length >= REVIEWER_MIN_LENGTH ||
        wordCount >= REVIEWER_MIN_WORDS

      if (!isMeaningful) {
        updateReviewerRunState(note._id, {
          status: "idle",
          error: null,
        })
        return
      }

      const nextSignature = createReviewerSignature({
        title: nextTitle,
        contentText: nextContentText,
      })

      if (note.reviewer?.contentSignature === nextSignature) {
        updateReviewerRunState(note._id, {
          status: "ready",
          error: null,
        })
        return
      }

      const existingTimeout = reviewerTimeoutsRef.current[note._id]
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }

      reviewerTimeoutsRef.current[note._id] = setTimeout(() => {
        delete reviewerTimeoutsRef.current[note._id]
        void runReviewer(note._id, nextSignature)
      }, REVIEWER_DEBOUNCE_MS)
    },
    [runReviewer, updateReviewerRunState],
  )

  const updateNote = useCallback(
    async (noteId: string, updates: Partial<Note>) => {
      const currentNote = notes.find((item) => item._id === noteId)
      const nextTitle = updates.title ?? currentNote?.title ?? ""
      const nextContentText = updates.contentText ?? currentNote?.contentText ?? ""
      const hasContentUpdate =
        updates.content !== undefined || updates.contentText !== undefined
      const contentChanged = Boolean(
        currentNote &&
          ((updates.content !== undefined &&
            updates.content !== currentNote.content) ||
            (updates.contentText !== undefined &&
              updates.contentText !== currentNote.contentText)),
      )

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      setIsSaved(false)
      saveTimeoutRef.current = setTimeout(() => {
        setIsSaved(true)
      }, 900)

      const updatedNote = await updateNoteMutation({
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

      if (hasContentUpdate && contentChanged && currentNote) {
        scheduleReviewer(
          {
            ...currentNote,
            content: updates.content ?? currentNote.content,
            contentText: nextContentText,
            title: nextTitle,
            reviewer: updatedNote?.reviewer,
          },
          nextTitle,
          nextContentText,
        )
      }
    },
    [notes, scheduleReviewer, updateNoteMutation],
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
      reviewerRunStateByNoteId,
      pendingChatPrompt,
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
      handoffReviewerSuggestionToChat: (noteId: string, prompt: string) => {
        setPendingChatPrompt({
          noteId,
          prompt,
          nonce: Date.now(),
        })
      },
      clearPendingChatPrompt: (noteId: string) => {
        setPendingChatPrompt((current) => {
          if (!current || current.noteId !== noteId) {
            return current
          }
          return null
        })
      },
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
      reviewerRunStateByNoteId,
      pendingChatPrompt,
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
    ],
  )

  useEffect(() => {
    const reviewerTimeouts = reviewerTimeoutsRef.current
    const reviewerAbortControllers = reviewerAbortControllersRef.current

    return () => {
      Object.values(reviewerTimeouts).forEach((timeout) => {
        clearTimeout(timeout)
      })
      Object.values(reviewerAbortControllers).forEach((controller) => {
        controller.abort()
      })
    }
  }, [])

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
}

export function useNotes() {
  const context = useContext(NotesContext)
  if (!context) {
    throw new Error("useNotes must be used within a NotesProvider")
  }
  return context
}
