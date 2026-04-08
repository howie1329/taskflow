"use client";

import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useViewer } from "../hooks/use-viewer";
import { useAvailableModels } from "../hooks/use-available-models";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import type { Doc } from "@/convex/_generated/dataModel";

type Tag = Doc<"tags">;

const selectTriggerClass =
  "h-8 w-full rounded-md focus-visible:ring-2 focus-visible:ring-ring";

const inputClass =
  "h-8 rounded-md focus-visible:ring-2 focus-visible:ring-ring";

export function PreferencesTab() {
  const { isLoading: isLoadingViewer, preferences } = useViewer();
  const {
    models,
    isLoading: isLoadingModels,
    isEmpty,
    lastSyncedAt,
  } = useAvailableModels();
  const tags = useQuery(api.tags.listMyTags, {}) as Tag[] | undefined;
  const { theme, setTheme } = useTheme();
  const updatePreferences = useMutation(api.preferences.updateMyPreferences);
  const createTag = useMutation(api.tags.createTag);
  const updateTag = useMutation(api.tags.updateTag);
  const deleteTag = useMutation(api.tags.deleteTag);

  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [taskDefaultView, setTaskDefaultView] = useState<
    "board" | "todayPlusBoard" | "list"
  >("board");
  const [hideCompletedTasks, setHideCompletedTasks] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingHideCompleted, setIsSavingHideCompleted] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);

  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#6366f1");
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [editTagName, setEditTagName] = useState("");
  const [editTagColor, setEditTagColor] = useState("#6366f1");
  const [isEditingTag, setIsEditingTag] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [isDeletingTag, setIsDeletingTag] = useState(false);

  // Initialize selected model from preferences
  useEffect(() => {
    const modelId = preferences?.defaultAIModel?.modelId;
    if (modelId && modelId !== selectedModelId && !isSaving) {
      setSelectedModelId(modelId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences?.defaultAIModel?.modelId, isSaving]);

  // Initialize task view from preferences
  useEffect(() => {
    const savedView = preferences?.taskDefaultView;
    if (savedView && savedView !== taskDefaultView && !isSaving) {
      setTaskDefaultView(savedView);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences?.taskDefaultView, isSaving]);

  // Initialize hide completed from preferences
  useEffect(() => {
    const savedValue = preferences?.hideCompletedTasks;
    if (
      savedValue !== undefined &&
      savedValue !== hideCompletedTasks &&
      !isSavingHideCompleted
    ) {
      setHideCompletedTasks(savedValue);
    }
  }, [preferences?.hideCompletedTasks, hideCompletedTasks, isSavingHideCompleted]);

  useEffect(() => {
    const savedValue = preferences?.notificationsEnabled;
    if (
      savedValue !== undefined &&
      savedValue !== notificationsEnabled &&
      !isSavingNotifications
    ) {
      setNotificationsEnabled(savedValue);
    }
  }, [
    preferences?.notificationsEnabled,
    notificationsEnabled,
    isSavingNotifications,
  ]);

  // Initialize edit dialog state when tag changes
  useEffect(() => {
    if (editingTag) {
      setEditTagName(editingTag.name);
      setEditTagColor(editingTag.color);
    }
  }, [editingTag]);

  const handleSave = async () => {
    if (!selectedModelId) {
      toast.error("Please select a model");
      return;
    }

    const selectedModel = models.find((m) => m.modelId === selectedModelId);
    if (!selectedModel) {
      toast.error("Selected model not found");
      return;
    }

    setIsSaving(true);
    try {
      await updatePreferences({
        defaultAIModel: {
          modelId: selectedModel.modelId,
          name: selectedModel.name,
        },
      });
      toast.success("Default AI model updated");
    } catch (error) {
      toast.error("Failed to update default model");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTaskView = async () => {
    setIsSaving(true);
    try {
      await updatePreferences({
        taskDefaultView,
      });
      toast.success("Default task view updated");
    } catch (error) {
      toast.error("Failed to update task view");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleHideCompleted = async (value: boolean) => {
    setHideCompletedTasks(value);
    setIsSavingHideCompleted(true);
    try {
      await updatePreferences({ hideCompletedTasks: value });
      toast.success("Task preference updated");
    } catch (error) {
      toast.error("Failed to update preference");
      setHideCompletedTasks(!value);
      console.error(error);
    } finally {
      setIsSavingHideCompleted(false);
    }
  };

  const handleToggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    setIsSavingNotifications(true);
    try {
      await updatePreferences({ notificationsEnabled: value });
      toast.success("Notification preference updated");
    } catch (error) {
      toast.error("Failed to update notifications");
      setNotificationsEnabled(!value);
      console.error(error);
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const handleCreateTag = async () => {
    const name = newTagName.trim();
    if (!name) {
      toast.error("Tag name is required");
      return;
    }

    const existing = tags?.find(
      (tag) => tag.name.toLowerCase() === name.toLowerCase(),
    );
    if (existing) {
      toast.success("Tag already exists");
      setNewTagName("");
      return;
    }

    setIsCreatingTag(true);
    try {
      await createTag({ name, color: newTagColor });
      toast.success("Tag created");
      setNewTagName("");
    } catch (error) {
      toast.error("Failed to create tag");
      console.error(error);
    } finally {
      setIsCreatingTag(false);
    }
  };

  const handleSaveTag = async () => {
    if (!editingTag) return;
    const name = editTagName.trim();
    if (!name) {
      toast.error("Tag name is required");
      return;
    }

    setIsEditingTag(true);
    try {
      await updateTag({
        tagId: editingTag._id,
        name,
        color: editTagColor,
      });
      toast.success("Tag updated");
      setEditingTag(null);
    } catch (error) {
      toast.error("Failed to update tag");
      console.error(error);
    } finally {
      setIsEditingTag(false);
    }
  };

  const handleDeleteTag = async () => {
    if (!tagToDelete) return;
    setIsDeletingTag(true);
    try {
      await deleteTag({ tagId: tagToDelete._id });
      toast.success("Tag deleted");
      setTagToDelete(null);
    } catch (error) {
      toast.error("Failed to delete tag");
      console.error(error);
    } finally {
      setIsDeletingTag(false);
    }
  };

  const currentDefaultModel = preferences?.defaultAIModel;
  const isModelInList = currentDefaultModel
    ? models.some((m) => m.modelId === currentDefaultModel.modelId)
    : false;
  const isLoadingTags = tags === undefined;
  const themeValue = theme ?? "system";

  const formatSyncTime = (timestamp: number | null) => {
    if (!timestamp) return "Never";
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-base font-semibold tracking-tight">
          General Preferences
        </h2>
        <p className="text-xs text-muted-foreground">
          Customize your workspace experience
        </p>
      </div>

      <div className="space-y-0">
        <section className="space-y-6 pb-6">
          <Field>
            <FieldLabel>Default AI Model</FieldLabel>
            {isLoadingViewer || isLoadingModels ? (
              <Skeleton className="h-8 w-full rounded-md" />
            ) : isEmpty ? (
              <div className="text-xs text-muted-foreground">
                <p className="italic">
                  No models available yet. Models sync automatically every 6
                  hours.
                </p>
                {lastSyncedAt && (
                  <p className="mt-1 text-[11px]">
                    Last synced: {formatSyncTime(lastSyncedAt)}
                  </p>
                )}
              </div>
            ) : (
              <>
                <Select
                  value={selectedModelId}
                  onValueChange={setSelectedModelId}
                >
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder="Select a default AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.modelId} value={model.modelId}>
                        <div className="flex flex-col">
                          <span>{model.name}</span>
                          <span className="font-mono text-xs text-muted-foreground">
                            {model.modelId}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {currentDefaultModel && (
                  <div className="text-xs">
                    <span className="text-muted-foreground">
                      Current default:{" "}
                    </span>
                    <span className="font-medium">{currentDefaultModel.name}</span>
                    <span className="ml-2 font-mono text-[11px] text-muted-foreground">
                      ({currentDefaultModel.modelId})
                    </span>
                    {!isModelInList && (
                      <span className="ml-2 align-middle text-[11px] text-muted-foreground">
                        (not in current catalog)
                      </span>
                    )}
                  </div>
                )}

                <FieldDescription>
                  Models are synced automatically every 6 hours. Last synced:{" "}
                  {formatSyncTime(lastSyncedAt)}
                </FieldDescription>
              </>
            )}
          </Field>

          {!isEmpty && (
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={
                  isSaving ||
                  !selectedModelId ||
                  (currentDefaultModel?.modelId === selectedModelId &&
                    models.some((m) => m.modelId === selectedModelId))
                }
                className="h-8 rounded-md"
              >
                {isSaving ? "Saving..." : "Save Default Model"}
              </Button>
            </div>
          )}
        </section>

        <section className="space-y-6 border-t border-border py-6">
          <h3 className="text-xs font-semibold tracking-tight">Tasks</h3>
          <Field>
            <FieldLabel>Default Task View</FieldLabel>
            {isLoadingViewer ? (
              <Skeleton className="h-8 w-full rounded-md" />
            ) : (
              <>
                <Select
                  value={taskDefaultView}
                  onValueChange={(value) =>
                    setTaskDefaultView(
                      value as "board" | "todayPlusBoard" | "list",
                    )
                  }
                >
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder="Select default task view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="board">Board (Classic Kanban)</SelectItem>
                    <SelectItem value="todayPlusBoard">
                      Today + Board (Split View)
                    </SelectItem>
                    <SelectItem value="list">List (by status)</SelectItem>
                  </SelectContent>
                </Select>

                <div className="mt-2 text-xs">
                  <span className="text-muted-foreground">Current default: </span>
                  <span className="font-medium">
                    {preferences?.taskDefaultView === "todayPlusBoard"
                      ? "Today + Board"
                      : preferences?.taskDefaultView === "list"
                        ? "List"
                        : "Board"}
                  </span>
                </div>

                <FieldDescription>
                  This determines which view is shown when you open the Tasks
                  page
                </FieldDescription>

                <div className="mt-3 flex justify-end">
                  <Button
                    onClick={handleSaveTaskView}
                    disabled={
                      isSaving || preferences?.taskDefaultView === taskDefaultView
                    }
                    className="h-8 rounded-md"
                  >
                    {isSaving ? "Saving..." : "Save Default View"}
                  </Button>
                </div>
              </>
            )}
          </Field>

          <Field>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <FieldLabel>Hide completed tasks</FieldLabel>
                <FieldDescription>
                  Completed tasks won’t appear in lists by default
                </FieldDescription>
              </div>
              {isLoadingViewer ? (
                <Skeleton className="h-6 w-10" />
              ) : (
                <Switch
                  checked={hideCompletedTasks}
                  onCheckedChange={handleToggleHideCompleted}
                  disabled={isSavingHideCompleted}
                  aria-label="Hide completed tasks"
                />
              )}
            </div>
          </Field>
        </section>

        <section className="space-y-6 border-t border-border py-6">
          <h3 className="text-xs font-semibold tracking-tight">
            Notifications
          </h3>
          <Field>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <FieldLabel>In-app notifications</FieldLabel>
                <FieldDescription>
                  Toggle updates like successful saves or reminders
                </FieldDescription>
              </div>
              {isLoadingViewer ? (
                <Skeleton className="h-6 w-10" />
              ) : (
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={handleToggleNotifications}
                  disabled={isSavingNotifications}
                  aria-label="Enable in-app notifications"
                />
              )}
            </div>
          </Field>
        </section>

        <section className="space-y-6 border-t border-border py-6">
          <h3 className="text-xs font-semibold tracking-tight">Tags</h3>
          <Field>
            <FieldLabel>New tag</FieldLabel>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                className={inputClass}
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Tag name"
                disabled={isCreatingTag}
              />
              <div className="flex items-center gap-2">
                <Input
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className="h-8 w-14 shrink-0 p-1"
                  aria-label="Tag color"
                  disabled={isCreatingTag}
                />
                <Button
                  onClick={handleCreateTag}
                  disabled={isCreatingTag || !newTagName.trim()}
                  className="h-8 rounded-md"
                >
                  {isCreatingTag ? "Creating..." : "Create"}
                </Button>
              </div>
            </div>
            <FieldDescription>
              Tags help organize tasks and power quick filtering
            </FieldDescription>
          </Field>

          <div className="space-y-2">
            {isLoadingTags ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-9 w-full rounded-md" />
                ))}
              </div>
            ) : tags.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No tags yet. Create your first tag above.
              </p>
            ) : (
              tags.map((tag) => (
                <div
                  key={tag._id}
                  className="flex min-h-8 items-center justify-between gap-3 rounded-md px-3 py-2 transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none hover:bg-accent/50"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="inline-block size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="truncate text-xs font-medium">
                      {tag.name}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-md"
                      onClick={() => setEditingTag(tag)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-8 rounded-md"
                      onClick={() => setTagToDelete(tag)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="space-y-6 border-t border-border pt-6">
          <h3 className="text-xs font-semibold tracking-tight">Appearance</h3>
          <Field>
            <FieldLabel>Theme</FieldLabel>
            {!theme ? (
              <Skeleton className="h-8 w-full rounded-md" />
            ) : (
              <Select
                value={themeValue}
                onValueChange={(value) =>
                  setTheme(value as "system" | "light" | "dark")
                }
              >
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            )}
            <FieldDescription>
              Applies to the entire workspace interface
            </FieldDescription>
          </Field>
        </section>
      </div>

      <Dialog
        open={!!editingTag}
        onOpenChange={(open) => {
          if (!open) setEditingTag(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Edit tag</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update the name or color.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Field>
              <FieldLabel>Name</FieldLabel>
              <Input
                className={inputClass}
                value={editTagName}
                onChange={(e) => setEditTagName(e.target.value)}
                disabled={isEditingTag}
              />
            </Field>
            <Field>
              <FieldLabel>Color</FieldLabel>
              <Input
                type="color"
                value={editTagColor}
                onChange={(e) => setEditTagColor(e.target.value)}
                className="h-8 w-16 p-1"
                disabled={isEditingTag}
              />
            </Field>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="h-8 rounded-md"
              onClick={() => setEditingTag(null)}
              disabled={isEditingTag}
            >
              Cancel
            </Button>
            <Button
              className="h-8 rounded-md"
              onClick={handleSaveTag}
              disabled={isEditingTag}
            >
              {isEditingTag ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!tagToDelete}
        onOpenChange={(open) => {
          if (!open) setTagToDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold">
              Delete tag?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground">
              This removes the tag from all tasks. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="h-8 rounded-md"
              disabled={isDeletingTag}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="h-8 rounded-md"
              onClick={handleDeleteTag}
              disabled={isDeletingTag}
            >
              {isDeletingTag ? "Deleting..." : "Delete tag"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
