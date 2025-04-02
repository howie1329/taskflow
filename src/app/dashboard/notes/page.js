"use client";
import React, { useState } from "react";
import useGetAllNotes from "@/hooks/useGetAllNotes";
import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { singleNote } from "@/hooks/useFetchNote";
import { Skeleton } from "@/components/ui/skeleton";
import SingleNoteCard from "./components/SingleNoteCard";

const Page = () => {
  const { data, isLoading } = useGetAllNotes();

  const router = useRouter();

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
          <Link key={key} href={`/dashboard/notes/${note.id}`}>
            <SingleNoteCard key={key} note={note} />
          </Link>
        ))}
      </div>
    </div>
  );
};

const LoadingDiv = () => {
  const loadingItems = 5;
  return (
    <div className="flex flex-col gap-2 w-full m-2">
      <div className="flex flex-col justify-evenly items-center w-full">
        <h1 className="font-bold text-lg">Notes - Dashboard</h1>
        <Button>Create New Note</Button>
      </div>
      <div className="flex gap-2">
        {Array.from({ length: loadingItems }).map((_, index) => (
          <LoadingNoteCard key={index} />
        ))}
      </div>
    </div>
  );
};

const LoadingNoteCard = () => {
  return (
    <Card className="flex flex-col w-[20rem]">
      <div className="flex flex-col p-2">
        <CardHeader>
          <Skeleton className="w-full h-4" />
        </CardHeader>
        <CardDescription>
          <Skeleton className="w-full h-4" />
        </CardDescription>
      </div>
    </Card>
  );
};

export default Page;
