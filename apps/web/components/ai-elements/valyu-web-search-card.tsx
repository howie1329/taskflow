"use client";

import { valyuSearchResponseSchema } from "@/lib/AITools/Valyu/zod";
import { ToolEmptyState, ToolResultHeader, ToolResultSection, ToolResultShell } from "./tool-result-shell";
import { renderValyuField } from "./valyu-content";
import { CodeBlock } from "./code-block";

export function ValyuWebSearchCard({ output }: { output: unknown }) {
  const parsed = valyuSearchResponseSchema.safeParse(output);
  if (!parsed.success) {
    return (
      <ToolResultShell>
        <ToolResultHeader title="Valyu Web Search" pills={["unparsed response"]} />
        <ToolResultSection title="Raw Output">
          <CodeBlock code={JSON.stringify(output, null, 2)} language="json" />
        </ToolResultSection>
      </ToolResultShell>
    );
  }

  const data = parsed.data;

  return (
    <ToolResultShell>
      <ToolResultHeader
        title="Valyu Web Search"
        pills={[
          `${data.results.length} results`,
          data.total_deduction_dollars !== undefined
            ? `$${data.total_deduction_dollars.toFixed(4)}`
            : "cost n/a",
        ]}
      />
      <ToolResultSection title="Query">
        <p className="rounded-sm border border-border/50 bg-muted/20 px-2 py-1 font-mono text-xs">
          {data.query ?? "No query returned"}
        </p>
      </ToolResultSection>
      <ToolResultSection title="Sources">
        {data.results.length === 0 ? (
          <ToolEmptyState message="No results returned from Valyu search." />
        ) : (
          <div className="space-y-2">
            {data.results.slice(0, 8).map((result, index) => (
              <div
                key={`${result.url}-${index}`}
                className="block rounded-sm border border-border/50 px-2.5 py-2 transition-colors hover:bg-muted/30"
              >
                {result.url ? (
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium underline-offset-4 hover:underline"
                  >
                    {result.title ?? result.url ?? "Untitled result"}
                  </a>
                ) : (
                  <div className="text-sm font-medium">
                    {result.title ?? "Untitled result"}
                  </div>
                )}
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {result.source ?? "unknown source"}
                  {result.publication_date ? ` · ${result.publication_date}` : ""}
                  {typeof result.relevance_score === "number"
                    ? ` · ${Math.round(result.relevance_score * 100)}%`
                    : ""}
                  {result.data_type ? ` · ${result.data_type}` : ""}
                </div>
                {renderValyuField(result.description ?? result.content ?? null)}
              </div>
            ))}
          </div>
        )}
      </ToolResultSection>
    </ToolResultShell>
  );
}
