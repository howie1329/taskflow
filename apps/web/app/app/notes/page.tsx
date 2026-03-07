"use client";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";
import { HugeiconsIcon } from "@hugeicons/react";
import { NoteIcon, Add01Icon } from "@hugeicons/core-free-icons";
import { useNotes } from "@/components/notes";

export default function NotesPage() {
  const { openCreateNotePicker } = useNotes()

  return (
    <div className="flex h-full w-full min-h-0 items-center justify-center px-4 py-3 md:px-6 md:py-4">
      <Empty className="min-h-[240px]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={NoteIcon} className="size-4" />
          </EmptyMedia>
          <EmptyTitle>Select a note</EmptyTitle>
          <EmptyDescription>
            Choose a note from the sidebar or create a new one.
          </EmptyDescription>
        </EmptyHeader>
        <Button size="sm" onClick={openCreateNotePicker}>
          <HugeiconsIcon icon={Add01Icon} className="size-4 mr-2" />
          Create note
        </Button>
      </Empty>
    </div>
  )
}
