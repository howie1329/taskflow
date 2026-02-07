"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  ExternalLink,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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
    <TooltipProvider>
      <Card
        className={cn(
          "group relative overflow-hidden transition-all duration-300 ease-out",
          "hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5",
        )}
        role="article"
        aria-label={`Source ${index + 1}: ${result.title}`}
      >
        <CardHeader className="pb-2 space-y-2">
          {/* Title Row with Favicon */}
          <div className="flex items-start gap-2">
            {!imageError && result.favicon ? (
              <img
                src={result.favicon}
                alt=""
                className="w-5 h-5 rounded-sm flex-shrink-0 mt-0.5"
                onError={() => setImageError(true)}
                loading="lazy"
              />
            ) : (
              <div className="w-5 h-5 rounded-sm bg-muted flex-shrink-0 mt-0.5 flex items-center justify-center">
                <ExternalLink className="w-3 h-3 text-muted-foreground" />
              </div>
            )}
            <a
              href={result.url}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 rounded"
              tabIndex={0}
            >
              {result.title}
            </a>
          </div>

          {/* Metadata Row */}
          <div className="flex items-center gap-2 flex-wrap">
            {result.score !== undefined && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-medium cursor-help",
                      getScoreColor(result.score),
                    )}
                  >
                    {Math.round(result.score * 100)}%
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Relevance score based on query match</p>
                </TooltipContent>
              </Tooltip>
            )}
            {result.publishedDate && (
              <span className="text-xs text-muted-foreground">
                {formatDate(result.publishedDate)}
              </span>
            )}

            {/* Copy URL Button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyUrl}
                  className="h-6 w-6 p-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={copied ? "URL copied" : "Copy URL"}
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{copied ? "Copied!" : "Copy URL"}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-2">
          {/* Content Preview */}
          <div
            className={cn(
              "text-sm text-foreground/80 overflow-hidden transition-all duration-300 ease-in-out",
              isExpanded ? "max-h-[500px]" : "max-h-[4.5rem]",
            )}
            role="region"
            aria-expanded={isExpanded}
          >
            <p className="leading-relaxed">{result.content}</p>
          </div>

          {/* Expand Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            onKeyDown={handleKeyDown}
            className="text-xs text-primary hover:text-primary/80 h-auto py-1 px-0 flex items-center gap-1"
            aria-expanded={isExpanded}
            aria-controls={`content-${index}`}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-3 h-3" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                Read more
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
