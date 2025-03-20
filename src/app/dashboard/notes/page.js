"use client";
import React, { useState } from "react";
import Tiptap from "./components/TipTap";
import { Input } from "@/components/ui/input";
import useGetAllNotes from "@/hooks/useGetAllNotes";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const Page = () => {
  const { data, isLoading } = useGetAllNotes();
  const router = useRouter();

  const onClick = () => {
    router.push("/dashboard/notes/create");
  };

  return (
    <div className="flex m-2 flex-col items-center flex-1 ">
      <div className="flex justify-evenly items-center w-full">
        <h1 className=" font-bold text-lg">Notes - Dashboard</h1>
      </div>
      {isLoading ? (
        <p>Loading All Notes...</p>
      ) : (
        <NotesDashboard data={data} onClick={onClick} />
      )}
    </div>
  );
};

const NotesDashboard = ({ data, onClick }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <Button onClick={onClick}>Create New Note</Button>
      <div className="flex flex-row gap-2 flex-wrap">
        {data.map((note, key) => (
          <NoteCard key={key} note={note} />
        ))}
      </div>
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
