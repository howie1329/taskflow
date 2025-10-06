"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import useFetchSingleNote from "@/hooks/notes/useFetchSingleNote";
import BlockEditor from "@/presentation/components/notes/BlockEditor";
import useSaveNote from "@/hooks/notes/useSaveNote";
import useDeleteNote from "@/hooks/notes/useDeleteNote";
import { useQueryClient } from "@tanstack/react-query";
import { EllipsisIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import useSocketStore from "@/lib/sockets/SocketStore";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";

function Page() {
  const { id } = useParams();
  const { data: note, isLoading, error } = useFetchSingleNote(id);
  const { mutate: saveNote } = useSaveNote();
  const deleteNote = useDeleteNote();
  const { socket } = useSocketStore();
  const queryClient = useQueryClient();
  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    if (socket) {
      socket.on("note-created", () => {
        queryClient.cancelQueries({ queryKey: ["notes"] });
        queryClient.invalidateQueries({ queryKey: ["notes"] });
      });
      socket.on("note-updated", (noteId) => {
        queryClient.cancelQueries({ queryKey: ["notes"] });
        queryClient.invalidateQueries({ queryKey: ["notes"] });
        queryClient.cancelQueries({ queryKey: ["note", noteId] });
        queryClient.invalidateQueries({ queryKey: ["note", noteId] });
      });
      socket.on("note-deleted", () => {
        queryClient.cancelQueries({ queryKey: ["notes"] });
        queryClient.invalidateQueries({ queryKey: ["notes"] });
      });
    }
  }, [socket, queryClient]);

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
    return (
      <Empty>
        <EmptyHeader>
          <Spinner />
        </EmptyHeader>
        <EmptyTitle>Loading note...</EmptyTitle>
      </Empty>
    );
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="grid grid-rows-[1fr_24fr] h-full text-sm px-2 bg-card rounded-tr-md rounded-br-md">
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-xl font-medium text-center">{note.title}</h1>
        <p>{note.description}</p>
        <NoteOptionsPopover
          title={note.title}
          description={note.description}
          handleDeleteNote={handleDeleteNote}
          handleSaveNote={handleSaveNote}
        />
      </div>
      <div className="flex-1 h-[91vh] overflow-y-auto">
        <BlockEditor noteId={id} setBlocks={setBlocks} />
      </div>
    </div>
  );
}

export default Page;

const NoteOptionsPopover = ({
  title,
  description,
  handleDeleteNote,
  handleSaveNote,
}) => {
  return (
    <Popover>
      <PopoverTrigger>
        <EllipsisIcon className="h-5 w-5" />
      </PopoverTrigger>
      <PopoverContent
        side="left"
        sideOffset={10}
        align="start"
        alignOffset={5}
        className="grid grid-rows-[20px_25px_25px_1fr_25px] bg-card  h-[200px] p-0 shadow-md"
      >
        <div className="row-span-1 flex flex-col items-center justify-center ">
          <p className="text-xs font-medium">Note Options</p>
          <Separator />
        </div>
        <div className="row-span-1  flex items-center justify-center ">
          <Input
            type="text"
            className="text-xs h-[95%] w-full border-none shadow-none text-center "
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="row-span-1 flex items-center justify-center">
          <Input
            type="text"
            className="text-xs h-[95%] w-full border-none shadow-none text-center"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="row-span-1">
          {/* For linking tasks, projects, tags, etc. */}
        </div>
        <div className="row-span-1  flex items-center justify-evenly gap-2 ">
          <Button
            variant="outline"
            className="text-xs h-2 w-[45%]"
            onClick={handleDeleteNote}
          >
            Delete
          </Button>
          <Button
            variant="outline"
            className="text-xs h-2 w-[45%]"
            onClick={handleSaveNote}
          >
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
