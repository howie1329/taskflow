"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowDownIcon } from "lucide-react";
import { motion } from "framer-motion";
import type { ComponentProps } from "react";
import { useCallback } from "react";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";

export type ConversationProps = ComponentProps<typeof StickToBottom>;

export const Conversation = ({ className, ...props }: ConversationProps) => (
  <StickToBottom
    className={cn(
      "relative flex-1 overflow-y-hidden overscroll-contain bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.055),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_34%),linear-gradient(180deg,hsl(var(--background)),color-mix(in_oklab,hsl(var(--muted))_22%,hsl(var(--background)))_100%)] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.035)_0,transparent_22%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.03)_0,transparent_18%),url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)' opacity='.08'/%3E%3C/svg%3E\")] before:opacity-40",
      className,
    )}
    initial="smooth"
    resize="smooth"
    role="log"
    {...props}
  />
);

export type ConversationContentProps = ComponentProps<
  typeof StickToBottom.Content
>;

export const ConversationContent = ({
  className,
  ...props
}: ConversationContentProps) => (
  <StickToBottom.Content
    className={cn("relative z-10 flex flex-col gap-8 p-4", className)}
    {...props}
  />
);

export type ConversationEmptyStateSuggestion = {
  title: string;
  value: string;
};

export type ConversationEmptyStateProps = ComponentProps<"div"> & {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  suggestions?: ConversationEmptyStateSuggestion[];
  onSuggestionSelect?: (value: string) => void;
};

export const ConversationEmptyState = ({
  className,
  title = "No messages yet",
  description = "Start a conversation to see messages here",
  icon,
  suggestions,
  onSuggestionSelect,
  children,
  ...props
}: ConversationEmptyStateProps) => (
  <div
    className={cn(
      "flex size-full flex-col items-center justify-center gap-3 p-8 text-center",
      className,
    )}
    {...props}
  >
    {children ?? (
      <>
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <div className="space-y-1">
          <h3 className="font-medium text-sm">{title}</h3>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
        {suggestions && suggestions.length > 0 && onSuggestionSelect && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <p className="w-full text-xs text-muted-foreground">Try asking…</p>
            {suggestions.map((s) => (
              <Button
                key={s.value}
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full border-border/70 bg-background/60 px-3 text-xs text-muted-foreground hover:bg-muted/40 hover:border-border hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30"
                onClick={() => onSuggestionSelect(s.value)}
              >
                {s.title}
              </Button>
            ))}
          </div>
        )}
      </>
    )}
  </div>
);

export type ConversationScrollButtonProps = ComponentProps<typeof Button>;

export const ConversationScrollButton = ({
  className,
  ...props
}: ConversationScrollButtonProps) => {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  const handleScrollToBottom = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  return (
    !isAtBottom && (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="pointer-events-auto absolute bottom-4 left-[50%] z-30 -translate-x-1/2"
      >
        <Button
          aria-label="Scroll to bottom"
          className={cn(
            "rounded-full dark:bg-background dark:hover:bg-muted",
            className,
          )}
          onClick={handleScrollToBottom}
          size="icon"
          type="button"
          variant="outline"
          {...props}
        >
          <ArrowDownIcon className="size-4" />
        </Button>
      </motion.div>
    )
  );
};
