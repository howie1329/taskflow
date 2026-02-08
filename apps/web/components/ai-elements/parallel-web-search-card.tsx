"use client";

import { parallelSearchResponseSchema } from "@/lib/AITools/ParallelAi/types";
import { ToolEmptyState, ToolResultHeader, ToolResultSection, ToolResultShell } from "./tool-result-shell";

export function ParallelWebSearchCard({ output }: { output: unknown }) {
  const parsed = parallelSearchResponseSchema.safeParse(output);
  if (!parsed.success) {
    return <ToolEmptyState message="Parallel search output could not be parsed." />;
  }

  const results = parsed.data.results ?? [];

  return (
    <ToolResultShell>
      <ToolResultHeader title="Parallel Web Search" pills={[`${results.length} results`]} />
      <ToolResultSection title="Sources">
        {results.length === 0 ? (
          <ToolEmptyState message="No search results were returned." />
        ) : (
          <div className="space-y-2">
            {results.slice(0, 8).map((result, index) => (
              <a
                key={`${result.url ?? index}-${index}`}
                href={result.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-sm border border-border/50 px-2.5 py-2 transition-colors hover:bg-muted/30"
              >
                <div className="text-sm font-medium">{result.title ?? result.url ?? "Untitled result"}</div>
                {result.source ? (
                  <div className="mt-0.5 text-xs text-muted-foreground">{result.source}</div>
                ) : null}
                {result.excerpt ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{result.excerpt}</p>
                ) : null}
              </a>
            ))}
          </div>
        )}
      </ToolResultSection>
    </ToolResultShell>
  );
}
