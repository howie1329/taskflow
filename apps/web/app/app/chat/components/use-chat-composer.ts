"use client"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  usePromptInputAttachments,
  usePromptInputController,
} from "@/components/ai-elements/prompt-input"
import {
  useChatConfig,
  useChatConfigActions,
  useChatMessages,
  useChatMessagingActions,
  useChatThreadActions,
} from "./chat-provider"

/**
 * Shared state and actions for both composer components.
 * Must be called inside a PromptInputProvider and ChatProvider.
 */
export function useChatComposer() {
  const { textInput } = usePromptInputController()
  const attachments = usePromptInputAttachments()
  const { status } = useChatMessages()
  const { sendPrompt, stop } = useChatMessagingActions()
  const isMobile = useIsMobile()

  const {
    selectedModelId,
    selectedProjectId,
    selectedMode,
    toolLock,
    thread,
    projects,
    availableModels,
  } = useChatConfig()

  const { setSelectedModel, setSelectedProjectId, setSelectedMode } =
    useChatConfigActions()

  const { setScope } = useChatThreadActions()

  const showPromptHeader =
    textInput.value.trimStart().startsWith("/") || !!toolLock

  return {
    textInput,
    attachments,
    status,
    sendPrompt,
    stop,
    isMobile,
    showPromptHeader,
    // config state
    selectedModelId,
    selectedProjectId,
    selectedMode,
    toolLock,
    thread,
    projects,
    availableModels,
    // config actions
    setSelectedModel,
    setSelectedProjectId,
    setSelectedMode,
    // thread action (used only by thread composer, harmless to expose)
    setScope,
  }
}
