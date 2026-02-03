"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
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

export default function ProjectsPage() {
  const router = useRouter()
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
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
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

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header Row */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <p className="text-sm text-muted-foreground">
            Group related work together
          </p>
        </div>
        <Button size="sm" onClick={handleCreateClick} className="h-8">
          <HugeiconsIcon
            icon={PlusSignIcon}
            strokeWidth={2}
            data-icon="inline-start"
          />
          New project
        </Button>
      </div>

      {/* Controls Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 shrink-0">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "active" | "archived")}
          className="w-full sm:w-auto"
        >
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="active" className="flex-1 sm:flex-none">
              Active
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex-1 sm:flex-none">
              Archived
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <InputGroup className="w-full sm:flex-1 sm:max-w-xs">
          <InputGroupAddon>
            <HugeiconsIcon icon={SearchIcon} strokeWidth={2} />
          </InputGroupAddon>
          <InputGroupInput
            ref={searchInputRef}
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search projects"
            aria-describedby="search-shortcut"
          />
          {searchQuery && (
            <InputGroupAddon>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setSearchQuery("")}
                className="h-6 w-6"
                aria-label="Clear search"
              >
                ×
              </Button>
            </InputGroupAddon>
          )}
        </InputGroup>
        <span id="search-shortcut" className="sr-only">
          Press Command K or Control K to focus search
        </span>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0">
        {isLoading ? (
          // Loading State
          <ProjectGridSkeleton count={6} />
        ) : displayProjects.length === 0 ? (
          // Empty State
          <Empty className="h-full min-h-[400px]">
            <EmptyHeader>
              {searchQuery ? (
                <EmptyMedia variant="icon">
                  <HugeiconsIcon icon={SearchIcon} strokeWidth={2} />
                </EmptyMedia>
              ) : activeTab === "active" ? (
                <EmptyMedia variant="icon">
                  <HugeiconsIcon icon={Folder02Icon} strokeWidth={2} />
                </EmptyMedia>
              ) : (
                <EmptyMedia variant="icon">
                  <HugeiconsIcon icon={Archive02Icon} strokeWidth={2} />
                </EmptyMedia>
              )}
              <EmptyTitle>
                {searchQuery
                  ? "No matching projects"
                  : activeTab === "active"
                    ? "No active projects"
                    : "No archived projects"}
              </EmptyTitle>
              <EmptyDescription>
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
              <Button onClick={handleCreateClick}>
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
          // Project Grid
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
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4"
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

      {/* Create/Edit Project Sheet */}
      <ProjectSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        project={editingProject}
        onSubmit={handleSheetSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Delete Confirmation Dialog */}
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
