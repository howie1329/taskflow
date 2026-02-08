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
        "rounded-md border border-border/60 bg-card/40 p-3",
        "space-y-3",
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
      <h4 className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
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
      <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        {title}
      </div>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

export function ToolEmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-border/60 bg-muted/20 p-2.5 text-sm text-muted-foreground">
      {message}
    </div>
  );
}
