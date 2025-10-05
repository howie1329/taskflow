"use client";
import {
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import React, { useState } from "react";
import Link from "next/link";
import { FolderIcon, PlusIcon, XIcon } from "lucide-react";
import useFetchAllProjects from "@/hooks/projects/useFetchAllProjects";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import useCreateProject from "@/hooks/projects/useCreateProject";
import { useAuth } from "@clerk/nextjs";

export default function ProjectSidebar() {
  const { data: projects } = useFetchAllProjects();
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-card rounded-tl-md rounded-bl-md border-r h-full">
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link
                  className="flex justify-center text-xs bg-black text-white"
                  href={`/mainview/projects`}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(true);
                  }}
                >
                  New Project
                  <PlusIcon className="w-4 h-4" />
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <div className="flex flex-row items-center w-full h-6 border rounded-md p-2 text-xs font-medium">
                <input
                  type="text"
                  className="w-full h-6 outline-none"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search.length > 0 && (
                  <XIcon
                    className="w-4 h-4 cursor-pointer"
                    onClick={() => setSearch("")}
                  />
                )}
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
          <SidebarMenu>
            {projects
              ?.filter((item) =>
                item.title?.toLowerCase().includes(search.toLowerCase())
              )
              .map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton asChild>
                    <Link href={`/mainview/projects/${item.id}`}>
                      <FolderIcon />
                      <span className="line-clamp-1 text-ellipsis text-xs">
                        {item.title?.charAt(0).toUpperCase() +
                          item.title?.slice(1)}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <CreateProjectDialog isOpen={isOpen} onOpenChange={setIsOpen} />
    </div>
  );
}

const CreateProjectDialog = ({ isOpen, onOpenChange }) => {
  // TODO: - This is the create project dialog modal... extract out into a seperate component...
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
