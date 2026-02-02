"use client";

import { useState, useId, useCallback, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Field,
  FieldLabel,
  FieldContent,
  FieldError,
} from "@/components/ui/field";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export interface ProjectDraft {
  title: string;
  description?: string;
  icon: string;
  color: string;
}

interface ProjectSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: {
    _id: string;
    title: string;
    description?: string;
    icon: string;
    color: string;
  } | null;
  onSubmit: (draft: ProjectDraft) => void;
  isSubmitting?: boolean;
}

const DEFAULT_ICON = "📁";
const DEFAULT_COLOR = "#3b82f6";

// Preset colors for quick selection
const PRESET_COLORS = [
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#84cc16", // Lime
  "#22c55e", // Green
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#a855f7", // Purple
  "#ec4899", // Pink
  "#f43f5e", // Rose
  "#6b7280", // Gray
];

// Form state hook
function useProjectForm(project?: ProjectSheetProps["project"]) {
  const initial = useMemo(
    () => ({
      title: project?.title ?? "",
      description: project?.description ?? "",
      icon: project?.icon ?? DEFAULT_ICON,
      color: project?.color ?? DEFAULT_COLOR,
      touched: false,
    }),
    [project?._id], // Only re-initialize when project ID changes
  );

  const [formState, setFormState] = useState(initial);

  // Sync with initial when project changes
  const reset = useCallback(() => {
    setFormState({
      title: project?.title ?? "",
      description: project?.description ?? "",
      icon: project?.icon ?? DEFAULT_ICON,
      color: project?.color ?? DEFAULT_COLOR,
      touched: false,
    });
  }, [project]);

  const setTitle = useCallback(
    (value: string) => setFormState((s) => ({ ...s, title: value })),
    [],
  );
  const setDescription = useCallback(
    (value: string) => setFormState((s) => ({ ...s, description: value })),
    [],
  );
  const setIcon = useCallback(
    (value: string) => setFormState((s) => ({ ...s, icon: value })),
    [],
  );
  const setColor = useCallback(
    (value: string) => setFormState((s) => ({ ...s, color: value })),
    [],
  );
  const setTouched = useCallback(
    (value: boolean) => setFormState((s) => ({ ...s, touched: value })),
    [],
  );

  return {
    ...formState,
    setTitle,
    setDescription,
    setIcon,
    setColor,
    setTouched,
    reset,
  };
}

export function ProjectSheet({
  open,
  onOpenChange,
  project,
  onSubmit,
  isSubmitting = false,
}: ProjectSheetProps) {
  const isMobile = useIsMobile();
  const baseId = useId();
  const isEditing = !!project;

  // Generate a key based on project ID and open state to force reset
  const formKey = `${project?._id ?? "new"}-${open}`;
  const form = useProjectForm(project);

  // Generate unique IDs for accessibility
  const ids = useMemo(
    () => ({
      title: `${baseId}-title`,
      description: `${baseId}-description`,
      icon: `${baseId}-icon`,
      color: `${baseId}-color`,
      titleError: `${baseId}-title-error`,
    }),
    [baseId],
  );

  // Validation
  const isTitleValid = form.title.trim().length > 0;
  const canSubmit = isTitleValid && !isSubmitting;
  const showTitleError = form.touched && !isTitleValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isTitleValid) {
      form.setTouched(true);
      return;
    }

    const draft: ProjectDraft = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      icon: form.icon.trim() || DEFAULT_ICON,
      color: form.color || DEFAULT_COLOR,
    };

    onSubmit(draft);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setColor(e.target.value);
  };

  // Reset form when key changes (on open or project change)
  const handleOpenAutoFocus = useCallback(() => {
    form.reset();
    const titleInput = document.getElementById(ids.title) as HTMLInputElement;
    titleInput?.focus();
  }, [form, ids.title]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn("sm:max-w-sm", isMobile && "h-[85vh]")}
        onOpenAutoFocus={handleOpenAutoFocus}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="pt-6 pb-2 shrink-0">
            <SheetTitle className="text-sm font-medium">
              {isEditing ? "Edit project" : "New project"}
            </SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              {isEditing
                ? "Update your project details"
                : "Create a new project to organize related tasks"}
            </SheetDescription>
          </SheetHeader>

          {/* Body */}
          <form
            key={formKey}
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto py-4 px-4 space-y-5"
          >
            {/* Title - Required */}
            <Field>
              <FieldLabel htmlFor={ids.title} className="text-xs font-medium">
                Title
                <span className="text-destructive ml-0.5">*</span>
              </FieldLabel>
              <FieldContent>
                <Input
                  id={ids.title}
                  value={form.title}
                  onChange={(e) => form.setTitle(e.target.value)}
                  placeholder="Project name"
                  className="h-9 text-sm font-medium"
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
              <FieldLabel
                htmlFor={ids.description}
                className="text-xs font-medium"
              >
                Description
              </FieldLabel>
              <FieldContent>
                <Textarea
                  id={ids.description}
                  value={form.description}
                  onChange={(e) => form.setDescription(e.target.value)}
                  placeholder="What is this project about? (optional)"
                  className="min-h-20 text-xs resize-none"
                />
              </FieldContent>
            </Field>

            {/* Icon */}
            <Field>
              <FieldLabel htmlFor={ids.icon} className="text-xs font-medium">
                Icon
              </FieldLabel>
              <FieldContent>
                <div className="flex items-center gap-3">
                  <Input
                    id={ids.icon}
                    value={form.icon}
                    onChange={(e) => form.setIcon(e.target.value)}
                    placeholder={DEFAULT_ICON}
                    className="h-9 text-sm w-20 text-center"
                    maxLength={2}
                  />
                  <span className="text-2xl">{form.icon || DEFAULT_ICON}</span>
                  <span className="text-xs text-muted-foreground">
                    Use an emoji
                  </span>
                </div>
              </FieldContent>
            </Field>

            {/* Color */}
            <Field>
              <FieldLabel className="text-xs font-medium">Color</FieldLabel>
              <FieldContent className="space-y-3">
                {/* Preset colors */}
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((presetColor) => (
                    <button
                      key={presetColor}
                      type="button"
                      onClick={() => form.setColor(presetColor)}
                      className={cn(
                        "w-6 h-6 rounded-full transition-all",
                        form.color === presetColor
                          ? "ring-2 ring-offset-2 ring-foreground scale-110"
                          : "hover:scale-105",
                      )}
                      style={{ backgroundColor: presetColor }}
                      aria-label={`Select color ${presetColor}`}
                      aria-pressed={form.color === presetColor}
                    />
                  ))}
                </div>

                {/* Custom color picker */}
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.color}
                    onChange={handleColorChange}
                    className="w-8 h-8 p-0 border-0 rounded-none cursor-pointer"
                    aria-label="Custom color"
                  />
                  <Input
                    value={form.color}
                    onChange={(e) => form.setColor(e.target.value)}
                    placeholder="#3b82f6"
                    className="h-8 text-xs w-24 font-mono"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                  <div
                    className="w-6 h-6 rounded-full border"
                    style={{ backgroundColor: form.color }}
                  />
                </div>
              </FieldContent>
            </Field>

            {/* Footer */}
            <SheetFooter className="gap-2 sm:flex-row sm:justify-end pt-2 border-t mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="h-9 text-xs sm:h-8"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!canSubmit}
                className="h-9 text-xs sm:h-8"
              >
                {isSubmitting
                  ? isEditing
                    ? "Saving..."
                    : "Creating..."
                  : isEditing
                    ? "Save"
                    : "Create"}
              </Button>
            </SheetFooter>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
