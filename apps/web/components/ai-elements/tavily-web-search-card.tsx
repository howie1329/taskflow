"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Search, Clock, Globe, Filter, ArrowUpDown, X } from "lucide-react";
import type { TavilyWebSearchOutput } from "@/lib/AITools/Tavily/types";
import { TavilySourceCard } from "./tavily-source-card";
import { TavilyImageCard } from "./tavily-image-card";

type SortOption = "relevance" | "date" | "alphabetical";
type FilterOption = "all" | "high" | "medium" | "low";

interface TavilyWebSearchCardProps extends TavilyWebSearchOutput {}

export function TavilyWebSearchCard({
  query,
  answer,
  results,
  images,
  responseTime,
}: TavilyWebSearchCardProps) {
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort results
  const processedResults = useMemo(() => {
    let filtered = [...results];

    // Apply text filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (result) =>
          result.title.toLowerCase().includes(term) ||
          result.content.toLowerCase().includes(term),
      );
    }

    // Apply relevance filter
    if (filterBy !== "all") {
      filtered = filtered.filter((result) => {
        const score = result.score ?? 0;
        if (filterBy === "high") return score >= 0.9;
        if (filterBy === "medium") return score >= 0.7 && score < 0.9;
        if (filterBy === "low") return score < 0.7;
        return true;
      });
    }

    // Sort results
    filtered.sort((a, b) => {
      if (sortBy === "relevance") {
        return (b.score ?? 0) - (a.score ?? 0);
      }
      if (sortBy === "date") {
        const dateA = a.publishedDate ? new Date(a.publishedDate).getTime() : 0;
        const dateB = b.publishedDate ? new Date(b.publishedDate).getTime() : 0;
        return dateB - dateA;
      }
      if (sortBy === "alphabetical") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return filtered;
  }, [results, sortBy, filterBy, searchTerm]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setFilterBy("all");
    setSortBy("relevance");
  }, []);

  const hasActiveFilters = searchTerm || filterBy !== "all";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Answer Summary Section */}
      {answer && (
        <Card className="bg-muted/30 border-border/50 animate-in slide-in-from-top-2 duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <Search className="w-4 h-4" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed">{answer}</p>
          </CardContent>
        </Card>
      )}

      {/* Results Grid Section */}
      {results.length > 0 && (
        <div className="space-y-4">
          {/* Header with Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Sources
              </h4>
              <Badge variant="outline" className="text-xs">
                {processedResults.length} of {results.length}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={cn("h-8 px-2 text-xs", showFilters && "bg-muted")}
              >
                <Filter className="w-3 h-3 mr-1" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </Button>
            </div>
          </div>

          {/* Filter Controls */}
          {showFilters && (
            <div className="p-3 bg-muted/50 rounded-lg space-y-3 animate-in slide-in-from-top-1 duration-200">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Search sources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Select
                    value={filterBy}
                    onValueChange={(v) => setFilterBy(v as FilterOption)}
                  >
                    <SelectTrigger className="w-[140px] h-8 text-xs">
                      <SelectValue placeholder="Filter by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All scores</SelectItem>
                      <SelectItem value="high">High (90%+)</SelectItem>
                      <SelectItem value="medium">Medium (70-89%)</SelectItem>
                      <SelectItem value="low">Low (&lt;70%)</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={sortBy}
                    onValueChange={(v) => setSortBy(v as SortOption)}
                  >
                    <SelectTrigger className="w-[140px] h-8 text-xs">
                      <ArrowUpDown className="w-3 h-3 mr-1" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="alphabetical">A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="h-7 text-xs text-muted-foreground"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear filters
                </Button>
              )}
            </div>
          )}

          {/* Results Grid */}
          {processedResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {processedResults.slice(0, 9).map((result, index) => (
                <TavilySourceCard
                  key={`${result.url}-${index}`}
                  result={result}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No sources match your filters</p>
              <Button
                variant="link"
                size="sm"
                onClick={handleClearFilters}
                className="mt-1"
              >
                Clear filters
              </Button>
            </div>
          )}

          {/* Show remaining count */}
          {processedResults.length > 9 && (
            <p className="text-xs text-muted-foreground text-center">
              +{processedResults.length - 9} more sources
            </p>
          )}
        </div>
      )}

      {/* Single Image Section */}
      {images && images.length > 0 && (
        <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-300">
          <Separator />
          <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Search className="w-4 h-4" />
            Related Image
          </h4>
          <div className="flex justify-center md:justify-start">
            <TavilyImageCard image={images[0]} title="Search result image" />
          </div>
        </div>
      )}

      {/* Metadata Footer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-muted-foreground pt-2 border-t border-border/50">
        <span className="flex items-center gap-1">
          <Search className="w-3 h-3" />
          Query: <span className="font-medium">{query}</span>
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Response time:{" "}
          <span className="font-medium">{responseTime.toFixed(2)}s</span>
        </span>
      </div>
    </div>
  );
}
