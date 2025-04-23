"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
} from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";
import { TaskCreateForm } from "./TaskCreateForm";

export const TaskCreateDialog = ({ small = false, plain = false }) => {
  return (
    <Dialog>
      <DialogTrigger>
        {small ? (
          <p className="bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0">
            <PlusIcon />
          </p>
        ) : plain ? (
          <p className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium">
            Create New Task
          </p>
        ) : (
          <p className="bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0">
            Create New Task
          </p>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>
        <TaskCreateForm />
      </DialogContent>
    </Dialog>
  );
};
