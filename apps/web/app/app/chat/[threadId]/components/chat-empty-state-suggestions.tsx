"use client"

import { ConversationEmptyState } from "@/components/ai-elements/conversation"
import { usePromptInputController } from "@/components/ai-elements/prompt-input"
import { useChatComposerFocus } from "../../components/chat-composer-context"
import { EMPTY_STATE_SUGGESTIONS } from "../../constants/suggestions"

export function ChatEmptyStateWithSuggestions() {
  const { textInput } = usePromptInputController()
  const composerFocus = useChatComposerFocus()

  const handleSuggestionSelect = (value: string) => {
    textInput.setInput(value)
    composerFocus?.focusComposer()
  }

  return (
    <ConversationEmptyState
      title="Start a new conversation"
      description="Ask anything, or use a prompt suggestion"
      suggestions={[...EMPTY_STATE_SUGGESTIONS]}
      onSuggestionSelect={handleSuggestionSelect}
    />
  )
}
