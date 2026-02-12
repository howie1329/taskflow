"use client";

import { useState, useEffect, useId } from "react";
import type { Doc } from "@/convex/_generated/dataModel";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@/components/ui/field";
import { Kbd } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type Task = Doc<"tasks">;
type Project = Doc<"projects">;
type Tag = Doc<"tags">;

interface CreateTaskSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaults: {
    status?: Task["status"];
    scheduledDate?: string | null;
    projectId?: string | null;
  };
  onCreate: (draft: TaskDraft) => void;
  projects?: Project[];
  tags?: Tag[];
}

// Draft for creating a task (all fields user can set, excluding server-managed ones)
// Only title is required - everything else is optional with defaults
type TaskDraft = {
  title: string;
  description?: string;
  notes?: string;
  status?: Task["status"];
  priority?: Task["priority"];
  dueDate?: number | null;
  scheduledDate?: string | null;
  completionDate?: number | null;
  projectId?: string | null;
  tagIds?: string[];
  parentTaskId?: string | null;
  estimatedDuration?: number | null;
  actualDuration?: number | null;
  energyLevel?: Task["energyLevel"];
  context?: string[];
  source?: Task["source"];
  orderIndex?: number;
  lastActiveAt?: number;
  streakCount?: number;
  difficulty?: Task["difficulty"];
  isTemplate?: boolean;
  aiContext?: unknown;
  aiSummary?: string | null;
  embedding?: number[] | null;
};

const statusOptions: Task["status"][] = [
  "Not Started",
  "To Do",
  "In Progress",
  "Completed",
];

const priorityOptions: Task["priority"][] = ["low", "medium", "high"];

export function CreateTaskSheet({
  open,
  onOpenChange,
  defaults,
  onCreate,
  projects = [],
  tags = [],
}: CreateTaskSheetProps) {
  const isMobile = useIsMobile();
  const baseId = useId();

  // Generate unique IDs for accessibility
  const ids = {
    title: `${baseId}-title`,
    description: `${baseId}-description`,
    project: `${baseId}-project`,
    status: `${baseId}-status`,
    priority: `${baseId}-priority`,
    scheduled: `${baseId}-scheduled`,
    due: `${baseId}-due`,
    titleError: `${baseId}-title-error`,
  };

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState<string>("__none__");
  const initialStatus = (defaults.status ?? "Not Started") as Task["status"];
  const [status, setStatus] = useState(initialStatus);
  const [priority, setPriority] = useState("low" as Task["priority"]);
  const [scheduledDate, setScheduledDate] = useState<string>(
    defaults.scheduledDate ?? "",
  );
  const [dueDate, setDueDate] = useState<string>("");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [touched, setTouched] = useState(false);

  // Reset form when opening with new defaults
  useEffect(() => {
    if (open) {
      setTitle("");
      setDescription("");
      setProjectId(defaults.projectId ?? "__none__");
      setStatus(defaults.status ?? "Not Started");
      setPriority("low");
      setScheduledDate(defaults.scheduledDate ?? "");
      setDueDate("");
      setTagIds([]);
      setTouched(false);
    }
  }, [open, defaults]);

  // Validation
  const isTitleValid = title.trim().length > 0;
  const canSubmit = isTitleValid;
  const showTitleError = touched && !isTitleValid;

  // Focus title on open
  useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => {
        const titleInput = document.getElementById(
          ids.title,
        ) as HTMLInputElement;
        titleInput?.focus();
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [open, ids.title]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isTitleValid) {
      setTouched(true);
      return;
    }

    const now = Date.now();
    const draft: TaskDraft = {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate).getTime() : null,
      scheduledDate: scheduledDate || null,
      completionDate: null,
      projectId: projectId === "__none__" ? null : projectId,
      tagIds,
      parentTaskId: null,
      estimatedDuration: null,
      actualDuration: null,
      energyLevel: "medium",
      context: [],
      source: "created",
      orderIndex: 0,
      lastActiveAt: now,
      streakCount: 0,
      difficulty: "medium",
      isTemplate: false,
    };

    onCreate(draft);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const toggleTag = (tagId: string) => {
    setTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  // Handle Cmd/Ctrl+Enter in textarea
  const handleDescriptionKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && canSubmit) {
      e.preventDefault();
      const form = e.currentTarget.closest("form");
      form?.requestSubmit();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn("sm:max-w-md", isMobile && "h-[85vh]")}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="pt-7 pb-3 shrink-0">
            <SheetTitle className="text-sm text-muted-foreground font-medium">
              New task
            </SheetTitle>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Kbd>Enter</Kbd>
              <span>to create</span>
              <span className="mx-1">·</span>
              <Kbd>Esc</Kbd>
              <span>to close</span>
            </div>
          </SheetHeader>

          {/* Body */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto px-5 py-5 space-y-6"
          >
            {/* Title - Required */}
            <Field>
              <FieldLabel htmlFor={ids.title} className="sr-only">
                Title
              </FieldLabel>
              <FieldContent>
                <Input
                  id={ids.title}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="h-11 rounded-xl px-4 text-base font-medium"
                  aria-invalid={showTitleError}
                  aria-describedby={showTitleError ? ids.titleError : undefined}
                />
                {showTitleError && (
                  <FieldError id={ids.titleError}>Title is required</FieldError>
                )}
              </FieldContent>
            </Field>

            {/* Description */}
            <Field>
              <FieldLabel htmlFor={ids.description} className="sr-only">
                Description
              </FieldLabel>
              <FieldContent>
                <Textarea
                  id={ids.description}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onKeyDown={handleDescriptionKeyDown}
                  placeholder="Add details (optional)"
                  className="min-h-32 rounded-xl px-4 py-3 text-sm leading-relaxed"
                />
              </FieldContent>
            </Field>

            <Separator />

            <div className="space-y-4 rounded-xl border border-border/60 p-4">
              <h3 className="text-sm font-medium text-muted-foreground">Options</h3>

              {/* Core metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Project */}
                <Field>
                  <FieldLabel
                    htmlFor={ids.project}
                    className="text-sm font-medium"
                  >
                    Project
                  </FieldLabel>
                  <FieldContent>
                    <Select
                      value={projectId}
                      onValueChange={(value) => setProjectId(value)}
                    >
                      <SelectTrigger
                        id={ids.project}
                        className="w-full h-9 text-sm"
                      >
                        <SelectValue placeholder="No project" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__" className="text-sm">
                          No project
                        </SelectItem>
                        {projects.map((project) => (
                          <SelectItem
                            key={project._id as string}
                            value={project._id as string}
                            className="text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: project.color }}
                              />
                              <span className="mr-1">{project.icon}</span>
                              {project.title}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>

                {/* Status */}
                <Field>
                  <FieldLabel
                    htmlFor={ids.status}
                    className="text-sm font-medium"
                  >
                    Status
                  </FieldLabel>
                  <FieldContent>
                    <Select
                      value={status}
                      onValueChange={(v) => setStatus(v as Task["status"])}
                    >
                      <SelectTrigger
                        id={ids.status}
                        className="w-full h-9 text-sm"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((s) => (
                          <SelectItem key={s} value={s} className="text-sm">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>

                {/* Priority */}
                <Field>
                  <FieldLabel
                    htmlFor={ids.priority}
                    className="text-sm font-medium"
                  >
                    Priority
                  </FieldLabel>
                  <FieldContent>
                    <Select
                      value={priority}
                      onValueChange={(v) => setPriority(v as Task["priority"])}
                    >
                      <SelectTrigger
                        id={ids.priority}
                        className="w-full h-9 text-sm"
                      >
                        <SelectValue>
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                priority === "high" && "bg-red-500",
                                priority === "medium" && "bg-amber-500",
                                priority === "low" && "bg-blue-500",
                              )}
                            />
                            <span className="capitalize">{priority}</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {priorityOptions.map((p) => (
                          <SelectItem key={p} value={p} className="text-sm">
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  p === "high" && "bg-red-500",
                                  p === "medium" && "bg-amber-500",
                                  p === "low" && "bg-blue-500",
                                )}
                              />
                              <span className="capitalize">{p}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FieldContent>
                </Field>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Scheduled Date */}
                <Field>
                  <FieldLabel
                    htmlFor={ids.scheduled}
                    className="text-sm font-medium"
                  >
                    Scheduled
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id={ids.scheduled}
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </FieldContent>
                </Field>

                {/* Due Date */}
                <Field>
                  <FieldLabel htmlFor={ids.due} className="text-sm font-medium">
                    Due Date
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      id={ids.due}
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </FieldContent>
                </Field>
              </div>

              {/* Tags */}
              <Field>
                <FieldLabel className="text-sm font-medium">Tags</FieldLabel>
                <FieldContent>
                  {tags.length === 0 ? (
                    <span className="text-sm text-muted-foreground">
                      No tags available. Create tags in Settings.
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => {
                        const isSelected = tagIds.includes(tag._id as string);
                        return (
                          <Button
                            key={tag._id as string}
                            type="button"
                            variant={isSelected ? "secondary" : "outline"}
                            size="xs"
                            onClick={() => toggleTag(tag._id as string)}
                            aria-pressed={isSelected}
                            className="h-8 px-3 text-sm rounded-lg"
                          >
                            <span
                              className="inline-block w-1.5 h-1.5 rounded-full mr-1.5"
                              style={{ backgroundColor: tag.color }}
                            />
                            {tag.name}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </FieldContent>
              </Field>
            </div>

            {/* Footer */}
            <SheetFooter className="gap-2 sm:flex-row sm:justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="h-9 text-sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!canSubmit}
                className="h-9 text-sm"
              >
                Create
              </Button>
            </SheetFooter>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
