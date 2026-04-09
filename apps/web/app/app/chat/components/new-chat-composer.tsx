"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import type { FileUIPart } from "ai";
import { Suggestions, Suggestion } from "@/components/ai-elements/suggestion";
import { PromptInputProvider } from "@/components/ai-elements/prompt-input";
import { useChatId } from "./chat-provider";
import { useChatComposer } from "./use-chat-composer";
import { ChatComposerInput } from "./chat-composer-input";
import { CHAT_SUGGESTIONS } from "../constants/suggestions";

function NewChatComposerInner() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { activeThreadId } = useChatId();
  const { textInput, sendPrompt, setSelectedProjectId } = useChatComposer();

  const handleSubmit = ({
    text,
    files,
  }: {
    text: string;
    files: FileUIPart[];
  }) => {
    router.push(`/app/chat/${activeThreadId}`);
    void sendPrompt({ text, files });
  };

  const handleSuggestionSelect = (suggestion: string) => {
    textInput.setInput(suggestion);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-8 md:py-8">
        <div className="w-full max-w-3xl space-y-3">
          <h1 className="text-center text-xl font-semibold leading-tight tracking-tight text-foreground">
            What can I help with?
          </h1>

          <Suggestions className="mx-auto w-full flex-wrap justify-center gap-2">
            {CHAT_SUGGESTIONS.map((suggestion) => (
              <Suggestion
                key={suggestion.value}
                suggestion={suggestion.value}
                onClick={handleSuggestionSelect}
                variant="ghost"
                size="sm"
                className="h-8 rounded-md px-3 text-xs font-medium text-muted-foreground transition-colors duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-100 hover:bg-accent/50 hover:text-foreground active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              >
                {suggestion.title}
              </Suggestion>
            ))}
          </Suggestions>

          <ChatComposerInput
            id="new-chat-message"
            placeholder="Ask anything..."
            textareaRef={textareaRef}
            onSubmit={handleSubmit}
            onSelectProjectId={setSelectedProjectId}
          />

          <p className="mt-2 text-center text-[11px] leading-snug text-muted-foreground">
            AI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
}

export function NewChatComposer() {
  return (
    <PromptInputProvider>
      <NewChatComposerInner />
    </PromptInputProvider>
  );
}
