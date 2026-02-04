"use client"

import { useMemo, useEffect, useState, useCallback, useRef } from "react"
import {
  useParams,
  useRouter,
  usePathname,
  useSearchParams,
} from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useIsMobile } from "@/hooks/use-mobile"
import { BoardView } from "@/components/tasks/board-view"
import { TaskDetailsSheet } from "@/components/tasks/task-details-sheet"
import { CreateTaskSheet } from "@/components/tasks/create-task-sheet"
import { ProjectSheet, type ProjectDraft } from "@/components/projects/project-sheet"
import { ProjectGridSkeleton } from "@/components/projects/project-skeleton"
import type { Doc, Id } from "@/convex/_generated/dataModel"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  MoreHorizontalIcon,
  Archive02Icon,
  Unarchive03Icon,
  Delete02Icon,
  PlusSignIcon,
  FolderManagementIcon,
  NoteIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

type Task = Doc<"tasks">
type Tag = Doc<"tags">
type TaskUpdate = {
  title?: string
  description?: string
  notes?: string
  status?: Task["status"]
  priority?: Task["priority"]
  projectId?: string
  tagIds?: string[]
  scheduledDate?: string
  dueDate?: number
}

type TabKey = "tasks" | "notes"

function formatRelativeTime(timestamp: number) {
  const diff = Date.now() - timestamp
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return `${Math.floor(days / 30)} months ago`
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isMobile = useIsMobile()
  const projectId = params.projectId as Id<"projects">

  const project = useQuery(api.projects.getMyProject, { projectId })
  const isProjectLoading = project === undefined

  const allProjects = useQuery(api.projects.listMyProjects, {})
  const tags = useQuery(api.tags.listMyTags, {})

  const updateProject = useMutation(api.projects.updateProject)
  const archiveProject = useMutation(api.projects.archiveProject)
  const unarchiveProject = useMutation(api.projects.unarchiveProject)
  const deleteProject = useMutation(api.projects.deleteProject)

  const createTask = useMutation(api.tasks.createTask)
  const updateTask = useMutation(api.tasks.updateTask)
  const toggleComplete = useMutation(api.tasks.toggleComplete)
  const deleteTask = useMutation(api.tasks.deleteTask)

  const createSubtask = useMutation(api.subtasks.createSubtask)
  const updateSubtask = useMutation(api.subtasks.updateSubtask)
  const toggleSubtask = useMutation(api.subtasks.toggleSubtask)
  const deleteSubtask = useMutation(api.subtasks.deleteSubtask)

  const createTag = useMutation(api.tags.createTag)

  const [isProjectSheetOpen, setIsProjectSheetOpen] = useState(false)
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false)
  const [isProjectSubmitting, setIsProjectSubmitting] = useState(false)

  const tabParam = searchParams.get("tab")
  const defaultTab: TabKey = tabParam === "notes" ? "notes" : "tasks"
  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab)

  useEffect(() => {
    setActiveTab(defaultTab)
  }, [defaultTab])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (activeTab === "tasks") {
      params.delete("tab")
    } else {
      params.set("tab", activeTab)
    }
    const next = params.toString()
    const current = searchParams.toString()
    if (next !== current) {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false })
    }
  }, [activeTab, pathname, router, searchParams])

  const isArchived = project?.status === "archived"
  const projectForSheet = useMemo(
    () =>
      project
        ? {
            _id: String(project._id),
            title: project.title,
            description: project.description,
            icon: project.icon,
            color: project.color,
          }
        : null,
    [project],
  )

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [isTaskSheetOpen, setIsTaskSheetOpen] = useState(false)
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [createTaskDefaults, setCreateTaskDefaults] = useState<{
    status: Task["status"]
  }>({ status: "Not Started" })
  const [taskSearchQuery, setTaskSearchQuery] = useState("")
  const [hideCompleted, setHideCompleted] = useState(false)
  const taskSearchRef = useRef<HTMLInputElement>(null)

  const tasks = useQuery(
    api.tasks.listMyTasks,
    project ? { projectId: project._id, hideCompleted } : "skip",
  )
  const taskList = tasks ?? []

  const projectTasks = useMemo(() => taskList, [taskList])

  const filteredTasks = useMemo(() => {
    const query = taskSearchQuery.trim().toLowerCase()
    if (!query) return projectTasks
    return projectTasks.filter((task) => {
      const title = task.title.toLowerCase()
      const description = task.description?.toLowerCase() ?? ""
      const notes = task.notes?.toLowerCase() ?? ""
      return (
        title.includes(query) ||
        description.includes(query) ||
        notes.includes(query)
      )
    })
  }, [projectTasks, taskSearchQuery])

  const selectedTask = useMemo(
    () => taskList.find((task) => String(task._id) === selectedTaskId) ?? null,
    [taskList, selectedTaskId],
  )

  const subtasks = useQuery(
    api.subtasks.listMySubtasks,
    selectedTask?._id ? { taskId: selectedTask._id } : "skip",
  )

  const handleTaskClick = (task: Task) => {
    setSelectedTaskId(task._id as string)
    setIsTaskSheetOpen(true)
  }

  const handleCreateTask = (defaults: { status: Task["status"] }) => {
    if (isArchived) {
      toast.error("Unarchive this project to add new tasks.")
      return
    }
    setCreateTaskDefaults(defaults)
    setIsCreateTaskOpen(true)
  }

  const handleCreateTaskSubmit = useCallback(
    async (draft: {
      title: string
      description?: string
      notes?: string
      status?: Task["status"]
      priority?: Task["priority"]
      dueDate?: number | null
      scheduledDate?: string | null
      projectId?: string | null
      tagIds?: string[]
      estimatedDuration?: number | null
      actualDuration?: number | null
      energyLevel?: Task["energyLevel"]
      context?: string[]
      source?: Task["source"]
      orderIndex?: number
      lastActiveAt?: number
      streakCount?: number
      difficulty?: Task["difficulty"]
      isTemplate?: boolean
      aiContext?: unknown
      aiSummary?: string | null
      embedding?: number[] | null
    }) => {
      if (!project) return
      try {
        const newTask = await createTask({
          title: draft.title,
          description: draft.description,
          notes: draft.notes,
          status: draft.status,
          priority: draft.priority,
          dueDate: draft.dueDate ?? undefined,
          scheduledDate: draft.scheduledDate ?? undefined,
          projectId: project._id,
          tagIds:
            draft.tagIds && draft.tagIds.length > 0
              ? (draft.tagIds as unknown as Doc<"tasks">["tagIds"])
              : undefined,
          estimatedDuration: draft.estimatedDuration ?? undefined,
          energyLevel: draft.energyLevel,
          difficulty: draft.difficulty,
        })
        setIsCreateTaskOpen(false)
        if (newTask) {
          setSelectedTaskId(newTask._id as string)
          setIsTaskSheetOpen(true)
        }
      } catch (error) {
        console.error("Failed to create task:", error)
        toast.error("Failed to create task")
      }
    },
    [createTask, project],
  )

  const handleTaskUpdate = async (taskId: string, updates: TaskUpdate) => {
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
      })
      if (updatedTask) {
        setSelectedTaskId(updatedTask._id as string)
      }
    } catch (error) {
      console.error("Failed to update task:", error)
      toast.error("Failed to update task")
    }
  }

  const handleTaskDelete = async (taskId: string) => {
    try {
      await deleteTask({ taskId: taskId as unknown as Doc<"tasks">["_id"] })
      if (selectedTaskId === taskId) {
        setSelectedTaskId(null)
        setIsTaskSheetOpen(false)
      }
    } catch (error) {
      console.error("Failed to delete task:", error)
      toast.error("Failed to delete task")
    }
  }

  const handleTaskToggleComplete = async (taskId: string) => {
    try {
      const updatedTask = await toggleComplete({
        taskId: taskId as unknown as Doc<"tasks">["_id"],
      })
      if (updatedTask) {
        setSelectedTaskId(updatedTask._id as string)
      }
    } catch (error) {
      console.error("Failed to toggle complete:", error)
      toast.error("Failed to update task")
    }
  }

  const handleTaskCreateTag = async (name: string) => {
    try {
      const newTag = await createTag({ name })
      return newTag || null
    } catch (error) {
      console.error("Failed to create tag:", error)
      toast.error("Failed to create tag")
      return null
    }
  }

  const handleCreateSubtask = async (taskId: string, title: string) => {
    try {
      await createSubtask({
        taskId: taskId as unknown as Doc<"tasks">["_id"],
        title,
      })
    } catch (error) {
      console.error("Failed to create subtask:", error)
    }
  }

  const handleToggleSubtask = async (subtaskId: string) => {
    try {
      await toggleSubtask({
        subtaskId: subtaskId as unknown as Doc<"subtasks">["_id"],
      })
    } catch (error) {
      console.error("Failed to toggle subtask:", error)
    }
  }

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      await deleteSubtask({
        subtaskId: subtaskId as unknown as Doc<"subtasks">["_id"],
      })
    } catch (error) {
      console.error("Failed to delete subtask:", error)
    }
  }

  const handleUpdateSubtask = async (subtaskId: string, title: string) => {
    try {
      await updateSubtask({
        subtaskId: subtaskId as unknown as Doc<"subtasks">["_id"],
        title,
      })
    } catch (error) {
      console.error("Failed to update subtask:", error)
    }
  }

  const handleArchiveToggle = async () => {
    if (!project) return
    try {
      if (project.status === "archived") {
        await unarchiveProject({ projectId: project._id })
        toast.success(`Unarchived "${project.title}"`)
      } else {
        await archiveProject({ projectId: project._id })
        toast.success(`Archived "${project.title}"`)
      }
    } catch (error) {
      console.error("Failed to update project:", error)
      toast.error("Failed to update project")
    }
  }

  const handleProjectSave = async (draft: ProjectDraft) => {
    if (!project) return
    setIsProjectSubmitting(true)
    try {
      await updateProject({
        projectId: project._id,
        title: draft.title,
        description: draft.description,
        icon: draft.icon,
        color: draft.color,
      })
      toast.success(`Updated "${draft.title}"`)
      setIsProjectSheetOpen(false)
    } catch (error) {
      console.error("Failed to update project:", error)
      toast.error("Failed to update project")
    } finally {
      setIsProjectSubmitting(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!project) return
    try {
      await deleteProject({ projectId: project._id })
      toast.success(`Deleted "${project.title}"`)
      setIsDeleteProjectOpen(false)
      router.push("/app/projects")
    } catch (error) {
      console.error("Failed to delete project:", error)
      toast.error("Failed to delete project")
    }
  }

  if (isProjectLoading) {
    return (
      <div className="flex h-full flex-col">
        {isMobile && (
          <div className="flex items-center gap-2 p-4 border-b md:hidden">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => router.push("/app/projects")}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
            </Button>
            <span className="text-sm font-medium">Back to projects</span>
          </div>
        )}
        <div className="flex-1 p-8">
          <ProjectGridSkeleton count={3} />
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex h-full flex-col">
        {isMobile && (
          <div className="flex items-center gap-2 p-4 border-b md:hidden">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => router.push("/app/projects")}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
            </Button>
            <span className="text-sm font-medium">Back to projects</span>
          </div>
        )}
        <div className="flex-1 flex items-center justify-center p-8">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={FolderManagementIcon} className="size-6" />
              </EmptyMedia>
              <EmptyTitle>Project not found</EmptyTitle>
              <EmptyDescription>
                This project may have been deleted or the link is invalid.
              </EmptyDescription>
            </EmptyHeader>
            <Button onClick={() => router.push("/app/projects")}>
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4 mr-2" />
              Back to projects
            </Button>
          </Empty>
        </div>
      </div>
    )
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as TabKey)}
      className="flex flex-col gap-6 h-full"
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => router.push("/app/projects")}
              className={cn("md:hidden")}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
            </Button>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold leading-tight">
                {project.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {project.description || "No description"}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                <span
                  className="inline-flex h-2 w-2 rounded-full"
                  style={{ backgroundColor: project.color }}
                  aria-hidden="true"
                />
                <span>{project.icon}</span>
                <Badge variant="outline" className="rounded-md text-[10px]">
                  {project.status === "archived" ? "Archived" : "Active"}
                </Badge>
                <span>Updated {formatRelativeTime(project.updatedAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              className="h-8"
              onClick={() => handleCreateTask({ status: "Not Started" })}
              disabled={isArchived}
            >
              <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />
              New task
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => setIsProjectSheetOpen(true)}
            >
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="h-8 w-8">
                  <HugeiconsIcon icon={MoreHorizontalIcon} className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleArchiveToggle}>
                  <HugeiconsIcon
                    icon={
                      project.status === "archived"
                        ? Unarchive03Icon
                        : Archive02Icon
                    }
                    className="size-4 mr-2"
                  />
                  {project.status === "archived" ? "Unarchive" : "Archive"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setIsDeleteProjectOpen(true)}
                >
                  <HugeiconsIcon icon={Delete02Icon} className="size-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <TabsList variant="line">
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="tasks" className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <InputGroup className="w-full sm:max-w-xs">
            <InputGroupAddon>
              <HugeiconsIcon icon={Search01Icon} className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              ref={taskSearchRef}
              placeholder="Search tasks..."
              value={taskSearchQuery}
              onChange={(e) => setTaskSearchQuery(e.target.value)}
            />
            {taskSearchQuery && (
              <InputGroupAddon>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setTaskSearchQuery("")}
                  className="h-6 w-6"
                >
                  ×
                </Button>
              </InputGroupAddon>
            )}
          </InputGroup>

          <Button
            variant={hideCompleted ? "secondary" : "outline"}
            size="sm"
            className="h-8"
            onClick={() => setHideCompleted((prev) => !prev)}
          >
            {hideCompleted ? "Showing open only" : "Hide completed"}
          </Button>
        </div>

        <div className="flex-1 min-h-0">
          {filteredTasks.length === 0 ? (
            <Empty className="min-h-[320px]">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HugeiconsIcon icon={FolderManagementIcon} className="size-5" />
                </EmptyMedia>
                <EmptyTitle>No tasks yet</EmptyTitle>
                <EmptyDescription>
                  {taskSearchQuery
                    ? "No tasks match your search."
                    : "Create your first task for this project."}
                </EmptyDescription>
              </EmptyHeader>
              {!taskSearchQuery && (
                <Button
                  onClick={() => handleCreateTask({ status: "Not Started" })}
                  disabled={isArchived}
                >
                  <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />
                  Create task
                </Button>
              )}
            </Empty>
          ) : (
            <BoardView
              tasks={filteredTasks}
              onTaskClick={handleTaskClick}
              onCreateTask={handleCreateTask}
              projects={allProjects ?? []}
              tags={tags ?? []}
              hideCompleted={hideCompleted}
            />
          )}
        </div>
      </TabsContent>

      <TabsContent value="notes" className="flex-1 min-h-0">
        <div className="flex h-full items-center justify-center">
          <Empty className="min-h-[320px]">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={NoteIcon} className="size-5" />
              </EmptyMedia>
              <EmptyTitle>Notes aren’t wired yet</EmptyTitle>
              <EmptyDescription>
                Project notes will be connected to Convex next.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      </TabsContent>

      <TaskDetailsSheet
        task={selectedTask}
        open={isTaskSheetOpen}
        onOpenChange={(open) => {
          setIsTaskSheetOpen(open)
          if (!open) setSelectedTaskId(null)
        }}
        onDelete={handleTaskDelete}
        onUpdate={(taskId, updates) => handleTaskUpdate(taskId, updates)}
        onToggleComplete={handleTaskToggleComplete}
        projects={allProjects ?? []}
        tags={tags ?? []}
        subtasks={subtasks ?? []}
        onCreateSubtask={handleCreateSubtask}
        onToggleSubtask={handleToggleSubtask}
        onDeleteSubtask={handleDeleteSubtask}
        onUpdateSubtask={handleUpdateSubtask}
        onCreateTag={handleTaskCreateTag}
      />

      <CreateTaskSheet
        open={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
        defaults={{
          status: createTaskDefaults.status,
          scheduledDate: null,
          projectId: String(project._id),
        }}
        onCreate={handleCreateTaskSubmit}
        projects={allProjects ?? []}
        tags={tags ?? []}
      />

      <ProjectSheet
        open={isProjectSheetOpen}
        onOpenChange={setIsProjectSheetOpen}
        project={projectForSheet}
        onSubmit={handleProjectSave}
        isSubmitting={isProjectSubmitting}
      />

      <AlertDialog
        open={isDeleteProjectOpen}
        onOpenChange={setIsDeleteProjectOpen}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Tasks will become unassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteProjectOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteProject}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Tabs>
  )
}
