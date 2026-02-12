"use client";

import { memo, useCallback, useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Kbd } from "@/components/ui/kbd";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";

// Auto-resize textarea hook - extracted for reuse
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
function useCaptureFocusShortcut(textareaRef, disabled) {
  useEffect(() => {
    if (disabled) return;

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
  }, [textareaRef, disabled]);
}

export const InboxCapture = memo(function InboxCapture({
  value,
  onChange,
  onCapture,
  disabled = false,
  className = "",
}) {
  const textareaRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Auto-resize textarea
  useAutoResizeTextarea(textareaRef, value, 80, 200);

  // Keyboard shortcut to focus
  useCaptureFocusShortcut(textareaRef, disabled || isCapturing);

  // Define capture handler first so it can be used in key handler
  const handleCaptureClick = useCallback(async () => {
    if (!value.trim() || isCapturing) return;

    setIsCapturing(true);
    try {
      await onCapture();
    } finally {
      setIsCapturing(false);
    }
  }, [value, onCapture, isCapturing]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleCaptureClick();
      }
      if (e.key === "Escape") {
        onChange("");
        e.currentTarget.blur();
      }
    },
    [onChange, handleCaptureClick],
  );

  const handleChange = useCallback(
    (e) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  const isDisabled = disabled || isCapturing;
  const characterCount = value.length;
  const isNearLimit = characterCount > 450;
  const isAtLimit = characterCount >= 500;

  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-background/60 p-3 space-y-2.5",
        className,
      )}
      role="form"
      aria-label="Capture new inbox item"
    >
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="What's on your mind?"
          className={cn(
            "min-h-[88px] resize-none pr-12 border-border/60 bg-transparent focus-visible:ring-[3px] focus-visible:ring-ring/50",
            isNearLimit && "border-yellow-500/50",
            isAtLimit && "border-red-500/50",
          )}
          disabled={isDisabled}
          aria-label="Capture inbox item"
          aria-describedby="capture-help capture-count"
          aria-busy={isCapturing}
          maxLength={500}
        />
        {characterCount > 0 && (
          <div
            id="capture-count"
            className={cn(
              "absolute bottom-2 right-2 text-xs tabular-nums",
              isNearLimit ? "text-yellow-600" : "text-muted-foreground",
              isAtLimit && "text-red-600 font-medium",
            )}
            aria-live="polite"
            aria-atomic="true"
          >
            {characterCount}/500
          </div>
        )}
      </div>
      <div
        id="capture-help"
        className="flex items-center justify-between text-[11px] text-muted-foreground"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1">
            <Kbd>Enter</Kbd> to capture
          </span>
          <span className="flex items-center gap-1">
            <Kbd>Shift</Kbd> + <Kbd>Enter</Kbd> for new line
          </span>
          <span className="hidden items-center gap-1 sm:inline-flex">
            <Kbd>Esc</Kbd> to clear
          </span>
          <span className="hidden items-center gap-1 sm:inline-flex">
            <Kbd>C</Kbd> to focus
          </span>
        </div>
        <Button
          size="sm"
          onClick={handleCaptureClick}
          disabled={isDisabled || !value.trim() || isAtLimit}
          aria-busy={isCapturing}
        >
          {isCapturing ? (
            <>
              <HugeiconsIcon
                icon={Loading03Icon}
                className="size-4 animate-spin mr-2"
              />
              Capturing...
            </>
          ) : (
            "Capture"
          )}
        </Button>
      </div>
    </div>
  );
});
