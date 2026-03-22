"use client"

import type { FileUIPart } from "ai"
import type { ReactNode, RefObject } from "react"
import { toast } from "sonner"
import {
  PromptInput,
  PromptInputFooter,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input"
import { ChatSettingsChips } from "./chat-settings-chips"
import {
  CHAT_COMPOSER_INPUT_CLASS_NAME,
  ChatComposerToolHeader,
  ComposerAttachmentsPreview,
  ComposerImageButton,
  ComposerSlashCommandButton,
  ComposerSubmitButton,
} from "./chat-composer-ui"
import { useChatComposer } from "./use-chat-composer"

interface ChatComposerInputProps {
  id: string
  placeholder: string
  textareaRef: RefObject<HTMLTextAreaElement | null>
  onSubmit: (args: { text: string; files: FileUIPart[] }) => void
  onSelectProjectId: (projectId: string | null) => void
  /** Slot rendered between the slash-command button and the settings chips */
  footerExtra?: ReactNode
  /** Slot rendered after the image button, before the submit button */
  footerTrailing?: ReactNode
}

/**
 * Shared PromptInput block used by both the new-chat composer and the
 * thread composer bar. Reads shared state from useChatComposer().
 *
 * The parent is responsible for:
 * - creating and owning textareaRef
 * - providing the onSubmit handler (route redirect, sendPrompt, etc.)
 * - providing onSelectProjectId (differs: thread updates scope, new-chat does not)
 * - injecting footerExtra / footerTrailing for per-composer controls
 */
export function ChatComposerInput({
  id,
  placeholder,
  textareaRef,
  onSubmit,
  onSelectProjectId,
  footerExtra,
  footerTrailing,
}: ChatComposerInputProps) {
  const {
    textInput,
    attachments,
    status,
    stop,
    isMobile,
    showPromptHeader,
    selectedModelId,
    selectedProjectId,
    selectedMode,
    projects,
    availableModels,
    setSelectedModel,
    setSelectedMode,
  } = useChatComposer()

  const handleSubmit = ({
    text,
    files,
  }: {
    text: string
    files: FileUIPart[]
  }) => {
    if ((!text.trim() && files.length === 0) || !selectedModelId) return
    onSubmit({ text, files })
    textInput.clear()
  }

  return (
    <>
      <label htmlFor={id} className="sr-only">
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
          id={id}
          ref={textareaRef}
          placeholder={placeholder}
          className="min-h-16 max-h-56 px-3 py-2 text-sm leading-relaxed placeholder:text-muted-foreground"
        />
        <PromptInputFooter className="border-t border-border px-3 py-2 text-muted-foreground">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:gap-3">
            <ComposerSlashCommandButton
              value={textInput.value}
              setInput={textInput.setInput}
              onFocus={() => textareaRef.current?.focus()}
            />
            {!isMobile && (
              <ComposerImageButton onClick={() => attachments.openFileDialog()} />
            )}
            {footerExtra}
            <div className="min-w-0">
              <ChatSettingsChips
                availableModels={availableModels}
                selectedModelId={selectedModelId}
                onSelectModel={setSelectedModel}
                selectedMode={selectedMode}
                onSelectMode={setSelectedMode}
                projects={projects}
                selectedProjectId={selectedProjectId}
                onSelectProjectId={onSelectProjectId}
                showImageAction={isMobile}
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pl-3">
            {footerTrailing}
          </div>
          <ComposerSubmitButton status={status} onStop={stop} />
        </PromptInputFooter>
      </PromptInput>
    </>
  )
}
