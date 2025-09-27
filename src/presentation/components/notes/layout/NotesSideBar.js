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
import { NotebookIcon, PlusIcon, XIcon } from "lucide-react";
import useFetchNotes from "@/hooks/notes/useFetchNotes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useCreateNote from "@/hooks/notes/useCreateNote";

export default function NotesSideBar() {
  const [search, setSearch] = useState("");
  const { data: notes } = useFetchNotes();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-card rounded-tl-md rounded-bl-md border-r h-full">
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Button
                  onClick={() => setIsOpen(true)}
                  className="flex justify-center text-xs bg-black text-white"
                >
                  New Note
                  <PlusIcon className="w-4 h-4" />
                </Button>
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
            {notes
              ?.filter((item) =>
                item.title.toLowerCase().includes(search.toLowerCase())
              )
              .map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton asChild>
                    <Link href={`/mainview/notes/${item.id}`}>
                      <NotebookIcon className="w-4 h-4" />
                      <span className="line-clamp-1 text-ellipsis text-xs">
                        {item.title.charAt(0).toUpperCase() +
                          item.title.slice(1)}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <CreateNoteDialog isOpen={isOpen} onOpenChange={setIsOpen} />
    </div>
  );
}

const CreateNoteDialog = ({ isOpen, onOpenChange }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const createNote = useCreateNote();
  const handleCreateNote = () => {
    setTitle("");
    setDescription("");
    onOpenChange(false);
    createNote.mutate({ title, description });
  };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Note</DialogTitle>
        </DialogHeader>
        <Separator />
        <div className="grid grid-cols-3 gap-2 ">
          <div className="col-span-3 gap-2 flex flex-col">
            <Input
              placeholder="Note Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              placeholder="Note Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Button className="w-full" onClick={handleCreateNote}>
              Create Note
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
