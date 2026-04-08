"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowDownIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { ComponentProps } from "react";
import { useCallback } from "react";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";

export type ConversationProps = ComponentProps<typeof StickToBottom>;

export const Conversation = ({ className, ...props }: ConversationProps) => (
  <StickToBottom
    className={cn(
      "relative flex-1 overflow-y-hidden overscroll-contain bg-background",
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
    className={cn(
      "relative z-10 flex flex-col gap-4 px-4 py-6 md:px-8",
      className,
    )}
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
          <h3 className="text-base font-semibold leading-tight text-foreground">
            {title}
          </h3>
          {description && (
            <p className="text-xs leading-snug text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {suggestions && suggestions.length > 0 && onSuggestionSelect && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <p className="w-full text-[11px] text-muted-foreground">
              Try asking…
            </p>
            {suggestions.map((s) => (
              <Button
                key={s.value}
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 rounded-md px-3 text-xs font-medium text-muted-foreground transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-accent/50 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/30"
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
  const prefersReducedMotion = useReducedMotion();

  const handleScrollToBottom = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  return (
    !isAtBottom && (
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10, scale: 0.95 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
        exit={prefersReducedMotion ? undefined : { opacity: 0, y: 10, scale: 0.95 }}
        transition={
          prefersReducedMotion
            ? undefined
            : { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
        }
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
