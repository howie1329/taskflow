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
      <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-8 md:py-10">
        <div className="w-full max-w-4xl space-y-5">
          <h1 className="text-center text-xl font-medium tracking-tight text-foreground md:text-3xl">
            What can I help with?
          </h1>

          <Suggestions className="mx-auto w-full max-w-2xl flex-wrap justify-center">
            {CHAT_SUGGESTIONS.map((suggestion) => (
              <Suggestion
                key={suggestion.value}
                suggestion={suggestion.value}
                onClick={handleSuggestionSelect}
                variant="outline"
                size="sm"
                className="rounded-full border-border/70 bg-background/60 px-4 text-xs text-muted-foreground hover:bg-muted/40 hover:border-border hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
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

          <p className="mt-2 text-center text-xs text-muted-foreground">
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
