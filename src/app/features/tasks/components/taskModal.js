import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import React from "react";
import { TaskModalButton } from "./taskModalButton";
import {
  MoveDiagonal,
  SeparatorHorizontal,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import useChangePosition from "@/hooks/useUpPosition";
import TaskDialogCard from "./TaskDialogCard";

export const TaskModal = ({ task }) => {
  const changePosition = useChangePosition();

  const updatePosition = (increment) => {
    if (task.position == 0) {
      return;
    }
    const newPosition = task.position + increment;
    const todoData = { position: newPosition };
    changePosition.mutate({ id: task.id, data: todoData });
  };

  return (
    <Card className="w-[20rem]">
      <Dialog className="flex flex-row">
        <Collapsible className="flex flex-col">
          <div className="flex flex-row justify-between  items-center space-x-2 mx-2">
            <div className="flex gap-2 truncate items-center">
              <div className="flex flex-col items-center">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => updatePosition(1)}
                >
                  <ChevronUp className="h-2 w-2" />
                </Button>
                <p className="font-semibold text-xs">{task.position}</p>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => updatePosition(-1)}
                >
                  <ChevronDown className="h-2 w-2" />
                </Button>
              </div>
              <h2 className="font-semibold truncate">{task.title}</h2>
            </div>
            <div className="flex flex-row space-x-2">
              <CollapsibleTrigger>
                <Button variant="ghost" size="xs">
                  <SeparatorHorizontal className="h-2 w-2" />
                </Button>
              </CollapsibleTrigger>
              <DialogTrigger>
                <Button variant="ghost" size="xs">
                  <MoveDiagonal className="h-2 w-2" />
                </Button>
              </DialogTrigger>
            </div>
          </div>
          <CollapsibleContent>
            <TaskModalButton task={task} />
          </CollapsibleContent>
        </Collapsible>
        <DialogContent>
          <TaskDialogCard task={task} />
        </DialogContent>
      </Dialog>
    </Card>
  );
};
