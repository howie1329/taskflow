"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useFetchAllProjects from "@/hooks/projects/useFetchAllProjects";
import { PlusIcon } from "lucide-react";
import React from "react";

export default function Page() {
  const { data: projects } = useFetchAllProjects();

  if (projects.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-full gap-2">
        <h1 className="text-lg font-medium text-center">Empty Projects List</h1>
        <Button variant="default" className="p-1 rounded-md">
          Create Project
        </Button>
      </div>
    );
  }
  return (
    <div className="flex flex-col bg-card rounded-md border shadow-sm p-2 overflow-hidden h-[93vh] gap-2">
      <div className="flex flex-col justify-between items-center">
        <div className="flex flex-row justify-between items-center w-full p-2">
          <h1 className="text-lg font-medium text-center">Projects</h1>
          <Button variant="outline" className="p-1 h-6 w-6 rounded-full">
            <PlusIcon className="w-2 h-2" />
          </Button>
        </div>
        <Separator />
      </div>
      <div className="grid grid-cols-12 grid-rows-12 p-2 gap-2">
        {projects.map((project) => (
          <div key={project.id} className="col-span-4 row-span-4">
            <h2 className="text-sm font-medium">{project.title}</h2>
          </div>
        ))}
      </div>
    </div>
  );
}
