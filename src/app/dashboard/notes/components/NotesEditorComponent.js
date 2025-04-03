"use client";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import Tiptap from "./TipTap";
import { Button } from "@/components/ui/button";
import { useUploadNote } from "@/hooks/useUploadNote";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useGetTasks from "@/hooks/useGetTasks";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useAuth } from "@clerk/nextjs";

const NotesEditorComponent = ({ content }) => {
  const router = useRouter();
  const upload = useUploadNote();

  const [noteTitle, setNoteTitle] = useState("");
  const [note, setNote] = useState("");
  const [linkedTask, setLinkedTask] = useState(null);
  const onChange = (content) => {
    setNote(content);
  };

  const onClick = () => {
    const noteData = {
      title: noteTitle,
      description: "Note Description",
      content: note,
      task_id: linkedTask,
    };
    upload.mutate(noteData);
    router.push("/dashboard/notes");
  };
  return (
    <div className="flex flex-col w-3/4 gap-2">
      <div className="flex flex-row gap-2">
        <Input
          placeholder={"Note Title...."}
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
        />
        <LinkTaskComboBox
          linkedTask={linkedTask}
          setLinkedTask={setLinkedTask}
        />
        <Button onClick={onClick}>Save</Button>
      </div>

      <Tiptap content={content} onChange={onChange} />
    </div>
  );
};

const LinkTaskComboBox = ({ linkedTask, setLinkedTask }) => {
  const [open, setOpen] = useState(false);
  const { userId } = useAuth();
  const { data: allTask } = useGetTasks(userId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button onClick={() => setOpen(!open)}>
          {allTask && linkedTask !== null
            ? allTask.find((task) => task.id === linkedTask).title
            : "Link A Task ..."}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Command>
          <CommandInput placeholder="Search Task" />
          <CommandList>
            <CommandEmpty>No Task Found</CommandEmpty>
            <CommandGroup>
              {allTask &&
                allTask.map((task, key) => (
                  <CommandItem
                    key={task.id}
                    value={task.id}
                    onSelect={() => {
                      setLinkedTask(task.id);
                      setOpen(false);
                    }}
                  >
                    {task.title}
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default NotesEditorComponent;
