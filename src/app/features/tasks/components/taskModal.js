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
import { TaskCard } from "./taskCard";
import { TaskModalButton } from "./taskModalButton";
import {
  MoveDiagonal,
  SeparatorHorizontal,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import useUpPosition from "@/hooks/useUpPosition";

export const TaskModal = ({ task }) => {
  const upPositionMutation = useUpPosition();

  const upPositionClick = () => {
    const todoData = { position: task.position };
    const newPosition = (todoData.position += 1);
    todoData.position = newPosition;
    upPositionMutation.mutate({ id: task.id, data: todoData });
  };

  const downPositionClick = () => {
    const todoData = { position: task.position };
    const newPosition = (todoData.position -= 1);
    todoData.position = newPosition;
    upPositionMutation.mutate({ id: task.id, data: todoData });
  };

  return (
    <Card className="w-[23rem]">
      <Dialog className="flex flex-row">
        <Collapsible className="flex flex-col">
          <div className="flex flex-row justify-between  items-center space-x-2 mx-2">
            <div className="flex gap-2 truncate items-center">
              <div className="flex flex-col items-center">
                <Button variant="ghost" size="sm" onClick={upPositionClick}>
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <p>{task.position}</p>
                <Button variant="ghost" size="sm" onClick={downPositionClick}>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              <h2 className="font-semibold truncate">{task.title}</h2>
            </div>
            <div className="flex flex-row space-x-2">
              <CollapsibleTrigger>
                <Button variant="ghost" size="sm">
                  <SeparatorHorizontal className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <DialogTrigger>
                <Button variant="ghost" size="sm">
                  <MoveDiagonal className="h-4 w-4" />
                </Button>
              </DialogTrigger>
            </div>
          </div>
          <CollapsibleContent>
            <TaskModalButton task={task} />
          </CollapsibleContent>
        </Collapsible>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{task.title}</DialogTitle>
            <DialogDescription>{task.description}</DialogDescription>
          </DialogHeader>
          <TaskCard {...task} />
        </DialogContent>{" "}
      </Dialog>
    </Card>
  );
};
