"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Task, mockProjects, mockTags } from "./mock-data";

interface CreateTaskSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaults: {
    status?: Task["status"];
    scheduledDate?: string | null;
  };
  onCreate: (draft: TaskDraft) => void;
}

// Task draft type - matches Task structure without generated fields
type TaskDraft = Omit<Task, "_id" | "userId" | "createdAt" | "updatedAt"> & {
  // Allow additional fields that might exist in Task type but not in mock data
  aiSummary?: string | null;
  aiContext?: unknown;
  embedding?: number[] | null;
};

const statusOptions: Task["status"][] = [
  "Not Started",
  "To Do",
  "In Progress",
  "Completed",
];

const priorityOptions: Task["priority"][] = ["low", "medium", "high"];

const projectOptions = Object.entries(mockProjects).map(([id, project]) => ({
  id,
  ...project,
}));

export function CreateTaskSheet({
  open,
  onOpenChange,
  defaults,
  onCreate,
}: CreateTaskSheetProps) {
  const isMobile = useIsMobile();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState<string>("");
  const [status, setStatus] = useState<Task["status"]>(
    defaults.status ?? "Not Started",
  );
  const [priority, setPriority] = useState<Task["priority"]>("low");
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
      setProjectId("");
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

  // Focus title on open
  useEffect(() => {
    if (open) {
      // Small delay to ensure sheet is rendered
      const timeout = setTimeout(() => {
        const titleInput = document.querySelector(
          '[data-slot="create-task-title"]',
        ) as HTMLInputElement;
        titleInput?.focus();
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  // Keyboard handlers
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Ctrl/Cmd + Enter to submit
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && canSubmit) {
        e.preventDefault();
        handleSubmit();
      }
      // Enter in title input to submit
      if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        if (
          target.tagName === "INPUT" &&
          target.getAttribute("data-slot") === "create-task-title"
        ) {
          e.preventDefault();
          if (canSubmit) {
            handleSubmit();
          } else {
            setTouched(true);
          }
        }
      }
    },
    [canSubmit],
  );

  const handleSubmit = () => {
    if (!isTitleValid) {
      setTouched(true);
      return;
    }

    const now = Date.now();
    const draft = {
      title: title.trim(),
      description: (description.trim() || null) as Task["description"],
      status,
      priority,
      dueDate: (dueDate
        ? new Date(dueDate).getTime()
        : null) as Task["dueDate"],
      scheduledDate: (scheduledDate || null) as Task["scheduledDate"],
      completionDate: null as Task["completionDate"],
      projectId: (projectId || null) as Task["projectId"],
      tagIds: tagIds as Task["tagIds"],
      parentTaskId: null as Task["parentTaskId"],
      estimatedDuration: null as unknown as Task["estimatedDuration"],
      actualDuration: null as Task["actualDuration"],
      energyLevel: "medium" as Task["energyLevel"],
      context: [] as Task["context"],
      source: "created" as Task["source"],
      orderIndex: 0,
      lastActiveAt: now,
      streakCount: 0,
      difficulty: "medium" as Task["difficulty"],
      isTemplate: false,
    } satisfies Omit<Task, "_id" | "userId" | "createdAt" | "updatedAt">;

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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn("sm:max-w-sm", isMobile && "h-[85vh]")}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="pt-10 pb-3 shrink-0">
            <SheetTitle className="text-sm font-medium">New task</SheetTitle>
            <p className="text-xs text-muted-foreground">
              Enter to create · Esc to close
            </p>
          </SheetHeader>

          <Separator />

          {/* Body */}
          <div
            className="flex-1 overflow-y-auto py-4 space-y-4"
            onKeyDown={handleKeyDown}
          >
            {/* Title - Required */}
            <Field>
              <FieldLabel className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Title
              </FieldLabel>
              <FieldContent>
                <Input
                  data-slot="create-task-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className="h-9 text-sm font-medium"
                  aria-invalid={touched && !isTitleValid}
                />
                {touched && !isTitleValid && (
                  <FieldError>Title is required</FieldError>
                )}
              </FieldContent>
            </Field>

            {/* Description */}
            <Field>
              <FieldLabel className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Description
              </FieldLabel>
              <FieldContent>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details (optional)"
                  className="min-h-20 text-xs"
                />
              </FieldContent>
            </Field>

            {/* Core metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Project */}
              <Field>
                <FieldLabel className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Project
                </FieldLabel>
                <FieldContent>
                  <Select
                    value={projectId ?? ""}
                    onValueChange={(value) => setProjectId(value)}
                  >
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue placeholder="No project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="" className="text-xs">
                        No project
                      </SelectItem>
                      {projectOptions.map((project) => (
                        <SelectItem
                          key={project.id}
                          value={project.id}
                          className="text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: project.color }}
                            />
                            {project.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>

              {/* Status */}
              <Field>
                <FieldLabel className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </FieldLabel>
                <FieldContent>
                  <Select
                    value={status}
                    onValueChange={(v) => setStatus(v as Task["status"])}
                  >
                    <SelectTrigger className="w-full h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((s) => (
                        <SelectItem key={s} value={s} className="text-xs">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>

              {/* Priority */}
              <Field>
                <FieldLabel className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Priority
                </FieldLabel>
                <FieldContent>
                  <Select
                    value={priority}
                    onValueChange={(v) => setPriority(v as Task["priority"])}
                  >
                    <SelectTrigger className="w-full h-8 text-xs">
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
                        <SelectItem key={p} value={p} className="text-xs">
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

            <Separator />

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Scheduled Date */}
              <Field>
                <FieldLabel className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Scheduled
                </FieldLabel>
                <FieldContent>
                  <Input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="h-8 text-xs"
                  />
                </FieldContent>
              </Field>

              {/* Due Date */}
              <Field>
                <FieldLabel className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Due Date
                </FieldLabel>
                <FieldContent>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-8 text-xs"
                  />
                </FieldContent>
              </Field>
            </div>

            <Separator />

            {/* Tags */}
            <Field>
              <FieldLabel className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Tags
              </FieldLabel>
              <FieldContent>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(mockTags).map(([id, tag]) => {
                    const isSelected = tagIds.includes(id);
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => toggleTag(id)}
                        className={cn(
                          "px-2 py-1 text-[10px] rounded-none border transition-colors",
                          isSelected
                            ? "bg-secondary text-secondary-foreground border-secondary"
                            : "bg-transparent text-muted-foreground border-border hover:border-foreground",
                        )}
                      >
                        <span
                          className="inline-block w-1.5 h-1.5 rounded-full mr-1"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </FieldContent>
            </Field>
          </div>

          <Separator />

          {/* Footer */}
          <SheetFooter className="border-t gap-2 sm:flex-row sm:justify-end shrink-0 py-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="h-9 text-xs sm:h-8"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="h-9 text-xs sm:h-8"
            >
              Create
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
