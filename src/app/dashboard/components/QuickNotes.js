import { useFetchNote } from "@/features/notes/hooks/useFetchNote";
import Link from "next/link";
import React from "react";
import SingleNoteCard from "../../../features/notes/SingleNoteCard";
import useGetAllNotes from "@/features/notes/hooks/useGetAllNotes";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export const QuickNotes = () => {
  const { data, isLoading, isError } = useGetAllNotes();

  const router = useRouter();

  const onClick = () => {
    router.push("/dashboard/notes/create");
  };

  if (isLoading) {
    return <div>Loading Notes...</div>;
  }

  return (
    <div className="w-full h-full ">
      <div className="flex justify-between items-center p-2">
        <h2>Quick Notes</h2>
        <Button onClick={onClick}>
          <PlusIcon />
        </Button>
      </div>
      <Separator />
      <div className="w-full h-[82%] flex flex-col items-center gap-2 overflow-scroll mt-1">
        {data.map((note, key) => (
          <Link key={key} href={`/dashboard/notes/${note.id}`}>
            <SingleNoteCard key={key} note={note} />
          </Link>
        ))}
      </div>
    </div>
  );
};
