"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  MoreVerticalCircle01Icon,
  PencilEdit01Icon,
  Archive02Icon,
  Unarchive03Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";

export interface ProjectCardData {
  _id: string;
  title: string;
  description?: string;
  status: "active" | "archived" | "deleted";
  color: string;
  icon: string;
  updatedAt: number;
}

interface ProjectCardProps {
  project: ProjectCardData;
  onClick?: (project: ProjectCardData) => void;
  onEdit?: (project: ProjectCardData) => void;
  onArchive?: (project: ProjectCardData) => void;
  onUnarchive?: (project: ProjectCardData) => void;
  onDelete?: (project: ProjectCardData) => void;
  showArchiveAction?: boolean;
}

export function ProjectCard({
  project,
  onClick,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
  showArchiveAction = true,
}: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const formatUpdatedAt = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleCardClick = () => {
    onClick?.(project);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      ref={cardRef}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${project.title} project. Press Enter to open.`}
      className="group relative flex h-full cursor-pointer flex-col rounded-[18px] border border-border/70 bg-card/50 p-4 outline-none transition-[background-color,border-color,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-border hover:bg-accent/20 motion-safe:active:scale-[0.99] focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-offset-2"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className="size-2.5 shrink-0 rounded-full ring-1 ring-border/50"
            style={{ backgroundColor: project.color }}
            aria-hidden="true"
          />
          <span
            className="shrink-0 text-lg leading-none select-none"
            aria-hidden="true"
            role="img"
          >
            {project.icon}
          </span>
          <h3 className="truncate text-[15px] font-medium tracking-[-0.01em] text-foreground">
            {project.title}
          </h3>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="shrink-0 rounded-md opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100"
              onClick={handleActionClick}
              aria-label={`Actions for ${project.title}`}
            >
              <HugeiconsIcon icon={MoreVerticalCircle01Icon} strokeWidth={2} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                handleActionClick(e);
                onEdit?.(project);
              }}
            >
              <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={2} />
              Edit
            </DropdownMenuItem>

            {showArchiveAction && project.status === "active" ? (
              <DropdownMenuItem
                onClick={(e) => {
                  handleActionClick(e);
                  onArchive?.(project);
                }}
              >
                <HugeiconsIcon icon={Archive02Icon} strokeWidth={2} />
                Archive
              </DropdownMenuItem>
            ) : showArchiveAction && project.status === "archived" ? (
              <DropdownMenuItem
                onClick={(e) => {
                  handleActionClick(e);
                  onUnarchive?.(project);
                }}
              >
                <HugeiconsIcon icon={Unarchive03Icon} strokeWidth={2} />
                Unarchive
              </DropdownMenuItem>
            ) : null}

            <DropdownMenuItem
              variant="destructive"
              onClick={(e) => {
                handleActionClick(e);
                onDelete?.(project);
              }}
            >
              <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p
        className={cn(
          "mb-5 flex-1 text-sm leading-relaxed",
          project.description
            ? "line-clamp-2 text-muted-foreground"
            : "text-muted-foreground/60 italic",
        )}
      >
        {project.description || "No description"}
      </p>

      <div className="mt-auto flex items-center justify-between border-t border-border/40 pt-2.5 text-[11px] tabular-nums text-muted-foreground/80">
        <span className="flex items-center gap-1.5">
          <span className="text-muted-foreground/50">Updated</span>
          {formatUpdatedAt(project.updatedAt)}
        </span>
        {project.status === "archived" && (
          <Badge variant="secondary" className="h-5 rounded-full px-2 text-[10px]">
            Archived
          </Badge>
        )}
      </div>
    </div>
  );
}
