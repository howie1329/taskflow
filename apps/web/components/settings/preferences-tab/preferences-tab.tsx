"use client";

import { Card } from "@/components/ui/card";
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
import { useViewer } from "../hooks/use-viewer";
import { useAvailableModels } from "../hooks/use-available-models";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export function PreferencesTab() {
  const { isLoading: isLoadingViewer, preferences } = useViewer();
  const {
    models,
    isLoading: isLoadingModels,
    isEmpty,
    lastSyncedAt,
  } = useAvailableModels();
  const updatePreferences = useMutation(api.preferences.updateMyPreferences);

  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [taskDefaultView, setTaskDefaultView] = useState<
    "board" | "todayPlusBoard"
  >("board");
  const [isSaving, setIsSaving] = useState(false);

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
      console.log("selectedModel", selectedModel);
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

  const currentDefaultModel = preferences?.defaultAIModel;
  const isModelInList = currentDefaultModel
    ? models.some((m) => m.modelId === currentDefaultModel.modelId)
    : false;

  const formatSyncTime = (timestamp: number | null) => {
    if (!timestamp) return "Never";
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-base font-medium">General Preferences</h2>
          <p className="text-sm text-muted-foreground">
            Customize your workspace experience
          </p>

          <div className="space-y-6">
            {/* Default AI Model Selection */}
            <Field>
              <FieldLabel>Default AI Model</FieldLabel>
              {isLoadingViewer || isLoadingModels ? (
                <Skeleton className="h-10 w-full" />
              ) : isEmpty ? (
                <div className="text-sm text-muted-foreground">
                  <p className="italic">
                    No models available yet. Models sync automatically every 6
                    hours.
                  </p>
                  {lastSyncedAt && (
                    <p className="text-xs mt-1">
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
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a default AI model" />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((model) => (
                        <SelectItem key={model.modelId} value={model.modelId}>
                          <div className="flex flex-col">
                            <span>{model.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {model.modelId}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Show current default model info */}
                  {currentDefaultModel && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">
                        Current default:{" "}
                      </span>
                      <span className="font-medium">
                        {currentDefaultModel.name}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({currentDefaultModel.modelId})
                      </span>
                      {!isModelInList && (
                        <span className="text-xs text-amber-600 ml-2">
                          (not in current available models)
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

            {/* Save Button */}
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
                >
                  {isSaving ? "Saving..." : "Save Default Model"}
                </Button>
              </div>
            )}

            {/* Tasks Section */}
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-3">Tasks</h3>
              <Field>
                <FieldLabel>Default Task View</FieldLabel>
                {isLoadingViewer ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <>
                    <Select
                      value={taskDefaultView}
                      onValueChange={(value) =>
                        setTaskDefaultView(value as "board" | "todayPlusBoard")
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select default task view" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="board">
                          Board (Classic Kanban)
                        </SelectItem>
                        <SelectItem value="todayPlusBoard">
                          Today + Board (Split View)
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Show current default view */}
                    <div className="text-sm mt-2">
                      <span className="text-muted-foreground">
                        Current default:{" "}
                      </span>
                      <span className="font-medium">
                        {preferences?.taskDefaultView === "todayPlusBoard"
                          ? "Today + Board"
                          : "Board"}
                      </span>
                    </div>

                    <FieldDescription>
                      This determines which view is shown when you open the
                      Tasks page
                    </FieldDescription>

                    {/* Save Button */}
                    <div className="flex justify-end mt-3">
                      <Button
                        onClick={handleSaveTaskView}
                        disabled={
                          isSaving ||
                          preferences?.taskDefaultView === taskDefaultView
                        }
                      >
                        {isSaving ? "Saving..." : "Save Default View"}
                      </Button>
                    </div>
                  </>
                )}
              </Field>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
