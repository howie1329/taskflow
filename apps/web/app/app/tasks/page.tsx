"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Kbd } from "@/components/ui/kbd";
import { BoardView } from "@/components/tasks/board-view";
import { TodayBoardView } from "@/components/tasks/today-board-view";
import { TaskDetailsSheet } from "@/components/tasks/task-details-sheet";
import { CreateTaskSheet } from "@/components/tasks/create-task-sheet";
import { useViewer } from "@/components/settings/hooks/use-viewer";
import { useQuery, useMutation, useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc } from "@/convex/_generated/dataModel";
import { SearchIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Task = Doc<"tasks">;
type Project = Doc<"projects">;
type Tag = Doc<"tags">;
type Subtask = Doc<"subtasks">;

// Task update interface for client-side updates
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

export default function TasksPage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const convex = useConvex();
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

  // Tag creation mutation
  const createTag = useMutation(api.tags.createTag);

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

  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Task[] | null>(null);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const searchButtonRef = useRef<HTMLButtonElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [scheduleFilter, setScheduleFilter] = useState("any");

  // Create tag dialog state
  const [isCreateTagDialogOpen, setIsCreateTagDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const lastCreatedTagIdRef = useRef<string | null>(null);

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

  // Sync filters and search from URL params
  useEffect(() => {
    const urlQuery = searchParams.get("q") ?? "";
    setSearchInput(urlQuery);
    if (urlQuery) {
      setIsSearchOpen(true);
    }

    const statusValue = searchParams.get("status") ?? "all";
    const priorityValue = searchParams.get("priority") ?? "all";
    const projectValue = searchParams.get("project") ?? "all";
    const tagValue = searchParams.get("tag") ?? "all";
    const scheduleValue = searchParams.get("schedule") ?? "any";

    const validStatus = [
      "all",
      "Not Started",
      "To Do",
      "In Progress",
      "Completed",
    ];
    const validPriority = ["all", "low", "medium", "high"];
    const validSchedule = ["any", "today", "week", "unscheduled"];

    if (!validStatus.includes(statusValue)) {
      toast.error("Invalid status filter. Reset to all.");
      setStatusFilter("all");
    } else {
      setStatusFilter(statusValue);
    }

    if (!validPriority.includes(priorityValue)) {
      toast.error("Invalid priority filter. Reset to all.");
      setPriorityFilter("all");
    } else {
      setPriorityFilter(priorityValue);
    }

    if (!validSchedule.includes(scheduleValue)) {
      toast.error("Invalid schedule filter. Reset to any.");
      setScheduleFilter("any");
    } else {
      setScheduleFilter(scheduleValue);
    }

    if (projectValue === "all") {
      setProjectFilter("all");
    } else if (
      projects &&
      projects.some((p) => String(p._id) === projectValue)
    ) {
      setProjectFilter(projectValue);
    } else if (projects) {
      toast.error("Selected project filter no longer exists.");
      setProjectFilter("all");
    }

    if (tagValue === "all") {
      setTagFilter("all");
    } else if (tags && tags.some((t) => String(t._id) === tagValue)) {
      setTagFilter(tagValue);
      // Clear the ref once the tag appears in the list (race resolved)
      if (lastCreatedTagIdRef.current === tagValue) {
        lastCreatedTagIdRef.current = null;
      }
    } else if (lastCreatedTagIdRef.current === tagValue) {
      // Race condition: we just created this tag, trust it even if not in tags yet
      setTagFilter(tagValue);
    } else if (tags) {
      toast.error("Selected tag filter no longer exists.");
      setTagFilter("all");
    }
  }, [searchParams, projects, tags]);

  // Debounce search input
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 250);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  // Fetch search results from Convex
  useEffect(() => {
    let isCancelled = false;

    if (!searchQuery) {
      setSearchResults(null);
      setIsSearchLoading(false);
      return;
    }

    const fetchResults = async () => {
      setIsSearchLoading(true);
      try {
        const results = await convex.query(api.tasks.searchMyTasks, {
          query: searchQuery,
        });
        if (!isCancelled) {
          setSearchResults(results);
        }
      } catch (error) {
        if (!isCancelled) {
          toast.error("Search failed. Showing existing tasks.");
        }
      } finally {
        if (!isCancelled) {
          setIsSearchLoading(false);
        }
      }
    };

    fetchResults();

    return () => {
      isCancelled = true;
    };
  }, [convex, searchQuery]);

  // Keep search open if there's an active query
  useEffect(() => {
    if (searchInput.length > 0) {
      setIsSearchOpen(true);
    }
  }, [searchInput]);

  // Keyboard shortcut: '/' to open search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditable =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (event.key === "/" && !isEditable) {
        event.preventDefault();
        setIsSearchOpen(true);
        requestAnimationFrame(() => searchInputRef.current?.focus());
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Persist search + filters to URL
  useEffect(() => {
    const params = new URLSearchParams();

    if (searchQuery) params.set("q", searchQuery);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (priorityFilter !== "all") params.set("priority", priorityFilter);
    if (projectFilter !== "all") params.set("project", projectFilter);
    if (tagFilter !== "all") params.set("tag", tagFilter);
    if (scheduleFilter !== "any") params.set("schedule", scheduleFilter);

    const queryString = params.toString();
    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }, [
    searchQuery,
    statusFilter,
    priorityFilter,
    projectFilter,
    tagFilter,
    scheduleFilter,
    pathname,
    router,
  ]);

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

  const handleUpdateTask = async (taskId: string, updates: TaskUpdate) => {
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

  const handleCreateTag = async (name: string): Promise<Tag | null> => {
    try {
      const newTag = await createTag({ name });
      return newTag || null;
    } catch (error) {
      console.error("Failed to create tag:", error);
      toast.error("Failed to create tag");
      return null;
    }
  };

  // Fetch subtasks for the selected task
  const subtasks = useQuery(
    api.subtasks.listMySubtasks,
    selectedTask?._id ? { taskId: selectedTask._id } : "skip",
  );

  const handleClearFilters = () => {
    setSearchInput("");
    setSearchQuery("");
    setIsSearchOpen(false);
    setStatusFilter("all");
    setPriorityFilter("all");
    setProjectFilter("all");
    setTagFilter("all");
    setScheduleFilter("any");
    searchButtonRef.current?.focus();
  };

  // Handle tag filter change - including "Create tag..." option
  const handleTagFilterChange = (value: string) => {
    if (value === "__create__") {
      setIsCreateTagDialogOpen(true);
      return;
    }
    setTagFilter(value);
  };

  // Handle creating a new tag from the dialog
  const handleCreateTagFromDialog = async () => {
    if (!newTagName.trim()) return;

    setIsCreatingTag(true);
    try {
      const newTag = await createTag({ name: newTagName.trim() });
      if (newTag) {
        // Store the new tag ID to prevent race condition during validation
        lastCreatedTagIdRef.current = newTag._id as string;
        setTagFilter(newTag._id as string);
        setNewTagName("");
        setIsCreateTagDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to create tag:", error);
      toast.error("Failed to create tag");
    } finally {
      setIsCreatingTag(false);
    }
  };

  const baseTasks = searchQuery ? (searchResults ?? tasks) : tasks;

  const filteredTasks = useMemo(() => {
    if (!baseTasks) return [];

    let result = [...baseTasks];

    if (hideCompleted) {
      result = result.filter((task) => task.status !== "Completed");
    }

    if (statusFilter !== "all") {
      result = result.filter((task) => task.status === statusFilter);
    }

    if (priorityFilter !== "all") {
      result = result.filter((task) => task.priority === priorityFilter);
    }

    if (projectFilter !== "all") {
      result = result.filter(
        (task) => String(task.projectId ?? "") === projectFilter,
      );
    }

    if (tagFilter !== "all") {
      result = result.filter((task) =>
        task.tagIds.some((id) => String(id) === tagFilter),
      );
    }

    if (scheduleFilter !== "any") {
      const today = new Date();
      const todayString = today.toISOString().split("T")[0];

      if (scheduleFilter === "today") {
        result = result.filter((task) => task.scheduledDate === todayString);
      } else if (scheduleFilter === "unscheduled") {
        result = result.filter((task) => !task.scheduledDate);
      } else if (scheduleFilter === "week") {
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + 6);

        result = result.filter((task) => {
          if (!task.scheduledDate) return false;
          const date = new Date(`${task.scheduledDate}T00:00:00`);
          return date >= today && date <= weekEnd;
        });
      }
    }

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter((task) => {
        const haystack = [task.title, task.description, task.notes]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      });
    }

    return result;
  }, [
    baseTasks,
    hideCompleted,
    statusFilter,
    priorityFilter,
    projectFilter,
    tagFilter,
    scheduleFilter,
    searchQuery,
  ]);

  const hasActiveFilters =
    searchQuery.length > 0 ||
    statusFilter !== "all" ||
    priorityFilter !== "all" ||
    projectFilter !== "all" ||
    tagFilter !== "all" ||
    scheduleFilter !== "any";

  const showNoResults =
    !isSearchLoading &&
    filteredTasks.length === 0 &&
    ((baseTasks && baseTasks.length > 0) || searchQuery.length > 0);

  const searchControl =
    isSearchOpen || searchInput.length > 0 ? (
      <InputGroup className="h-8">
        <InputGroupAddon>
          <SearchIcon className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          id="task-search-input"
          ref={searchInputRef}
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              if (searchInput.trim().length === 0) {
                setIsSearchOpen(false);
                searchButtonRef.current?.focus();
              } else {
                setSearchInput("");
                setSearchQuery("");
              }
            }
          }}
          placeholder="Search tasks"
          aria-label="Search tasks"
        />
        <InputGroupButton
          size="icon-xs"
          onClick={() => {
            setSearchInput("");
            setSearchQuery("");
            setIsSearchOpen(false);
            searchButtonRef.current?.focus();
          }}
          aria-label="Clear search"
        >
          <XIcon className="size-3.5" />
        </InputGroupButton>
      </InputGroup>
    ) : (
      <button
        ref={searchButtonRef}
        type="button"
        className="h-8 w-full rounded-md border border-border bg-transparent px-2.5 text-xs text-muted-foreground flex items-center justify-between"
        onClick={() => {
          setIsSearchOpen(true);
          requestAnimationFrame(() => searchInputRef.current?.focus());
        }}
        aria-expanded={isSearchOpen}
        aria-controls="task-search-input"
      >
        <span className="flex items-center gap-2">
          <SearchIcon className="size-4" />
          Search tasks
        </span>
        <Kbd>/</Kbd>
      </button>
    );

  const filterControls = (
    <div className="flex flex-wrap gap-2">
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger size="sm" className="min-w-[120px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All status</SelectItem>
          <SelectItem value="Not Started">Not Started</SelectItem>
          <SelectItem value="To Do">To Do</SelectItem>
          <SelectItem value="In Progress">In Progress</SelectItem>
          <SelectItem value="Completed">Completed</SelectItem>
        </SelectContent>
      </Select>

      <Select value={priorityFilter} onValueChange={setPriorityFilter}>
        <SelectTrigger size="sm" className="min-w-[110px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priority</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
        </SelectContent>
      </Select>

      <Select value={projectFilter} onValueChange={setProjectFilter}>
        <SelectTrigger size="sm" className="min-w-[140px]">
          <SelectValue placeholder="Project" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All projects</SelectItem>
          {projects && projects.length > 0 ? (
            projects.map((project) => (
              <SelectItem
                key={project._id as string}
                value={project._id as string}
              >
                <span className="mr-2">{project.icon}</span>
                {project.title}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled>
              No projects
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      <Select value={tagFilter} onValueChange={handleTagFilterChange}>
        <SelectTrigger size="sm" className="min-w-[120px]">
          <SelectValue placeholder="Tag" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All tags</SelectItem>
          {tags && tags.length > 0 ? (
            tags.map((tag) => (
              <SelectItem key={tag._id as string} value={tag._id as string}>
                {tag.name}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled>
              No tags
            </SelectItem>
          )}
          <SelectItem value="__create__">+ Create tag...</SelectItem>
        </SelectContent>
      </Select>

      <Select value={scheduleFilter} onValueChange={setScheduleFilter}>
        <SelectTrigger size="sm" className="min-w-[140px]">
          <SelectValue placeholder="Schedule" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any schedule</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="week">This week</SelectItem>
          <SelectItem value="unscheduled">Unscheduled</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleClearFilters}
          className="text-xs px-2.5 py-1.5 rounded border border-border hover:bg-accent transition-colors"
        >
          Clear
        </button>
      )}
    </div>
  );

  // Combined loading state
  const isLoading =
    isViewerLoading ||
    isTasksLoading ||
    isProjectsLoading ||
    isTagsLoading ||
    isSearchLoading;

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

  // Determine if we should show empty state
  const isEmptyState = (!tasks || tasks.length === 0) && !searchQuery;

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header with view switcher */}
      <div className="flex flex-col gap-3 shrink-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Organize and track your work
          </p>
          <div className="w-full sm:flex-1 sm:max-w-[420px]">
            {searchControl}
          </div>
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
        {!isEmptyState && filterControls}
      </div>

      {/* Main content area */}
      <div className="flex-1 min-h-0">
        {isEmptyState ? (
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-2 text-center max-w-sm">
              <h3 className="text-sm font-medium">No tasks yet</h3>
              <p className="text-xs text-muted-foreground">
                Create your first task to get started
              </p>
              <button
                onClick={() => handleOpenCreate({ status: "Not Started" })}
                className="mt-4 px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Add your first task
              </button>
              <button
                onClick={() => setIsCreateTagDialogOpen(true)}
                className="mt-2 px-3 py-1.5 text-xs rounded-md border border-border hover:bg-accent transition-colors"
              >
                Create a tag
              </button>
            </div>
          </div>
        ) : showNoResults ? (
          <div className="flex-1 min-h-0 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center gap-2 text-center max-w-sm">
              <h3 className="text-sm font-medium">No matching tasks</h3>
              <p className="text-xs text-muted-foreground">
                Try adjusting your search or filters
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="mt-3 px-3 py-1.5 text-xs border border-border hover:bg-accent transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        ) : currentView === "board" ? (
          <BoardView
            tasks={filteredTasks}
            onTaskClick={handleTaskClick}
            onCreateTask={handleOpenCreate}
            projects={projects}
            tags={tags}
            hideCompleted={hideCompleted}
          />
        ) : (
          <TodayBoardView
            tasks={filteredTasks}
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
        onCreateTag={handleCreateTag}
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

      {/* Create tag dialog */}
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
                    handleCreateTagFromDialog();
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
              onClick={handleCreateTagFromDialog}
              disabled={!newTagName.trim() || isCreatingTag}
            >
              {isCreatingTag ? "Creating..." : "Create tag"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
