"use client";

import { useEffect, memo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

export const Toast = memo(function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg border border-border/60 bg-background/80 px-4 py-3 text-xs shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-in slide-in-from-bottom-2",
        type === "success"
          ? "text-green-700 dark:text-green-400"
          : "text-blue-700 dark:text-blue-400",
      )}
      role="status"
      aria-live="polite"
    >
      <HugeiconsIcon
        icon={type === "success" ? CheckmarkCircle02Icon : AlertCircleIcon}
        className="size-4"
      />
      {message}
    </div>
  );
});
