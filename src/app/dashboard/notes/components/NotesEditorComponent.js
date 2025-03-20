"use client";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import Tiptap from "./TipTap";
import { Button } from "@/components/ui/button";
import useUploadNote from "@/hooks/useUploadNote";
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
import { set } from "date-fns";

const NotesEditorComponent = ({ content }) => {
  const router = useRouter();
  const upload = useUploadNote();
  const { data: allTask } = useGetTasks();
  const [noteTitle, setNoteTitle] = useState();
  const [note, setNote] = useState();
  const [linkedTask, setLinkedTask] = useState("");
  const onChange = (content) => {
    setNote(content);
  };

  const onClick = () => {
    const noteData = {
      title: noteTitle,
      description: "Note Description",
      content: note,
    };
    upload(noteData);
    router.push("/dashboard/notes");
  };
  return (
    <div className="flex flex-col w-3/4 gap-2">
      <Input
        placeholder={"Note Title...."}
        value={noteTitle}
        onChange={(e) => setNoteTitle(e.target.value)}
      />
      <LinkTaskComboBox
        allTask={allTask}
        linkedTask={linkedTask}
        setLinkedTask={setLinkedTask}
      />
      <Tiptap content={content} onChange={onChange} />
      <Button onClick={onClick}>Save</Button>
    </div>
  );
};

const LinkTaskComboBox = ({ allTask, linkedTask, setLinkedTask }) => {
  const [open, setOpen] = useState(false);
  console.log(allTask);
  return (
    <Popover open={open} setOpen={setOpen}>
      <PopoverTrigger>
        <Button onClick={() => setOpen(!open)}>
          {linkedTask === "" ? "Select Task" : linkedTask}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Command>
          <CommandInput placeholder="Search Task" />
          <CommandList>
            <CommandEmpty>No Task Found</CommandEmpty>
            <CommandGroup>
              {allTask.map((task, key) => (
                <CommandItem
                  key={key}
                  value={task.id}
                  onSelect={(currentValue) => {
                    setLinkedTask(currentValue);
                    setOpen(false);
                  }}
                />
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default NotesEditorComponent;
