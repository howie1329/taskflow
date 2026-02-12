"use client"

import { PromptInputProvider } from "@/components/ai-elements/prompt-input"
import { NewChatComposer } from "./components/new-chat-composer"

export default function ChatPage() {
  return (
    <PromptInputProvider>
      <NewChatComposer />
    </PromptInputProvider>
  )
}
