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
import { MoveDiagonal, SeparatorHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const TaskModal = ({ task }) => {
  return (
    <Card className="w-[20rem]">
      <Dialog className="flex flex-row">
        <Collapsible className="flex flex-col">
          <div className="flex flex-row justify-between  items-center space-x-2 mx-2">
            <h2 className="font-semibold truncate">{task.title}</h2>
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
