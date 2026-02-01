"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BoardView } from "@/components/tasks/board-view";
import { TodayBoardView } from "@/components/tasks/today-board-view";
import { TaskDetailsSheet } from "@/components/tasks/task-details-sheet";
import { CreateTaskSheet } from "@/components/tasks/create-task-sheet";
import { useViewer } from "@/components/settings/hooks/use-viewer";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";

type Task = Doc<"tasks">;
type Project = Doc<"projects">;
type Tag = Doc<"tags">;
type Subtask = Doc<"subtasks">;

export default function TasksPage() {
  const { viewer, isLoading: isViewerLoading } = useViewer();
  const updatePreferences = useMutation(api.preferences.updateMyPreferences);
  const createTask = useMutation(api.tasks.createTask);
  const updateTask = useMutation(api.tasks.updateTask);
  const toggleComplete = useMutation(api.tasks.toggleComplete);
  const deleteTask = useMutation(api.tasks.deleteTask);

  // Subtask mutations
  const createSubtask = useMutation(api.subtasks.createSubtask);
  const updateSubtask = useMutation(api.subtasks.updateSubtask);
  const toggleSubtask = useMutation(api.subtasks.toggleSubtask);
  const deleteSubtask = useMutation(api.subtasks.deleteSubtask);

  // Fetch real tasks from Convex
  const tasks = useQuery(api.tasks.listMyTasks, {});
  const isTasksLoading = tasks === undefined;

  // Fetch projects and tags
  const projects = useQuery(api.projects.listMyProjects, {});
  const tags = useQuery(api.tags.listMyTags, {});
  const isProjectsLoading = projects === undefined;
  const isTagsLoading = tags === undefined;

  // View state - sync with preferences when they load
  const [currentView, setCurrentView] = useState<"board" | "todayPlusBoard">(
    "board",
  );

  // Hide completed tasks state
  const [hideCompleted, setHideCompleted] = useState(false);

  // Sync view with preferences when they load (not just initial state)
  useEffect(() => {
    if (viewer?.preferences?.taskDefaultView) {
      setCurrentView(viewer.preferences.taskDefaultView);
    }
  }, [viewer?.preferences?.taskDefaultView]);

  // Sync hide completed preference when viewer loads
  useEffect(() => {
    if (viewer?.preferences?.hideCompletedTasks !== undefined) {
      setHideCompleted(viewer.preferences.hideCompletedTasks);
    }
  }, [viewer?.preferences?.hideCompletedTasks]);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Create task sheet state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDefaults, setCreateDefaults] = useState<{
    status?: Task["status"];
    scheduledDate?: string | null;
  }>({});

  const handleViewChange = async (newView: "board" | "todayPlusBoard") => {
    setCurrentView(newView);

    // Persist the view change to Convex
    if (viewer?.userId) {
      try {
        await updatePreferences({ taskDefaultView: newView });
      } catch (error) {
        console.error("Failed to save view preference:", error);
      }
    }
  };

  const handleToggleHideCompleted = async () => {
    const newValue = !hideCompleted;
    setHideCompleted(newValue);

    // Persist the change to Convex
    if (viewer?.userId) {
      try {
        await updatePreferences({ hideCompletedTasks: newValue });
      } catch (error) {
        console.error("Failed to save hide completed preference:", error);
        // Revert on error
        setHideCompleted(!newValue);
      }
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDetailsOpen(true);
  };

  const handleOpenCreate = (defaults: {
    status?: Task["status"];
    scheduledDate?: string | null;
  }) => {
    setCreateDefaults(defaults);
    setIsCreateOpen(true);
  };

  const handleCreateTask = async (draft: {
    title: string;
    description?: string;
    notes?: string;
    status?: Task["status"];
    priority?: Task["priority"];
    dueDate?: number | null;
    scheduledDate?: string | null;
    projectId?: string | null;
    tagIds?: string[];
    estimatedDuration?: number | null;
    energyLevel?: Task["energyLevel"];
    difficulty?: Task["difficulty"];
  }) => {
    try {
      // Normalize null values to undefined for optional fields
      // Cast IDs from strings to proper Convex ID types
      const newTask = await createTask({
        title: draft.title,
        description: draft.description,
        notes: draft.notes,
        status: draft.status,
        priority: draft.priority,
        dueDate: draft.dueDate ?? undefined,
        scheduledDate: draft.scheduledDate ?? undefined,
        projectId: draft.projectId
          ? (draft.projectId as unknown as Doc<"tasks">["projectId"])
          : undefined,
        tagIds:
          draft.tagIds && draft.tagIds.length > 0
            ? (draft.tagIds as unknown as Doc<"tasks">["tagIds"])
            : undefined,
        estimatedDuration: draft.estimatedDuration ?? undefined,
        energyLevel: draft.energyLevel,
        difficulty: draft.difficulty,
      });

      // Close create sheet and open details sheet for the new task
      setIsCreateOpen(false);
      if (newTask) {
        setSelectedTask(newTask);
        setIsDetailsOpen(true);
      }
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask({ taskId: taskId as unknown as Doc<"tasks">["_id"] });
      setIsDetailsOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const updatedTask = await updateTask({
        taskId: taskId as unknown as Doc<"tasks">["_id"],
        title: updates.title,
        description: updates.description,
        notes: updates.notes,
        status: updates.status,
        priority: updates.priority,
        dueDate: updates.dueDate ?? undefined,
        scheduledDate: updates.scheduledDate ?? undefined,
        projectId: updates.projectId
          ? (updates.projectId as unknown as Doc<"tasks">["projectId"])
          : undefined,
        tagIds:
          updates.tagIds && updates.tagIds.length > 0
            ? (updates.tagIds as unknown as Doc<"tasks">["tagIds"])
            : undefined,
        estimatedDuration: updates.estimatedDuration ?? undefined,
        energyLevel: updates.energyLevel,
        difficulty: updates.difficulty,
      });
      if (updatedTask) {
        setSelectedTask(updatedTask);
      }
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    try {
      const updatedTask = await toggleComplete({
        taskId: taskId as unknown as Doc<"tasks">["_id"],
      });
      if (updatedTask) {
        setSelectedTask(updatedTask);
      }
    } catch (error) {
      console.error("Failed to toggle complete:", error);
    }
  };

  // Subtask handlers
  const handleCreateSubtask = async (taskId: string, title: string) => {
    try {
      await createSubtask({
        taskId: taskId as unknown as Doc<"tasks">["_id"],
        title,
      });
    } catch (error) {
      console.error("Failed to create subtask:", error);
    }
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    try {
      await toggleSubtask({
        subtaskId: subtaskId as unknown as Doc<"subtasks">["_id"],
      });
    } catch (error) {
      console.error("Failed to toggle subtask:", error);
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      await deleteSubtask({
        subtaskId: subtaskId as unknown as Doc<"subtasks">["_id"],
      });
    } catch (error) {
      console.error("Failed to delete subtask:", error);
    }
  };

  const handleUpdateSubtask = async (subtaskId: string, title: string) => {
    try {
      await updateSubtask({
        subtaskId: subtaskId as unknown as Doc<"subtasks">["_id"],
        title,
      });
    } catch (error) {
      console.error("Failed to update subtask:", error);
    }
  };

  // Fetch subtasks for the selected task
  const subtasks = useQuery(
    api.subtasks.listMySubtasks,
    selectedTask?._id ? { taskId: selectedTask._id } : "skip",
  );

  // Combined loading state
  const isLoading =
    isViewerLoading || isTasksLoading || isProjectsLoading || isTagsLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 h-full">
        <div className="flex items-center justify-between shrink-0">
          <p className="text-sm text-muted-foreground">
            Organize and track your work
          </p>
        </div>
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex flex-col gap-4 h-full">
        {/* Header with view switcher */}
        <div className="flex items-center justify-between shrink-0">
          <p className="text-sm text-muted-foreground">
            Organize and track your work
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleHideCompleted}
              className="text-xs px-3 py-1.5 rounded border border-border hover:bg-accent transition-colors"
              style={{ opacity: hideCompleted ? 1 : 0.5 }}
            >
              {hideCompleted ? "✓ Hide completed" : "Hide completed"}
            </button>
            <Tabs
              value={currentView}
              onValueChange={(v) =>
                handleViewChange(v as "board" | "todayPlusBoard")
              }
            >
              <TabsList>
                <TabsTrigger value="board">Board</TabsTrigger>
                <TabsTrigger value="todayPlusBoard">Today + Board</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Empty state */}
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-2 text-center max-w-sm">
            <h3 className="text-sm font-medium">No tasks yet</h3>
            <p className="text-xs text-muted-foreground">
              Create your first task to get started
            </p>
            <button
              onClick={() => handleOpenCreate({ status: "Not Started" })}
              className="mt-4 px-3 py-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Add your first task
            </button>
          </div>
        </div>

        {/* Task details sheet */}
        <TaskDetailsSheet
          task={selectedTask}
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          onDelete={handleDeleteTask}
          onUpdate={handleUpdateTask}
          onToggleComplete={handleToggleComplete}
          projects={projects}
          tags={tags}
          subtasks={subtasks || []}
          onCreateSubtask={handleCreateSubtask}
          onToggleSubtask={handleToggleSubtask}
          onDeleteSubtask={handleDeleteSubtask}
          onUpdateSubtask={handleUpdateSubtask}
        />

        {/* Create task sheet */}
        <CreateTaskSheet
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          defaults={createDefaults}
          onCreate={handleCreateTask}
          projects={projects}
          tags={tags}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header with view switcher */}
      <div className="flex items-center justify-between shrink-0">
        <p className="text-sm text-muted-foreground">
          Organize and track your work
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleHideCompleted}
            className="text-xs px-3 py-1.5 rounded border border-border hover:bg-accent transition-colors"
            style={{ opacity: hideCompleted ? 1 : 0.5 }}
          >
            {hideCompleted ? "✓ Hide completed" : "Hide completed"}
          </button>
          <Tabs
            value={currentView}
            onValueChange={(v) =>
              handleViewChange(v as "board" | "todayPlusBoard")
            }
          >
            <TabsList>
              <TabsTrigger value="board">Board</TabsTrigger>
              <TabsTrigger value="todayPlusBoard">Today + Board</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 min-h-0">
        {currentView === "board" ? (
          <BoardView
            tasks={tasks}
            onTaskClick={handleTaskClick}
            onCreateTask={handleOpenCreate}
            projects={projects}
            tags={tags}
            hideCompleted={hideCompleted}
          />
        ) : (
          <TodayBoardView
            tasks={tasks}
            onTaskClick={handleTaskClick}
            onCreateTask={handleOpenCreate}
            projects={projects}
            tags={tags}
            hideCompleted={hideCompleted}
          />
        )}
      </div>

      {/* Task details sheet */}
      <TaskDetailsSheet
        task={selectedTask}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onDelete={handleDeleteTask}
        onUpdate={handleUpdateTask}
        onToggleComplete={handleToggleComplete}
        projects={projects}
        tags={tags}
        subtasks={subtasks || []}
        onCreateSubtask={handleCreateSubtask}
        onToggleSubtask={handleToggleSubtask}
        onDeleteSubtask={handleDeleteSubtask}
        onUpdateSubtask={handleUpdateSubtask}
      />

      {/* Create task sheet */}
      <CreateTaskSheet
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        defaults={createDefaults}
        onCreate={handleCreateTask}
        projects={projects}
        tags={tags}
      />
    </div>
  );
}
