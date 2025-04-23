"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  MoveDiagonal,
  SeparatorHorizontal,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import useTaskPositionUpdate from "@/features/tasks/hooks/useTaskPositionUpdate";
import { singleSubTask } from "@/features/subtasks/hooks/useFetchSingleSubTask";
import { singleNote } from "@/features/notes/hooks/useFetchSingleNote";
import { TaskCollapsibleButton } from "./TaskCollapsibleButton";
import TaskDialogCard from "./TaskDialogCard";
import useIsComplete from "./hooks/useIsComplete";
import useTaskUpdateField from "./hooks/useTaskUpdateField";

const PositionControls = ({ position, onPositionChange }) => (
  <div className="flex flex-col items-center">
    <Button variant="ghost" size="xs" onClick={() => onPositionChange(1)}>
      <ChevronUp className="h-2 w-2" />
    </Button>
    <p className="font-semibold text-xs">{position}</p>
    <Button variant="ghost" size="xs" onClick={() => onPositionChange(-1)}>
      <ChevronDown className="h-2 w-2" />
    </Button>
  </div>
);

const StatusBadge = ({ priority }) => {
  const statusButtonColor = {
    None: "bg-primary",
    Low: "bg-blue-600",
    Medium: "bg-yellow-600",
    High: "bg-red-600",
  };

  return (
    <p
      className={`font-extralight text-xs shadow rounded-md px-2 text-primary-foreground ${statusButtonColor[priority]} hover:opacity-90`}
    >
      {priority}
    </p>
  );
};

const TaskContent = ({
  task,
  updateField,
  setUpdateField,
  onUpdateFieldBlur,
  onCompleteChange,
}) => (
  <div className="flex flex-col truncate w-full gap-1">
    <Input
      className="text-3xl truncate border-none h-fit p-0"
      placeholder={task.title}
      value={updateField}
      onChange={(e) => setUpdateField(e.target.value)}
      onKeyUp={(e) => {
        if (e.key === "Enter") {
          onUpdateFieldBlur("title", updateField);
        }
      }}
    />
    <div className="flex flex-row justify-between">
      <StatusBadge priority={task.priority} />
      <p className="font-extralight text-xs">{task.date}</p>
    </div>
  </div>
);

export const TaskModal = ({ task }) => {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const changePosition = useTaskPositionUpdate(getToken);
  const completeUpdateMutation = useIsComplete(getToken);
  const [updateField, setUpdateField] = useState(task.title);
  const updateFieldMutation = useTaskUpdateField(getToken);

  const handlePositionChange = (increment) => {
    const newPosition = task.position + increment;
    if (newPosition > 0) {
      changePosition.mutate({
        id: task.id,
        data: { position: newPosition },
      });
    }
  };

  const handleCompleteChange = () => {
    completeUpdateMutation.mutate({
      id: task.id,
      data: { isCompleted: !task.isCompleted },
    });
  };

  const handleUpdateFieldBlur = (field, value) => {
    updateFieldMutation.mutate({
      id: task.id,
      changedField: field,
      updateData: value,
    });
  };

  const preFetchData = () => {
    queryClient.prefetchQuery({
      queryKey: ["subtasks", task.id],
      queryFn: () => singleSubTask(task.id, getToken),
      staleTime: 300_000,
    });
    queryClient.prefetchQuery({
      queryKey: ["notes", task.id],
      queryFn: () => singleNote(task.id),
      staleTime: 300_000,
    });
  };

  return (
    <Card className="w-full" onMouseEnter={preFetchData}>
      <Dialog className="flex flex-row">
        <Collapsible className="flex flex-col">
          <div className="flex flex-row justify-between items-center space-x-1 mx-1">
            <div className="flex truncate items-center w-full">
              <PositionControls
                position={task.position}
                onPositionChange={handlePositionChange}
              />
              <div className="flex flex-row justify-center truncate w-full">
                <div className="flex mr-1 items-center">
                  <Checkbox
                    checked={task.isCompleted}
                    onCheckedChange={handleCompleteChange}
                  />
                </div>
                <TaskContent
                  task={task}
                  updateField={updateField}
                  setUpdateField={setUpdateField}
                  onUpdateFieldBlur={handleUpdateFieldBlur}
                  onCompleteChange={handleCompleteChange}
                />
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
