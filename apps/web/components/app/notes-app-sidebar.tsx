"use client"

import { useEffect, useRef } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useSidebar } from "@/components/ui/sidebar"
import { NotesRail, useNotes } from "@/components/notes"
import { SHORTCUT_HINT, SHORTCUT_KEYS } from "@/lib/keyboard-shortcuts"
import { shouldIgnoreGlobalShortcut } from "@/lib/should-ignore-global-shortcut"

export function NotesAppSidebar() {
  const { state, isMobile, setOpen, setOpenMobile } = useSidebar()
  const isCollapsed = state === "collapsed" && !isMobile
  const searchInputRef = useRef<HTMLInputElement>(null)
  const didAutoOpenRef = useRef(false)

  const {
    notes,
    filteredNotes,
    selectedNoteId,
    typeFilter,
    searchQuery,
    isLoading,
    setTypeFilter,
    setSearchQuery,
    openCreateNotePicker,
    selectNote,
    pinNote,
    moveNote,
    requestDeleteNote,
    confirmDelete,
    cancelDelete,
    deleteDialogOpen,
    projects,
  } = useNotes()

  useEffect(() => {
    if (!isMobile) return
    if (didAutoOpenRef.current) return
    setOpenMobile(true)
    didAutoOpenRef.current = true
  }, [isMobile, setOpenMobile])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === SHORTCUT_KEYS.createNew) {
        e.preventDefault()
        openCreateNotePicker()
      }
      if (
        e.key === SHORTCUT_KEYS.localSearch &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !shouldIgnoreGlobalShortcut(e.target)
      ) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [openCreateNotePicker])

  const handleSelectNote = (noteId: string) => {
    selectNote(noteId)
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const handleCreateNote = () => {
    openCreateNotePicker()
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  if (isCollapsed) {
    return (
      <>
        <SidebarHeader className="gap-1 border-b border-sidebar-border/50 px-1.5 py-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <div className="flex flex-col gap-2">
                <SidebarMenuButton
                  tooltip="Open notes"
                  onClick={() => setOpen(true)}
                  className="justify-center"
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} className="shrink-0" />
                  <span>Open notes</span>
                </SidebarMenuButton>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="size-8 rounded-lg"
                  onClick={handleCreateNote}
                  aria-label="New note"
                  title={`New note (${SHORTCUT_HINT.createNew})`}
                >
                  <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
                </Button>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <AlertDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => !open && cancelDelete()}
        >
          <AlertDialogContent size="sm">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete note?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The note will be permanently
                removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelDelete}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={confirmDelete}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    )
  }

  return (
    <>
      <SidebarContent className="overflow-hidden px-0 pt-0">
        <div className="flex h-full min-h-0 flex-col px-2 pb-2 md:px-3 md:pb-3">
          <NotesRail
            variant="sidebar"
            notes={filteredNotes}
            totalNotesCount={notes.length}
            activeNoteId={selectedNoteId}
            typeFilter={typeFilter}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onTypeFilterChange={setTypeFilter}
            onSearchQueryChange={setSearchQuery}
            onSelectNote={handleSelectNote}
            onCreateNote={handleCreateNote}
            onTogglePin={pinNote}
            onMoveNote={moveNote}
            onDeleteNote={requestDeleteNote}
            projects={projects}
            searchInputRef={searchInputRef}
          />
        </div>
      </SidebarContent>

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => !open && cancelDelete()}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete note?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The note will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
