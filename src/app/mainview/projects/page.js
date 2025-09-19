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
import useCreateProject from "@/hooks/projects/useCreateProject";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function Page() {
  const { data: projects } = useFetchAllProjects();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
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
          <Card
            key={project.id}
            className="bg-white rounded-lg p-1 flex-shrink-0 cursor-pointer hover:bg-gray-50 col-span-4"
            onClick={() => router.push(`/mainview/projects/${project.id}`)}
          >
            <CardContent className="flex flex-col gap-1 p-1">
              <p className="text-sm font-medium">{project.title}</p>
              <p className="text-sm text-gray-500">{project.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <CreateProjectDialog isOpen={isOpen} onOpenChange={setIsOpen} />
    </div>
  );
}

const CreateProjectDialog = ({ isOpen, onOpenChange }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { mutate: createProject } = useCreateProject();
  const { userId } = useAuth();
  const handleCreateProject = () => {
    const formattedProject = {
      title,
      description,
      userId: userId,
    };
    createProject(formattedProject);
    onOpenChange(false);
  };

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
            <Button className="w-full" onClick={handleCreateProject}>
              Create Project
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
