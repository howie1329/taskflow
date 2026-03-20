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
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden px-4 py-3 md:px-8 md:py-4">
        <div className="mx-auto w-full max-w-[42rem] rounded-lg border border-border bg-card p-4">
          <Skeleton className="mb-4 h-9 w-3/5" />
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-6 w-24 rounded-md" />
            <Skeleton className="h-6 w-20 rounded-md" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <div className="mx-auto mt-3 flex w-full max-w-[42rem] flex-1 flex-col space-y-3 rounded-lg border border-border bg-muted/20 p-4">
          <Skeleton className="h-8 w-72 max-w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-4/5" />
        </div>
      </div>
    )
  }

  if (!selectedNote || selectedNote._id !== noteId) {
    return (
      <div className="flex h-full flex-col">
        {isMobile && (
          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5 md:hidden">
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

        <div className="flex flex-1 items-center justify-center p-8">
          <Empty className="max-w-md border-0">
            <EmptyHeader>
              <EmptyMedia
                variant="icon"
                className="size-8 rounded-lg border border-border bg-background text-muted-foreground [&_svg]:size-5"
              >
                <HugeiconsIcon icon={NoteIcon} className="size-5" strokeWidth={2} />
              </EmptyMedia>
              <EmptyTitle className="text-sm font-medium">Note not found</EmptyTitle>
              <EmptyDescription className="max-w-[20rem] text-sm text-muted-foreground">
                This note may have been deleted or the link is invalid.
              </EmptyDescription>
            </EmptyHeader>
            <Button className="h-8" onClick={() => router.push("/app/notes")}>
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                className="mr-2 size-4"
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
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      {isMobile && (
        <div className="flex items-center gap-2 border-b border-border px-4 py-2.5 md:hidden">
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

      <div className="min-h-0 flex-1">
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
