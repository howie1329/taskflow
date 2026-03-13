"use client"

import { useEffect, useRef } from "react"
import type { FileUIPart } from "ai"
import { toast } from "sonner"
import type { Id } from "@/convex/_generated/dataModel"
import {
  PromptInput,
  PromptInputFooter,
  PromptInputTextarea,
  usePromptInputController,
  usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import { LightbulbIcon } from "lucide-react"
import {
  useChatConfig,
  useChatConfigActions,
  useChatMessages,
  useChatMessagingActions,
  useChatThreadActions,
} from "../../components/chat-provider"
import { ChatSettingsChips } from "../../components/chat-settings-chips"
import { ComposerHints } from "../../components/composer-hints"
import { useChatComposerFocus } from "../../components/chat-composer-context"
import { THREAD_COMPOSER_SUGGESTIONS } from "../../constants/suggestions"
import {
  CHAT_COMPOSER_INPUT_CLASS_NAME,
  ChatComposerToolHeader,
  ComposerAttachmentsPreview,
  ComposerImageButton,
  ComposerSlashCommandButton,
  ComposerSubmitButton,
} from "../../components/chat-composer-ui"

export function ThreadComposerBar() {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
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
  const composerFocus = useChatComposerFocus()

  useEffect(() => {
    composerFocus?.registerFocus(() => textareaRef.current?.focus())
    return () => composerFocus?.registerFocus(undefined)
  }, [composerFocus])

  const handleSubmit = ({
    text,
    files,
  }: {
    text: string
    files: FileUIPart[]
  }) => {
    if (!text.trim() && files.length === 0) return
    void sendPrompt({ text, files })
    textInput.clear()
  }

  const isToolCommandActive = textInput.value.trimStart().startsWith("/")
  const showPromptHeader = isToolCommandActive || !!toolLock

  const handleSuggestionSelect = (value: string) => {
    textInput.setInput(value)
    textareaRef.current?.focus()
  }

  return (
    <div className="shrink-0 bg-background/90 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-3 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto w-full max-w-4xl px-4">
        <label htmlFor="thread-message" className="sr-only">
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
            id="thread-message"
            ref={textareaRef}
            placeholder="Continue the conversation..."
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
              <DropdownMenu>
                <Tooltip>
                  <DropdownMenuTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        aria-label="Examples"
                        className="size-7 rounded-full border-border/60 bg-background/70 text-foreground shadow-sm hover:bg-muted/70"
                      >
                        <LightbulbIcon className="size-3.5" />
                      </Button>
                    </TooltipTrigger>
                  </DropdownMenuTrigger>
                  <TooltipContent sideOffset={6}>
                    <p>Examples</p>
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent
                  align="start"
                  className="w-64 overscroll-contain"
                >
                  {THREAD_COMPOSER_SUGGESTIONS.map((s) => (
                    <DropdownMenuItem
                      key={s.value}
                      onSelect={() => handleSuggestionSelect(s.value)}
                    >
                      {s.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <ChatSettingsChips
                availableModels={availableModels}
                selectedModelId={selectedModelId}
                onSelectModel={setSelectedModel}
                selectedMode={selectedMode}
                onSelectMode={setSelectedMode}
                projects={projects}
                selectedProjectId={selectedProjectId}
                onSelectProjectId={(projectId) => {
                  setSelectedProjectId(projectId)
                  if (!thread) return

                  if (projectId === null) {
                    void setScope({
                      scope: "workspace",
                    })
                    return
                  }

                  void setScope({
                    scope: "project",
                    projectId: projectId as Id<"projects">,
                  })
                }}
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
  )
}
