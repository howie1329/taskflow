"use client";

import { CodeBlock } from "./code-block";

export function renderValyuField(value: unknown) {
  if (value === null || value === undefined) return null;

  if (typeof value === "string") {
    return <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{value}</p>;
  }

  if (typeof value === "object") {
    return (
      <div className="mt-1 rounded-sm border border-border/50 bg-muted/20">
        <CodeBlock code={JSON.stringify(value, null, 2)} language="json" />
      </div>
    );
  }

  return <p className="mt-1 text-xs text-muted-foreground">{String(value)}</p>;
}
