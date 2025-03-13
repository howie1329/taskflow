import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import React from "react";
import { TaskCard } from "./taskCard";
import { TaskModalButton } from "./taskModalButton";

export const TaskModal = ({ task }) => {
  return (
    <Dialog>
      <DialogTrigger>
        <TaskModalButton task={task} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
          <DialogDescription>{task.description}</DialogDescription>
        </DialogHeader>
        <TaskCard {...task} />
      </DialogContent>
    </Dialog>
  );
};
