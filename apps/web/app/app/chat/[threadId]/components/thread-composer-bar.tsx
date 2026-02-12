"use client"

import { useRef } from "react"
import type { Doc, Id } from "@/convex/_generated/dataModel"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
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
    toolLock,
    projects,
    availableModels,
  } = useChatContext()

  const setThreadScope = useMutation(api.chat.setThreadScope)

  const handleSubmit = () => {
    if (!textInput.value.trim()) return
    void sendText(textInput.value)
    textInput.clear()
  }

  const isToolCommandActive = textInput.value.trimStart().startsWith("/")
  const showPromptHeader = isToolCommandActive || !!toolLock

  return (
    <div className="shrink-0 bg-background/90 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-3 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto w-full max-w-4xl px-4">
        <label htmlFor="thread-message" className="sr-only">
          Message
        </label>
        <div
          className={`grid overflow-hidden transition-all duration-200 ease-out ${
            showPromptHeader
              ? "mb-2 grid-rows-[1fr] opacity-100"
              : "pointer-events-none mb-0 grid-rows-[0fr] opacity-0"
          }`}
          aria-hidden={!showPromptHeader}
        >
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-background px-3 py-2 shadow-sm">
            <ToolLockCommandMenu textareaRef={textareaRef} />
          </div>
        </div>
        <PromptInput
          onSubmit={handleSubmit}
          className="**:data-[slot=input-group]:rounded-3xl **:data-[slot=input-group]:border-border/60 **:data-[slot=input-group]:bg-background **:data-[slot=input-group]:shadow-sm **:data-[slot=input-group]:transition-colors **:data-[slot=input-group]:has-[[data-slot=input-group-control]:focus-visible]:border-ring/50 **:data-[slot=input-group]:has-[[data-slot=input-group-control]:focus-visible]:ring-2 **:data-[slot=input-group]:has-[[data-slot=input-group-control]:focus-visible]:ring-ring/20"
        >
          <PromptInputTextarea
            id="thread-message"
            ref={textareaRef}
            placeholder="Continue the conversation..."
            className="min-h-[72px] max-h-56 px-3 py-2.5 text-[15px] leading-7"
          />

          <PromptInputFooter className="border-t border-border/45 pb-2.5 pt-2 text-muted-foreground">
            <div className="flex flex-wrap items-center gap-1.5">
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
                  projectId: projectId as Id<"projects">,
                  })
                }}
              />
            </div>
            <PromptInputSubmit
              status={status}
              onStop={stop}
              size="icon-sm"
              className="size-8 rounded-full"
            />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  )
}
