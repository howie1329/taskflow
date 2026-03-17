"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "./code-block";
import {
  ToolEmptyState,
  ToolResultHeader,
  ToolResultSection,
  ToolResultShell,
} from "./tool-result-shell";

type AdvancedSource = {
  title?: string;
  url?: string;
  snippet?: string;
  provider?: string;
};

type ScrapedSource = {
  title?: string;
  url?: string;
  excerpt?: string;
  markdown?: string;
  text?: string;
};

type AdvancedResearchOutput = {
  query?: string;
  summary?: string;
  totalSources?: number;
  sources?: AdvancedSource[];
  scrapedSources?: ScrapedSource[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseAdvancedResearchOutput(
  output: unknown,
): AdvancedResearchOutput | null {
  if (!isRecord(output)) return null;

  return {
    query: typeof output.query === "string" ? output.query : undefined,
    summary: typeof output.summary === "string" ? output.summary : undefined,
    totalSources:
      typeof output.totalSources === "number" ? output.totalSources : undefined,
    sources: Array.isArray(output.sources)
      ? (output.sources.filter(isRecord) as AdvancedSource[])
      : [],
    scrapedSources: Array.isArray(output.scrapedSources)
      ? (output.scrapedSources.filter(isRecord) as ScrapedSource[])
      : [],
  };
}

export function AdvancedResearchCard({ output }: { output: unknown }) {
  const [showAllSources, setShowAllSources] = useState(false);
  const [showAllScraped, setShowAllScraped] = useState(false);
  const parsed = parseAdvancedResearchOutput(output);

  if (!parsed) {
    return (
      <ToolResultShell>
        <ToolResultHeader title="Advanced Research" pills={["unparsed response"]} />
        <ToolResultSection title="Raw output">
          <CodeBlock code={JSON.stringify(output, null, 2)} language="json" />
        </ToolResultSection>
      </ToolResultShell>
    );
  }

  const sources = parsed.sources ?? [];
  const scrapedSources = parsed.scrapedSources ?? [];
  const visibleSources = showAllSources ? sources : sources.slice(0, 5);
  const visibleScrapedSources = showAllScraped
    ? scrapedSources
    : scrapedSources.slice(0, 3);

  return (
    <ToolResultShell>
      <ToolResultHeader
        title="Advanced Research"
        pills={[
          typeof parsed.totalSources === "number"
            ? `${parsed.totalSources} sources`
            : sources.length > 0
              ? `${sources.length} sources`
              : null,
          scrapedSources.length > 0 ? `${scrapedSources.length} scraped` : null,
        ].filter((value): value is string => Boolean(value))}
      />

      {parsed.query ? (
        <ToolResultSection title="Query">
          <p className="rounded-sm bg-muted/20 px-2 py-1 font-mono text-xs">
            {parsed.query}
          </p>
        </ToolResultSection>
      ) : null}

      {parsed.summary ? (
        <ToolResultSection title="Summary">
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {parsed.summary}
          </p>
        </ToolResultSection>
      ) : null}

      <ToolResultSection title="Sources">
        {sources.length === 0 ? (
          <ToolEmptyState message="No research sources were returned." />
        ) : (
          <div className="divide-y divide-border/60 rounded-sm border border-border/50">
            {visibleSources.map((source, index) => (
              <div key={`${source.url ?? source.title ?? index}-${index}`}>
                {source.url ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block px-2.5 py-2 transition-colors hover:bg-muted/20"
                  >
                    <div className="text-sm font-medium">
                      {source.title ?? source.url ?? "Untitled source"}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {source.provider ?? "research"}
                    </div>
                    {source.snippet ? (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {source.snippet}
                      </p>
                    ) : null}
                  </a>
                ) : (
                  <div className="px-2.5 py-2">
                    <div className="text-sm font-medium">
                      {source.title ?? "Untitled source"}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {source.provider ?? "research"}
                    </div>
                    {source.snippet ? (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {source.snippet}
                      </p>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {sources.length > 5 ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 h-7 px-2 text-xs"
            onClick={() => setShowAllSources((current) => !current)}
          >
            {showAllSources ? "Show less" : `Show all (${sources.length})`}
          </Button>
        ) : null}
      </ToolResultSection>

      {scrapedSources.length > 0 ? (
        <ToolResultSection title="Scraped pages">
          <div className="divide-y divide-border/60 rounded-sm border border-border/50">
            {visibleScrapedSources.map((source, index) => (
              <div
                key={`${source.url ?? source.title ?? index}-${index}`}
                className="px-2.5 py-2"
              >
                {source.url ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium underline-offset-4 hover:underline"
                  >
                    {source.title ?? source.url}
                  </a>
                ) : (
                  <div className="text-sm font-medium">
                    {source.title ?? "Untitled page"}
                  </div>
                )}
                {source.excerpt ? (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {source.excerpt}
                  </p>
                ) : null}
                {source.text || source.markdown ? (
                  <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">
                    {source.text ?? source.markdown}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
          {scrapedSources.length > 3 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 h-7 px-2 text-xs"
              onClick={() => setShowAllScraped((current) => !current)}
            >
              {showAllScraped ? "Show less" : `Show all (${scrapedSources.length})`}
            </Button>
          ) : null}
        </ToolResultSection>
      ) : null}
    </ToolResultShell>
  );
}
