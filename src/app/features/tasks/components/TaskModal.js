import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

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
import { TaskCollapsibleButton } from "./TaskCollapsibleButton";
import useIsComplete from "@/hooks/useIsComplete";

export const TaskModal = ({ task }) => {
  const changePosition = useChangePosition();
  const completeUpdateMutation = useIsComplete();

  const updatePosition = (increment) => {
    if (task.position == 0) {
      return;
    }
    const newPosition = task.position + increment;
    const todoData = { position: newPosition };
    changePosition.mutate({ id: task.id, data: todoData });
  };

  const completeButtonClick = () => {
    const data = { isCompleted: !task.isCompleted };
    completeUpdateMutation.mutate({ id: task.id, data: data });
  };

  return (
    <Card className="w-[20rem]">
      <Dialog className="flex flex-row">
        <Collapsible className="flex flex-col">
          <div className="flex flex-row justify-between items-center space-x-1 mx-1">
            <div className="flex truncate items-center w-full">
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
              <div className="flex flex-row justify-center truncate w-full">
                <div className="flex mr-1 items-center">
                  {task.isCompleted ? (
                    <Button
                      className=" bg-green-700 h-3 w-3 rounded-full"
                      size="basic"
                      onClick={completeButtonClick}
                    ></Button>
                  ) : (
                    <Button
                      className=" bg-red-700 h-3 w-3 rounded-full"
                      size="basic"
                      onClick={completeButtonClick}
                    ></Button>
                  )}
                </div>
                <div className="truncate w-full">
                  <h2 className="font-semibold truncate">{task.title}</h2>
                  <div className="flex flex-row justify-between">
                    <p className="font-extralight text-xs">
                      SubTasks: {task.subTasks.length}
                    </p>
                    <p className="font-extralight text-xs">{task.date}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-row space-x-1">
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
            <TaskCollapsibleButton task={task} />
          </CollapsibleContent>
        </Collapsible>
        <DialogContent>
          <TaskDialogCard task={task} />
        </DialogContent>
      </Dialog>
    </Card>
  );
};
