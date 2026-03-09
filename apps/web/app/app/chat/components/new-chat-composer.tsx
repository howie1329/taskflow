"use client"

import { useRef } from "react"
import { useRouter } from "next/navigation"
import type { FileUIPart } from "ai"
import { toast } from "sonner"
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  usePromptInputController,
  usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input"
import { Suggestions, Suggestion } from "@/components/ai-elements/suggestion"
import {
  useChatConfig,
  useChatConfigActions,
  useChatId,
  useChatMessages,
  useChatMessagingActions,
} from "./chat-provider"
import { ChatSettingsChips } from "./chat-settings-chips"
import { ComposerHints } from "./composer-hints"
import { CHAT_SUGGESTIONS } from "../constants/suggestions"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  CHAT_COMPOSER_INPUT_CLASS_NAME,
  ChatComposerToolHeader,
  ComposerAttachmentsPreview,
  ComposerImageButton,
  ComposerSlashCommandButton,
  ComposerSubmitButton,
} from "./chat-composer-ui"

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
          <ChatComposerToolHeader show={showPromptHeader} textareaRef={textareaRef} />
          <PromptInput
            onSubmit={handleSubmit}
            accept="image/*"
            multiple
            maxFiles={4}
            maxFileSize={1_000_000}
            onError={(error) => toast.error(error.message)}
            className={CHAT_COMPOSER_INPUT_CLASS_NAME}
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
                <ComposerSlashCommandButton
                  value={textInput.value}
                  setInput={textInput.setInput}
                  onFocus={() => textareaRef.current?.focus()}
                />
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
                  <ComposerImageButton onClick={() => attachments.openFileDialog()} />
                )}
              </div>
              <ComposerSubmitButton status={status} onStop={stop} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  )
}
