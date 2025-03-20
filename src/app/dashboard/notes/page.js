"use client";
import React, { useState } from "react";
import Tiptap from "./components/TipTap";
import { Input } from "@/components/ui/input";
import useGetAllNotes from "@/hooks/useGetAllNotes";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";

const Page = () => {
  const { data, isLoading } = useGetAllNotes();

  return (
    <div className="flex m-2 flex-col items-center flex-1 ">
      <div className="flex justify-evenly items-center w-full">
        <h1 className=" font-bold text-lg">Notes - Dashboard</h1>
      </div>
      {isLoading ? <p>Loading All Notes...</p> : <NotesDashboard data={data} />}
    </div>
  );
};

const NotesEditorComponent = ({ content }) => {
  const [note, setNote] = useState();
  const onChange = (content) => {
    setNote(content);
  };
  return (
    <div className="flex flex-col w-3/4 gap-2">
      <Input />
      <Tiptap content={content} onChange={onChange} />
    </div>
  );
};

const NotesDashboard = ({ data }) => {
  return (
    <div className="flex flex-row gap-2 w-full">
      {data.map((note, key) => (
        <NoteCard key={key} note={note} />
      ))}
    </div>
  );
};

const NoteCard = ({ note }) => {
  return (
    <Card className="flex flex-col w-[20rem]">
      <div className="flex flex-col m-2">
        <CardHeader>{note.title}</CardHeader>
        <CardDescription>{note.description}</CardDescription>
      </div>
    </Card>
  );
};

export default Page;
