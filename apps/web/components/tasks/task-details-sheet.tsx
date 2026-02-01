"use client";

import type { Doc } from "@/convex/_generated/dataModel";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { CheckSquareIcon, SquareIcon, PencilIcon, XIcon } from "lucide-react";

type Task = Doc<"tasks">;
type Project = Doc<"projects">;
type Tag = Doc<"tags">;

interface TaskDetailsSheetProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (taskId: string) => void;
  onUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onToggleComplete?: (taskId: string) => void;
  projects?: Project[];
  tags?: Tag[];
}

export function TaskDetailsSheet({
  task,
  open,
  onOpenChange,
  onDelete,
  onUpdate,
  onToggleComplete,
  projects = [],
  tags: availableTags = [],
}: TaskDetailsSheetProps) {
  const isMobile = useIsMobile();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedNotes, setEditedNotes] = useState("");
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [isEditingTags, setIsEditingTags] = useState(false);

  // Reset editing state when task changes
  useEffect(() => {
    if (task) {
      setEditedTitle(task.title);
      setEditedDescription(task.description ?? "");
      setEditedNotes(task.notes ?? "");
      setIsEditing(false);
      setIsEditingProject(false);
      setIsEditingTags(false);
      setShowDeleteConfirm(false);
    }
  }, [task?._id]);

  if (!task) {
    return null;
  }

  // Find the project for this task
  const project = task.projectId
    ? projects.find((p) => p._id === task.projectId)
    : null;

  // Find the tags for this task
  const taskTags = task.tagIds
    .map((id) => availableTags.find((t) => t._id === id))
    .filter(Boolean) as Tag[];

  const formatDate = (timestamp: number | null | undefined) => {
    if (!timestamp) return "Not set";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  const isCompleted = task.status === "Completed";

  const handleDelete = () => {
    if (onDelete) {
      onDelete(task._id as unknown as string);
    }
    setShowDeleteConfirm(false);
  };

  const handleToggleComplete = () => {
    if (onToggleComplete) {
      onToggleComplete(task._id as unknown as string);
    }
  };

  const handleSave = () => {
    if (onUpdate && editedTitle.trim()) {
      onUpdate(task._id as unknown as string, {
        title: editedTitle.trim(),
        description: editedDescription.trim() || undefined,
        notes: editedNotes.trim() || undefined,
      });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedTitle(task.title);
    setEditedDescription(task.description ?? "");
    setEditedNotes(task.notes ?? "");
    setIsEditing(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn("sm:max-w-sm", isMobile && "h-[85vh]")}
      >
        <div className="flex flex-col h-full">
          {/* Header Block */}
          <SheetHeader className="pt-10 pb-4">
            {/* Top row: Project + Status + Actions */}
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-4"
                >
                  {project ? (
                    <>
                      <span className="mr-1">{project.icon}</span>
                      {project.title}
                    </>
                  ) : (
                    "No project"
                  )}
                </Badge>
              </Badge>
              <div className="flex items-center gap-1">
                {/* Toggle Complete Button */}
                {onToggleComplete && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleToggleComplete}
                    className="h-7 w-7"
                    title={isCompleted ? "Mark incomplete" : "Mark complete"}
                  >
                    {isCompleted ? (
                      <CheckSquareIcon className="h-4 w-4 text-primary" />
                    ) : (
                      <SquareIcon className="h-4 w-4" />
                    )}
                  </Button>
                )}
                {/* Edit Button */}
                {onUpdate && !isEditing && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setIsEditing(true)}
                    className="h-7 w-7"
                    title="Edit task"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                )}
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleCancelEdit}
                    className="h-7 w-7"
                    title="Cancel editing"
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Title - Editable or Read-only */}
            {isEditing ? (
              <div className="space-y-3">
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="text-sm font-medium"
                  placeholder="Task title"
                />
                <Textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="text-xs min-h-[60px]"
                  placeholder="Description (optional)"
                />
                <Textarea
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  className="text-xs min-h-[60px]"
                  placeholder="Notes (optional)"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={!editedTitle.trim()}
                    className="h-8 text-xs"
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    className="h-8 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <SheetTitle
                  className={cn(
                    "text-sm font-medium leading-tight",
                    isCompleted && "line-through text-muted-foreground",
                  )}
                >
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
              </>
            )}
          </SheetHeader>

          <Separator />

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
            {/* Tags */}
            {taskTags.length > 0 && (
              <div>
                <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Tags
                </h4>
                <div className="flex flex-wrap gap-1">
                  {taskTags.map((tag, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 h-4"
                      style={{
                        backgroundColor: `${tag.color}20`,
                        color: tag.color,
                        borderColor: tag.color,
                      }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Description (only show if not editing - editing is in header) */}
            {!isEditing && (
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
            )}

            {/* Notes (only show if not editing - editing is in header) */}
            {!isEditing && task.notes && (
              <div>
                <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
                  Notes
                </h4>
                <p className="text-sm text-foreground">{task.notes}</p>
              </div>
            )}

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

          {/* Footer with Delete */}
          {onDelete && (
            <SheetFooter className="border-t gap-2 sm:flex-row sm:justify-between shrink-0 py-3">
              {showDeleteConfirm ? (
                <>
                  <span className="text-xs text-muted-foreground">
                    Are you sure?
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="h-8 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      className="h-8 text-xs"
                    >
                      Delete
                    </Button>
                  </div>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="h-8 text-xs text-destructive hover:text-destructive"
                >
                  Delete task
                </Button>
              )}
            </SheetFooter>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
