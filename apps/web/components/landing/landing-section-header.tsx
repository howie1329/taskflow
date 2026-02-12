import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface LandingSectionHeaderProps {
  eyebrow?: string;
  icon?: ReactNode;
  title: string;
  description?: string;
  className?: string;
  align?: "center" | "left";
  children?: ReactNode;
}

export function LandingSectionHeader({
  eyebrow,
  icon,
  title,
  description,
  className,
  align = "center",
  children,
}: LandingSectionHeaderProps) {
  const textAlignment = align === "center" ? "text-center" : "text-left";
  const containerClasses = align === "center" ? "mx-auto max-w-3xl" : "";
  const badgeAlignment =
    align === "center" ? "justify-center" : "justify-start";
  const descriptionClasses =
    align === "center" ? "mx-auto max-w-[62ch]" : "max-w-[62ch]";

  return (
    <div className={cn(textAlignment, containerClasses, "mb-12", className)}>
      {(eyebrow || icon) && (
        <div className={cn("mb-4 flex items-center gap-2", badgeAlignment)}>
          <Badge
            variant="outline"
            className="rounded-full border-border/50 px-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
          >
            {icon && <span className="mr-1">{icon}</span>}
            {eyebrow}
          </Badge>
        </div>
      )}
      <h2 className="mb-4 text-balance text-[1.8rem] font-medium leading-tight tracking-tight lg:text-[2.1rem]">
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "text-pretty text-sm leading-relaxed text-muted-foreground",
            descriptionClasses,
          )}
        >
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
