"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import useFetchSingleNote from "@/hooks/notes/useFetchSingleNote";
import BlockEditor from "@/presentation/components/notes/BlockEditor";
import useSaveNote from "@/hooks/notes/useSaveNote";
import useDeleteNote from "@/hooks/notes/useDeleteNote";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/lib/sockets/SocketProvider";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { NoteOptionsPopover } from "@/presentation/components/notes/NoteOptionsPopover";

function Page() {
  const { id } = useParams();
  const { data: note, isLoading, error } = useFetchSingleNote(id);
  const { mutate: saveNote } = useSaveNote();
  const deleteNote = useDeleteNote();
  const { socket } = useSocket();
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
    <div className="grid grid-rows-[auto_1fr] h-full text-sm px-2 bg-background overflow-hidden rounded-none">
      <div className="flex flex-row h-fit justify-between items-center gap-2 border-b">
        <div className="flex flex-col h-fit justify-center items-start">
          <h1 className="text-lg font-medium text-center line-clamp-1">
            {note.title}
          </h1>
          <p className="line-clamp-1 text-xs">{note.description}</p>
        </div>
        <NoteOptionsPopover
          title={note.title}
          description={note.description}
          handleDeleteNote={handleDeleteNote}
          handleSaveNote={handleSaveNote}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        <BlockEditor noteId={id} setBlocks={setBlocks} />
      </div>
    </div>
  );
}

export default Page;
