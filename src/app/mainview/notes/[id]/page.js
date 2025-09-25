"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import useFetchSingleNote from "@/hooks/notes/useFetchSingleNote";
import BlockEditor from "@/presentation/components/notes/BlockEditor";
import { Button } from "@/components/ui/button";
import useSaveNote from "@/hooks/notes/useSaveNote";
import useDeleteNote from "@/hooks/notes/useDeleteNote";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisIcon, SaveIcon, Trash2Icon } from "lucide-react";

function Page() {
  const { id } = useParams();
  const { data: note, isLoading, error } = useFetchSingleNote(id);
  const { mutate: saveNote } = useSaveNote();
  const deleteNote = useDeleteNote();
  const [blocks, setBlocks] = useState([]);

  const handleSaveNote = () => {
    saveNote({
      id: id,
      title: note.title,
      description: note.description,
      blocks: blocks,
    });
  };

  const handleDeleteNote = () => {
    deleteNote.mutate(id);
  };

  if (isLoading) {
    return <div>Loading note...</div>;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="grid grid-rows-[1fr_24fr] h-full text-sm px-2 bg-card border-r border-y rounded-tr-xl rounded-br-xl">
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-xl font-medium text-center">{note.title}</h1>
        <p>{note.description}</p>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <EllipsisIcon className="h-5 w-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleDeleteNote}>
              <Trash2Icon className="h-5 w-5" />
              Delete
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSaveNote}>
              <SaveIcon className="h-5 w-5" />
              Save
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex-1 h-[91vh] overflow-y-auto">
        <BlockEditor noteId={id} setBlocks={setBlocks} />
      </div>
    </div>
  );
}

export default Page;
