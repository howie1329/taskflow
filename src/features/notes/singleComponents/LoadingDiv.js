import { Button } from "@/components/ui/button";
import React from "react";
import LoadingNoteCards from "./LoadingNoteCards";

export const LoadingDiv = () => {
  const loadingItems = 5;
  return (
    <div className="flex flex-col gap-2 w-full m-2">
      <div className="flex flex-col justify-evenly items-center w-full">
        <h1 className="font-bold text-lg">Notes - Dashboard</h1>
        <Button>Create New Note</Button>
      </div>
      <div className="flex gap-2">
        {Array.from({ length: loadingItems }).map((_, index) => (
          <LoadingNoteCards key={index} />
        ))}
      </div>
    </div>
  );
};
