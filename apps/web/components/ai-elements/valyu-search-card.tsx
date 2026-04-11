"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { valyuSearchResponseSchema } from "@/lib/AITools/Valyu/zod"
import {
  ToolEmptyState,
  ToolResultHeader,
  ToolResultSection,
  ToolResultShell,
} from "./tool-result-shell"
import { renderValyuField } from "./valyu-content"
import { CodeBlock } from "./code-block"

type ValyuSearchVariant = "web" | "finance"

const VARIANT_CONFIG = {
  web: {
    title: "Valyu web search",
    unparsedTitle: "Valyu Web Search",
    sectionTitle: "Sources",
    emptyMessage: "No results returned from Valyu search.",
    renderMeta: (result: Record<string, unknown>) => {
      const parts = [result.source ?? "unknown source"]
      if (result.publication_date) parts.push(String(result.publication_date))
      if (typeof result.relevance_score === "number")
        parts.push(`${Math.round(result.relevance_score * 100)}%`)
      if (result.data_type) parts.push(String(result.data_type))
      return parts.join(" · ")
    },
  },
  finance: {
    title: "Valyu finance search",
    unparsedTitle: "Valyu Finance Search",
    sectionTitle: "Financial sources",
    emptyMessage: "No finance results returned from Valyu.",
    renderMeta: (result: Record<string, unknown>) => {
      const parts = [result.source ?? "unknown source"]
      if (typeof result.price === "number") parts.push(`$${result.price.toFixed(4)}`)
      if (typeof result.relevance_score === "number")
        parts.push(`${Math.round(result.relevance_score * 100)}%`)
      if (result.data_type) parts.push(String(result.data_type))
      return parts.join(" · ")
    },
  },
} as const

export function ValyuSearchCard({
  output,
  variant,
}: {
  output: unknown
  variant: ValyuSearchVariant
}) {
  const [showAll, setShowAll] = useState(false)
  const config = VARIANT_CONFIG[variant]
  const parsed = valyuSearchResponseSchema.safeParse(output)

  if (!parsed.success) {
    return (
      <ToolResultShell>
        <ToolResultHeader title={config.unparsedTitle} pills={["unparsed response"]} />
        <ToolResultSection title="Raw output">
          <CodeBlock code={JSON.stringify(output, null, 2)} language="json" />
        </ToolResultSection>
      </ToolResultShell>
    )
  }

  const data = parsed.data
  const visibleResults = showAll ? data.results : data.results.slice(0, 5)

  return (
    <ToolResultShell>
      <ToolResultHeader
        title={config.title}
        pills={[
          `${data.results.length} results`,
          data.total_deduction_dollars !== undefined
            ? `$${data.total_deduction_dollars.toFixed(4)}`
            : null,
        ].filter((value): value is string => Boolean(value))}
      />
      <ToolResultSection title="Query">
        <p className="rounded-sm bg-muted/20 px-2 py-1 font-mono text-xs">
          {data.query ?? "No query returned"}
        </p>
      </ToolResultSection>
      <ToolResultSection title={config.sectionTitle}>
        {data.results.length === 0 ? (
          <ToolEmptyState message={config.emptyMessage} />
        ) : (
          <div className="divide-y divide-border/60 rounded-sm border border-border/50">
            {visibleResults.map((result, index) => (
              <div
                key={`${result.url}-${index}`}
                className="px-2.5 py-2 transition-colors hover:bg-muted/20"
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
                  {config.renderMeta(result as unknown as Record<string, unknown>)}
                </div>
                {renderValyuField(result.description ?? result.content ?? null)}
              </div>
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
  )
}

export function ValyuWebSearchCard({ output }: { output: unknown }) {
  return <ValyuSearchCard output={output} variant="web" />
}

export function ValyuFinanceSearchCard({ output }: { output: unknown }) {
  return <ValyuSearchCard output={output} variant="finance" />
}
