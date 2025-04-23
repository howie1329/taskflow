"use client";
import React, { useState } from "react";
import useGetAllNotes from "@/features/notes/hooks/useGetAllNotes";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LoadingDiv } from "@/features/notes/singleComponents/LoadingDiv";
import SingleNoteCard from "@/features/notes/SingleNoteCard";

const Page = () => {
  const router = useRouter();
  const { data, isLoading } = useGetAllNotes();

  const onClick = () => {
    router.push("/dashboard/notes/create");
  };

  if (isLoading) {
    return <LoadingDiv />;
  }

  return (
    <div className="flex m-2 flex-col items-center flex-1 ">
      <div className="flex justify-evenly items-center w-full">
        <h1 className=" font-bold text-lg">Notes - Dashboard</h1>
      </div>
      <NotesDashboard data={data} onClick={onClick} />
    </div>
  );
};

const NotesDashboard = ({ data, onClick }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <Button onClick={onClick}>Create New Note</Button>
      <div className="flex flex-row gap-2 flex-wrap">
        {data.map((note, key) => (
          <Link key={key} href={`/dashboard/notes/${note.id}`}>
            <SingleNoteCard key={key} note={note} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Page;
