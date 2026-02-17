"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { exaAnswerResponseSchema } from "@/lib/AITools/Exa/types";
import { CodeBlock } from "./code-block";
import { ToolEmptyState, ToolResultHeader, ToolResultSection, ToolResultShell } from "./tool-result-shell";

function renderAnswer(answer: unknown) {
  if (typeof answer === "string") {
    return <p className="whitespace-pre-wrap text-sm leading-relaxed">{answer}</p>;
  }

  return <CodeBlock code={JSON.stringify(answer, null, 2)} language="json" />;
}

export function ExaAnswerCard({ output }: { output: unknown }) {
  const [showAll, setShowAll] = useState(false);
  const parsed = exaAnswerResponseSchema.safeParse(output);
  if (!parsed.success) {
    return <ToolEmptyState message="Exa answer response could not be parsed." />;
  }

  const data = parsed.data;
  const citations = data.citations ?? [];
  const visibleCitations = showAll ? citations : citations.slice(0, 5);

  return (
    <ToolResultShell>
      <ToolResultHeader
        title="Exa Answer"
        pills={[
          `${citations.length} citations`,
          data.requestId ? `id:${data.requestId.slice(0, 8)}` : "no-id",
        ]}
      />
      <ToolResultSection title="Answer">{renderAnswer(data.answer)}</ToolResultSection>
      {citations.length > 0 ? (
        <ToolResultSection title="Citations">
          <div className="divide-y divide-border/60 rounded-sm border border-border/50">
            {visibleCitations.map((citation, index) => (
              <a
                key={`${citation.url}-${index}`}
                href={citation.url}
                target="_blank"
                rel="noreferrer"
                className="block px-2.5 py-2 transition-colors hover:bg-muted/20"
              >
                <div className="text-sm font-medium">{citation.title ?? citation.url}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{citation.url}</div>
              </a>
            ))}
          </div>
          {citations.length > 5 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 h-7 px-2 text-xs"
              onClick={() => setShowAll((current) => !current)}
            >
              {showAll ? "Show less" : `Show all (${citations.length})`}
            </Button>
          ) : null}
        </ToolResultSection>
      ) : null}
    </ToolResultShell>
  );
}
