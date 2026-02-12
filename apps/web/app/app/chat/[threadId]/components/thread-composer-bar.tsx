"use client"

import { useRef } from "react"
import type { Doc } from "@/convex/_generated/dataModel"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import {
  PromptInput,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputController,
} from "@/components/ai-elements/prompt-input"
import { useChatContext } from "../../components/chat-provider"
import { ModelSelectorMenu } from "../../components/model-selector-menu"
import { ModeSelectorMenu } from "../../components/mode-selector-menu"
import { ProjectSelectorMenu } from "../../components/project-selector-menu"
import { ToolLockCommandMenu } from "../../components/tool-lock-command-menu"

interface ThreadComposerBarProps {
  thread: Doc<"thread"> | null | undefined
}

export function ThreadComposerBar({ thread }: ThreadComposerBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { textInput } = usePromptInputController()
  const {
    sendText,
    status,
    stop,
    selectedModelId,
    setSelectedModelId,
    selectedProjectId,
    setSelectedProjectId,
    selectedMode,
    setSelectedMode,
    projects,
    availableModels,
  } = useChatContext()

  const setThreadScope = useMutation(api.chat.setThreadScope)

  const handleSubmit = () => {
    if (!textInput.value.trim()) return
    void sendText(textInput.value)
    textInput.clear()
  }

  return (
    <div className="shrink-0 bg-background/70 px-16 py-3 pb-[calc(env(safe-area-inset-bottom)+2px)] backdrop-blur supports-backdrop-filter:bg-background/60">
      <label htmlFor="thread-message" className="sr-only">
        Message
      </label>
      <PromptInput onSubmit={handleSubmit}>
        <PromptInputHeader>
          <ToolLockCommandMenu textareaRef={textareaRef} />
          <PromptInputTools />
        </PromptInputHeader>

        <PromptInputTextarea
          id="thread-message"
          ref={textareaRef}
          placeholder="Continue the conversation..."
        />

        <PromptInputFooter>
          <div className="flex items-center gap-2">
            <ModelSelectorMenu
              availableModels={availableModels}
              selectedModelId={selectedModelId}
              onSelectModelId={setSelectedModelId}
              priceDecimals={2}
            />
            <ModeSelectorMenu
              selectedMode={selectedMode}
              onSelectMode={setSelectedMode}
            />
            <ProjectSelectorMenu
              projects={projects}
              selectedProjectId={selectedProjectId}
              onSelectProjectId={(projectId) => {
                setSelectedProjectId(projectId)
                if (!thread) return

                if (projectId === null) {
                  void setThreadScope({
                    threadId: thread.threadId,
                    scope: "workspace",
                  })
                  return
                }

                void setThreadScope({
                  threadId: thread.threadId,
                  scope: "project",
                  projectId,
                })
              }}
            />
          </div>
          <PromptInputTools />
          <PromptInputSubmit status={status} onStop={stop} />
        </PromptInputFooter>
      </PromptInput>
    </div>
  )
}
