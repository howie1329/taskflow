"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { SparklesIcon, InformationCircleIcon } from "@hugeicons/core-free-icons";
import { ChevronDown, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type ModernToolResultProps = {
  toolName: string;
  toolState: string;
  summary: string | null;
  provider: string;
  input?: unknown;
  output?: unknown;
};

type AdvancedResearchOutput = {
  summary?: string;
  sources?: Array<{ title?: string; url?: string; provider?: string }>;
  scrapedSources?: Array<{ title?: string; url?: string }>;
};

const tryParseAdvancedResearch = (output: unknown): AdvancedResearchOutput | null => {
  if (!output || typeof output !== "object") return null;
  return output as AdvancedResearchOutput;
};

export function ModernToolResult({
  toolName,
  toolState,
  summary,
  provider,
  input,
  output,
}: ModernToolResultProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const advancedData = toolName === "advancedResearch" ? tryParseAdvancedResearch(output) : null;

  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-3">
      <Collapsible defaultOpen={false}>
        <CollapsibleTrigger className="group flex w-full items-center justify-between gap-3 text-left">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={SparklesIcon} className="size-4 text-primary" strokeWidth={2} />
              <p className="text-sm font-medium">{toolName}</p>
              <Badge variant="outline" className="text-[10px] capitalize">
                {toolState.replace(/-/g, " ")}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {summary ?? "Tool finished without a summary."}
            </p>
          </div>
          <ChevronDown className="size-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-3">
          <div className="flex items-center justify-between rounded-lg bg-muted/40 p-2">
            <span className="text-xs text-muted-foreground">Provider: {provider}</span>
            <Button variant="outline" size="sm" className="h-7" onClick={() => setIsDetailsOpen(true)}>
              <HugeiconsIcon icon={InformationCircleIcon} className="size-4" strokeWidth={2} />
              Details
            </Button>
          </div>

          {advancedData?.summary && (
            <div className="rounded-lg border border-border/50 bg-background/70 p-3">
              <p className="text-xs font-medium text-muted-foreground">Agent summary</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{advancedData.summary}</p>
            </div>
          )}

          {Array.isArray(advancedData?.sources) && advancedData.sources.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Sources used</p>
              {advancedData.sources.slice(0, 5).map((source) => (
                <a
                  key={`${source.url}-${source.provider}`}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    "flex items-center justify-between rounded-lg border border-border/50 px-3 py-2",
                    "text-sm hover:bg-muted/40 transition-colors",
                  )}
                >
                  <span className="truncate">{source.title ?? source.url}</span>
                  <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
                </a>
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{toolName} details</SheetTitle>
            <SheetDescription>
              Raw input and output payloads for this tool run.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Input</p>
              <pre className="mt-2 overflow-x-auto rounded-md bg-muted/60 p-3 text-xs">
                {JSON.stringify(input ?? null, null, 2)}
              </pre>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Output</p>
              <pre className="mt-2 overflow-x-auto rounded-md bg-muted/60 p-3 text-xs">
                {JSON.stringify(output ?? null, null, 2)}
              </pre>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
