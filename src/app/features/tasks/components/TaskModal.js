import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import React, { useState } from "react";
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
import { useQueryClient } from "@tanstack/react-query";
import { singleSubTask } from "@/hooks/useFetchSingleSubTask";
import { Input } from "@/components/ui/input";
import useTaskUpdateField from "@/hooks/useTaskUpdateField";
import { singleNote } from "@/hooks/useFetchSingleNote";
import { useAuth } from "@clerk/nextjs";

export const TaskModal = ({ task }) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const changePosition = useChangePosition();
  const completeUpdateMutation = useIsComplete(getToken);
  const [updateField, setUpdateField] = useState(task.title);

  const updateFieldMutation = useTaskUpdateField(getToken);

  const updatePosition = (increment) => {
    const newPosition = task.position + increment;
    if (newPosition == 0) {
      return;
    }
    const todoData = { position: newPosition };
    changePosition.mutate({ id: task.id, data: todoData });
  };

  const completeButtonClick = () => {
    const data = { isCompleted: !task.isCompleted };
    completeUpdateMutation.mutate({ id: task.id, data: data });
  };

  const updateFieldBlur = (field, value) => {
    updateFieldMutation.mutate({
      id: task.id,
      changedField: field,
      updateData: value,
    });
  };

  const preFetchSubtask = () => {
    queryClient.prefetchQuery({
      queryKey: ["subtasks", task.id],
      queryFn: () => singleSubTask(task.id),
      staleTime: 300_000,
    });
  };

  const preFetchNotes = () => {
    queryClient.prefetchQuery({
      queryKey: ["notes", task.id],
      queryFn: () => singleNote(task.id),
      staleTime: 300_000,
    });
  };
  const preFetch = () => {
    preFetchSubtask();
    preFetchNotes();
  };

  const statusButtonColor = {
    None: "bg-primary",
    Low: "bg-blue-600",
    Medium: "bg-yellow-600",
    High: "bg-red-600",
  };

  return (
    <Card className="w-[20rem]" onMouseEnter={() => preFetch()}>
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
                <div className="flex flex-col truncate w-full gap-1">
                  <Input
                    className="text-3xl truncate border-none h-fit p-0"
                    placeholder={task.title}
                    value={updateField}
                    onChange={(e) => setUpdateField(e.target.value)}
                    onKeyUp={(e) => {
                      if (e.key === "Enter") {
                        updateFieldBlur("title", updateField);
                      }
                    }}
                  />
                  <div className="flex flex-row justify-between">
                    <p
                      className={`font-extralight text-xs shadow rounded-md px-2 text-primary-foreground ${
                        statusButtonColor[task.priority]
                      } hover:opacity-90`}
                    >
                      {task.priority}
                    </p>
                    <p className="font-extralight text-xs ">{task.date}</p>
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
