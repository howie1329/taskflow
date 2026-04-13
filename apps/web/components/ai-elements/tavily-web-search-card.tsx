"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { TavilyWebSearchOutput } from "@/lib/AITools/Tavily/types";
import { getDomain } from "@/lib/utils/url";
import {
  ToolEmptyState,
  ToolResultHeader,
  ToolResultSection,
  ToolResultShell,
} from "./tool-result-shell";

type TavilyWebSearchCardProps = TavilyWebSearchOutput;

export function TavilyWebSearchCard({
  query,
  answer,
  results,
  images,
  responseTime,
}: TavilyWebSearchCardProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleResults = showAll ? results : results.slice(0, 5);

  return (
    <ToolResultShell>
      <ToolResultHeader
        title="Tavily web search"
        pills={[`${results.length} sources`, `${responseTime.toFixed(2)}s`]}
      />
      <ToolResultSection title="Query">
        <p className="rounded-sm bg-muted/20 px-2 py-1 font-mono text-xs">
          {query}
        </p>
      </ToolResultSection>

      {answer ? (
        <ToolResultSection title="Summary">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{answer}</p>
        </ToolResultSection>
      ) : null}

      <ToolResultSection title="Sources">
        {results.length === 0 ? (
          <ToolEmptyState message="No sources returned." />
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
                <div className="text-sm font-medium">
                  {result.title || result.url || "Untitled source"}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {getDomain(result.url)}
                  {result.publishedDate ? ` · ${result.publishedDate}` : ""}
                  {typeof result.score === "number"
                    ? ` · ${Math.round(result.score * 100)}%`
                    : ""}
                </div>
                {result.content ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {result.content}
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

      {images?.[0] ? (
        <ToolResultSection title="Image">
          <a
            href={images[0]}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted-foreground underline underline-offset-4"
          >
            Open related image
          </a>
        </ToolResultSection>
      ) : null}
    </ToolResultShell>
  );
}
