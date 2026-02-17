"use client"

import type { Doc } from "@/convex/_generated/dataModel"
import {
  ProjectSelector,
  ProjectSelectorTrigger,
  ProjectSelectorContent,
  ProjectSelectorList,
  ProjectSelectorItem,
  ProjectSelectorGroup,
  ProjectSelectorEmpty,
} from "@/components/ai-elements/project-selector"

interface ProjectSelectorMenuProps {
  projects: Doc<"projects">[]
  selectedProjectId: string | null
  onSelectProjectId: (projectId: string | null) => void
  triggerClassName?: string
  maxLabelWidthClassName?: string
}

export function ProjectSelectorMenu({
  projects,
  selectedProjectId,
  onSelectProjectId,
  triggerClassName = "flex h-7 items-center gap-1 rounded-full border border-border/60 bg-muted/30 px-2.5 text-xs font-medium text-foreground hover:bg-muted/60",
  maxLabelWidthClassName = "max-w-[150px]",
}: ProjectSelectorMenuProps) {
  if (projects.length === 0) return null

  const selectedProject = selectedProjectId
    ? projects.find((project) => project._id === selectedProjectId)
    : null

  return (
    <ProjectSelector>
      <ProjectSelectorTrigger className={triggerClassName}>
        <span className={`truncate ${maxLabelWidthClassName}`}>
          {selectedProject
            ? `${selectedProject.icon} ${selectedProject.title}`
            : "No project"}
        </span>
      </ProjectSelectorTrigger>
      <ProjectSelectorContent>
        <ProjectSelectorList>
          <ProjectSelectorEmpty>No projects found</ProjectSelectorEmpty>
          <ProjectSelectorGroup heading="Your Projects">
            <ProjectSelectorItem value="none" onSelect={() => onSelectProjectId(null)}>
              No project
            </ProjectSelectorItem>
            {projects.map((project) => (
              <ProjectSelectorItem
                key={project._id}
                value={project._id}
                onSelect={() => onSelectProjectId(project._id)}
              >
                <span className="mr-2">{project.icon}</span>
                {project.title}
              </ProjectSelectorItem>
            ))}
          </ProjectSelectorGroup>
        </ProjectSelectorList>
      </ProjectSelectorContent>
    </ProjectSelector>
  )
}
