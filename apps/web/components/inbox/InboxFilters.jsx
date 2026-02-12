"use client";

import { memo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";

export const InboxFilters = memo(function InboxFilters({
  searchQuery,
  onSearchChange,
  className = "",
}) {
  const handleClear = useCallback(() => {
    onSearchChange("");
  }, [onSearchChange]);

  const handleChange = useCallback(
    (e) => {
      onSearchChange(e.target.value);
    },
    [onSearchChange],
  );

  return (
    <div className={className}>
      <div className="relative w-full">
        <HugeiconsIcon
          icon={Search01Icon}
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
        />
        <Input
          type="text"
          placeholder="Search inbox..."
          value={searchQuery}
          onChange={handleChange}
          className="pl-10 h-10 text-sm border-border/50 focus-visible:ring-ring/50"
          aria-label="Search inbox items"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon-xs"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
            onClick={handleClear}
            aria-label="Clear search"
          >
            ×
          </Button>
        )}
      </div>
    </div>
  );
});
