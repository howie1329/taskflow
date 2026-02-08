"use client";

import type { SearchResponse } from "@/lib/AITools/Valyu/types";
import { ToolEmptyState, ToolResultHeader, ToolResultSection, ToolResultShell } from "./tool-result-shell";

function isValyuOutput(output: unknown): output is SearchResponse {
  if (!output || typeof output !== "object") return false;
  const value = output as Record<string, unknown>;
  return Array.isArray(value.results);
}

export function ValyuFinanceSearchCard({ output }: { output: unknown }) {
  if (!isValyuOutput(output)) {
    return <ToolEmptyState message="Valyu finance response was not in the expected format." />;
  }

  const data = output;

  return (
    <ToolResultShell>
      <ToolResultHeader
        title="Valyu Finance Search"
        pills={[
          `${data.results.length} results`,
          data.total_deduction_dollars !== undefined
            ? `$${data.total_deduction_dollars.toFixed(4)}`
            : "cost n/a",
        ]}
      />
      <ToolResultSection title="Query">
        <p className="rounded-sm border border-border/50 bg-muted/20 px-2 py-1 font-mono text-xs">
          {data.query}
        </p>
      </ToolResultSection>
      <ToolResultSection title="Financial Sources">
        {data.results.length === 0 ? (
          <ToolEmptyState message="No finance results returned from Valyu." />
        ) : (
          <div className="space-y-2">
            {data.results.slice(0, 8).map((result, index) => (
              <a
                key={`${result.url}-${index}`}
                href={result.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-sm border border-border/50 px-2.5 py-2 transition-colors hover:bg-muted/30"
              >
                <div className="text-sm font-medium">{result.title}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {result.source}
                  {typeof result.price === "number" ? ` · $${result.price.toFixed(4)}` : ""}
                  {typeof result.relevance_score === "number"
                    ? ` · ${Math.round(result.relevance_score * 100)}%`
                    : ""}
                </div>
                {result.description ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {result.description}
                  </p>
                ) : (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{result.content}</p>
                )}
              </a>
            ))}
          </div>
        )}
      </ToolResultSection>
    </ToolResultShell>
  );
}
