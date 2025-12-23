import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { FolderIcon } from "lucide-react";
import React from "react";

export default function Page() {
  return (
    <div className="flex flex-col h-full w-full justify-center items-center">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderIcon />
          </EmptyMedia>
          <EmptyTitle>No Projects Yet</EmptyTitle>
          <EmptyDescription>
            Create a new project to get started
          </EmptyDescription>
        </EmptyHeader>
        {/* Create project button and dialog modal found in the  project sidebar component */}
      </Empty>
    </div>
  );
}
