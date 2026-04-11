"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
  type ComponentProps,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useViewer } from "@/components/settings/hooks/use-viewer";
import { BoardView } from "@/components/tasks/board-view";
import { TodayBoardView } from "@/components/tasks/today-board-view";
import { TaskListView } from "@/components/tasks/task-list-view";
import { TaskDetailsSheet } from "@/components/tasks/task-details-sheet";
import { CreateTaskSheet } from "@/components/tasks/create-task-sheet";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Kbd } from "@/components/ui/kbd";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  InboxIcon,
  SearchIcon,
  SearchXIcon,
  SlidersHorizontalIcon,
  XIcon,
} from "lucide-react";
import { toast } from "sonner";

type Task = Doc<"tasks">;
type Project = Doc<"projects">;
type Tag = Doc<"tags">;
type Subtask = Doc<"subtasks">;

type TaskView = "board" | "todayPlusBoard" | "list";
type StatusFilter = "all" | Task["status"];
type PriorityFilter = "all" | Task["priority"];
type ScheduleFilter = "any" | "today" | "week" | "unscheduled";

type TaskCreateDefaults = ComponentProps<typeof CreateTaskSheet>["defaults"];
type TaskCreateDraft = Parameters<
  NonNullable<ComponentProps<typeof CreateTaskSheet>["onCreate"]>
>[0];
type TaskUpdate = Parameters<
  NonNullable<ComponentProps<typeof TaskDetailsSheet>["onUpdate"]>
>[1];

interface TaskFeatureContextValue {
  state: {
    currentView: TaskView;
    hideCompleted: boolean;
    isSearchOpen: boolean;
    searchInput: string;
    searchQuery: string;
    statusFilter: StatusFilter;
    priorityFilter: PriorityFilter;
    projectFilter: string;
    tagFilter: string;
    scheduleFilter: ScheduleFilter;
    tasks: Task[];
    projects: Project[];
    tags: Tag[];
    subtasks: Subtask[];
    filteredTasks: Task[];
    selectedTask: Task | null;
    isDetailsOpen: boolean;
    isCreateOpen: boolean;
    createDefaults: TaskCreateDefaults;
    isCreateTagDialogOpen: boolean;
    newTagName: string;
    isCreatingTag: boolean;
    hasActiveFilters: boolean;
    showNoResults: boolean;
    isEmptyState: boolean;
  };
  actions: {
    setView: (view: TaskView) => Promise<void>;
    toggleHideCompleted: () => Promise<void>;
    openSearch: () => void;
    closeSearch: () => void;
    setSearchInput: (value: string) => void;
    clearSearch: () => void;
    setStatusFilter: (value: StatusFilter) => void;
    setPriorityFilter: (value: PriorityFilter) => void;
    setProjectFilter: (value: string) => void;
    setTagFilter: (value: string) => void;
    setScheduleFilter: (value: ScheduleFilter) => void;
    clearFilters: () => void;
    openDetails: (task: Task) => void;
    closeDetails: () => void;
    openCreate: (defaults: TaskCreateDefaults) => void;
    closeCreate: () => void;
    createTask: (draft: TaskCreateDraft) => Promise<void>;
    updateTask: (taskId: string, updates: TaskUpdate) => Promise<void>;
    toggleComplete: (taskId: string) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    createSubtask: (taskId: string, title: string) => Promise<void>;
    updateSubtask: (subtaskId: string, title: string) => Promise<void>;
    toggleSubtask: (subtaskId: string) => Promise<void>;
    deleteSubtask: (subtaskId: string) => Promise<void>;
    createTag: (name: string) => Promise<Tag | null>;
    setCreateTagDialogOpen: (open: boolean) => void;
    setNewTagName: (value: string) => void;
    createTagFromDialog: () => Promise<void>;
    focusSearchButton: () => void;
  };
  meta: {
    isLoading: boolean;
    isViewerLoading: boolean;
    isTasksLoading: boolean;
    isProjectsLoading: boolean;
    isTagsLoading: boolean;
    isSearchLoading: boolean;
    searchButtonRef: RefObject<HTMLButtonElement | null>;
    searchInputRef: RefObject<HTMLInputElement | null>;
  };
}

const TaskFeatureContext = createContext<TaskFeatureContextValue | null>(null);

const validStatuses: StatusFilter[] = [
  "all",
  "Not Started",
  "To Do",
  "In Progress",
  "Completed",
];
const validPriorities: PriorityFilter[] = ["all", "low", "medium", "high"];
const validSchedules: ScheduleFilter[] = ["any", "today", "week", "unscheduled"];

function toQueryString({
  searchQuery,
  statusFilter,
  priorityFilter,
  projectFilter,
  tagFilter,
  scheduleFilter,
}: {
  searchQuery: string;
  statusFilter: StatusFilter;
  priorityFilter: PriorityFilter;
  projectFilter: string;
  tagFilter: string;
  scheduleFilter: ScheduleFilter;
}) {
  const params = new URLSearchParams();
  if (searchQuery) params.set("q", searchQuery);
  if (statusFilter !== "all") params.set("status", statusFilter);
  if (priorityFilter !== "all") params.set("priority", priorityFilter);
  if (projectFilter !== "all") params.set("project", projectFilter);
  if (tagFilter !== "all") params.set("tag", tagFilter);
  if (scheduleFilter !== "any") params.set("schedule", scheduleFilter);
  return params.toString();
}

export function useTaskFeature() {
  const context = useContext(TaskFeatureContext);
  if (!context) {
    throw new Error("useTaskFeature must be used within TaskFeature.Provider");
  }
  return context;
}

function TaskFeatureProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isTasksIndexRoute = pathname === "/app/tasks";
  const { viewer, isLoading: isViewerLoading } = useViewer();

  const updatePreferences = useMutation(api.preferences.updateMyPreferences);
  const createTaskMutation = useMutation(api.tasks.createTask);
  const updateTaskMutation = useMutation(api.tasks.updateTask);
  const toggleCompleteMutation = useMutation(api.tasks.toggleComplete);
  const deleteTaskMutation = useMutation(api.tasks.deleteTask);
  const createSubtaskMutation = useMutation(api.subtasks.createSubtask);
  const updateSubtaskMutation = useMutation(api.subtasks.updateSubtask);
  const toggleSubtaskMutation = useMutation(api.subtasks.toggleSubtask);
  const deleteSubtaskMutation = useMutation(api.subtasks.deleteSubtask);
  const createTagMutation = useMutation(api.tags.createTag);

  const tasksQuery = useQuery(api.tasks.listMyTasks, {});
  const projectsQuery = useQuery(api.projects.listMyProjects, {});
  const tagsQuery = useQuery(api.tags.listMyTags, {});

  const [currentView, setCurrentView] = useState<TaskView>("board");
  const [hideCompleted, setHideCompleted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [scheduleFilter, setScheduleFilter] = useState<ScheduleFilter>("any");
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDefaults, setCreateDefaults] = useState<TaskCreateDefaults>({});
  const [isCreateTagDialogOpen, setIsCreateTagDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  const lastCreatedTagIdRef = useRef<string | null>(null);
  const searchButtonRef = useRef<HTMLButtonElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const tasks = tasksQuery ?? [];
  const projects = projectsQuery ?? [];
  const tags = tagsQuery ?? [];

  const searchResults = useQuery(
    api.tasks.searchMyTasks,
    searchQuery ? { query: searchQuery } : "skip",
  );

  const isTasksLoading = tasksQuery === undefined;
  const isProjectsLoading = projectsQuery === undefined;
  const isTagsLoading = tagsQuery === undefined;
  const isSearchLoading = searchQuery.length > 0 && searchResults === undefined;

  const selectedTask = useMemo(
    () => tasks.find((task) => String(task._id) === selectedTaskId) ?? null,
    [tasks, selectedTaskId],
  );

  const subtasksQuery = useQuery(
    api.subtasks.listMySubtasks,
    selectedTask?._id ? { taskId: selectedTask._id } : "skip",
  );
  const subtasks = subtasksQuery ?? [];

  useEffect(() => {
    if (viewer?.preferences?.taskDefaultView) {
      setCurrentView(viewer.preferences.taskDefaultView);
    }
  }, [viewer?.preferences?.taskDefaultView]);

  useEffect(() => {
    if (viewer?.preferences?.hideCompletedTasks !== undefined) {
      setHideCompleted(viewer.preferences.hideCompletedTasks);
    }
  }, [viewer?.preferences?.hideCompletedTasks]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 250);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  useEffect(() => {
    if (searchInput.length > 0) {
      setIsSearchOpen(true);
    }
  }, [searchInput]);

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

  useEffect(() => {
    if (!isTasksIndexRoute) {
      return;
    }

    const queryFromUrl = searchParams.get("q") ?? "";
    const statusValue = searchParams.get("status") ?? "all";
    const priorityValue = searchParams.get("priority") ?? "all";
    const projectValue = searchParams.get("project") ?? "all";
    const tagValue = searchParams.get("tag") ?? "all";
    const scheduleValue = searchParams.get("schedule") ?? "any";

    setSearchInput((prev) => (prev === queryFromUrl ? prev : queryFromUrl));
    setSearchQuery((prev) =>
      prev === queryFromUrl.trim() ? prev : queryFromUrl.trim(),
    );
    setIsSearchOpen(queryFromUrl.length > 0);

    setStatusFilter(
      validStatuses.includes(statusValue as StatusFilter)
        ? (statusValue as StatusFilter)
        : "all",
    );
    setPriorityFilter(
      validPriorities.includes(priorityValue as PriorityFilter)
        ? (priorityValue as PriorityFilter)
        : "all",
    );
    setScheduleFilter(
      validSchedules.includes(scheduleValue as ScheduleFilter)
        ? (scheduleValue as ScheduleFilter)
        : "any",
    );

    if (
      projectValue !== "all" &&
      !projects.some((project) => String(project._id) === projectValue)
    ) {
      setProjectFilter("all");
    } else {
      setProjectFilter(projectValue);
    }

    if (tagValue === "all") {
      setTagFilter("all");
      return;
    }

    if (tags.some((tag) => String(tag._id) === tagValue)) {
      setTagFilter(tagValue);
      if (lastCreatedTagIdRef.current === tagValue) {
        lastCreatedTagIdRef.current = null;
      }
      return;
    }

    if (lastCreatedTagIdRef.current === tagValue) {
      setTagFilter(tagValue);
      return;
    }

    setTagFilter("all");
  }, [isTasksIndexRoute, searchParams, projects, tags]);

  useEffect(() => {
    if (!isTasksIndexRoute) {
      return;
    }

    const queryString = toQueryString({
      searchQuery,
      statusFilter,
      priorityFilter,
      projectFilter,
      tagFilter,
      scheduleFilter,
    });

    const current = searchParams.toString();
    if (queryString === current) {
      return;
    }

    router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
      scroll: false,
    });
  }, [
    isTasksIndexRoute,
    searchQuery,
    statusFilter,
    priorityFilter,
    projectFilter,
    tagFilter,
    scheduleFilter,
    pathname,
    router,
    searchParams,
  ]);

  useEffect(() => {
    if (!isDetailsOpen || !selectedTaskId || isTasksLoading) {
      return;
    }

    const stillExists = tasks.some((task) => String(task._id) === selectedTaskId);
    if (!stillExists) {
      setIsDetailsOpen(false);
      setSelectedTaskId(null);
    }
  }, [isDetailsOpen, selectedTaskId, tasks, isTasksLoading]);

  const baseTasks = searchQuery ? (searchResults ?? tasksQuery ?? []) : tasks;

  const filteredTasks = useMemo(() => {
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
      result = result.filter((task) => String(task.projectId ?? "") === projectFilter);
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
          if (!task.scheduledDate) {
            return false;
          }
          const date = new Date(`${task.scheduledDate}T00:00:00`);
          return date >= today && date <= weekEnd;
        });
      }
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
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

  const isEmptyState = tasks.length === 0 && !searchQuery;

  const setView = async (view: TaskView) => {
    setCurrentView(view);
    if (!viewer?.userId) {
      return;
    }
    try {
      await updatePreferences({ taskDefaultView: view });
    } catch (error) {
      console.error("Failed to save view preference:", error);
    }
  };

  const toggleHideCompleted = async () => {
    const next = !hideCompleted;
    setHideCompleted(next);

    if (!viewer?.userId) {
      return;
    }

    try {
      await updatePreferences({ hideCompletedTasks: next });
    } catch (error) {
      console.error("Failed to save hide completed preference:", error);
      setHideCompleted(!next);
    }
  };

  const openSearch = () => {
    setIsSearchOpen(true);
    requestAnimationFrame(() => searchInputRef.current?.focus());
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setIsSearchOpen(false);
    searchButtonRef.current?.focus();
  };

  const clearFilters = () => {
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

  const openDetails = (task: Task) => {
    setSelectedTaskId(String(task._id));
    setIsDetailsOpen(true);
  };

  const openCreate = (defaults: TaskCreateDefaults) => {
    setCreateDefaults(defaults);
    setIsCreateOpen(true);
  };

  const createTask = async (draft: TaskCreateDraft) => {
    try {
      const createdTask = await createTaskMutation({
        title: draft.title,
        description: draft.description,
        notes: draft.notes,
        status: draft.status,
        priority: draft.priority,
        dueDate: draft.dueDate ?? undefined,
        scheduledDate: draft.scheduledDate ?? undefined,
        projectId: draft.projectId
          ? (draft.projectId as unknown as Id<"projects">)
          : undefined,
        tagIds:
          draft.tagIds && draft.tagIds.length > 0
            ? (draft.tagIds as unknown as Id<"tags">[])
            : undefined,
        estimatedDuration: draft.estimatedDuration ?? undefined,
        energyLevel: draft.energyLevel,
        difficulty: draft.difficulty,
      });

      setIsCreateOpen(false);
      setSelectedTaskId(createdTask ? String(createdTask._id) : null);
      setIsDetailsOpen(!!createdTask);
    } catch (error) {
      console.error("Failed to create task:", error);
      toast.error("Failed to create task");
    }
  };

  const updateTask = async (taskId: string, updates: TaskUpdate) => {
    try {
      await updateTaskMutation({
        taskId: taskId as unknown as Id<"tasks">,
        title: updates.title,
        description: updates.description,
        notes: updates.notes,
        status: updates.status,
        priority: updates.priority,
        dueDate: updates.dueDate ?? undefined,
        scheduledDate: updates.scheduledDate ?? undefined,
        projectId: updates.projectId
          ? (updates.projectId as unknown as Id<"projects">)
          : undefined,
        tagIds:
          updates.tagIds && updates.tagIds.length > 0
            ? (updates.tagIds as unknown as Id<"tags">[])
            : undefined,
      });
    } catch (error) {
      console.error("Failed to update task:", error);
      toast.error("Failed to update task");
    }
  };

  const toggleComplete = async (taskId: string) => {
    try {
      await toggleCompleteMutation({
        taskId: taskId as unknown as Id<"tasks">,
      });
    } catch (error) {
      console.error("Failed to toggle task:", error);
      toast.error("Failed to update task status");
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await deleteTaskMutation({
        taskId: taskId as unknown as Id<"tasks">,
      });
      setIsDetailsOpen(false);
      setSelectedTaskId(null);
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("Failed to delete task");
    }
  };

  const createSubtask = async (taskId: string, title: string) => {
    try {
      await createSubtaskMutation({
        taskId: taskId as unknown as Id<"tasks">,
        title,
      });
    } catch (error) {
      console.error("Failed to create subtask:", error);
      toast.error("Failed to create subtask");
    }
  };

  const updateSubtask = async (subtaskId: string, title: string) => {
    try {
      await updateSubtaskMutation({
        subtaskId: subtaskId as unknown as Id<"subtasks">,
        title,
      });
    } catch (error) {
      console.error("Failed to update subtask:", error);
      toast.error("Failed to update subtask");
    }
  };

  const toggleSubtask = async (subtaskId: string) => {
    try {
      await toggleSubtaskMutation({
        subtaskId: subtaskId as unknown as Id<"subtasks">,
      });
    } catch (error) {
      console.error("Failed to toggle subtask:", error);
      toast.error("Failed to update subtask status");
    }
  };

  const deleteSubtask = async (subtaskId: string) => {
    try {
      await deleteSubtaskMutation({
        subtaskId: subtaskId as unknown as Id<"subtasks">,
      });
    } catch (error) {
      console.error("Failed to delete subtask:", error);
      toast.error("Failed to delete subtask");
    }
  };

  const createTag = async (name: string): Promise<Tag | null> => {
    try {
      const newTag = await createTagMutation({ name });
      return newTag || null;
    } catch (error) {
      console.error("Failed to create tag:", error);
      toast.error("Failed to create tag");
      return null;
    }
  };

  const createTagFromDialog = async () => {
    const trimmedName = newTagName.trim();
    if (!trimmedName) {
      return;
    }

    setIsCreatingTag(true);
    try {
      const newTag = await createTagMutation({ name: trimmedName });
      if (!newTag) {
        return;
      }
      const createdTagId = String(newTag._id);
      lastCreatedTagIdRef.current = createdTagId;
      setTagFilter(createdTagId);
      setNewTagName("");
      setIsCreateTagDialogOpen(false);
    } catch (error) {
      console.error("Failed to create tag:", error);
      toast.error("Failed to create tag");
    } finally {
      setIsCreatingTag(false);
    }
  };

  const value = useMemo<TaskFeatureContextValue>(
    () => ({
      state: {
        currentView,
        hideCompleted,
        isSearchOpen,
        searchInput,
        searchQuery,
        statusFilter,
        priorityFilter,
        projectFilter,
        tagFilter,
        scheduleFilter,
        tasks,
        projects,
        tags,
        subtasks,
        filteredTasks,
        selectedTask,
        isDetailsOpen,
        isCreateOpen,
        createDefaults,
        isCreateTagDialogOpen,
        newTagName,
        isCreatingTag,
        hasActiveFilters,
        showNoResults,
        isEmptyState,
      },
      actions: {
        setView,
        toggleHideCompleted,
        openSearch,
        closeSearch: () => setIsSearchOpen(false),
        setSearchInput,
        clearSearch,
        setStatusFilter,
        setPriorityFilter,
        setProjectFilter,
        setTagFilter,
        setScheduleFilter,
        clearFilters,
        openDetails,
        closeDetails: () => setIsDetailsOpen(false),
        openCreate,
        closeCreate: () => setIsCreateOpen(false),
        createTask,
        updateTask,
        toggleComplete,
        deleteTask,
        createSubtask,
        updateSubtask,
        toggleSubtask,
        deleteSubtask,
        createTag,
        setCreateTagDialogOpen: setIsCreateTagDialogOpen,
        setNewTagName,
        createTagFromDialog,
        focusSearchButton: () => searchButtonRef.current?.focus(),
      },
      meta: {
        isLoading:
          isViewerLoading ||
          isTasksLoading ||
          isProjectsLoading ||
          isTagsLoading ||
          isSearchLoading,
        isViewerLoading,
        isTasksLoading,
        isProjectsLoading,
        isTagsLoading,
        isSearchLoading,
        searchButtonRef,
        searchInputRef,
      },
    }),
    [
      currentView,
      hideCompleted,
      isSearchOpen,
      searchInput,
      searchQuery,
      statusFilter,
      priorityFilter,
      projectFilter,
      tagFilter,
      scheduleFilter,
      tasks,
      projects,
      tags,
      subtasks,
      filteredTasks,
      selectedTask,
      isDetailsOpen,
      isCreateOpen,
      createDefaults,
      isCreateTagDialogOpen,
      newTagName,
      isCreatingTag,
      hasActiveFilters,
      showNoResults,
      isEmptyState,
      isViewerLoading,
      isTasksLoading,
      isProjectsLoading,
      isTagsLoading,
      isSearchLoading,
      router,
    ],
  );

  return (
    <TaskFeatureContext.Provider value={value}>
      {children}
    </TaskFeatureContext.Provider>
  );
}

function TaskFilterControls() {
  const { state, actions } = useTaskFeature();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={state.statusFilter}
        onValueChange={(value) => actions.setStatusFilter(value as StatusFilter)}
      >
        <SelectTrigger size="sm" className="min-w-[124px]">
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

      <Select
        value={state.priorityFilter}
        onValueChange={(value) =>
          actions.setPriorityFilter(value as PriorityFilter)
        }
      >
        <SelectTrigger size="sm" className="min-w-[116px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All priority</SelectItem>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="high">High</SelectItem>
        </SelectContent>
      </Select>

      <Select value={state.projectFilter} onValueChange={actions.setProjectFilter}>
        <SelectTrigger size="sm" className="min-w-[144px]">
          <SelectValue placeholder="Project" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All projects</SelectItem>
          {state.projects.length > 0 ? (
            state.projects.map((project) => (
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

      <Select
        value={state.tagFilter}
        onValueChange={(value) => {
          if (value === "__create__") {
            actions.setCreateTagDialogOpen(true);
            return;
          }
          actions.setTagFilter(value);
        }}
      >
        <SelectTrigger size="sm" className="min-w-[124px]">
          <SelectValue placeholder="Tag" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All tags</SelectItem>
          {state.tags.length > 0 ? (
            state.tags.map((tag) => (
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

      <Select
        value={state.scheduleFilter}
        onValueChange={(value) =>
          actions.setScheduleFilter(value as ScheduleFilter)
        }
      >
        <SelectTrigger size="sm" className="min-w-[144px]">
          <SelectValue placeholder="Schedule" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any schedule</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="week">This week</SelectItem>
          <SelectItem value="unscheduled">Unscheduled</SelectItem>
        </SelectContent>
      </Select>

      {state.hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={actions.clearFilters}>
          Clear
        </Button>
      )}
    </div>
  );
}

function TaskFeatureFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-background">
      {children}
    </div>
  );
}

function TaskFeatureToolbar() {
  const { state, actions, meta } = useTaskFeature();
  const isMobile = useIsMobile();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const tabTriggerClass =
    "h-7 rounded-md px-2.5 text-xs font-medium text-muted-foreground data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:shadow-none data-[state=active]:after:hidden sm:px-3";

  return (
    <div className="flex min-h-11 shrink-0 flex-wrap items-center gap-x-2 gap-y-2 border-b border-border/50 px-4 py-2">
      <div className="min-w-0 flex-1 basis-[140px] sm:basis-auto sm:min-w-40">
        {state.isSearchOpen || state.searchInput.length > 0 ? (
          <InputGroup className="h-8 rounded-md border border-border/70 bg-transparent shadow-none">
            <InputGroupAddon>
              <SearchIcon className="size-3.5" />
            </InputGroupAddon>
            <InputGroupInput
              id="task-search-input"
              ref={meta.searchInputRef}
              value={state.searchInput}
              onChange={(event) => actions.setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  if (state.searchInput.trim().length === 0) {
                    actions.closeSearch();
                    actions.focusSearchButton();
                  } else {
                    actions.clearSearch();
                  }
                }
              }}
              placeholder="Search tasks"
              aria-label="Search tasks"
              className="text-xs"
            />
            <InputGroupButton
              size="icon-xs"
              onClick={actions.clearSearch}
              aria-label="Clear search"
            >
              <XIcon className="size-3.5" />
            </InputGroupButton>
          </InputGroup>
        ) : (
          <div className="flex items-center gap-1">
            <Button
              // eslint-disable-next-line react-hooks/refs -- forwarded ref object for focus restore outside render
              ref={meta.searchButtonRef}
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 text-muted-foreground"
              onClick={actions.openSearch}
              aria-expanded={state.isSearchOpen}
              aria-controls="task-search-input"
              aria-label="Search tasks"
            >
              <SearchIcon className="size-4" />
            </Button>
            <Kbd className="hidden sm:inline-flex">/</Kbd>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-1.5 sm:ml-auto">
        {!state.isEmptyState &&
          (isMobile ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground"
                onClick={() => setIsMobileFiltersOpen(true)}
                aria-label="Open filters"
              >
                <SlidersHorizontalIcon className="size-4" />
              </Button>
              <Sheet
                open={isMobileFiltersOpen}
                onOpenChange={setIsMobileFiltersOpen}
              >
                <SheetContent
                  side="bottom"
                  className="h-[70vh] rounded-t-lg border-border/70 bg-background"
                >
                  <SheetHeader>
                    <SheetTitle>Filter tasks</SheetTitle>
                    <SheetDescription>
                      Narrow tasks by status, priority, project, tag, and
                      schedule.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="overflow-y-auto p-4">
                    <TaskFilterControls />
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground"
                  aria-label="Filters"
                >
                  <SlidersHorizontalIcon className="size-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="flex w-80 max-h-[min(70vh,28rem)] flex-col gap-2 overflow-y-auto p-3"
              >
                <TaskFilterControls />
              </PopoverContent>
            </Popover>
          ))}

        <label className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-md px-1.5 text-xs text-foreground">
          <Switch
            size="sm"
            checked={state.hideCompleted}
            onCheckedChange={actions.toggleHideCompleted}
            aria-label="Hide completed tasks"
          />
          <span className="hidden font-medium leading-none sm:inline">
            Hide completed
          </span>
        </label>

        <Tabs
          value={state.currentView}
          onValueChange={(value) => actions.setView(value as TaskView)}
          className="min-w-0 max-w-full shrink-0 overflow-x-auto"
        >
          <TabsList
            variant="line"
            className="h-8 w-max min-w-0 flex-nowrap rounded-md border border-border/70 bg-transparent p-0.5"
          >
            <TabsTrigger value="board" className={tabTriggerClass}>
              Board
            </TabsTrigger>
            <TabsTrigger value="todayPlusBoard" className={tabTriggerClass}>
              Today + Board
            </TabsTrigger>
            <TabsTrigger value="list" className={tabTriggerClass}>
              List
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}

function TaskFeatureContent() {
  const { state, actions, meta } = useTaskFeature();

  if (meta.isLoading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-3">
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pt-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden px-4 py-3">
      {state.isEmptyState ? (
        <div className="flex min-h-0 flex-1 items-center justify-center py-16">
          <div className="flex max-w-xs flex-col items-center justify-center gap-3 text-center">
            <InboxIcon
              className="size-8 text-muted-foreground"
              aria-hidden
            />
            <h3 className="text-xl font-semibold tracking-tight">
              No tasks yet
            </h3>
            <p className="text-sm text-muted-foreground">
              Create your first task to get started
            </p>
            <Button
              size="sm"
              className="mt-2 h-8 rounded-md"
              onClick={() => actions.openCreate({ status: "Not Started" })}
            >
              Add your first task
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-8 rounded-md"
              onClick={() => actions.setCreateTagDialogOpen(true)}
            >
              Create a tag
            </Button>
          </div>
        </div>
      ) : state.showNoResults ? (
        <div className="flex min-h-0 flex-1 items-center justify-center py-16">
          <div className="flex max-w-xs flex-col items-center justify-center gap-3 text-center">
            <SearchXIcon
              className="size-8 text-muted-foreground"
              aria-hidden
            />
            <h3 className="text-xl font-semibold tracking-tight">
              No matching tasks
            </h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
            {state.hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 h-8 rounded-md"
                onClick={actions.clearFilters}
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {state.currentView === "list" ? (
            <TaskListView
              tasks={state.filteredTasks}
              onTaskClick={actions.openDetails}
              onCreateTask={actions.openCreate}
              hideCompleted={state.hideCompleted}
            />
          ) : state.currentView === "board" ? (
            <BoardView
              tasks={state.filteredTasks}
              onTaskClick={actions.openDetails}
              onCreateTask={actions.openCreate}
              projects={state.projects}
              tags={state.tags}
              hideCompleted={state.hideCompleted}
            />
          ) : (
            <TodayBoardView
              tasks={state.filteredTasks}
              onTaskClick={actions.openDetails}
              onCreateTask={actions.openCreate}
              projects={state.projects}
              tags={state.tags}
              hideCompleted={state.hideCompleted}
            />
          )}
        </div>
      )}
    </div>
  );
}

function TaskFeatureSheets() {
  const { state, actions } = useTaskFeature();

  return (
    <>
      <CreateTaskSheet
        open={state.isCreateOpen}
        onOpenChange={(open) => {
          if (!open) actions.closeCreate();
        }}
        defaults={state.createDefaults}
        onCreate={actions.createTask}
        projects={state.projects}
        tags={state.tags}
      />
      <TaskDetailsSheet
        task={state.selectedTask}
        open={state.isDetailsOpen}
        onOpenChange={(open) => {
          if (!open) actions.closeDetails();
        }}
        onDelete={actions.deleteTask}
        onUpdate={actions.updateTask}
        onToggleComplete={actions.toggleComplete}
        projects={state.projects}
        tags={state.tags}
        subtasks={state.subtasks}
        onCreateSubtask={actions.createSubtask}
        onToggleSubtask={actions.toggleSubtask}
        onDeleteSubtask={actions.deleteSubtask}
        onUpdateSubtask={actions.updateSubtask}
        onCreateTag={actions.createTag}
      />
    </>
  );
}

function TaskFeatureCreateTagDialog() {
  const { state, actions } = useTaskFeature();

  return (
    <Dialog
      open={state.isCreateTagDialogOpen}
      onOpenChange={actions.setCreateTagDialogOpen}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create new tag</DialogTitle>
          <DialogDescription>
            Enter a name for your new tag. Color will be set automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label className="text-sm font-medium" htmlFor="tag-name">
              Tag name
            </Label>
            <Input
              id="tag-name"
              className="h-8 text-sm"
              value={state.newTagName}
              onChange={(event) => actions.setNewTagName(event.target.value)}
              placeholder="e.g., urgent, work, personal"
              onKeyDown={(event) => {
                if (event.key === "Enter" && state.newTagName.trim()) {
                  actions.createTagFromDialog();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="h-8 text-sm"
            onClick={() => {
              actions.setNewTagName("");
              actions.setCreateTagDialogOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            className="h-8 text-sm"
            onClick={actions.createTagFromDialog}
            disabled={!state.newTagName.trim() || state.isCreatingTag}
          >
            {state.isCreatingTag ? "Creating..." : "Create tag"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const TaskFeature = {
  Provider: TaskFeatureProvider,
  Frame: TaskFeatureFrame,
  Toolbar: TaskFeatureToolbar,
  Content: TaskFeatureContent,
  Sheets: TaskFeatureSheets,
  CreateTagDialog: TaskFeatureCreateTagDialog,
};
