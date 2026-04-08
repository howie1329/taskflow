"use client";

import type { FileUIPart } from "ai";
import type { RefObject } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LightbulbIcon } from "lucide-react";
import { ChatComposerInput } from "../../components/chat-composer-input";
import { useChatComposer } from "../../components/use-chat-composer";
import { THREAD_COMPOSER_SUGGESTIONS } from "../../constants/suggestions";
import { ThreadContextFooterBadge } from "./thread-context-footer-badge";
import { useKeyboardScroll } from "@/hooks/use-keyboard-scroll";

interface ThreadComposerBarProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}

export function ThreadComposerBar({ textareaRef }: ThreadComposerBarProps) {
  const {
    textInput,
    isMobile,
    sendPrompt,
    setSelectedProjectId,
    setScope,
    thread,
  } = useChatComposer();

  useKeyboardScroll(textareaRef as React.RefObject<HTMLElement | null>, {
    enabled: isMobile,
  });

  const handleSubmit = ({
    text,
    files,
  }: {
    text: string;
    files: FileUIPart[];
  }) => {
    void sendPrompt({ text, files });
  };

  const handleSelectProjectId = (projectId: string | null) => {
    setSelectedProjectId(projectId);
    if (!thread) return;
    void setScope(
      projectId === null
        ? { scope: "workspace" }
        : { scope: "project", projectId: projectId as Id<"projects"> },
    );
  };

  const handleSuggestionSelect = (value: string) => {
    textInput.setInput(value);
    textareaRef.current?.focus();
  };

  const footerExtra = !isMobile ? (
    <DropdownMenu>
      <Tooltip>
        <DropdownMenuTrigger asChild>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="Examples"
              className="size-8 rounded-md text-muted-foreground shadow-none transition-[color,background-color,transform] duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-accent/50 hover:text-foreground motion-safe:active:scale-[0.97]"
            >
              <LightbulbIcon className="size-3.5" />
            </Button>
          </TooltipTrigger>
        </DropdownMenuTrigger>
        <TooltipContent sideOffset={6}>
          <p>Examples</p>
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="start" className="w-64 overscroll-contain">
        {THREAD_COMPOSER_SUGGESTIONS.map((s) => (
          <DropdownMenuItem
            key={s.value}
            onSelect={() => handleSuggestionSelect(s.value)}
          >
            {s.title}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  ) : null;

  return (
    <div className="shrink-0 border-t border-border/50 bg-background pb-[calc(env(safe-area-inset-bottom)+8px)] pt-3">
      <div className="mx-auto w-full max-w-2xl px-4 md:px-8">
        <ChatComposerInput
          id="thread-message"
          placeholder="Continue the conversation..."
          textareaRef={textareaRef}
          onSubmit={handleSubmit}
          onSelectProjectId={handleSelectProjectId}
          footerExtra={footerExtra}
          footerTrailing={<ThreadContextFooterBadge />}
        />
      </div>
    </div>
  );
}
