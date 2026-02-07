"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ImageIcon, ZoomIn, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

interface TavilyImageCardProps {
  image: string;
  title?: string;
  description?: string;
}

export function TavilyImageCard({
  image,
  title,
  description,
}: TavilyImageCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleDownload = useCallback(async () => {
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = title || "tavily-image";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download image:", err);
      // Fallback: open in new tab
      window.open(image, "_blank");
    }
  }, [image, title]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(true);
    }
  }, []);

  if (hasError) {
    return (
      <div className="w-72 h-48 md:w-80 md:h-52 bg-muted rounded-lg border border-border/50 flex flex-col items-center justify-center gap-2">
        <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
        <span className="text-xs text-muted-foreground">Image unavailable</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <>
        {/* Thumbnail Card */}
        <button
          onClick={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className={cn(
            "relative group cursor-pointer overflow-hidden rounded-lg",
            "w-72 h-48 md:w-80 md:h-52",
            "bg-muted border border-border/50",
            "hover:border-primary/30 transition-all duration-300 ease-out",
            "hover:shadow-lg hover:scale-[1.02]",
            "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
          )}
          aria-label={`View image: ${title || "Search result image"}`}
          tabIndex={0}
        >
          {!isLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="w-full h-full" />
            </div>
          )}
          <img
            src={image}
            alt={title || "Search result image"}
            className={cn(
              "w-full h-full object-cover transition-all duration-300",
              "group-hover:scale-110",
              isLoaded ? "opacity-100" : "opacity-0",
            )}
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            loading="lazy"
          />

          {/* Hover Overlay */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent",
              "flex flex-col items-center justify-end pb-4",
              "opacity-0 group-hover:opacity-100 group-focus:opacity-100",
              "transition-opacity duration-200",
            )}
          >
            <div className="flex items-center gap-2 text-white">
              <ZoomIn className="w-5 h-5" />
              <span className="text-sm font-medium">Click to enlarge</span>
            </div>
          </div>
        </button>

        {/* Full Size Modal */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-4xl w-[95vw] p-0 overflow-hidden bg-background">
            <DialogHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <DialogTitle className="text-base font-medium truncate pr-4">
                {title || "Image"}
              </DialogTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownload}
                    className="h-8 w-8 p-0"
                    aria-label="Download image"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download image</p>
                </TooltipContent>
              </Tooltip>
            </DialogHeader>
            <div className="p-4 pt-0">
              <div className="relative">
                <img
                  src={image}
                  alt={title || "Search result image"}
                  className="w-full h-auto max-h-[75vh] object-contain rounded-md"
                />
              </div>
              {description && (
                <p className="mt-3 text-sm text-muted-foreground text-center">
                  {description}
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </>
    </TooltipProvider>
  );
}
