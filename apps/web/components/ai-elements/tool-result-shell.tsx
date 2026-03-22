"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";

export function ToolResultShell({
  className,
  ...props
}: ComponentProps<"section">) {
  return (
    <section
      className={cn(
        "space-y-4 rounded-lg border border-border bg-card p-4 text-card-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function ToolResultHeader({
  title,
  pills,
}: {
  title: string;
  pills?: ReactNode[];
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h4 className="text-xs font-medium text-foreground/90">
        {title}
      </h4>
      {pills && pills.length > 0 ? (
        <div className="flex items-center gap-1.5">
          {pills.map((pill, index) => (
            <Badge
              key={index}
              variant="outline"
              className="h-5 rounded-sm px-1.5 font-mono text-[10px] font-medium"
            >
              {pill}
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ToolResultSection({
  title,
  className,
  children,
  ...props
}: ComponentProps<"div"> & { title: string }) {
  return (
    <div className={cn("space-y-1.5", className)} {...props}>
      <div className="text-xs text-muted-foreground">
        {title}
      </div>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

export function ToolEmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
      {message}
    </div>
  );
}
