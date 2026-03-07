"use client"

import { useEffect, useRef } from "react"
import type { FileUIPart } from "ai"
import { toast } from "sonner"
import type { Id } from "@/convex/_generated/dataModel"
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
  usePromptInputController,
  usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input"
import {
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from "@/components/ai-elements/attachments"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import { ImagePlusIcon, LightbulbIcon } from "lucide-react"
import {
  useChatConfig,
  useChatConfigActions,
  useChatMessages,
  useChatMessagingActions,
  useChatThreadActions,
} from "../../components/chat-provider"
import { ChatSettingsChips } from "../../components/chat-settings-chips"
import { ToolLockCommandMenu } from "../../components/tool-lock-command-menu"
import { ComposerHints } from "../../components/composer-hints"
import { useChatComposerFocus } from "../../components/chat-composer-context"
import { THREAD_COMPOSER_SUGGESTIONS } from "../../constants/suggestions"

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
  const { setSelectedModelId, setSelectedProjectId, setSelectedMode } =
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

  const openCommands = () => {
    const v = textInput.value
    textInput.setInput(v.trimStart().startsWith("/") ? v : `/${v}`)
    textareaRef.current?.focus()
  }

  return (
    <div className="shrink-0 bg-background/90 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-3 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto w-full max-w-4xl px-4">
        <label htmlFor="thread-message" className="sr-only">
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label="Slash commands"
                    className="size-7 rounded-full border-border/60 bg-background/70 text-foreground shadow-sm hover:bg-muted/70"
                    onClick={openCommands}
                  >
                    <span className="text-[13px] font-semibold leading-none">/</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent sideOffset={6}>
                  <p>Slash commands</p>
                </TooltipContent>
              </Tooltip>
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
                onSelectModelId={setSelectedModelId}
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
