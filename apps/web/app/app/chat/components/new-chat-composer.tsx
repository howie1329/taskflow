"use client"

import { useRef } from "react"
import { useRouter } from "next/navigation"
import type { FileUIPart } from "ai"
import { toast } from "sonner"
import {
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputFooter,
  usePromptInputController,
  usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input"
import {
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from "@/components/ai-elements/attachments"
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
  {
    title: "Generate UI summary card",
    value:
      "Create a compact UI summary card for my request using json-render components, with a title, short summary, and a small table if helpful.",
  },
]

export function NewChatComposer() {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { textInput } = usePromptInputController()
  const {
    activeThreadId,
    sendPrompt,
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

  const handleSubmit = ({
    text,
    files,
  }: {
    text: string
    files: FileUIPart[]
  }) => {
    if ((!text.trim() && files.length === 0) || !selectedModelId) return
    router.push(`/app/chat/${activeThreadId}`)
    void sendPrompt({ text, files })
    textInput.clear()
  }

  const handleSuggestionSelect = (suggestion: string) => {
    textInput.setInput(suggestion)
    textareaRef.current?.focus()
  }

  const isToolCommandActive = textInput.value.trimStart().startsWith("/")
  const showPromptHeader = isToolCommandActive || !!toolLock

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-8 md:py-10">
        <div className="w-full max-w-4xl space-y-5">
          <h1 className="text-center text-2xl font-medium tracking-tight text-foreground md:text-3xl">
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
            accept="image/*"
            multiple
            maxFiles={4}
            maxFileSize={1_000_000}
            onError={(error) => toast.error(error.message)}
            className="**:data-[slot=input-group]:rounded-3xl **:data-[slot=input-group]:border-border/60 **:data-[slot=input-group]:bg-background **:data-[slot=input-group]:shadow-sm **:data-[slot=input-group]:transition-colors **:data-[slot=input-group]:has-[[data-slot=input-group-control]:focus-visible]:border-ring/50 **:data-[slot=input-group]:has-[[data-slot=input-group-control]:focus-visible]:ring-2 **:data-[slot=input-group]:has-[[data-slot=input-group-control]:focus-visible]:ring-ring/20"
          >
            <ComposerAttachmentsPreview />
            <PromptInputTextarea
              id="new-chat-message"
              ref={textareaRef}
              placeholder="Message Taskflow..."
              className="min-h-[72px] max-h-56 px-3 py-2.5 text-[15px] leading-7"
            />

            <PromptInputFooter className="border-t border-border/45 pb-2.5 pt-2 text-muted-foreground">
              <div className="flex flex-wrap items-center gap-1.5">
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger
                    className="h-7 rounded-full border border-border/60 bg-muted/30 px-2.5 text-xs font-medium text-foreground hover:bg-muted/60"
                    size="sm"
                  >
                    Add image
                  </PromptInputActionMenuTrigger>
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments label="Add image" />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
                <ModelSelectorMenu
                  availableModels={availableModels}
                  selectedModelId={selectedModelId}
                  onSelectModelId={setSelectedModelId}
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
    </div>
  )
}

function ComposerAttachmentsPreview() {
  const attachments = usePromptInputAttachments()
  if (attachments.files.length === 0) return null

  return (
    <div className="px-3 pt-3">
      <Attachments variant="inline" className="mr-auto">
        {attachments.files.map((file) => (
          <Attachment
            key={file.id}
            data={file}
            onRemove={() => attachments.remove(file.id)}
          >
            <AttachmentPreview />
            <AttachmentRemove />
          </Attachment>
        ))}
      </Attachments>
    </div>
  )
}
