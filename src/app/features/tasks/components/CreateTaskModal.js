"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { TaskCreateForm } from "./TaskCreateForm";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
} from "@/components/ui/dialog";

export const CreateTaskModal = () => {
  return (
    <Dialog>
      <DialogTrigger>
        <Button className="w-full">Create New Task</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
        </DialogHeader>
        <TaskCreateForm />
      </DialogContent>
    </Dialog>
  );
};
