"use client";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import Tiptap from "./TipTap";
import { Button } from "@/components/ui/button";
import { useUploadNote } from "@/features/notes/hooks/useUploadNote";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useGetTasks from "@/features/tasks/hooks/useGetTasks";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useAuth } from "@clerk/nextjs";
import { Link2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

const NotesEditorComponent = ({ content }) => {
  const { getToken, userId } = useAuth();
  const router = useRouter();
  const upload = useUploadNote();

  const [noteTitle, setNoteTitle] = useState("");
  const [note, setNote] = useState("");
  const [linkedTask, setLinkedTask] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const onChange = (content) => {
    setNote(content);
  };

  const onClick = async () => {
    if (!noteTitle.trim()) {
      // You might want to add proper validation/error handling here
      return;
    }

    setIsSaving(true);
    try {
      const token = await getToken();
      const noteData = {
        title: noteTitle,
        description: "Note Description",
        content: note,
        task_id: linkedTask,
        token: token,
        userId: userId,
      };
      await upload.mutateAsync(noteData);
      router.push("/dashboard/notes");
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col w-full gap-6">
      <div className="flex flex-col gap-4">
        <Input
          placeholder="Enter note title..."
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          className="text-2xl font-semibold h-12"
        />

        <div className="flex items-center gap-2">
          <LinkTaskComboBox
            linkedTask={linkedTask}
            setLinkedTask={setLinkedTask}
          />
          <Button
            onClick={onClick}
            disabled={isSaving || !noteTitle.trim()}
            className="ml-auto"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Note"}
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Tiptap content={content} onChange={onChange} />
      </div>
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
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          <Link2 className="h-4 w-4 mr-2" />
          {allTask && linkedTask !== null
            ? allTask.find((task) => task.id === linkedTask).title
            : "Link a task..."}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search tasks..." />
          <CommandList>
            <CommandEmpty>No tasks found</CommandEmpty>
            <CommandGroup>
              {allTask &&
                allTask.map((task) => (
                  <CommandItem
                    key={task.id}
                    value={task.id}
                    onSelect={() => {
                      setLinkedTask(task.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "cursor-pointer",
                      linkedTask === task.id && "bg-accent"
                    )}
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
