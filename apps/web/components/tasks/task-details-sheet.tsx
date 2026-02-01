"use client";

import { Task, mockProjects, mockTags } from "./mock-data";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "Not set";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <div className="flex flex-col h-full">
          {/* Header Block */}
          <SheetHeader className="pt-10 pb-4">
            {/* Top row: Project + Status */}
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                {project?.name || "No project"}
              </Badge>
              <Badge
                variant={
                  task.status === "Completed"
                    ? "default"
                    : task.status === "In Progress"
                      ? "secondary"
                      : "outline"
                }
                className="text-[10px] px-1.5 py-0 h-4"
              >
                {task.status}
              </Badge>
            </div>

            {/* Title */}
            <SheetTitle className="text-sm font-medium leading-tight">
              {task.title}
            </SheetTitle>

            {/* Meta row: Scheduled / Due / Priority */}
            <div className="flex items-center gap-2 mt-2">
              {task.scheduledDate && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1 py-0 h-4"
                >
                  {task.scheduledDate}
                </Badge>
              )}
              {task.dueDate && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] px-1 py-0 h-4",
                    isOverdue && "border-destructive text-destructive",
                  )}
                >
                  Due: {formatDate(task.dueDate)}
                </Badge>
              )}
              <div
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  task.priority === "high" && "bg-red-500",
                  task.priority === "medium" && "bg-amber-500",
                  task.priority === "low" && "bg-blue-500",
                )}
                title={`Priority: ${task.priority}`}
              />
            </div>
          </SheetHeader>

          <Separator />

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
            {/* Tags */}
            {tags.length > 0 && (
              <div>
                <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Tags
                </h4>
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 h-4"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Description
              </h4>
              <p className="text-sm text-foreground">
                {task.description || (
                  <span className="text-muted-foreground italic">
                    No description provided
                  </span>
                )}
              </p>
            </div>

            <Separator />

            {/* Scheduling Section */}
            <div>
              <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Scheduling
              </h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Scheduled</dt>
                  <dd>{task.scheduledDate || "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Due</dt>
                  <dd className={cn(isOverdue && "text-destructive")}>
                    {task.dueDate ? formatDate(task.dueDate) : "—"}
                  </dd>
                </div>
                {task.completionDate && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Completed</dt>
                    <dd>{formatDate(task.completionDate)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Last active</dt>
                  <dd>{formatDate(task.lastActiveAt)}</dd>
                </div>
              </dl>
            </div>

            {/* Work & Metadata Section */}
            <div>
              <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Work & Metadata
              </h4>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Energy</dt>
                  <dd className="capitalize">{task.energyLevel}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Difficulty</dt>
                  <dd className="capitalize">{task.difficulty}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Context</dt>
                  <dd>{task.context.join(", ") || "—"}</dd>
                </div>
                {task.estimatedDuration && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Estimated</dt>
                    <dd>
                      {Math.round((task.estimatedDuration / 60) * 10) / 10}h
                    </dd>
                  </div>
                )}
                {task.actualDuration && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Actual</dt>
                    <dd>{Math.round((task.actualDuration / 60) * 10) / 10}h</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Source</dt>
                  <dd className="capitalize">
                    {task.source.replace("-", " ")}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Timestamps Footer */}
            <div className="pt-4 border-t mt-6">
              <dl className="space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <dt>Created</dt>
                  <dd>{formatDate(task.createdAt)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Updated</dt>
                  <dd>{formatDate(task.updatedAt)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
