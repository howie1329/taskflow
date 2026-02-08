"use client";

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
  const parsed = exaAnswerResponseSchema.safeParse(output);
  if (!parsed.success) {
    return <ToolEmptyState message="Exa answer response could not be parsed." />;
  }

  const data = parsed.data;
  const citations = data.citations ?? [];

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
          <div className="space-y-2">
            {citations.slice(0, 6).map((citation, index) => (
              <a
                key={`${citation.url}-${index}`}
                href={citation.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-sm border border-border/50 px-2.5 py-2 transition-colors hover:bg-muted/30"
              >
                <div className="text-sm font-medium">{citation.title ?? citation.url}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{citation.url}</div>
              </a>
            ))}
          </div>
        </ToolResultSection>
      ) : null}
    </ToolResultShell>
  );
}
