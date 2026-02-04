"use client";

import { useRef, useEffect } from "react";
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
  const cardRef = useRef<HTMLDivElement>(null);

  const formatRelativeTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
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
      className="group rounded-xl border border-border/60 bg-card/40 dark:bg-card/20 p-4 hover:bg-accent/30 hover:border-border shadow-sm shadow-black/5 hover:-translate-y-[1px] transition-[transform,box-shadow,background-color,border-color] duration-200 ease-out cursor-pointer relative h-full flex flex-col outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:ring-offset-2"
    >
      {/* Card Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-border/50"
            style={{ backgroundColor: project.color }}
            aria-hidden="true"
          />
          <span
            className="text-xl shrink-0 leading-none select-none"
            aria-hidden="true"
            role="img"
          >
            {project.icon}
          </span>
          <h3 className="text-sm font-semibold tracking-tight truncate">
            {project.title}
          </h3>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200 focus-visible:opacity-100"
              onClick={handleActionClick}
              aria-label={`Actions for ${project.title}`}
            >
              <HugeiconsIcon
                icon={MoreVerticalCircle01Icon}
                strokeWidth={2}
                className="w-4 h-4"
              />
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

      {/* Description */}
      <p
        className={cn(
          "text-xs line-clamp-2 mb-4 flex-1 leading-relaxed",
          project.description
            ? "text-muted-foreground"
            : "text-muted-foreground/60 italic",
        )}
      >
        {project.description || "No description"}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground/80 mt-auto pt-2 border-t border-border/30 tabular-nums">
        <span className="flex items-center gap-1">
          <span className="text-muted-foreground/50">Updated</span>
          {formatRelativeTime(project.updatedAt)}
        </span>
        {project.status === "archived" && (
          <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
            Archived
          </Badge>
        )}
      </div>
    </div>
  );
}
