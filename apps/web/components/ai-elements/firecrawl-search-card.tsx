"use client";

import { firecrawlSearchResponseSchema } from "@/lib/AITools/Firecrawl/types";
import { ToolEmptyState, ToolResultHeader, ToolResultSection, ToolResultShell } from "./tool-result-shell";

export function FirecrawlSearchCard({ output }: { output: unknown }) {
  const parsed = firecrawlSearchResponseSchema.safeParse(output);
  if (!parsed.success) {
    return <ToolEmptyState message="Firecrawl search returned an unexpected response." />;
  }

  const data = parsed.data;
  const results = data.data ?? [];

  return (
    <ToolResultShell>
      <ToolResultHeader
        title="Firecrawl Search"
        pills={[
          `${results.length} pages`,
          data.creditsUsed !== undefined ? `${data.creditsUsed} credits` : "credits n/a",
        ]}
      />
      {data.warning ? (
        <ToolResultSection title="Warning">
          <p className="text-xs text-amber-600">{data.warning}</p>
        </ToolResultSection>
      ) : null}
      {data.error ? (
        <ToolResultSection title="Error">
          <p className="text-xs text-destructive">{data.error}</p>
        </ToolResultSection>
      ) : null}
      <ToolResultSection title="Sources">
        <div className="space-y-2">
          {results.length === 0 ? (
            <ToolEmptyState message="No pages were returned by Firecrawl search." />
          ) : (
            results.slice(0, 8).map((result, index) => (
              <a
                key={`${result.url ?? index}-${index}`}
                href={result.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-sm border border-border/50 px-2.5 py-2 transition-colors hover:bg-muted/30"
              >
                <div className="text-sm font-medium">{result.title ?? result.url ?? "Untitled page"}</div>
                {result.description ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{result.description}</p>
                ) : null}
              </a>
            ))
          )}
        </div>
      </ToolResultSection>
    </ToolResultShell>
  );
}
