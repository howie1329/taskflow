"use client"

import { useCallback, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Kbd } from "@/components/ui/kbd"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import type { NotesProject, Note } from "./types"

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
  const contentUpdateRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (contentUpdateRef.current) {
        clearTimeout(contentUpdateRef.current)
      }
    }
  }, [])

  const handleContentChange = useCallback(
    (value: string, textContent: string) => {
      if (!note) return
      if (contentUpdateRef.current) {
        clearTimeout(contentUpdateRef.current)
      }
      contentUpdateRef.current = setTimeout(() => {
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
  const wordCount = note.contentText.split(/\s+/).filter(Boolean).length

  if (isInSheet) {
    return (
      <div className="flex h-full flex-col gap-4">
        <div className="shrink-0 border-b border-border/60 pb-4">
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm">
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
                      <DropdownMenuItem
                        onClick={() => onMoveNote(note._id, "__none__")}
                      >
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
                  <DropdownMenuItem
                    onClick={() => onDeleteNote(note._id)}
                    className="text-destructive"
                  >
                    <HugeiconsIcon
                      icon={Delete01Icon}
                      className="size-4 mr-2"
                    />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <Input
            ref={titleInputRef}
            value={note.title}
            onChange={(e) => onUpdateNote(note._id, { title: e.target.value })}
            placeholder="Note title"
            className="border-0 bg-transparent px-0 text-lg font-semibold tracking-tight shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/50"
          />
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="rounded-md text-[10px]">
              {project ? (
                <>
                  {project.icon} {project.title}
                </>
              ) : (
                "No project"
              )}
            </Badge>
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {formatRelativeTime(note.updatedAt)}
            </span>
            {isSaved ? (
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

        <div className="shrink-0 border-t border-border/60 pt-3 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>{note.contentText.length} chars</span>
            <span>{wordCount} words</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="shrink-0 rounded-lg border border-border/60 bg-muted/30 p-3 space-y-3">
        <Input
          ref={titleInputRef}
          value={note.title}
          onChange={(e) => onUpdateNote(note._id, { title: e.target.value })}
          placeholder="Note title"
          className="border-0 bg-transparent px-0 text-lg font-semibold tracking-tight shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/50"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="rounded-md text-[10px]">
              {project ? (
                <>
                  {project.icon} {project.title}
                </>
              ) : (
                "No project"
              )}
            </Badge>
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {formatRelativeTime(note.updatedAt)}
            </span>
            {isSaved ? (
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
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onPinNote(note._id)}
              className={cn(note.pinned && "text-primary")}
              title={note.pinned ? "Unpin note" : "Pin note"}
            >
              <HugeiconsIcon icon={PinIcon} className="size-4" />
            </Button>
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
                    <DropdownMenuItem
                      onClick={() => onMoveNote(note._id, "__none__")}
                    >
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
                <DropdownMenuItem
                  onClick={() => onDeleteNote(note._id)}
                  className="text-destructive"
                >
                  <HugeiconsIcon icon={Delete01Icon} className="size-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <Separator className="bg-border/60" />

      <NoteRichEditor
        key={note._id}
        value={note.content}
        onChange={handleContentChange}
        placeholder="Start writing..."
        editorClassName="min-h-[300px] border-0 bg-transparent px-0 text-sm leading-relaxed"
      />

      <div className="shrink-0 border-t border-border/60 pt-3 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span>{note.contentText.length} characters</span>
          <span>{wordCount} words</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Press</span>
          <Kbd>Esc</Kbd>
          <span>to close</span>
        </div>
      </div>
    </div>
  )
}
