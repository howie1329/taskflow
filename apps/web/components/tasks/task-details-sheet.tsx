"use client";

import { Task, mockProjects, mockTags } from "./mock-data";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface TaskDetailsSheetProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetailsSheet({
  task,
  open,
  onOpenChange,
}: TaskDetailsSheetProps) {
  if (!task) {
    return null;
  }

  const project = task.projectId
    ? mockProjects[task.projectId as keyof typeof mockProjects]
    : null;
  const tags = task.tagIds
    .map((id) => mockTags[id as keyof typeof mockTags])
    .filter(Boolean);

  const priorityLabels = {
    low: "Low Priority",
    medium: "Medium Priority",
    high: "High Priority",
  };

  const statusLabels = {
    "Not Started": "Not Started",
    "To Do": "To Do",
    "In Progress": "In Progress",
    Completed: "Completed",
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "Not set";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="text-base">{task.title}</SheetTitle>
          <SheetDescription className="text-xs">
            Task details and management
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status and Priority */}
          <div className="flex gap-2 flex-wrap">
            <Badge
              variant={
                task.status === "Completed"
                  ? "default"
                  : task.status === "In Progress"
                    ? "secondary"
                    : "outline"
              }
            >
              {statusLabels[task.status as keyof typeof statusLabels]}
            </Badge>
            <Badge
              variant="outline"
              className={
                task.priority === "high"
                  ? "border-red-500 text-red-500"
                  : task.priority === "medium"
                    ? "border-amber-500 text-amber-500"
                    : "border-blue-500 text-blue-500"
              }
            >
              {priorityLabels[task.priority as keyof typeof priorityLabels]}
            </Badge>
          </div>

          {/* Project */}
          {project && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-1">
                Project
              </h4>
              <Badge
                variant="outline"
                style={{ borderColor: project.color, color: project.color }}
              >
                {project.name}
              </Badge>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-1">
                Tags
              </h4>
              <div className="flex gap-1 flex-wrap">
                {tags.map((tag, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    style={{
                      backgroundColor: tag.color + "20",
                      color: tag.color,
                    }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Dates */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Scheduled</span>
              <span>{task.scheduledDate || "Not scheduled"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Due</span>
              <span>{formatDate(task.dueDate)}</span>
            </div>
            {task.completionDate && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Completed</span>
                <span>{formatDate(task.completionDate)}</span>
              </div>
            )}
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground mb-2">
              Description
            </h4>
            <p className="text-sm text-foreground">
              {task.description || "No description provided."}
            </p>
          </div>

          <Separator />

          {/* Metadata */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Energy Level</span>
              <span className="capitalize">{task.energyLevel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Difficulty</span>
              <span className="capitalize">{task.difficulty}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Context</span>
              <span>{task.context.join(", ") || "None"}</span>
            </div>
            {task.estimatedDuration && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated</span>
                <span>
                  {Math.round((task.estimatedDuration / 60) * 10) / 10}h
                </span>
              </div>
            )}
            {task.actualDuration && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Actual</span>
                <span>{Math.round((task.actualDuration / 60) * 10) / 10}h</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Source</span>
              <span className="capitalize">
                {task.source.replace("-", " ")}
              </span>
            </div>
          </div>

          {/* Created/Updated */}
          <div className="pt-4 border-t text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Created</span>
              <span>{formatDate(task.createdAt)}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Last updated</span>
              <span>{formatDate(task.updatedAt)}</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
