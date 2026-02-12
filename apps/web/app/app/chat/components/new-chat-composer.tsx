"use client"

import { useRef } from "react"
import { useRouter } from "next/navigation"
import {
  PromptInput,
  PromptInputHeader,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputFooter,
  PromptInputTools,
  usePromptInputController,
} from "@/components/ai-elements/prompt-input"
import { Suggestions, Suggestion } from "@/components/ai-elements/suggestion"
import { useChatContext } from "./chat-provider"
import { ModelSelectorMenu } from "./model-selector-menu"
import { ModeSelectorMenu } from "./mode-selector-menu"
import { ProjectSelectorMenu } from "./project-selector-menu"
import { ToolLockCommandMenu } from "./tool-lock-command-menu"

const SUGGESTIONS = [
  { title: "Plan my day", value: "Plan my day" },
  { title: "Break this into tasks", value: "Break this into tasks" },
  { title: "Prioritize my backlog", value: "Prioritize my backlog" },
  { title: "Create a project plan", value: "Create a project plan" },
]

export function NewChatComposer() {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { textInput } = usePromptInputController()
  const {
    activeThreadId,
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

  const handleSubmit = () => {
    if (!textInput.value.trim() || !selectedModelId) return
    router.push(`/app/chat/${activeThreadId}`)
    void sendText(textInput.value)
    textInput.clear()
  }

  const handleSuggestionSelect = (suggestion: string) => {
    textInput.setInput(suggestion)
    textareaRef.current?.focus()
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-3xl space-y-6">
          <h1 className="text-center text-3xl font-medium tracking-tight text-foreground">
            Ready to dive in?
          </h1>

          <Suggestions className="mx-auto w-full max-w-2xl justify-center">
            {SUGGESTIONS.map((suggestion) => (
              <Suggestion
                key={suggestion.value}
                suggestion={suggestion.value}
                onClick={handleSuggestionSelect}
                variant="outline"
                size="sm"
                className="rounded-full border-border/70 bg-background/60 px-4 text-xs text-muted-foreground hover:text-foreground"
              >
                {suggestion.title}
              </Suggestion>
            ))}
          </Suggestions>

          <label htmlFor="new-chat-message" className="sr-only">
            Message
          </label>
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputHeader>
              <ToolLockCommandMenu textareaRef={textareaRef} />
              <PromptInputTools />
            </PromptInputHeader>

            <PromptInputTextarea
              id="new-chat-message"
              ref={textareaRef}
              placeholder="Message Taskflow..."
            />

            <PromptInputFooter className="text-muted-foreground">
              <div className="flex items-center gap-2">
                <ModelSelectorMenu
                  availableModels={availableModels}
                  selectedModelId={selectedModelId}
                  onSelectModelId={setSelectedModelId}
                  priceDecimals={3}
                />
                <ModeSelectorMenu
                  selectedMode={selectedMode}
                  onSelectMode={setSelectedMode}
                />
                <ProjectSelectorMenu
                  projects={projects}
                  selectedProjectId={selectedProjectId}
                  onSelectProjectId={setSelectedProjectId}
                />
              </div>
              <PromptInputSubmit status={status} onStop={stop} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  )
}
