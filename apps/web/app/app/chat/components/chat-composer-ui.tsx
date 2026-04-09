"use client";

import type { RefObject } from "react";
import type { ChatStatus } from "ai";
import { ImagePlusIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import {
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from "@/components/ai-elements/attachments";
import {
  PromptInputSubmit,
  usePromptInputAttachments,
} from "@/components/ai-elements/prompt-input";
import { ToolLockCommandMenu } from "./tool-lock-command-menu";

export const CHAT_COMPOSER_INPUT_CLASS_NAME =
  "**:data-[slot=input-group]:rounded-md **:data-[slot=input-group]:border-input **:data-[slot=input-group]:bg-input **:data-[slot=input-group]:shadow-none **:data-[slot=input-group]:transition-colors **:data-[slot=input-group]:duration-150 **:data-[slot=input-group]:has-[[data-slot=input-group-control]:focus-visible]:border-ring **:data-[slot=input-group]:has-[[data-slot=input-group-control]:focus-visible]:ring-2 **:data-[slot=input-group]:has-[[data-slot=input-group-control]:focus-visible]:ring-ring **:data-[slot=input-group]:has-[[data-slot=input-group-control]:focus-visible]:ring-offset-0"

/** Shared textarea sizing: short default height, wider max scroll than min for long prompts */
export const CHAT_COMPOSER_TEXTAREA_CLASS_NAME =
  "max-h-48 min-h-11 px-3 py-1.5 leading-snug"

export function getComposerHeaderClassName(showPromptHeader: boolean) {
  return `grid overflow-hidden transition-[grid-template-rows,opacity,margin-bottom] duration-200 ease-out ${
    showPromptHeader
      ? "mb-1.5 grid-rows-[1fr] opacity-100"
      : "pointer-events-none mb-0 grid-rows-[0fr] opacity-0"
  }`;
}

export function openComposerCommands(
  value: string,
  setInput: (value: string) => void,
  onFocus?: () => void,
) {
  setInput(value.trimStart().startsWith("/") ? value : `/${value}`);
  onFocus?.();
}

export function ChatComposerToolHeader({
  show,
  textareaRef,
}: {
  show: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
}) {
  return (
    <div className={getComposerHeaderClassName(show)} aria-hidden={!show}>
      <div className="overflow-hidden border-b border-border/50 pb-1.5">
        <ToolLockCommandMenu textareaRef={textareaRef} />
      </div>
    </div>
  );
}

export function ComposerAttachmentsPreview() {
  const attachments = usePromptInputAttachments();
  if (attachments.files.length === 0) return null;

  return (
    <div className="px-3 pt-2">
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
  );
}

const COMPOSER_ICON_BUTTON_CLASS_NAME =
  "size-8 rounded-md text-muted-foreground shadow-none transition-[color,background-color,transform] duration-150 motion-safe:active:scale-[0.97] ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-accent/50 hover:text-foreground";

export function ComposerSlashCommandButton({
  value,
  setInput,
  onFocus,
}: {
  value: string;
  setInput: (value: string) => void;
  onFocus?: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Slash commands"
          className={COMPOSER_ICON_BUTTON_CLASS_NAME}
          onClick={() => openComposerCommands(value, setInput, onFocus)}
        >
          <span className="text-xs font-semibold leading-none">/</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent sideOffset={6}>
        <p>Slash commands</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function ComposerImageButton({ onClick }: { onClick: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Add image"
          className={COMPOSER_ICON_BUTTON_CLASS_NAME}
          onClick={onClick}
        >
          <ImagePlusIcon className="size-3.5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent sideOffset={6}>
        <p>Add image</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function ComposerSubmitButton({
  status,
  onStop,
}: {
  status: ChatStatus;
  onStop: () => void;
}) {
  const tooltipLabel =
    status === "submitted" || status === "streaming"
      ? "Stop generating"
      : "Send message";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>
          <PromptInputSubmit
            status={status}
            onStop={onStop}
            size="icon-sm"
            variant="default"
            className="size-8 rounded-md border-0 shadow-none bg-primary text-primary-foreground hover:bg-primary/90"
          />
        </div>
      </TooltipTrigger>
      <TooltipContent sideOffset={6}>
        <p>{tooltipLabel}</p>
      </TooltipContent>
    </Tooltip>
  );
}
