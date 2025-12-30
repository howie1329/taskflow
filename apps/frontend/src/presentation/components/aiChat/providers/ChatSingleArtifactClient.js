"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CheckIcon, CopyIcon, ExternalLinkIcon, XIcon } from "lucide-react";

function safeHost(url) {
  try {
    return new URL(url).host;
  } catch {
    return "";
  }
}

function fmtMoney(n) {
  if (typeof n !== "number" || Number.isNaN(n)) return "—";
  return `$${n < 1 ? n.toFixed(3) : n.toFixed(2)}`;
}

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function StatusBadge({ status, error }) {
  if (error) return <Badge variant="destructive">error</Badge>;
  if (status === "complete") return <Badge variant="secondary">complete</Badge>;
  if (status) return <Badge variant="outline">{status}</Badge>;
  return <Badge variant="outline">unknown</Badge>;
}

function Meta({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="text-xs font-medium break-all">{value ?? "—"}</div>
    </div>
  );
}

export const ChatSingleArtifactClient = ({ artifact }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const toolName = artifact?.toolName ?? "Tool";
  const status = artifact?.status;
  const error = artifact?.error;

  const primaryInput = useMemo(() => {
    const input = artifact?.input ?? {};
    if (typeof input?.query === "string") return input.query; // WebSearch
    try {
      const keys = Object.keys(input);
      if (!keys.length) return null;
      return JSON.stringify(input);
    } catch {
      return null;
    }
  }, [artifact]);

  const outputs = artifact?.outputs ?? {};
  const sources = Array.isArray(outputs?.sources) ? outputs.sources : [];
  const resultsCount =
    typeof outputs?.resultsCount === "number" ? outputs.resultsCount : null;

  const totalCost = outputs?.cost?.total;
  const durationMs = artifact?.duration;
  const timestamp = artifact?.timestamp;

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(artifact, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <Card className="rounded-none">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <StatusBadge status={status} error={error} />
              <Badge>{toolName}</Badge>

              {typeof totalCost === "number" && (
                <Badge variant="outline">cost {fmtMoney(totalCost)}</Badge>
              )}
              {typeof resultsCount === "number" && (
                <Badge variant="outline">{resultsCount} results</Badge>
              )}
            </div>

            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2">
                {open ? "Hide" : "Details"}
              </Button>
            </CollapsibleTrigger>
          </CardTitle>

          <div className="flex flex-col gap-1">
            {artifact?.message && (
              <div className="text-sm font-medium">{artifact.message}</div>
            )}
            {primaryInput && (
              <div className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground/80">Input:</span>{" "}
                <span className="font-mono">{primaryInput}</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CollapsibleContent className=" overflow-y-auto">
          <CardContent className="pt-4">
            {error && (
              <div className="border rounded-md p-3 bg-destructive/5">
                <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                  <XIcon className="h-4 w-4" />
                  Tool error
                </div>
                <pre className="mt-2 text-xs whitespace-pre-wrap break-words">
                  {typeof error === "string" ? error : JSON.stringify(error)}
                </pre>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Meta label="Artifact ID" value={artifact?.id ?? "—"} />
              <Meta label="Timestamp" value={fmtDate(timestamp)} />
              <Meta
                label="Duration"
                value={typeof durationMs === "number" ? `${durationMs}ms` : "—"}
              />
              <Meta
                label="Cost"
                value={
                  typeof totalCost === "number" ? fmtMoney(totalCost) : "—"
                }
              />
            </div>

            <Separator className="my-4" />

            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold">Sources</div>
              <Button
                variant="outline"
                size="sm"
                className="h-7"
                onClick={handleCopyJson}
              >
                {copied ? (
                  <>
                    <CheckIcon className="h-4 w-4" /> Copied
                  </>
                ) : (
                  <>
                    <CopyIcon className="h-4 w-4" /> Copy JSON
                  </>
                )}
              </Button>
            </div>

            <div className="mt-3">
              {sources.length === 0 ? (
                <div className="text-sm text-muted-foreground">No sources.</div>
              ) : (
                <ScrollArea className="h-[520px] pr-3">
                  <div className="flex flex-col gap-3">
                    {sources.map((s, idx) => {
                      const host = safeHost(s?.url);
                      const published = fmtDate(s?.publishedDate);

                      return (
                        <Card
                          key={s?.id ?? s?.url ?? idx}
                          className="shadow-none"
                        >
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="font-medium text-sm break-words">
                                  {s?.title ?? "Untitled source"}
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground flex flex-wrap gap-x-2 gap-y-1">
                                  {host && <span>{host}</span>}
                                  {s?.author && <span>by {s.author}</span>}
                                  <span>{published}</span>
                                </div>
                              </div>

                              {s?.url && (
                                <Button
                                  asChild
                                  variant="outline"
                                  size="sm"
                                  className="h-7"
                                >
                                  <a
                                    href={s.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="gap-2"
                                  >
                                    <ExternalLinkIcon className="h-4 w-4" />
                                    Open
                                  </a>
                                </Button>
                              )}
                            </div>

                            {s?.summary && (
                              <div className="mt-3 text-sm text-foreground/90 whitespace-pre-wrap">
                                {s.summary}
                              </div>
                            )}

                            {typeof s?.text === "string" && s.text.trim() && (
                              <>
                                <Separator className="my-3" />
                                <Collapsible>
                                  <div className="flex items-center justify-between">
                                    <div className="text-xs font-medium text-muted-foreground">
                                      Raw page text
                                    </div>
                                    <CollapsibleTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2"
                                      >
                                        Toggle
                                      </Button>
                                    </CollapsibleTrigger>
                                  </div>
                                  <CollapsibleContent>
                                    <pre className="mt-2 text-xs whitespace-pre-wrap break-words max-h-[240px] overflow-auto border rounded-md p-3 bg-muted/30 border-black border-2">
                                      {s.text}
                                    </pre>
                                  </CollapsibleContent>
                                </Collapsible>
                              </>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>

            <Separator className="my-4" />

            <div className="text-xs text-muted-foreground">
              Tip: optimized for WebSearch (query → sources), but still shows
              generic inputs/JSON for other tools.
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
