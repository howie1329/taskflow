"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import useFetchAllProjects from "@/hooks/projects/useFetchAllProjects";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import React, { useState } from "react";

export default function Page() {
  const { data: projects } = useFetchAllProjects();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col bg-card rounded-md border shadow-sm p-2 overflow-hidden h-[93vh] gap-2">
      <div className="flex flex-col justify-between items-center">
        <div className="flex flex-row justify-between items-center w-full p-2">
          <h1 className="text-lg font-medium text-center">Projects</h1>
          <Button
            variant="outline"
            className="p-1 h-6 w-6 rounded-full"
            onClick={() => setIsOpen(true)}
          >
            <PlusIcon className="w-2 h-2" />
          </Button>
        </div>
        <Separator />
      </div>
      <div className="grid grid-cols-12 grid-rows-12 p-2 gap-2">
        {projects?.map((project) => (
          <div key={project.id} className="col-span-4 row-span-4">
            <h2 className="text-sm font-medium">{project.title}</h2>
          </div>
        ))}
      </div>
      <CreateProjectDialog isOpen={isOpen} onOpenChange={setIsOpen} />
    </div>
  );
}

const CreateProjectDialog = ({ isOpen, onOpenChange }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Project</DialogTitle>
        </DialogHeader>
        <Separator />
        <div className="grid grid-cols-3 gap-2 ">
          <div className="col-span-3 gap-2 flex flex-col">
            <Input
              placeholder="Project Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              placeholder="Project Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="col-span-3 gap-2 flex flex-col">
            <Button className="w-full">Create Project</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
