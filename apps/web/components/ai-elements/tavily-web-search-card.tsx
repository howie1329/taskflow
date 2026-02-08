"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Search, Clock, Globe, ImageIcon } from "lucide-react";
import type { TavilyWebSearchOutput } from "@/lib/AITools/Tavily/types";
import { TavilySourceCard } from "./tavily-source-card";
import { TavilyImageCard } from "./tavily-image-card";

interface TavilyWebSearchCardProps extends TavilyWebSearchOutput {}

const DEFAULT_VISIBLE_RESULTS = 6;

export function TavilyWebSearchCard({
  query,
  answer,
  results,
  images,
  responseTime,
}: TavilyWebSearchCardProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(DEFAULT_VISIBLE_RESULTS);

  const filteredResults = useMemo(() => {
    if (!searchTerm.trim()) return results;

    const term = searchTerm.toLowerCase();
    return results.filter(
      (result) =>
        result.title.toLowerCase().includes(term) ||
        result.content.toLowerCase().includes(term) ||
        result.url.toLowerCase().includes(term),
    );
  }, [results, searchTerm]);

  const visibleResults = filteredResults.slice(0, visibleCount);
  const canShowMore = visibleCount < filteredResults.length;

  return (
    <div className="space-y-4">
      <section className="rounded-md border border-border/60 bg-card/40 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            <Search className="h-3.5 w-3.5" />
            Web Search
          </h4>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="h-5 rounded-sm px-1.5 font-mono text-[10px]">
              {results.length} sources
            </Badge>
            <Badge variant="outline" className="h-5 rounded-sm px-1.5 font-mono text-[10px]">
              <Clock className="mr-1 h-3 w-3" />
              {responseTime.toFixed(2)}s
            </Badge>
          </div>
        </div>

        <div className="mt-3 rounded-sm border border-border/50 bg-muted/20 px-2 py-1.5 font-mono text-xs text-foreground">
          {query}
        </div>
      </section>

      {answer ? (
        <section className="rounded-md border border-border/60 bg-card/40 p-3">
          <h5 className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Summary</h5>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{answer}</p>
        </section>
      ) : null}

      {results.length > 0 ? (
        <section className="space-y-3 rounded-md border border-border/60 bg-card/40 p-3">
          <div className="flex items-center justify-between gap-2">
            <h5 className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              <Globe className="h-3.5 w-3.5" />
              Sources
            </h5>
            <Badge variant="outline" className="h-5 rounded-sm px-1.5 font-mono text-[10px]">
              {filteredResults.length}/{results.length}
            </Badge>
          </div>

          {results.length >= 6 ? (
            <Input
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setVisibleCount(DEFAULT_VISIBLE_RESULTS);
              }}
              placeholder="Search within results"
              className="h-8 rounded-sm text-xs"
            />
          ) : null}

          <div className="space-y-2">
            {visibleResults.length === 0 ? (
              <p className="text-xs text-muted-foreground">No sources match this search.</p>
            ) : (
              visibleResults.map((result, index) => (
                <TavilySourceCard key={`${result.url}-${index}`} result={result} index={index} />
              ))
            )}
          </div>

          {canShowMore ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVisibleCount(filteredResults.length)}
              className="h-7 rounded-sm px-2 text-xs"
            >
              Show more
            </Button>
          ) : null}
        </section>
      ) : null}

      {images && images.length > 0 ? (
        <section className="rounded-md border border-border/60 bg-card/40 p-3">
          <Separator className="mb-3" />
          <h5 className="mb-2 flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            <ImageIcon className="h-3.5 w-3.5" />
            Related Image
          </h5>
          <TavilyImageCard image={images[0]} title="Search result image" />
        </section>
      ) : null}
    </div>
  );
}
