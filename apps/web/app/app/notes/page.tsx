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
  const { createNote } = useNotes();

  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <Empty className="min-h-[300px]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HugeiconsIcon icon={NoteIcon} className="size-4" />
          </EmptyMedia>
          <EmptyTitle>Select a note</EmptyTitle>
          <EmptyDescription>
            Choose a note from the sidebar or create a new one.
          </EmptyDescription>
        </EmptyHeader>
        <Button size="sm" onClick={createNote}>
          <HugeiconsIcon icon={Add01Icon} className="size-4 mr-2" />
          Create note
        </Button>
      </Empty>
    </div>
  );
}
