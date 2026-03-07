"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty"
import { HugeiconsIcon } from "@hugeicons/react"
import { NoteIcon, ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { NoteEditor } from "@/components/notes"
import { useNotes } from "@/components/notes"
import { useIsMobile } from "@/hooks/use-mobile"

export default function NotePage() {
  const params = useParams()
  const router = useRouter()
  const isMobile = useIsMobile()
  const noteId = params.noteId as string

  const {
    selectedNote,
    isSaved,
    isLoading,
    updateNote,
    pinNote,
    moveNote,
    requestDeleteNote,
    openCreateNotePicker,
    closeEditor,
    projects,
    projectForNote,
  } = useNotes()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      const target = e.target as HTMLElement
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable
      ) {
        return
      }
      router.push("/app/notes")
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [router])

  if (isLoading) {
    return (
      <div className="flex h-full w-full min-h-0 flex-col overflow-hidden p-3">
        <div className="rounded-2xl border border-border/50 bg-background/80 p-3">
          <Skeleton className="mb-4 h-10 w-3/5" />
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <div className="flex-1 space-y-3 rounded-2xl border border-border/40 bg-background/60 p-3 mt-3">
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-4/5" />
        </div>
      </div>
    )
  }

  if (!selectedNote || selectedNote._id !== noteId) {
    return (
      <div className="flex flex-col h-full">
        {isMobile && (
          <div className="flex items-center gap-2 p-4 border-b md:hidden">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => router.push("/app/notes")}
            >
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                className="size-4"
                strokeWidth={2}
              />
            </Button>
            <span className="text-sm font-medium">Back to notes</span>
          </div>
        )}

        <div className="flex-1 flex items-center justify-center p-8">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={NoteIcon} className="size-6" />
              </EmptyMedia>
              <EmptyTitle>Note not found</EmptyTitle>
              <EmptyDescription>
                This note may have been deleted or the link is invalid.
              </EmptyDescription>
            </EmptyHeader>
            <Button onClick={() => router.push("/app/notes")}>
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                className="size-4 mr-2"
                strokeWidth={2}
              />
              Back to notes
            </Button>
          </Empty>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full min-h-0 flex-col overflow-hidden">
      {isMobile && (
        <div className="flex items-center gap-2 border-b border-border/40 px-3 py-2 md:hidden">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.push("/app/notes")}
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              className="size-4"
              strokeWidth={2}
            />
          </Button>
          <span className="text-sm font-medium">Back to notes</span>
        </div>
      )}

      <div className="flex-1 min-h-0">
        <NoteEditor
          note={selectedNote}
          isSaved={isSaved}
          isInSheet={false}
          projects={projects}
          projectForNote={projectForNote}
          onUpdateNote={updateNote}
          onPinNote={pinNote}
          onMoveNote={moveNote}
          onDeleteNote={requestDeleteNote}
          onCreateNote={openCreateNotePicker}
          onCloseSheet={closeEditor}
        />
      </div>
    </div>
  )
}
