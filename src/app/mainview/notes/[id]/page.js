"use client";
import React from "react";
import { useParams } from "next/navigation";
import { notes } from "../../../../../docs/testData/notesTestData";

function Page() {
  const { id } = useParams();
  const note = notes.find((note) => note.id === id);
  if (!note) {
    return <div>Note not found</div>;
  }
  return (
    <div>
      <h1>{note.title}</h1>
      <p>{note.content}</p>
    </div>
  );
}

export default Page;
