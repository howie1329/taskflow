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
  <div className="flex flex-col items-center bg-muted/50 rounded-md p-1">
    <Button
      variant="ghost"
      size="xs"
      onClick={() => onPositionChange(1)}
      className="hover:bg-muted"
    >
      <ChevronUp className="h-3 w-3" />
    </Button>
    <p className="font-medium text-xs text-muted-foreground">{position}</p>
    <Button
      variant="ghost"
      size="xs"
      onClick={() => onPositionChange(-1)}
      className="hover:bg-muted"
    >
      <ChevronDown className="h-3 w-3" />
    </Button>
  </div>
);

const StatusBadge = ({ priority }) => {
  const statusButtonColor = {
    None: "bg-muted text-muted-foreground",
    Low: "bg-blue-200 text-blue-700",
    Medium: "bg-yellow-200 text-yellow-700",
    High: "bg-red-200 text-red-700",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusButtonColor[priority]}`}
    >
      {priority}
    </span>
  );
};

const TaskContent = ({
  task,
  updateField,
  setUpdateField,
  onUpdateFieldBlur,
  onCompleteChange,
}) => (
  <div className="flex flex-col w-full gap-2">
    <div className="flex items-center gap-2">
      <Checkbox
        checked={task.isCompleted}
        onCheckedChange={onCompleteChange}
        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
      />
      <Input
        className={`text-base font-medium border-none h-fit p-0 bg-transparent focus-visible:ring-0 ${
          task.isCompleted ? "line-through text-muted-foreground" : ""
        }`}
        placeholder={task.title}
        value={updateField}
        onChange={(e) => setUpdateField(e.target.value)}
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            onUpdateFieldBlur("title", updateField);
          }
        }}
      />
    </div>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <StatusBadge priority={task.priority} />
        {task.labels?.map((label, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground"
          >
            {label}
          </span>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{task.date}</p>
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
    <Card
      className="w-full transition-all duration-200 hover:shadow-md border-border/50"
      onMouseEnter={preFetchData}
    >
      <Dialog>
        <Collapsible>
          <div className="p-3">
            <div className="flex items-start gap-3">
              <PositionControls
                position={task.position}
                onPositionChange={handlePositionChange}
              />
              <div className="flex-1 min-w-0">
                <TaskContent
                  task={task}
                  updateField={updateField}
                  setUpdateField={setUpdateField}
                  onUpdateFieldBlur={handleUpdateFieldBlur}
                  onCompleteChange={handleCompleteChange}
                />
              </div>
              <div className="flex items-center gap-1">
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-muted"
                  >
                    <SeparatorHorizontal className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-muted"
                  >
                    <MoveDiagonal className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
              </div>
            </div>
          </div>
          <CollapsibleContent className="px-3 pb-3">
            <TaskCollapsibleButton task={task} />
          </CollapsibleContent>
        </Collapsible>
        <DialogContent className="max-w-2xl">
          <TaskDialogCard task={task} />
        </DialogContent>
      </Dialog>
    </Card>
  );
};
