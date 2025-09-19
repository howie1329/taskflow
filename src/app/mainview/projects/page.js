import { Separator } from "@/components/ui/separator";
import React from "react";

export default function Page() {
  return (
    <div className="flex flex-col bg-card rounded-md border shadow-sm p-2 overflow-hidden h-[93vh]">
      <div>
        <h1 className="text-lg font-medium text-center">Projects</h1>
        <Separator />
      </div>
      <div className="grid grid-cols-12 border rounded-md p-2">
        <div className="col-span-12">
          <h2 className="text-sm font-medium">Projects</h2>
        </div>
      </div>
    </div>
  );
}
