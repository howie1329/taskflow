"use client";

import { useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

// Auto-resize textarea hook
function useAutoResizeTextarea(ref, value, minHeight = 80, maxHeight = 200) {
  useEffect(() => {
    const textarea = ref.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const newHeight = Math.min(
      Math.max(textarea.scrollHeight, minHeight),
      maxHeight,
    );
    textarea.style.height = `${newHeight}px`;
  }, [value, ref, minHeight, maxHeight]);
}

// Keyboard shortcut: C to focus capture
function useCaptureFocusShortcut(textareaRef) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const target = e.target;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (e.key === "c" && !isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [textareaRef]);
}

export function InboxCapture({
  value,
  onChange,
  onCapture,
  disabled = false,
  className = "",
}) {
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useAutoResizeTextarea(textareaRef, value, 80, 200);

  // Keyboard shortcut to focus
  useCaptureFocusShortcut(textareaRef);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onCapture();
      }
      if (e.key === "Escape") {
        onChange("");
        e.currentTarget.blur();
      }
    },
    [onCapture, onChange],
  );

  const handleChange = useCallback(
    (e) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 bg-background/30 p-3 space-y-2",
        className,
      )}
    >
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="What's on your mind?"
          className="min-h-[80px] resize-none pr-12 border-border/60 focus-visible:ring-[3px] focus-visible:ring-ring/50"
          disabled={disabled}
          aria-label="Capture inbox item"
        />
        {value.length > 0 && (
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground tabular-nums">
            {value.length}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Kbd>Enter</Kbd> to capture
          </span>
          <span className="flex items-center gap-1">
            <Kbd>Shift</Kbd> + <Kbd>Enter</Kbd> for new line
          </span>
          <span className="flex items-center gap-1 hidden sm:inline-flex">
            <Kbd>Esc</Kbd> to clear
          </span>
          <span className="flex items-center gap-1 hidden sm:inline-flex">
            <Kbd>C</Kbd> to focus
          </span>
        </div>
        <Button
          size="sm"
          onClick={onCapture}
          disabled={disabled || !value.trim()}
        >
          Capture
        </Button>
      </div>
    </div>
  );
}
