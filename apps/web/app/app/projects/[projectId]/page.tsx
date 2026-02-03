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
import { Separator } from "@/components/ui/separator"
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
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import { BoardView } from "@/components/tasks/board-view"
import { TaskDetailsSheet } from "@/components/tasks/task-details-sheet"
import { CreateTaskSheet } from "@/components/tasks/create-task-sheet"
import { ProjectSheet, type ProjectDraft } from "@/components/projects/project-sheet"
import { NotesList } from "@/components/notes/notes-list"
import { NoteEditor } from "@/components/notes/note-editor"
import type { MockNote, MockProject, ViewMode } from "@/components/notes/types"
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
import {
  mockProjects,
  mockProjectTasks,
  mockProjectTags,
  mockProjectNotes,
} from "@/components/projects/mock-data"

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
type NotesView = Exclude<ViewMode, "byProject">

function formatRelativeTime(timestamp: number) {
  const diff = Date.now() - timestamp
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return `${Math.floor(days / 30)} months ago`
}

function generateId() {
  return Math.random().toString(36).slice(2)
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isMobile = useIsMobile()
  const projectId = params.projectId as string

  const baseProject = useMemo(
    () => mockProjects.find((p) => p._id === projectId) ?? null,
    [projectId],
  )

  const [project, setProject] = useState(baseProject)
  const [isProjectSheetOpen, setIsProjectSheetOpen] = useState(false)
  const [isDeleteProjectOpen, setIsDeleteProjectOpen] = useState(false)

  useEffect(() => {
    setProject(baseProject)
  }, [baseProject])

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

  const handleArchiveToggle = () => {
    if (!project) return
    const nextStatus = project.status === "archived" ? "active" : "archived"
    setProject({ ...project, status: nextStatus })
    toast.success(
      nextStatus === "archived"
        ? `Archived "${project.title}"`
        : `Unarchived "${project.title}"`,
    )
  }

  const handleProjectSave = (draft: ProjectDraft) => {
    if (!project) return
    setProject({
      ...project,
      title: draft.title,
      description: draft.description,
      icon: draft.icon,
      color: draft.color,
      updatedAt: Date.now(),
    })
    toast.success(`Updated "${draft.title}"`)
    setIsProjectSheetOpen(false)
  }

  const handleDeleteProject = () => {
    if (!project) return
    toast.success(`Deleted "${project.title}"`)
    setIsDeleteProjectOpen(false)
    router.push("/app/projects")
  }

  const [tasks, setTasks] = useState<Task[]>(mockProjectTasks)
  const [tags, setTags] = useState<Tag[]>(mockProjectTags)
  const fallbackUserId = useMemo(
    () => tasks[0]?.userId ?? ("user-1" as Id<"users">),
    [tasks],
  )
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [isTaskSheetOpen, setIsTaskSheetOpen] = useState(false)
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [createTaskDefaults, setCreateTaskDefaults] = useState<{
    status: Task["status"]
  }>({ status: "Not Started" })
  const [taskSearchQuery, setTaskSearchQuery] = useState("")
  const [hideCompleted, setHideCompleted] = useState(false)

  const projectTasks = useMemo(() => {
    if (!project) return []
    return tasks.filter((task) => String(task.projectId) === project._id)
  }, [tasks, project])

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
    () => tasks.find((task) => String(task._id) === selectedTaskId) ?? null,
    [tasks, selectedTaskId],
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
    (draft: {
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
      const now = Date.now()
      const task: Task = {
        _id: `task-${generateId()}` as Id<"tasks">,
        _creationTime: now,
        userId: fallbackUserId,
        title: draft.title,
        description: draft.description,
        notes: draft.notes,
        status: draft.status ?? "Not Started",
        priority: draft.priority ?? "low",
        dueDate: draft.dueDate ?? undefined,
        scheduledDate: draft.scheduledDate ?? undefined,
        completionDate: undefined,
        projectId: project._id as Id<"projects">,
        tagIds: (draft.tagIds ?? []) as Id<"tags">[],
        parentTaskId: undefined,
        estimatedDuration: draft.estimatedDuration ?? undefined,
        actualDuration: draft.actualDuration ?? undefined,
        energyLevel: draft.energyLevel ?? "medium",
        context: draft.context ?? [],
        source: draft.source ?? "created",
        orderIndex: draft.orderIndex ?? 0,
        lastActiveAt: draft.lastActiveAt ?? now,
        streakCount: draft.streakCount ?? 0,
        difficulty: draft.difficulty ?? "medium",
        isTemplate: draft.isTemplate ?? false,
        aiSummary: draft.aiSummary ?? undefined,
        aiContext: draft.aiContext ?? undefined,
        embedding: draft.embedding ?? undefined,
        createdAt: now,
        updatedAt: now,
      }
      setTasks((prev) => [task, ...prev])
      setIsCreateTaskOpen(false)
    },
    [project],
  )

  const handleTaskUpdate = (taskId: string, updates: TaskUpdate) => {
    const mappedUpdates: Partial<Task> = {
      ...updates,
      projectId: updates.projectId
        ? (updates.projectId as Id<"projects">)
        : undefined,
      tagIds: updates.tagIds ? (updates.tagIds as Id<"tags">[]) : undefined,
    }
    setTasks((prev) =>
      prev.map((task) =>
        String(task._id) === taskId
          ? { ...task, ...mappedUpdates, updatedAt: Date.now() }
          : task,
      ),
    )
  }

  const handleTaskDelete = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => String(task._id) !== taskId))
    if (selectedTaskId === taskId) {
      setSelectedTaskId(null)
      setIsTaskSheetOpen(false)
    }
  }

  const handleTaskToggleComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (String(task._id) !== taskId) return task
        const completed = task.status === "Completed"
        return {
          ...task,
          status: completed ? "To Do" : "Completed",
          completionDate: completed ? undefined : Date.now(),
          updatedAt: Date.now(),
        }
      }),
    )
  }

  const handleTaskCreateTag = async (name: string) => {
    if (!project) return null
    const newTag: Tag = {
      _id: `tag-${generateId()}` as Id<"tags">,
      _creationTime: Date.now(),
      userId: fallbackUserId,
      name,
      color: "#6366f1",
      usageCount: 0,
      createdAt: Date.now(),
    }
    setTags((prev) => [...prev, newTag])
    return newTag
  }

  const [notes, setNotes] = useState<MockNote[]>(mockProjectNotes)
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [noteSearchQuery, setNoteSearchQuery] = useState("")
  const [noteViewMode, setNoteViewMode] = useState<NotesView>("recent")
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isSaved, setIsSaved] = useState(true)
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)
  const [isDeleteNoteOpen, setIsDeleteNoteOpen] = useState(false)
  const noteSearchRef = useRef<HTMLInputElement>(null)

  const projectNotes = useMemo(() => {
    if (!project) return []
    return notes.filter((note) => note.projectId === project._id)
  }, [notes, project])

  const filteredNotes = useMemo(() => {
    let list = projectNotes
    const query = noteSearchQuery.trim().toLowerCase()
    if (query) {
      list = list.filter((note) => {
        const title = note.title.toLowerCase()
        const content = note.content.toLowerCase()
        return title.includes(query) || content.includes(query)
      })
    }
    if (noteViewMode === "pinned") {
      list = list.filter((note) => note.pinned)
    }
    return [...list].sort((a, b) => b.updatedAt - a.updatedAt)
  }, [projectNotes, noteSearchQuery, noteViewMode])

  const selectedNote = useMemo(
    () => projectNotes.find((note) => note._id === selectedNoteId) ?? null,
    [projectNotes, selectedNoteId],
  )

  useEffect(() => {
    if (!selectedNote) return
    setIsSaved(false)
    const timer = setTimeout(() => setIsSaved(true), 800)
    return () => clearTimeout(timer)
  }, [selectedNote?._id, selectedNote?.title, selectedNote?.content])

  const noteProjectList: MockProject[] = project
    ? [{ _id: project._id, title: project.title, icon: project.icon }]
    : []

  const projectForNote = useCallback(
    (projectIdValue: string) => {
      if (!project) return null
      return projectIdValue === project._id
        ? { _id: project._id, title: project.title, icon: project.icon }
        : null
    },
    [project],
  )

  const handleSelectNote = (noteId: string) => {
    setSelectedNoteId(noteId)
    if (isMobile) {
      setIsEditorOpen(true)
    }
  }

  const handleCreateNote = () => {
    if (!project) return
    if (isArchived) {
      toast.error("Unarchive this project to add new notes.")
      return
    }
    const newNote: MockNote = {
      _id: `note-${generateId()}`,
      projectId: project._id,
      title: "",
      content: "",
      pinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    setNotes((prev) => [newNote, ...prev])
    setSelectedNoteId(newNote._id)
    if (isMobile) setIsEditorOpen(true)
  }

  const handleUpdateNote = (noteId: string, updates: Partial<MockNote>) => {
    setNotes((prev) =>
      prev.map((note) =>
        note._id === noteId
          ? { ...note, ...updates, updatedAt: Date.now() }
          : note,
      ),
    )
  }

  const handlePinNote = (noteId: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note._id === noteId
          ? { ...note, pinned: !note.pinned, updatedAt: Date.now() }
          : note,
      ),
    )
  }

  const handleMoveNote = (noteId: string, newProjectId: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note._id === noteId
          ? { ...note, projectId: newProjectId, updatedAt: Date.now() }
          : note,
      ),
    )
    if (newProjectId !== project?._id) {
      setSelectedNoteId(null)
    }
  }

  const handleDeleteNote = (noteId: string) => {
    setNoteToDelete(noteId)
    setIsDeleteNoteOpen(true)
  }

  const confirmDeleteNote = () => {
    if (!noteToDelete) return
    setNotes((prev) => prev.filter((note) => note._id !== noteToDelete))
    if (selectedNoteId === noteToDelete) {
      setSelectedNoteId(null)
      setIsEditorOpen(false)
    }
    setNoteToDelete(null)
    setIsDeleteNoteOpen(false)
  }

  const handleCloseSheet = () => {
    setIsEditorOpen(false)
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
                <Badge variant="outline" className="rounded-none text-[10px]">
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
                    icon={project.status === "archived" ? Unarchive03Icon : Archive02Icon}
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
                projects={mockProjects as unknown as Doc<"projects">[]}
                tags={tags}
                hideCompleted={hideCompleted}
              />
            )}
          </div>
      </TabsContent>

      <TabsContent value="notes" className="flex-1 min-h-0">
          {isMobile ? (
            <div className="flex h-full flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Capture context for this project
                </p>
                <Button
                  size="sm"
                  className="h-8"
                  onClick={handleCreateNote}
                  disabled={isArchived}
                >
                  <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />
                  New note
                </Button>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <HugeiconsIcon
                    icon={Search01Icon}
                    className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <InputGroupInput
                    ref={noteSearchRef}
                    placeholder="Search notes..."
                    value={noteSearchQuery}
                    onChange={(e) => setNoteSearchQuery(e.target.value)}
                    className="h-8 pl-8 text-xs"
                  />
                  {noteSearchQuery && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="absolute right-1 top-1/2 -translate-y-1/2"
                      onClick={() => setNoteSearchQuery("")}
                    >
                      ×
                    </Button>
                  )}
                </div>

                <Tabs
                  value={noteViewMode}
                  onValueChange={(v) => setNoteViewMode(v as NotesView)}
                >
                  <TabsList variant="line" className="w-full">
                    <TabsTrigger value="recent" className="flex-1">
                      Recent
                      <Badge
                        variant="secondary"
                        className="ml-1.5 rounded-none text-[10px] px-1 py-0 h-4"
                      >
                        {filteredNotes.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="pinned" className="flex-1">
                      Pinned
                      <Badge
                        variant="secondary"
                        className="ml-1.5 rounded-none text-[10px] px-1 py-0 h-4"
                      >
                        {projectNotes.filter((n) => n.pinned).length}
                      </Badge>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <Separator />

              <div className="min-h-0 flex-1 overflow-y-auto">
                {isArchived && filteredNotes.length === 0 ? (
                  <Empty className="min-h-[240px]">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <HugeiconsIcon icon={NoteIcon} className="size-4" />
                      </EmptyMedia>
                      <EmptyTitle>No notes yet</EmptyTitle>
                      <EmptyDescription>
                        Unarchive this project to add new notes.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  <NotesList
                    sortedNotes={filteredNotes}
                    groupedNotes={null}
                    viewMode={noteViewMode}
                    selectedNoteId={selectedNoteId}
                    projectFilter={project._id}
                    searchQuery={noteSearchQuery}
                    isMobile={isMobile}
                    onSelectNote={handleSelectNote}
                    onCreateNote={handleCreateNote}
                    onPinNote={handlePinNote}
                    onMoveNote={handleMoveNote}
                    onDeleteNote={handleDeleteNote}
                    projectForNote={projectForNote}
                    mockProjects={noteProjectList}
                  />
                )}
              </div>

              <Sheet open={isEditorOpen} onOpenChange={setIsEditorOpen}>
                <SheetContent side="bottom" className="h-[85vh] p-4" showCloseButton={false}>
                  <div className="h-full overflow-y-auto">
                    <NoteEditor
                      note={selectedNote}
                      isSaved={isSaved}
                      isInSheet={true}
                      mockProjects={noteProjectList}
                      projectForNote={projectForNote}
                      onUpdateNote={handleUpdateNote}
                      onPinNote={handlePinNote}
                      onMoveNote={handleMoveNote}
                      onDeleteNote={handleDeleteNote}
                      onCreateNote={handleCreateNote}
                      onCloseSheet={handleCloseSheet}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          ) : (
            <div className="flex h-full">
              <div className="flex w-[350px] shrink-0 flex-col border-r p-4 gap-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Capture context for this project
                  </p>
                  <Button
                    size="sm"
                    className="h-8"
                    onClick={handleCreateNote}
                    disabled={isArchived}
                  >
                    <HugeiconsIcon icon={PlusSignIcon} className="size-4 mr-2" />
                    New note
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <HugeiconsIcon
                      icon={Search01Icon}
                      className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <InputGroupInput
                      ref={noteSearchRef}
                      placeholder="Search notes..."
                      value={noteSearchQuery}
                      onChange={(e) => setNoteSearchQuery(e.target.value)}
                      className="h-8 pl-8 text-xs"
                    />
                    {noteSearchQuery && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="absolute right-1 top-1/2 -translate-y-1/2"
                        onClick={() => setNoteSearchQuery("")}
                      >
                        ×
                      </Button>
                    )}
                  </div>

                  <Tabs
                    value={noteViewMode}
                    onValueChange={(v) => setNoteViewMode(v as NotesView)}
                  >
                    <TabsList variant="line" className="w-full">
                      <TabsTrigger value="recent" className="flex-1">
                        Recent
                        <Badge
                          variant="secondary"
                          className="ml-1.5 rounded-none text-[10px] px-1 py-0 h-4"
                        >
                          {filteredNotes.length}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="pinned" className="flex-1">
                        Pinned
                        <Badge
                          variant="secondary"
                          className="ml-1.5 rounded-none text-[10px] px-1 py-0 h-4"
                        >
                          {projectNotes.filter((n) => n.pinned).length}
                        </Badge>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <Separator />

                <div className="min-h-0 flex-1 overflow-y-auto">
                  {isArchived && filteredNotes.length === 0 ? (
                    <Empty className="min-h-[240px]">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <HugeiconsIcon icon={NoteIcon} className="size-4" />
                        </EmptyMedia>
                        <EmptyTitle>No notes yet</EmptyTitle>
                        <EmptyDescription>
                          Unarchive this project to add new notes.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  ) : (
                    <NotesList
                      sortedNotes={filteredNotes}
                      groupedNotes={null}
                      viewMode={noteViewMode}
                      selectedNoteId={selectedNoteId}
                      projectFilter={project._id}
                      searchQuery={noteSearchQuery}
                      isMobile={isMobile}
                      onSelectNote={handleSelectNote}
                      onCreateNote={handleCreateNote}
                      onPinNote={handlePinNote}
                      onMoveNote={handleMoveNote}
                      onDeleteNote={handleDeleteNote}
                      projectForNote={projectForNote}
                      mockProjects={noteProjectList}
                    />
                  )}
                </div>
              </div>

              <div className="flex min-h-0 flex-1 flex-col p-4">
                <NoteEditor
                  note={selectedNote}
                  isSaved={isSaved}
                  isInSheet={false}
                  mockProjects={noteProjectList}
                  projectForNote={projectForNote}
                  onUpdateNote={handleUpdateNote}
                  onPinNote={handlePinNote}
                  onMoveNote={handleMoveNote}
                  onDeleteNote={handleDeleteNote}
                  onCreateNote={handleCreateNote}
                  onCloseSheet={handleCloseSheet}
                />
              </div>
            </div>
          )}
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
        projects={mockProjects as unknown as Doc<"projects">[]}
        tags={tags}
        subtasks={[]}
        onCreateTag={handleTaskCreateTag}
      />

      <CreateTaskSheet
        open={isCreateTaskOpen}
        onOpenChange={setIsCreateTaskOpen}
        defaults={{
          status: createTaskDefaults.status,
          scheduledDate: null,
          projectId: project._id,
        }}
        onCreate={handleCreateTaskSubmit}
        projects={mockProjects as unknown as Doc<"projects">[]}
        tags={tags}
      />

      <ProjectSheet
        open={isProjectSheetOpen}
        onOpenChange={setIsProjectSheetOpen}
        project={project}
        onSubmit={handleProjectSave}
      />

      <AlertDialog
        open={isDeleteProjectOpen}
        onOpenChange={setIsDeleteProjectOpen}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Tasks and notes will become
              unassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteProjectOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDeleteProject}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isDeleteNoteOpen} onOpenChange={setIsDeleteNoteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete note?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The note will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNoteToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={confirmDeleteNote}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Tabs>
  )
}
