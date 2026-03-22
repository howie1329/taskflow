"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  NoteIcon,
  Add01Icon,
  PinIcon,
  Delete01Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  FolderManagementIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { NoteRichEditor } from "./note-rich-editor"
import { getAllTemplates, getTemplateByNoteType } from "./note-templates"
import type { NotesProject, Note } from "./types"

const TITLE_DEBOUNCE_MS = 400

interface NoteEditorProps {
  note: Note | null
  isSaved: boolean
  isInSheet?: boolean
  projects: NotesProject[]
  projectForNote: (projectId: string) => NotesProject | null
  onUpdateNote: (noteId: string, updates: Partial<Note>) => void
  onPinNote: (noteId: string) => void
  onMoveNote: (noteId: string, newProjectId: string) => void
  onDeleteNote: (noteId: string) => void
  onCreateNote: () => void
  onCloseSheet?: () => void
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export function NoteEditor({
  note,
  isSaved,
  isInSheet = false,
  projects,
  projectForNote,
  onUpdateNote,
  onPinNote,
  onMoveNote,
  onDeleteNote,
  onCreateNote,
  onCloseSheet,
}: NoteEditorProps) {
  const titleInputRef = useRef<HTMLInputElement>(null)
  const titleUpdateRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const currentNoteIdRef = useRef<string | null>(null)
  const pendingTitleRef = useRef<{ noteId: string; title: string } | null>(null)
  const contentUpdateRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastAppliedContentRef = useRef<string>("")
  const [titlePendingNoteId, setTitlePendingNoteId] = useState<string | null>(
    null,
  )

  const flushTitleUpdate = useCallback((inputTitle?: string) => {
    if (!note) return

    if (titleUpdateRef.current) {
      clearTimeout(titleUpdateRef.current)
      titleUpdateRef.current = null
    }

    const nextTitle = inputTitle ?? titleInputRef.current?.value ?? ""
    if (nextTitle !== note.title) {
      onUpdateNote(note._id, { title: nextTitle })
    }

    pendingTitleRef.current = null
    setTitlePendingNoteId(null)
  }, [note, onUpdateNote])

  const queueTitleUpdate = useCallback(
    (nextTitle: string) => {
      if (!note) return

      if (titleUpdateRef.current) {
        clearTimeout(titleUpdateRef.current)
      }

      setTitlePendingNoteId(note._id)
      pendingTitleRef.current = { noteId: note._id, title: nextTitle }
      titleUpdateRef.current = setTimeout(() => {
        if (currentNoteIdRef.current !== note._id) return
        onUpdateNote(note._id, { title: nextTitle })
        pendingTitleRef.current = null
        titleUpdateRef.current = null
        setTitlePendingNoteId(null)
      }, TITLE_DEBOUNCE_MS)
    },
    [note, onUpdateNote],
  )

  useEffect(() => {
    currentNoteIdRef.current = note?._id ?? null

    if (titleUpdateRef.current) {
      clearTimeout(titleUpdateRef.current)
      titleUpdateRef.current = null
    }
    if (
      note &&
      pendingTitleRef.current &&
      pendingTitleRef.current.title !== note.title
    ) {
      onUpdateNote(pendingTitleRef.current.noteId, {
        title: pendingTitleRef.current.title,
      })
    }
    pendingTitleRef.current = null
  }, [note, onUpdateNote])

  useEffect(() => {
    const nextContent = note?.content ?? ""

    if (!note) {
      lastAppliedContentRef.current = ""
      return
    }

    if (
      contentUpdateRef.current &&
      lastAppliedContentRef.current &&
      nextContent !== lastAppliedContentRef.current
    ) {
      clearTimeout(contentUpdateRef.current)
      contentUpdateRef.current = null
    }

    lastAppliedContentRef.current = nextContent
  }, [note?.content, note])

  useEffect(() => {
    return () => {
      if (titleUpdateRef.current) {
        clearTimeout(titleUpdateRef.current)
      }
      if (pendingTitleRef.current) {
        onUpdateNote(pendingTitleRef.current.noteId, {
          title: pendingTitleRef.current.title,
        })
      }
      pendingTitleRef.current = null
      if (contentUpdateRef.current) {
        clearTimeout(contentUpdateRef.current)
      }
    }
  }, [onUpdateNote])

  const handleContentChange = useCallback(
    (value: string, textContent: string) => {
      if (!note) return
      if (contentUpdateRef.current) {
        clearTimeout(contentUpdateRef.current)
      }
      contentUpdateRef.current = setTimeout(() => {
        lastAppliedContentRef.current = value
        onUpdateNote(note._id, {
          content: value,
          contentText: textContent,
        })
      }, 400)
    },
    [note, onUpdateNote],
  )

  if (!note) {
    return (
      <Empty className="h-full min-h-[280px] max-w-md border-0">
        <EmptyHeader>
          <EmptyMedia
            variant="icon"
            className="size-8 rounded-lg border border-border bg-background text-muted-foreground [&_svg]:size-5"
          >
            <HugeiconsIcon icon={NoteIcon} className="size-5" strokeWidth={2} />
          </EmptyMedia>
          <EmptyTitle className="text-sm font-medium">Select a note</EmptyTitle>
          <EmptyDescription className="max-w-[20rem] text-sm text-muted-foreground">
            Choose a note from the list or create a new one
          </EmptyDescription>
        </EmptyHeader>
        <Button size="sm" className="h-8" onClick={onCreateNote}>
          <HugeiconsIcon icon={Add01Icon} className="mr-2 size-4" strokeWidth={2} />
          Create note
        </Button>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Kbd>⌘</Kbd>
          <span>N</span>
          <span>to create</span>
        </div>
      </Empty>
    )
  }

  const project = projectForNote(note.projectId)
  const noteTemplate = getTemplateByNoteType(note.noteType)
  const noteTypeOptions = getAllTemplates()
  const wordCount = note.contentText.split(/\s+/).filter(Boolean).length

  const saveStateLabel =
    isSaved && titlePendingNoteId !== note._id ? (
      <span className="inline-flex items-center gap-1">
        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3" strokeWidth={2} />
        Saved
      </span>
    ) : (
      <span>Saving...</span>
    )

  const detailsStrip = [
    project ? `${project.icon} ${project.title}` : "No project",
    noteTemplate.label,
    `${wordCount} words`,
    formatRelativeTime(note.updatedAt),
  ]

  const moreActionsMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" title="More actions">
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => onPinNote(note._id)}>
          <HugeiconsIcon icon={PinIcon} className="size-4 mr-2" />
          {note.pinned ? "Unpin" : "Pin"}
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <HugeiconsIcon
              icon={FolderManagementIcon}
              className="size-4 mr-2"
            />
            Move to...
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuItem onClick={() => onMoveNote(note._id, "__none__")}>
              No project
            </DropdownMenuItem>
            {projects.map((p) => (
              <DropdownMenuItem
                key={p._id}
                onClick={() => onMoveNote(note._id, p._id)}
              >
                {p.icon} {p.title}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Change type</DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-44">
            <DropdownMenuRadioGroup value={note.noteType ?? "blank"}>
              {noteTypeOptions.map((template) => (
                <DropdownMenuRadioItem
                  key={template.key}
                  value={template.noteType}
                  onSelect={(event) => {
                    event.preventDefault()
                    onUpdateNote(note._id, { noteType: template.noteType })
                  }}
                >
                  {template.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem
          onClick={() => onDeleteNote(note._id)}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <HugeiconsIcon icon={Delete01Icon} className="mr-2 size-4" strokeWidth={2} />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  if (isInSheet) {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
        <div className="sticky top-0 z-10 shrink-0 border-b border-border/70 bg-background/95 px-4 pb-3 pt-2 backdrop-blur supports-backdrop-filter:bg-background/90">
          <div className="mx-auto w-full max-w-[48rem]">
            <div className="mb-3 flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onCloseSheet}
                className="-ml-2 h-8 text-muted-foreground"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="mr-1 size-4" strokeWidth={2} />
                Back
              </Button>
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onPinNote(note._id)}
                  className={cn(note.pinned && "text-primary")}
                >
                  <HugeiconsIcon icon={PinIcon} className="size-4" strokeWidth={2} />
                </Button>
                {moreActionsMenu}
              </div>
            </div>
            <Input
              key={note._id}
              ref={titleInputRef}
              defaultValue={note.title}
              onChange={(e) => {
                queueTitleUpdate(e.target.value)
              }}
              onBlur={(e) => flushTitleUpdate(e.target.value)}
              placeholder="Note title"
              className="h-auto border-0 bg-transparent px-0 py-0 text-2xl font-semibold tracking-tight shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/40"
            />
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              {detailsStrip.map((item) => (
                <span key={item}>{item}</span>
              ))}
              <span aria-hidden="true">•</span>
              <span>{saveStateLabel}</span>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden px-4 py-4">
          <div className="mx-auto flex h-full min-h-0 w-full max-w-[48rem] flex-col">
            <NoteRichEditor
              key={note._id}
              value={note.content}
              onChange={handleContentChange}
              placeholder="Start writing..."
              className="h-full min-h-0"
              toolbarClassName="sticky top-0 z-10 -mx-1 mb-5 border-b border-border/60 bg-background/90 px-1 pb-2 backdrop-blur supports-backdrop-filter:bg-background/80"
              editorClassName="h-full min-h-0 border-0 bg-transparent px-0 py-0 text-[15px] leading-8"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="sticky top-0 z-10 shrink-0 border-b border-border/70 bg-background/95 px-4 pb-4 pt-4 backdrop-blur supports-backdrop-filter:bg-background/90 md:px-8 md:pb-5">
        <div className="mx-auto flex max-w-[50rem] items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Input
              key={note._id}
              ref={titleInputRef}
              defaultValue={note.title}
              onChange={(e) => {
                queueTitleUpdate(e.target.value)
              }}
              onBlur={(e) => flushTitleUpdate(e.target.value)}
              placeholder="Note title"
              className="h-auto border-0 bg-transparent px-0 py-0 text-[2rem] font-semibold tracking-tight shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/40 md:text-[2.375rem]"
            />
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              {detailsStrip.map((item) => (
                <span key={item}>{item}</span>
              ))}
              <span aria-hidden="true">•</span>
              <span>{saveStateLabel}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-0.5 pt-1">
            <SidebarTrigger
              scope="inspector"
              className="[&_svg]:rotate-180"
              aria-label="Toggle inspector"
            />
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onPinNote(note._id)}
              className={cn(note.pinned && "text-primary")}
              title={note.pinned ? "Unpin note" : "Pin note"}
            >
              <HugeiconsIcon icon={PinIcon} className="size-4" strokeWidth={2} />
            </Button>
            {moreActionsMenu}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-4 py-4 md:px-8 md:py-5">
        <div className="mx-auto flex h-full min-h-0 max-w-[50rem] flex-col">
          <NoteRichEditor
            key={note._id}
            value={note.content}
            onChange={handleContentChange}
            placeholder="Start writing..."
            className="h-full min-h-0"
            toolbarClassName="sticky top-0 z-10 -mx-1 mb-6 border-b border-border/60 bg-background/90 px-1 pb-2 backdrop-blur supports-backdrop-filter:bg-background/80"
            editorClassName="h-full min-h-0 border-0 bg-transparent px-0 py-0 text-[15px] leading-8"
          />
        </div>
      </div>
    </div>
  )
}
