"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
      <Empty className="min-h-[300px] h-full">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={NoteIcon} className="size-4" />
          </EmptyMedia>
          <EmptyTitle>Select a note</EmptyTitle>
          <EmptyDescription>
            Choose a note from the list or create a new one
          </EmptyDescription>
        </EmptyHeader>
        <Button size="sm" onClick={onCreateNote}>
          <HugeiconsIcon icon={Add01Icon} className="size-4 mr-2" />
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

  const metadataBadges = (
    <>
      <Badge
        variant="outline"
        className="rounded-md border-border/40 bg-background/70 text-[10px]"
      >
        {project ? (
          <>
            {project.icon} {project.title}
          </>
        ) : (
          "No project"
        )}
      </Badge>
      <Badge
        variant="outline"
        className="rounded-md border-border/40 bg-background/70 text-[10px]"
      >
        {noteTemplate.label}
      </Badge>
    </>
  )

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
          className="text-destructive"
        >
          <HugeiconsIcon icon={Delete01Icon} className="size-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  if (isInSheet) {
    return (
      <div className="flex h-full flex-col gap-3">
        <div className="sticky top-0 z-10 shrink-0 border-b border-border/40 bg-background/80 pb-3 backdrop-blur supports-backdrop-filter:bg-background/70">
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCloseSheet}
              className="h-8 -ml-2"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4 mr-1" />
              Back
            </Button>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onPinNote(note._id)}
                className={cn(note.pinned && "text-primary")}
              >
                <HugeiconsIcon icon={PinIcon} className="size-4" />
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
            className="border-0 bg-transparent px-0 text-lg font-semibold tracking-tight shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/50"
          />
          <div className="mt-2 flex items-center gap-2">
            {metadataBadges}
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {formatRelativeTime(note.updatedAt)}
            </span>
            {isSaved && titlePendingNoteId !== note._id ? (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  className="size-3"
                />
                Saved
              </span>
            ) : (
              <span className="text-[11px] text-muted-foreground">Saving...</span>
            )}
          </div>
        </div>

        <NoteRichEditor
          key={note._id}
          value={note.content}
          onChange={handleContentChange}
          placeholder="Start writing..."
          editorClassName="min-h-[220px] border-0 bg-transparent px-0 text-base leading-relaxed"
        />

        <div className="shrink-0 flex items-center justify-between border-t border-border/40 pt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>{note.contentText.length} chars</span>
            <span>{wordCount} words</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="sticky top-0 z-10 shrink-0 border-b border-border/40 bg-background/80 px-3 pb-2 pt-2 backdrop-blur supports-backdrop-filter:bg-background/70">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {metadataBadges}
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {formatRelativeTime(note.updatedAt)}
            </span>
            {isSaved && titlePendingNoteId !== note._id ? (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  className="size-3"
                />
                Saved
              </span>
            ) : (
              <span className="text-[11px] text-muted-foreground">Saving...</span>
            )}
          </div>
          <div className="flex items-center gap-1">
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
              <HugeiconsIcon icon={PinIcon} className="size-4" />
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
          className="h-auto border-0 bg-transparent px-0 py-1 text-2xl font-semibold tracking-tight shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40 md:text-[2rem]"
        />
      </div>

      <div className="flex-1 min-h-0 px-3 py-2">
        <NoteRichEditor
          key={note._id}
          value={note.content}
          onChange={handleContentChange}
          placeholder="Start writing..."
          className="h-full"
          toolbarClassName="w-fit rounded-md border-0 bg-transparent p-0"
          editorClassName="h-full min-h-0 border-0 bg-transparent px-0 py-1 text-base leading-7"
        />
      </div>

      <div className="shrink-0 border-t border-border/40 px-3 py-2 text-xs text-muted-foreground">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>{note.contentText.length} characters</span>
          <span>{wordCount} words</span>
          <span className="inline-flex items-center gap-1">
            <span>Esc</span>
            <span>to close</span>
          </span>
        </div>
      </div>
    </div>
  )
}
