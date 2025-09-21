"use client";
import React from "react";
import { useParams } from "next/navigation";
import { notes } from "../../../../../docs/testData/notesTestData";
import { Separator } from "@/components/ui/separator";

function Page() {
  const { id } = useParams();
  const note = notes.find((note) => note.id === id);
  if (!note) {
    return <div>Note not found</div>;
  }
  return (
    <div className="grid grid-rows-[1fr_24fr] h-full text-sm bg-card border-r border-y p-2 rounded-tr-xl rounded-br-xl">
      <div>
        <h1 className="text-xl font-medium text-center">{note.title}</h1>
        <Separator />
      </div>
      <p>{note.content}</p>
    </div>
  );
}

export default Page;
