"use client";

import { useEffect, useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  SearchIcon,
  Cancel01Icon,
  PlusSignIcon,
  Sun02Icon,
  Moon02Icon,
} from "@hugeicons/core-free-icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";
import { NotesSidebar, useNotes } from "@/components/notes";
import { useTheme } from "next-themes";

interface NotesAppSidebarProps {
  onBackToWorkspace?: () => void;
}

export function NotesAppSidebar({ onBackToWorkspace }: NotesAppSidebarProps) {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;
  const searchInputRef = useRef<HTMLInputElement>(null);
  const didAutoOpenRef = useRef(false);

  const {
    notes,
    filteredNotes,
    sortedNotes,
    groupedNotes,
    selectedNoteId,
    projectFilter,
    searchQuery,
    viewMode,
    setProjectFilter,
    setSearchQuery,
    setViewMode,
    createNote,
    selectNote,
    pinNote,
    moveNote,
    requestDeleteNote,
    confirmDelete,
    cancelDelete,
    deleteDialogOpen,
    projects,
    projectForNote,
  } = useNotes();

  const { setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    if (!isMobile) return;
    if (didAutoOpenRef.current) return;
    setOpenMobile(true);
    didAutoOpenRef.current = true;
  }, [isMobile, setOpenMobile]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        createNote();
      }
      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement;
        if (
          target.tagName !== "INPUT" &&
          target.tagName !== "TEXTAREA" &&
          !target.isContentEditable
        ) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [createNote]);

  const handleSelectNote = (noteId: string) => {
    selectNote(noteId);
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleCreateNote = () => {
    createNote();
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  if (isCollapsed) {
    return (
      <>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Back to workspace"
                onClick={onBackToWorkspace}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
                <span>Back to workspace</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="px-2">
          <div className="space-y-2">
            <Button
              className="w-full h-7 rounded-md px-2 text-xs"
              variant="default"
              onClick={handleCreateNote}
            >
              <HugeiconsIcon
                icon={PlusSignIcon}
                className="size-3 mr-1"
                strokeWidth={2}
              />
              New
            </Button>

            <InputGroup className="w-full">
              <InputGroupAddon>
                <HugeiconsIcon
                  icon={SearchIcon}
                  className="size-3.5"
                  strokeWidth={2}
                />
              </InputGroupAddon>
              <InputGroupInput
                ref={searchInputRef}
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
                className="h-7 text-xs"
              />
              {searchQuery && (
                <InputGroupAddon>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setSearchQuery("")}
                    className="h-5 w-5"
                  >
                    <HugeiconsIcon
                      icon={Cancel01Icon}
                      className="size-3"
                      strokeWidth={2}
                    />
                  </Button>
                </InputGroupAddon>
              )}
            </InputGroup>
          </div>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setTheme(isDark ? "light" : "dark")}
                tooltip={
                  isDark ? "Switch to light mode" : "Switch to dark mode"
                }
              >
                <HugeiconsIcon
                  icon={isDark ? Sun02Icon : Moon02Icon}
                  className="size-4"
                />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

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
    );
  }

  return (
    <>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Back to workspace"
              onClick={onBackToWorkspace}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
              <span>Back to workspace</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="px-0 overflow-hidden">
        <div className="h-full px-4 py-3">
          <NotesSidebar
            notes={notes}
            filteredNotes={filteredNotes}
            sortedNotes={sortedNotes}
            groupedNotes={groupedNotes}
            selectedNoteId={selectedNoteId}
            projectFilter={projectFilter}
            searchQuery={searchQuery}
            viewMode={viewMode}
            isMobile={isMobile}
            onProjectFilterChange={setProjectFilter}
            onSearchQueryChange={setSearchQuery}
            onViewModeChange={setViewMode}
            onSelectNote={handleSelectNote}
            onCreateNote={handleCreateNote}
            onPinNote={pinNote}
            onMoveNote={moveNote}
            onDeleteNote={requestDeleteNote}
            projectForNote={projectForNote}
            projects={projects}
            searchInputRef={searchInputRef}
          />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setTheme(isDark ? "light" : "dark")}
              tooltip={
                isDark ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              <HugeiconsIcon
                icon={isDark ? Sun02Icon : Moon02Icon}
                className="size-4"
              />
              <span>{isDark ? "Light mode" : "Dark mode"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

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
  );
}
