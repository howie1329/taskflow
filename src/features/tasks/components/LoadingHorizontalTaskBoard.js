import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";

export const LoadingHorizontalTaskBoard = () => {
  const loadingItem = 15;
  const timeGroup = ["NoDeadLine", "Today", "ThisWeek", "OverDue"];

  return (
    <div className="flex w-full h-[700px] gap-2">
      {timeGroup.map((heading) => (
        <div key={heading}>
          <div className="flex flex-row justify-center items-center space-x-2 my-2 text-center">
            {heading.toUpperCase()}
          </div>
          <div className="flex flex-col h-[94%] overflow-auto gap-2">
            {Array.from({ length: loadingItem }).map((_, index) => (
              <SkeletonTaskModal key={index} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const SkeletonTaskModal = () => {
  return (
    <Card className="flex flex-row w-[20rem] h-[3rem] gap-2 p-2 items-center">
      <div>
        <Skeleton className="h-3 w-3 rounded-full" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[250px]" />
      </div>
    </Card>
  );
};
