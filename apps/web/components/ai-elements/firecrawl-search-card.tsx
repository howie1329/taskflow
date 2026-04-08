"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { firecrawlSearchResponseSchema } from "@/lib/AITools/Firecrawl/types";
import { CodeBlock } from "./code-block";
import {
  ToolEmptyState,
  ToolResultHeader,
  ToolResultSection,
  ToolResultShell,
} from "./tool-result-shell";

function getInputQuery(input: unknown) {
  if (!input || typeof input !== "object") return null;
  const query = (input as Record<string, unknown>).query;
  return typeof query === "string" ? query : null;
}

export function FirecrawlSearchCard({
  input,
  output,
}: {
  input?: unknown;
  output: unknown;
}) {
  const [showAll, setShowAll] = useState(false);
  const parsed = firecrawlSearchResponseSchema.safeParse(output);
  if (!parsed.success) {
    return (
      <ToolResultShell>
        <ToolResultHeader title="Firecrawl Search" pills={["unparsed response"]} />
        <ToolResultSection title="Raw output">
          <CodeBlock code={JSON.stringify(output, null, 2)} language="json" />
        </ToolResultSection>
      </ToolResultShell>
    );
  }

  const data = parsed.data;
  const results = data.data ?? [];
  const visibleResults = showAll ? results : results.slice(0, 5);
  const query = getInputQuery(input);

  return (
    <ToolResultShell>
      <ToolResultHeader
        title="Firecrawl Search"
        pills={[
          `${results.length} pages`,
          data.creditsUsed !== undefined ? `${data.creditsUsed} credits` : null,
        ].filter((value): value is string => Boolean(value))}
      />
      {query ? (
        <ToolResultSection title="Query">
          <p className="rounded-sm bg-muted/20 px-2 py-1 font-mono text-xs">
            {query}
          </p>
        </ToolResultSection>
      ) : null}
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
        {results.length === 0 ? (
          <ToolEmptyState message="No pages were returned by Firecrawl search." />
        ) : (
          <div className="divide-y divide-border/60 rounded-sm border border-border/50">
            {visibleResults.map((result, index) => (
              <a
                key={`${result.url ?? index}-${index}`}
                href={result.url}
                target="_blank"
                rel="noreferrer"
                className="block px-2.5 py-2 transition-colors hover:bg-muted/20"
              >
                <div className="text-sm font-medium">
                  {result.title ?? result.url ?? "Untitled page"}
                </div>
                {result.description ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {result.description}
                  </p>
                ) : null}
              </a>
            ))}
          </div>
        )}
        {results.length > 5 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 h-7 px-2 text-xs"
            onClick={() => setShowAll((current) => !current)}
          >
            {showAll ? "Show less" : `Show all (${results.length})`}
          </Button>
        ) : null}
      </ToolResultSection>
    </ToolResultShell>
  );
}
