import { Card, CardDescription, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export default function LoadingNoteCards() {
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
}
