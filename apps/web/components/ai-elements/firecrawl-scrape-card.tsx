"use client";

import { useMemo, useState } from "react";
import { firecrawlScrapeResponseSchema } from "@/lib/AITools/Firecrawl/types";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "./code-block";
import { ToolEmptyState, ToolResultHeader, ToolResultSection, ToolResultShell } from "./tool-result-shell";

type FormatKey = "markdown" | "text" | "html";

export function FirecrawlScrapeCard({ output }: { output: unknown }) {
  const parsed = firecrawlScrapeResponseSchema.safeParse(output);
  const [selectedFormat, setSelectedFormat] = useState<FormatKey>("markdown");

  if (!parsed.success) {
    return <ToolEmptyState message="Firecrawl scrape returned an unexpected response." />;
  }

  const data = parsed.data;
  const scrapeData = data.data;

  const formats = useMemo(() => {
    if (!scrapeData) return [] as FormatKey[];
    return (["markdown", "text", "html"] as const).filter((key) => Boolean(scrapeData[key]));
  }, [scrapeData]);

  const activeFormat = formats.includes(selectedFormat) ? selectedFormat : formats[0];
  const content = activeFormat && scrapeData ? scrapeData[activeFormat] : undefined;

  return (
    <ToolResultShell>
      <ToolResultHeader
        title="Firecrawl Scrape"
        pills={[
          scrapeData?.url ? "url loaded" : "url n/a",
          data.creditsUsed !== undefined ? `${data.creditsUsed} credits` : "credits n/a",
        ]}
      />
      {scrapeData?.url ? (
        <ToolResultSection title="URL">
          <a
            href={scrapeData.url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-muted-foreground underline underline-offset-4"
          >
            {scrapeData.url}
          </a>
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
      <ToolResultSection title="Content">
        {formats.length === 0 || !content ? (
          <ToolEmptyState message="No scrape content was returned." />
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              {formats.map((format) => (
                <Button
                  key={format}
                  type="button"
                  variant={activeFormat === format ? "secondary" : "ghost"}
                  size="sm"
                  className="h-7 rounded-sm px-2 text-xs capitalize"
                  onClick={() => setSelectedFormat(format)}
                >
                  {format}
                </Button>
              ))}
            </div>
            <div className="rounded-sm border border-border/50 bg-muted/20">
              <CodeBlock code={content} language={activeFormat === "html" ? "html" : "markdown"} />
            </div>
          </div>
        )}
      </ToolResultSection>
    </ToolResultShell>
  );
}
