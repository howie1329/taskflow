import React from "react";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { NotepadTextIcon } from "lucide-react";

function Page() {
  return (
    <div className="flex flex-col justify-center items-center h-full">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <NotepadTextIcon />
          </EmptyMedia>
          <EmptyTitle>No Notes Yet</EmptyTitle>
          <EmptyDescription>Create a new note to get started</EmptyDescription>
        </EmptyHeader>
        {/* Create note button and dialog modal found in the  notes sidebar component */}
      </Empty>
    </div>
  );
}

export default Page;
