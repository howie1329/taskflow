"use client"

import { useRef } from "react"
import { useRouter } from "next/navigation"
import type { FileUIPart } from "ai"
import { toast } from "sonner"
import {
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
import {
  useChatConfig,
  useChatConfigActions,
  useChatId,
  useChatMessages,
  useChatMessagingActions,
} from "./chat-provider"
import { ChatSettingsChips } from "./chat-settings-chips"
import { ToolLockCommandMenu } from "./tool-lock-command-menu"
import { ComposerHints } from "./composer-hints"
import { CHAT_SUGGESTIONS } from "../constants/suggestions"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import { ImagePlusIcon } from "lucide-react"

export function NewChatComposer() {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { textInput } = usePromptInputController()
  const attachments = usePromptInputAttachments()
  const { activeThreadId } = useChatId()
  const { status } = useChatMessages()
  const { sendPrompt, stop } = useChatMessagingActions()
  const isMobile = useIsMobile()
  const {
    selectedModelId,
    selectedProjectId,
    selectedMode,
    toolLock,
    projects,
    availableModels,
  } = useChatConfig()
  const { setSelectedModelId, setSelectedProjectId, setSelectedMode } =
    useChatConfigActions()

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

          <p className="text-center text-xs text-muted-foreground">
            Tasks · Notes · Projects · Inbox · Web search · Research
          </p>

          <Suggestions className="mx-auto w-full max-w-2xl justify-center">
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

          <label htmlFor="new-chat-message" className="sr-only">
            Message
          </label>
          <div
            className={`grid overflow-hidden transition-[grid-template-rows,opacity,margin-bottom] duration-200 ease-out ${
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
                {isMobile ? null : (
                  <ComposerHints
                    show={!textInput.value.trim()}
                    toolLock={toolLock}
                  />
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label="Slash commands"
                      className="size-7 rounded-full border-border/60 bg-background/70 text-foreground shadow-sm hover:bg-muted/70"
                      onClick={() => {
                        const v = textInput.value
                        textInput.setInput(v.trimStart().startsWith("/") ? v : `/${v}`)
                        textareaRef.current?.focus()
                      }}
                    >
                      <span className="text-[13px] font-semibold leading-none">/</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent sideOffset={6}>
                    <p>Slash commands</p>
                  </TooltipContent>
                </Tooltip>
                <ChatSettingsChips
                  availableModels={availableModels}
                  selectedModelId={selectedModelId}
                  onSelectModelId={setSelectedModelId}
                  selectedMode={selectedMode}
                  onSelectMode={setSelectedMode}
                  projects={projects}
                  selectedProjectId={selectedProjectId}
                  onSelectProjectId={setSelectedProjectId}
                  showImageAction={isMobile}
                />
                {isMobile ? null : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label="Add image"
                        className="size-7 rounded-full border-border/60 bg-background/70 text-foreground shadow-sm hover:bg-muted/70"
                        onClick={() => attachments.openFileDialog()}
                      >
                        <ImagePlusIcon className="size-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={6}>
                      <p>Add image</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <PromptInputSubmit
                      status={status}
                      onStop={stop}
                      size="icon-sm"
                      className="size-8 rounded-full"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent sideOffset={6}>
                  <p>{status === "submitted" || status === "streaming" ? "Stop generating" : "Send message"}</p>
                </TooltipContent>
              </Tooltip>
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
