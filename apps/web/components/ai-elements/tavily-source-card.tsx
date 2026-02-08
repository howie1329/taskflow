"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ExternalLink, Check, Copy, ChevronDown, ChevronUp } from "lucide-react";
import type { TavilyResult } from "@/lib/AITools/Tavily/types";

interface TavilySourceCardProps {
  result: TavilyResult;
  index: number;
}

function getScoreColor(score: number): string {
  if (score >= 0.9)
    return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  if (score >= 0.7) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
  return "bg-rose-500/10 text-rose-500 border-rose-500/20";
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export function TavilySourceCard({ result, index }: TavilySourceCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleCopyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(result.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  }, [result.url]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsExpanded(!isExpanded);
      }
    },
    [isExpanded],
  );

  return (
    <article
      className="group rounded-sm border border-border/50 bg-card/30 px-3 py-2.5 transition-colors hover:bg-muted/20"
      role="article"
      aria-label={`Source ${index + 1}: ${result.title}`}
    >
      <div className="flex items-start gap-2">
        {!imageError && result.favicon ? (
          <img
            src={result.favicon}
            alt=""
            className="mt-0.5 h-4 w-4 rounded-sm flex-shrink-0"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-sm bg-muted">
            <ExternalLink className="h-2.5 w-2.5 text-muted-foreground" />
          </div>
        )}
        <a
          href={result.url}
          target="_blank"
          rel="noreferrer"
          className="line-clamp-2 text-sm font-medium leading-5 hover:underline"
        >
          {result.title}
        </a>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopyUrl}
          className="ml-auto h-6 w-6 p-0 text-muted-foreground"
          aria-label={copied ? "URL copied" : "Copy URL"}
        >
          {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>

      <div className="mt-2 flex items-center gap-2">
        {result.score !== undefined ? (
          <Badge variant="outline" className={cn("h-5 rounded-sm text-[10px]", getScoreColor(result.score))}>
            {Math.round(result.score * 100)}%
          </Badge>
        ) : null}
        {result.publishedDate ? (
          <span className="text-[11px] text-muted-foreground">{formatDate(result.publishedDate)}</span>
        ) : null}
      </div>

      <div
        className={cn(
          "mt-2 overflow-hidden text-xs leading-5 text-muted-foreground transition-all duration-200",
          isExpanded ? "max-h-[360px]" : "max-h-10",
        )}
        role="region"
        aria-expanded={isExpanded}
      >
        <p>{result.content}</p>
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={handleKeyDown}
        className="mt-1 h-6 px-1 text-[11px] text-muted-foreground hover:text-foreground"
        aria-expanded={isExpanded}
      >
        {isExpanded ? (
          <>
            <ChevronUp className="mr-1 h-3 w-3" />
            Show less
          </>
        ) : (
          <>
            <ChevronDown className="mr-1 h-3 w-3" />
            Read more
          </>
        )}
      </Button>
    </article>
  );
}
