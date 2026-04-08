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
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden px-4 py-4 md:px-8 md:py-5">
        <div className="mx-auto w-full max-w-[50rem] border-b border-border/50 pb-5">
          <Skeleton className="h-11 w-3/5 max-w-full" />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-14" />
          </div>
        </div>
        <div className="mx-auto mt-5 flex w-full max-w-[50rem] flex-1 flex-col">
          <div className="flex flex-wrap items-center gap-1 border-b border-border/50 pb-3">
            <Skeleton className="h-7 w-7 rounded-md" />
            <Skeleton className="h-7 w-7 rounded-md" />
            <Skeleton className="h-7 w-7 rounded-md" />
            <Skeleton className="h-7 w-px rounded-none" />
            <Skeleton className="h-7 w-7 rounded-md" />
            <Skeleton className="h-7 w-7 rounded-md" />
          </div>
          <div className="mt-6 space-y-5">
            <Skeleton className="h-8 w-72 max-w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-4/5" />
          </div>
        </div>
      </div>
    )
  }

  if (!selectedNote || selectedNote._id !== noteId) {
    return (
      <div className="flex h-full flex-col">
        {isMobile && (
          <div className="flex items-center gap-2 border-b border-border/50 bg-background px-4 py-2.5 md:hidden">
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
            <span className="text-base font-semibold leading-tight">Back to notes</span>
          </div>
        )}

        <div className="flex flex-1 items-center justify-center p-8">
          <Empty className="max-w-md border-0">
            <EmptyHeader>
              <EmptyMedia
                variant="icon"
                className="size-8 rounded-lg bg-muted/30 text-muted-foreground [&_svg]:size-5"
              >
                <HugeiconsIcon icon={NoteIcon} className="size-5" strokeWidth={2} />
              </EmptyMedia>
              <EmptyTitle className="text-base font-semibold leading-tight">
                Note not found
              </EmptyTitle>
              <EmptyDescription className="max-w-[20rem] text-xs leading-snug text-muted-foreground">
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
        <div className="flex items-center gap-2 border-b border-border/50 bg-background px-4 py-2.5 md:hidden">
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
          <span className="truncate text-base font-semibold leading-tight">
            {selectedNote?.title || "Note"}
          </span>
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
