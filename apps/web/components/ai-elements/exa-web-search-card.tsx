"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { exaSearchResponseSchema } from "@/lib/AITools/Exa/types";
import { ToolEmptyState, ToolResultHeader, ToolResultSection, ToolResultShell } from "./tool-result-shell";

function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function ExaWebSearchCard({ output }: { output: unknown }) {
  const [showAll, setShowAll] = useState(false);
  const parsed = exaSearchResponseSchema.safeParse(output);
  if (!parsed.success) {
    return <ToolEmptyState message="Exa returned an unexpected response shape." />;
  }

  const data = parsed.data;
  const visibleResults = showAll ? data.results : data.results.slice(0, 5);

  return (
    <ToolResultShell>
      <ToolResultHeader
        title="Exa Web Search"
        pills={[
          `${data.results.length} results`,
          data.requestId ? `id:${data.requestId.slice(0, 8)}` : "no-id",
        ]}
      />
      {data.context ? (
        <ToolResultSection title="Context">
          <p className="line-clamp-2 text-sm text-muted-foreground">{data.context}</p>
        </ToolResultSection>
      ) : null}
      <ToolResultSection title="Sources">
        {data.results.length === 0 ? (
          <ToolEmptyState message="No results returned." />
        ) : (
          <div className="divide-y divide-border/60 rounded-sm border border-border/50">
            {visibleResults.map((result, index) => (
              <a
                key={`${result.url}-${index}`}
                href={result.url}
                target="_blank"
                rel="noreferrer"
                className="block px-2.5 py-2 transition-colors hover:bg-muted/20"
              >
                <div className="text-sm font-medium">{result.title ?? "Untitled source"}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {getDomain(result.url)}
                  {result.publishedDate ? ` · ${result.publishedDate}` : ""}
                </div>
                {result.summary ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{result.summary}</p>
                ) : null}
              </a>
            ))}
          </div>
        )}
        {data.results.length > 5 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 h-7 px-2 text-xs"
            onClick={() => setShowAll((current) => !current)}
          >
            {showAll ? "Show less" : `Show all (${data.results.length})`}
          </Button>
        ) : null}
      </ToolResultSection>
    </ToolResultShell>
  );
}
