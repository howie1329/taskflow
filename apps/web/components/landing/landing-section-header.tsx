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

  return (
    <div className={cn(textAlignment, containerClasses, "mb-12", className)}>
      {(eyebrow || icon) && (
        <div className="flex items-center justify-center gap-2 mb-4">
          <Badge variant="outline" className="rounded-md font-mono text-xs">
            {icon && <span className="mr-1">{icon}</span>}
            {eyebrow}
          </Badge>
        </div>
      )}
      <h2 className="text-balance text-2xl font-medium tracking-tight lg:text-3xl mb-4">
        {title}
      </h2>
      {description && (
        <p className="text-pretty text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
