"use client";

import type { RefObject } from "react";
import { ConversationEmptyState } from "@/components/ai-elements/conversation";
import { usePromptInputController } from "@/components/ai-elements/prompt-input";
import { EMPTY_STATE_SUGGESTIONS } from "../../constants/suggestions";

interface ChatEmptyStateWithSuggestionsProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}

export function ChatEmptyStateWithSuggestions({
  textareaRef,
}: ChatEmptyStateWithSuggestionsProps) {
  const { textInput } = usePromptInputController();

  const handleSuggestionSelect = (value: string) => {
    textInput.setInput(value);
    textareaRef.current?.focus();
  };

  return (
    <ConversationEmptyState
      title="Start a new conversation"
      description="Ask anything, or use a prompt suggestion"
      suggestions={[...EMPTY_STATE_SUGGESTIONS]}
      onSuggestionSelect={handleSuggestionSelect}
    />
  );
}
