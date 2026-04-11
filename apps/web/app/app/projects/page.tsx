"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty"
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
import {
  ProjectCard,
  type ProjectCardData,
} from "@/components/projects/project-card"
import { ProjectGridSkeleton } from "@/components/projects/project-skeleton"
import {
  ProjectSheet,
  type ProjectDraft,
} from "@/components/projects/project-sheet"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PlusSignIcon,
  SearchIcon,
  Folder02Icon,
  Archive02Icon,
} from "@hugeicons/core-free-icons"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Doc } from "@/convex/_generated/dataModel"
import { Kbd } from "@/components/ui/kbd"
import { SHORTCUT_DISPLAY } from "@/lib/keyboard-shortcuts"
import { shouldIgnoreGlobalShortcut } from "@/lib/should-ignore-global-shortcut"

export default function ProjectsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active")
  const [searchQuery, setSearchQuery] = useState("")
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectCardData | null>(
    null,
  )
  const [deleteProject, setDeleteProject] = useState<ProjectCardData | null>(
    null,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const projects = useQuery(api.projects.listMyProjects, {
    status: activeTab,
  })
  const isLoading = projects === undefined

  const createProject = useMutation(api.projects.createProject)
  const updateProject = useMutation(api.projects.updateProject)
  const archiveProject = useMutation(api.projects.archiveProject)
  const unarchiveProject = useMutation(api.projects.unarchiveProject)
  const deleteProjectMutation = useMutation(api.projects.deleteProject)

  const filteredProjects = useMemo(() => {
    const list = projects ?? []
    if (!searchQuery.trim()) return list
    const query = searchQuery.toLowerCase()
    return list.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        (p.description?.toLowerCase() || "").includes(query),
    )
  }, [projects, searchQuery])

  const displayProjects = useMemo<ProjectCardData[]>(
    () =>
      filteredProjects.map((project) => ({
        _id: String(project._id),
        title: project.title,
        description: project.description,
        status: project.status,
        color: project.color,
        icon: project.icon,
        updatedAt: project.updatedAt,
      })),
    [filteredProjects],
  )

  const handleCreateClick = () => {
    setEditingProject(null)
    setIsSheetOpen(true)
  }

  const handleEdit = (project: ProjectCardData) => {
    setEditingProject(project)
    setIsSheetOpen(true)
  }

  const handleArchive = async (project: ProjectCardData) => {
    try {
      await archiveProject({
        projectId: project._id as unknown as Doc<"projects">["_id"],
      })
      toast.success(`Archived "${project.title}"`)
    } catch (error) {
      console.error("Failed to archive project:", error)
      toast.error("Failed to archive project")
    }
  }

  const handleUnarchive = async (project: ProjectCardData) => {
    try {
      await unarchiveProject({
        projectId: project._id as unknown as Doc<"projects">["_id"],
      })
      toast.success(`Unarchived "${project.title}"`)
    } catch (error) {
      console.error("Failed to unarchive project:", error)
      toast.error("Failed to unarchive project")
    }
  }

  const handleDelete = (project: ProjectCardData) => {
    setDeleteProject(project)
  }

  const handleConfirmDelete = async () => {
    if (!deleteProject) return
    try {
      await deleteProjectMutation({
        projectId: deleteProject._id as unknown as Doc<"projects">["_id"],
      })
      toast.success(`Deleted "${deleteProject.title}"`)
      setDeleteProject(null)
    } catch (error) {
      console.error("Failed to delete project:", error)
      toast.error("Failed to delete project")
    }
  }

  const handleCardClick = (project: ProjectCardData) => {
    router.push(`/app/projects/${project._id}`)
  }

  const handleSheetSubmit = async (draft: ProjectDraft) => {
    setIsSubmitting(true)

    try {
      if (editingProject) {
        await updateProject({
          projectId: editingProject._id as unknown as Doc<"projects">["_id"],
          title: draft.title,
          description: draft.description,
          icon: draft.icon,
          color: draft.color,
        })
        toast.success(`Updated "${draft.title}"`)
      } else {
        await createProject({
          title: draft.title,
          description: draft.description,
          icon: draft.icon,
          color: draft.color,
        })
        toast.success(`Created "${draft.title}"`)
      }

      setIsSheetOpen(false)
      setEditingProject(null)
    } catch (error) {
      console.error("Failed to save project:", error)
      toast.error("Failed to save project")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Slash focuses local search when we're not in an editable field.
      if (
        e.key === "/" &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        !shouldIgnoreGlobalShortcut(e.target)
      ) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      // Escape to close dialogs/sheets
      if (e.key === "Escape") {
        if (deleteProject) {
          setDeleteProject(null)
        } else if (isSheetOpen) {
          setIsSheetOpen(false)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [deleteProject, isSheetOpen])

  useEffect(() => {
    const intent = searchParams.get("intent")
    if (intent !== "create-project") return
    setEditingProject(null)
    setIsSheetOpen(true)

    const params = new URLSearchParams(searchParams.toString())
    params.delete("intent")
    const nextQuery = params.toString()
    router.replace(nextQuery ? `/app/projects?${nextQuery}` : "/app/projects", {
      scroll: false,
    })
  }, [router, searchParams])

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border/50 bg-background px-4 py-3 md:px-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-4">
          <div className="min-w-0 shrink-0">
            <h1 className="text-xl font-semibold leading-tight tracking-tight">
              Projects
            </h1>
            <p className="text-xs leading-snug text-muted-foreground">
              Group related work together
            </p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as "active" | "archived")}
            className="w-full min-w-0 shrink-0 sm:w-auto"
          >
            <TabsList
              variant="line"
              className="h-8 w-full flex-nowrap rounded-md border border-border/70 bg-transparent p-0.5 sm:w-max"
            >
              <TabsTrigger
                value="active"
                className="h-7 flex-1 rounded-md px-2.5 text-xs font-medium text-muted-foreground data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:after:hidden sm:flex-none"
              >
                Active
              </TabsTrigger>
              <TabsTrigger
                value="archived"
                className="h-7 flex-1 rounded-md px-2.5 text-xs font-medium text-muted-foreground data-[state=active]:bg-accent data-[state=active]:text-accent-foreground data-[state=active]:after:hidden sm:flex-none"
              >
                Archived
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <InputGroup className="h-8 min-w-0 flex-1 rounded-md border-input bg-input shadow-none dark:bg-input/30">
            <InputGroupAddon>
              <HugeiconsIcon icon={SearchIcon} strokeWidth={2} />
            </InputGroupAddon>
            <InputGroupInput
              ref={searchInputRef}
              placeholder="Search projects"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search projects"
              aria-describedby="search-shortcut"
              className="text-xs"
            />
            {searchQuery ? (
              <InputGroupAddon align="inline-end">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                >
                  ×
                </Button>
              </InputGroupAddon>
            ) : (
              <InputGroupAddon align="inline-end">
                <Kbd className="h-5 text-[10px]">{SHORTCUT_DISPLAY.localSearch}</Kbd>
              </InputGroupAddon>
            )}
          </InputGroup>

          <Button
            size="sm"
            onClick={handleCreateClick}
            className="h-8 shrink-0 px-3 text-xs transition-[transform,box-shadow] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]"
          >
            <HugeiconsIcon
              icon={PlusSignIcon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            New project
          </Button>
          <span id="search-shortcut" className="sr-only">
            Press slash to focus project search
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-8">
        {isLoading ? (
          <ProjectGridSkeleton count={6} />
        ) : displayProjects.length === 0 ? (
          <Empty className="h-full min-h-[400px]">
            <EmptyHeader>
              {searchQuery ? (
                <EmptyMedia
                  variant="icon"
                  className="border-0 bg-muted/30 [&_svg]:text-muted-foreground"
                >
                  <HugeiconsIcon icon={SearchIcon} strokeWidth={2} />
                </EmptyMedia>
              ) : activeTab === "active" ? (
                <EmptyMedia
                  variant="icon"
                  className="border-0 bg-muted/30 [&_svg]:text-muted-foreground"
                >
                  <HugeiconsIcon icon={Folder02Icon} strokeWidth={2} />
                </EmptyMedia>
              ) : (
                <EmptyMedia
                  variant="icon"
                  className="border-0 bg-muted/30 [&_svg]:text-muted-foreground"
                >
                  <HugeiconsIcon icon={Archive02Icon} strokeWidth={2} />
                </EmptyMedia>
              )}
              <EmptyTitle className="text-base font-semibold leading-tight">
                {searchQuery
                  ? "No matching projects"
                  : activeTab === "active"
                    ? "No active projects"
                    : "No archived projects"}
              </EmptyTitle>
              <EmptyDescription className="text-xs leading-snug text-muted-foreground">
                {searchQuery ? (
                  <>
                    No projects match your search.{" "}
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-primary hover:underline"
                    >
                      Clear search
                    </button>
                  </>
                ) : activeTab === "active" ? (
                  "Create your first project to start organizing tasks"
                ) : (
                  "Archived projects will appear here"
                )}
              </EmptyDescription>
            </EmptyHeader>
            {activeTab === "active" && !searchQuery && (
              <Button
                onClick={handleCreateClick}
                className="h-8 text-xs transition-[transform,box-shadow] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98]"
              >
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  strokeWidth={2}
                  data-icon="inline-start"
                />
                Create your first project
              </Button>
            )}
          </Empty>
        ) : (
          <>
            <div
              className="sr-only"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              Showing {displayProjects.length}{" "}
              {activeTab === "active" ? "active" : "archived"} project
              {displayProjects.length === 1 ? "" : "s"}
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
            <div
              className="grid grid-cols-1 gap-3 pb-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
              role="list"
              aria-label={`${activeTab === "active" ? "Active" : "Archived"} projects`}
            >
              {displayProjects.map((project) => (
                <div key={project._id} role="listitem">
                  <ProjectCard
                    project={project}
                    onClick={handleCardClick}
                    onEdit={handleEdit}
                    onArchive={handleArchive}
                    onUnarchive={handleUnarchive}
                    onDelete={handleDelete}
                    showArchiveAction={true}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <ProjectSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        project={editingProject}
        onSubmit={handleSheetSubmit}
        isSubmitting={isSubmitting}
      />

      <AlertDialog
        open={!!deleteProject}
        onOpenChange={(open) => !open && setDeleteProject(null)}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All tasks in this project will
              become unassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteProject(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
