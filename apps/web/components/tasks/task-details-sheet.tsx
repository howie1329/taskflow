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
import { priorityDotClassName } from "@/lib/task-priority-styles";
import { useState, useEffect } from "react";
import {
  CheckSquareIcon,
  SquareIcon,
  PencilIcon,
  XIcon,
  TrashIcon,
  PlusIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type Task = Doc<"tasks">;
type Project = Doc<"projects">;
type Tag = Doc<"tags">;
type Subtask = Doc<"subtasks">;

// Task update type with string IDs for client-side use
interface TaskUpdate {
  title?: string;
  description?: string;
  notes?: string;
  status?: Task["status"];
  priority?: Task["priority"];
  projectId?: string;
  tagIds?: string[];
  scheduledDate?: string;
  dueDate?: number;
}

interface TaskDetailsSheetProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: (taskId: string) => void;
  onUpdate?: (taskId: string, updates: TaskUpdate) => void;
  onToggleComplete?: (taskId: string) => void;
  projects?: Project[];
  tags?: Tag[];
  subtasks?: Subtask[];
  onCreateSubtask?: (taskId: string, title: string) => void;
  onToggleSubtask?: (subtaskId: string) => void;
  onDeleteSubtask?: (subtaskId: string) => void;
  onUpdateSubtask?: (subtaskId: string, title: string) => void;
  onCreateTag?: (name: string) => Promise<Tag | null>;
  renderInSidebar?: boolean;
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
  subtasks = [],
  onCreateSubtask,
  onToggleSubtask,
  onDeleteSubtask,
  onUpdateSubtask,
  onCreateTag,
  renderInSidebar = false,
}: TaskDetailsSheetProps) {
  const isMobile = useIsMobile();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [editedNotes, setEditedNotes] = useState("");
  const [editedStatus, setEditedStatus] =
    useState<Task["status"]>("Not Started");
  const [editedPriority, setEditedPriority] = useState<Task["priority"]>("low");
  const [editedProjectId, setEditedProjectId] = useState<string>("__none__");
  const [editedTagIds, setEditedTagIds] = useState<string[]>([]);
  const [editedScheduledDate, setEditedScheduledDate] = useState<string>("");
  const [editedDueDate, setEditedDueDate] = useState<string>("");

  // Create tag dialog state
  const [isCreateTagDialogOpen, setIsCreateTagDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  // Subtask state
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState("");
  const [hideCompletedSubtasks, setHideCompletedSubtasks] = useState(false);

  // Reset editing state when task changes
  useEffect(() => {
    if (task) {
      setEditedTitle(task.title);
      setEditedDescription(task.description ?? "");
      setEditedNotes(task.notes ?? "");
      setEditedStatus(task.status);
      setEditedPriority(task.priority);
      setEditedProjectId(task.projectId ? String(task.projectId) : "__none__");
      setEditedTagIds(task.tagIds.map((id) => String(id)));
      setEditedScheduledDate(task.scheduledDate ?? "");
      setEditedDueDate(
        task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
      );
      setIsEditing(false);
      setShowDeleteConfirm(false);
      setNewSubtaskTitle("");
      setEditingSubtaskId(null);
      setEditingSubtaskTitle("");
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

  // Subtask calculations
  const completedSubtasks = subtasks.filter((s) => s.isComplete).length;
  const totalSubtasks = subtasks.length;
  const subtaskProgress =
    totalSubtasks > 0 ? `${completedSubtasks}/${totalSubtasks}` : null;

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
        status: editedStatus,
        priority: editedPriority,
        projectId: editedProjectId === "__none__" ? undefined : editedProjectId,
        tagIds: editedTagIds.length > 0 ? editedTagIds : undefined,
        scheduledDate: editedScheduledDate || undefined,
        dueDate: editedDueDate ? new Date(editedDueDate).getTime() : undefined,
      });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedTitle(task.title);
    setEditedDescription(task.description ?? "");
    setEditedNotes(task.notes ?? "");
    setEditedStatus(task.status);
    setEditedPriority(task.priority);
    setEditedProjectId(task.projectId ? String(task.projectId) : "__none__");
    setEditedTagIds(task.tagIds.map((id) => String(id)));
    setEditedScheduledDate(task.scheduledDate ?? "");
    setEditedDueDate(
      task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
    );
    setIsEditing(false);
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim() || !onCreateTag) return;

    setIsCreatingTag(true);
    try {
      const newTag = await onCreateTag(newTagName.trim());
      if (newTag) {
        // Add the new tag to the task's selected tags
        setEditedTagIds((prev) => [...prev, newTag._id as string]);
        setNewTagName("");
        setIsCreateTagDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to create tag:", error);
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleAddSubtask = () => {
    if (onCreateSubtask && newSubtaskTitle.trim()) {
      onCreateSubtask(task._id as unknown as string, newSubtaskTitle.trim());
      setNewSubtaskTitle("");
    }
  };

  const handleToggleSubtask = (subtaskId: string) => {
    if (onToggleSubtask) {
      onToggleSubtask(subtaskId);
    }
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    if (onDeleteSubtask) {
      onDeleteSubtask(subtaskId);
    }
  };

  const handleEditSubtask = (subtask: Subtask) => {
    setEditingSubtaskId(subtask._id as string);
    setEditingSubtaskTitle(subtask.title);
  };

  const handleSaveSubtask = () => {
    if (onUpdateSubtask && editingSubtaskId && editingSubtaskTitle.trim()) {
      onUpdateSubtask(editingSubtaskId, editingSubtaskTitle.trim());
    }
    setEditingSubtaskId(null);
    setEditingSubtaskTitle("");
  };

  const handleCancelEditSubtask = () => {
    setEditingSubtaskId(null);
    setEditingSubtaskTitle("");
  };

  // Filter subtasks if hide completed is on
  const visibleSubtasks = hideCompletedSubtasks
    ? subtasks.filter((s) => !s.isComplete)
    : subtasks;

  const panelContent = (
    <div className="flex h-full flex-col">
          {/* Header Block */}
          <SheetHeader className="pb-4 pt-6">
            {/* Top row: Project + Status + Actions */}
            <div className="flex items-center justify-between mb-3">
              <Badge variant="outline" className="text-xs px-2 py-0.5 h-6">
                {project ? (
                  <>
                    <span className="mr-1">{project.icon}</span>
                    {project.title}
                  </>
                ) : (
                  "No project"
                )}
              </Badge>
              <div className="flex items-center gap-1.5">
                {/* Toggle Complete Button */}
                {onToggleComplete && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={handleToggleComplete}
                    className="h-8 w-8"
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
                    className="h-8 w-8"
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
                    className="h-8 w-8"
                    title="Cancel editing"
                  >
                    <XIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {!isEditing ? (
              <>
                {renderInSidebar ? (
                  <h2
                    className={cn(
                      "text-foreground text-lg font-medium leading-snug",
                      isCompleted && "line-through text-muted-foreground",
                    )}
                  >
                    {task.title}
                  </h2>
                ) : (
                  <SheetTitle
                    className={cn(
                      "text-lg font-medium leading-snug",
                      isCompleted && "line-through text-muted-foreground",
                    )}
                  >
                    {task.title}
                  </SheetTitle>
                )}

                {/* Meta row: Scheduled / Due / Priority */}
                <div className="flex items-center gap-2 mt-3 text-sm">
                  {task.scheduledDate && (
                    <Badge variant="secondary" className="text-xs px-2 py-0.5 h-6">
                      {task.scheduledDate}
                    </Badge>
                  )}
                  {task.dueDate && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs px-2 py-0.5 h-6",
                        isOverdue && "border-destructive text-destructive",
                      )}
                    >
                      Due: {formatDate(task.dueDate)}
                    </Badge>
                  )}
                  <div
                    className={cn(
                      "size-1.5 rounded-full opacity-80",
                      priorityDotClassName(task.priority),
                    )}
                    title={`Priority: ${task.priority}`}
                  />
                </div>
              </>
            ) : (
              renderInSidebar ? (
                <h2 className="text-foreground text-base font-medium">Edit task</h2>
              ) : (
                <SheetTitle className="text-base font-medium">Edit task</SheetTitle>
              )
            )}
          </SheetHeader>

          <Separator />

          {/* Scrollable Content */}
          <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
            {isEditing && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="h-8 rounded-md px-3 text-sm font-medium"
                    placeholder="Task title"
                  />
                  <Textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="min-h-28 rounded-md px-3 py-2 text-sm leading-relaxed"
                    placeholder="Description (optional)"
                  />
                  <Textarea
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    className="min-h-24 rounded-md px-3 py-2 text-sm leading-relaxed"
                    placeholder="Notes (optional)"
                  />
                </div>

                <div className="space-y-4 rounded-lg border border-border p-4">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Options
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">
                        Status
                      </label>
                      <Select
                        value={editedStatus}
                        onValueChange={(v) => setEditedStatus(v as Task["status"])}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Not Started">Not Started</SelectItem>
                          <SelectItem value="To Do">To Do</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">
                        Priority
                      </label>
                      <Select
                        value={editedPriority}
                        onValueChange={(v) =>
                          setEditedPriority(v as Task["priority"])
                        }
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue>
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "size-1.5 rounded-full",
                                  priorityDotClassName(editedPriority),
                                )}
                              />
                              <span className="capitalize">{editedPriority}</span>
                            </div>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {(["low", "medium", "high"] as const).map((p) => (
                            <SelectItem key={p} value={p} className="text-sm">
                              <div className="flex items-center gap-2">
                                <div
                                  className={cn(
                                    "size-1.5 rounded-full",
                                    priorityDotClassName(p),
                                  )}
                                />
                                <span className="capitalize">{p}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">
                      Project
                    </label>
                    <Select value={editedProjectId} onValueChange={setEditedProjectId}>
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="No project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">No project</SelectItem>
                        {projects.map((project) => (
                          <SelectItem
                            key={project._id as string}
                            value={project._id as string}
                          >
                            <span className="mr-1">{project.icon}</span>
                            {project.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1.5 block">
                      Tags
                    </label>
                    {availableTags.length === 0 ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          No tags available.
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsCreateTagDialogOpen(true)}
                          className="h-8 px-3 text-sm"
                        >
                          + Create tag
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {availableTags.map((tag) => {
                          const isSelected = editedTagIds.includes(tag._id as string);
                          return (
                            <Button
                              key={tag._id as string}
                              type="button"
                              variant={isSelected ? "secondary" : "outline"}
                              size="xs"
                              onClick={() => {
                                setEditedTagIds((prev) =>
                                  isSelected
                                    ? prev.filter((id) => id !== (tag._id as string))
                                    : [...prev, tag._id as string],
                                );
                              }}
                              className="h-8 rounded-md px-3 text-sm"
                            >
                              <span
                                className="inline-block w-1.5 h-1.5 rounded-full mr-1.5"
                                style={{ backgroundColor: tag.color }}
                              />
                              {tag.name}
                            </Button>
                          );
                        })}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsCreateTagDialogOpen(true)}
                          className="h-8 rounded-md border-dashed px-3 text-sm"
                        >
                          + Create tag
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">
                        Scheduled
                      </label>
                      <Input
                        type="date"
                        value={editedScheduledDate}
                        onChange={(e) => setEditedScheduledDate(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1.5 block">
                        Due Date
                      </label>
                      <Input
                        type="date"
                        value={editedDueDate}
                        onChange={(e) => setEditedDueDate(e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={!editedTitle.trim()}
                    className="h-8 text-sm"
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    className="h-8 text-sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Subtasks Section */}
            {!isEditing && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Subtasks {subtaskProgress && `(${subtaskProgress})`}
                  </h4>
                  {totalSubtasks > 0 && (
                    <button
                      onClick={() =>
                        setHideCompletedSubtasks(!hideCompletedSubtasks)
                      }
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {hideCompletedSubtasks
                        ? "Show completed"
                        : "Hide completed"}
                    </button>
                  )}
                </div>

                {/* Add new subtask */}
                {onCreateSubtask && (
                  <div className="flex gap-2 mb-3">
                    <Input
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      placeholder="Add a checklist item..."
                      className="h-8 flex-1 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAddSubtask();
                        }
                      }}
                    />
                    <Button
                      size="icon-sm"
                      onClick={handleAddSubtask}
                      disabled={!newSubtaskTitle.trim()}
                      className="h-8 w-8"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Subtasks list */}
                <div className="space-y-2">
                  {visibleSubtasks.map((subtask) => (
                    <div
                      key={subtask._id as string}
                      className="flex items-center gap-2 group rounded-lg px-1"
                    >
                      {editingSubtaskId === subtask._id ? (
                        <div className="flex gap-2 flex-1">
                          <Input
                            value={editingSubtaskTitle}
                            onChange={(e) =>
                              setEditingSubtaskTitle(e.target.value)
                            }
                            className="h-8 text-sm flex-1"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleSaveSubtask();
                              } else if (e.key === "Escape") {
                                handleCancelEditSubtask();
                              }
                            }}
                            autoFocus
                          />
                          <Button
                            size="icon-sm"
                            onClick={handleSaveSubtask}
                            className="h-8 w-8"
                          >
                            <CheckSquareIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() =>
                              handleToggleSubtask(subtask._id as string)
                            }
                            className="h-7 w-7 shrink-0"
                          >
                            {subtask.isComplete ? (
                              <CheckSquareIcon className="h-4 w-4 text-primary" />
                            ) : (
                              <SquareIcon className="h-4 w-4" />
                            )}
                          </Button>
                          <span
                            className={cn(
                              "text-sm flex-1 cursor-pointer",
                              subtask.isComplete &&
                                "line-through text-muted-foreground",
                            )}
                            onClick={() =>
                              onUpdateSubtask && handleEditSubtask(subtask)
                            }
                          >
                            {subtask.title}
                          </span>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            {onUpdateSubtask && (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleEditSubtask(subtask)}
                                className="h-7 w-7"
                              >
                                <PencilIcon className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {onDeleteSubtask && (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() =>
                                  handleDeleteSubtask(subtask._id as string)
                                }
                                className="h-7 w-7 text-destructive"
                              >
                                <TrashIcon className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  {subtasks.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">
                      No checklist items
                    </p>
                  )}

                  {hideCompletedSubtasks &&
                    subtasks.length > visibleSubtasks.length && (
                      <p className="text-xs text-muted-foreground">
                        {subtasks.length - visibleSubtasks.length} completed
                        item(s) hidden
                      </p>
                    )}
                </div>
              </div>
            )}

            {/* Tags */}
            {!isEditing && taskTags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {taskTags.map((tag, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="text-xs px-2 py-0.5 h-6"
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
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Description
                </h4>
                <p className="text-sm leading-relaxed text-foreground">
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
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  Notes
                </h4>
                <p className="text-sm leading-relaxed text-foreground">{task.notes}</p>
              </div>
            )}

            {/* Scheduling Section */}
            {!isEditing && (
              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
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
            )}

            {/* Work & Metadata Section */}
            {!isEditing && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">
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
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Context</dt>
                    <dd className="text-right">{task.context.join(", ") || "—"}</dd>
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
            )}

            {/* Timestamps Footer */}
            {!isEditing && (
              <div className="pt-2 mt-1">
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
            )}
          </div>

          {/* Footer with Delete */}
          {onDelete && (
            <SheetFooter className="shrink-0 gap-2 border-t border-border py-3 sm:flex-row sm:justify-between">
              {showDeleteConfirm ? (
                <>
                  <span className="text-sm text-muted-foreground">
                    Are you sure?
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="h-8 text-sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      className="h-8 text-sm"
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
                  className="h-8 text-sm text-destructive hover:text-destructive"
                >
                  Delete task
                </Button>
              )}
            </SheetFooter>
          )}
    </div>
  );

  const createTagDialog = (
      <Dialog
        open={isCreateTagDialogOpen}
        onOpenChange={setIsCreateTagDialogOpen}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Create new tag</DialogTitle>
            <DialogDescription>
              Enter a name for your new tag. Color will be set automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="tag-name">Tag name</Label>
              <Input
                id="tag-name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="e.g., urgent, work, personal"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newTagName.trim()) {
                    handleCreateTag();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setNewTagName("");
                setIsCreateTagDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTag}
              disabled={!newTagName.trim() || isCreatingTag}
            >
              {isCreatingTag ? "Creating..." : "Create tag"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );

  if (!open) {
    return null;
  }

  if (renderInSidebar) {
    return (
      <>
        {panelContent}
        {createTagDialog}
      </>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn("sm:max-w-md", isMobile && "h-[85vh]")}
      >
        {panelContent}
      </SheetContent>
      {createTagDialog}
    </Sheet>
  );
}
