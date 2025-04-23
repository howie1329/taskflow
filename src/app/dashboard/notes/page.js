"use client";
import React, { useState } from "react";
import useGetAllNotes from "@/features/notes/hooks/useGetAllNotes";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LoadingDiv } from "@/features/notes/singleComponents/LoadingDiv";
import SingleNoteCard from "@/features/notes/SingleNoteCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusIcon } from "lucide-react";

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
    <div className="h-screen w-screen p-4">
      <Card className="h-[98%] w-[94%]">
        <CardContent className="h-full p-6 space-y-6 overflow-hidden">
          <div className="flex justify-between items-center min-h-[60px]">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
              <p className="text-muted-foreground">
                Manage and organize your notes
              </p>
            </div>
            <div className="flex-shrink-0">
              <Button onClick={onClick} className="flex items-center gap-2">
                <PlusIcon className="h-4 w-4" />
                Create New Note
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-100px)] overflow-hidden">
            <Card className="col-span-1 lg:col-span-3 h-full">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">
                  All Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-60px)] overflow-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.map((note, key) => (
                    <Link key={key} href={`/dashboard/notes/${note.id}`}>
                      <SingleNoteCard key={key} note={note} />
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
