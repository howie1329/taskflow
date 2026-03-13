import { memo, useMemo } from "react"
import type { UIMessage } from "ai"
import { useJsonRenderMessage } from "@json-render/react"
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
} from "@/components/ai-elements/message"
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning"
import { cn } from "@/lib/utils"
import { Streamdown } from "streamdown"
import { code } from "@streamdown/code"
import { mermaid } from "@streamdown/mermaid"
import { math } from "@streamdown/math"
import { cjk } from "@streamdown/cjk"
import {
  ActivityIcon,
  AlertCircleIcon,
  CheckCircle2Icon,
  CopyIcon,
  EllipsisIcon,
  RefreshCwIcon,
} from "lucide-react"
import {
  Attachment,
  AttachmentPreview,
  Attachments,
} from "@/components/ai-elements/attachments"
import { Skeleton } from "@/components/ui/skeleton"
import {
  parseMessageParts,
  type ToolProgressPart,
} from "./message-parts"
import { MessageGenUIPanel } from "./message-genui-panel"
import { ToolPanels } from "./tool-panels"
import { formatToolKeyLabel } from "./tool-meta"
import type { ToolCall } from "./tool-types"

const STREAMDOWN_PLUGINS = { code, mermaid, math, cjk }

interface PreferencesLike {
  aiChatShowReasoning?: boolean
  aiChatShowActions?: boolean
  aiChatShowToolDetails?: boolean
}

interface ThreadMessageListProps {
  uiMessages: UIMessage[]
  status: string
  preferences: PreferencesLike | undefined
  onRegenerate: (assistantMessageId: string) => void
  onCopy: (messageText: string) => void
  onOpenDetails: (messageId: string) => void
}

export function ThreadMessageList({
  uiMessages,
  status,
  preferences,
  onRegenerate,
  onCopy,
  onOpenDetails,
}: ThreadMessageListProps) {
  return (
    <>
      {uiMessages.map((message, index) => {
        return (
          <ThreadMessageRow
            key={message.id}
            message={message}
            index={index}
            totalMessages={uiMessages.length}
            status={status}
            preferences={preferences}
            onRegenerate={onRegenerate}
            onCopy={onCopy}
            onOpenDetails={onOpenDetails}
          />
        )
      })}
    </>
  )
}

interface ThreadMessageRowProps {
  message: UIMessage
  index: number
  totalMessages: number
  status: string
  preferences: PreferencesLike | undefined
  onRegenerate: (assistantMessageId: string) => void
  onCopy: (messageText: string) => void
  onOpenDetails: (messageId: string) => void
}

const ThreadMessageRow = memo(function ThreadMessageRow({
  message,
  index,
  totalMessages,
  status,
  preferences,
  onRegenerate,
  onCopy,
  onOpenDetails,
}: ThreadMessageRowProps) {
  const parsedMessage = useMemo(() => parseMessageParts(message), [message])
  const {
    files,
    reasoningText,
    text: messageText,
    toolCalls,
    toolProgress,
  } = parsedMessage
  const hasReasoning = !!reasoningText
  const hasFiles = files.length > 0
  const isStreamingMessage =
    message.role === "assistant" &&
    status === "streaming" &&
    index === totalMessages - 1

  return (
    <Message
      from={message.role}
      className={cn("max-w-none gap-1.5", message.role === "user" && "justify-end")}
    >
      <MessageContent
        className={cn(
          "text-[15px] leading-7",
          message.role === "assistant" && "w-full",
          message.role === "user" && "max-w-xl",
        )}
      >
        {message.role === "assistant" ? (
          <AssistantMessageBody
            message={message}
            messageFiles={files}
            toolCalls={toolCalls}
            hasReasoning={hasReasoning}
            reasoningText={reasoningText}
            preferences={preferences}
            status={status}
            isStreamingMessage={isStreamingMessage}
            plainMessageText={messageText}
            progressParts={toolProgress}
            onRegenerate={onRegenerate}
            onCopy={onCopy}
            onOpenDetails={onOpenDetails}
          />
        ) : (
          <div className="whitespace-pre-wrap text-[15px] leading-7">
            {hasFiles && (
              <Attachments variant="inline" className="mb-2">
                {files.map((file, fileIndex) => (
                  <Attachment
                    key={`${message.id}-${file.filename ?? "file"}-${fileIndex}`}
                    data={{ ...file, id: `${message.id}-${fileIndex}` }}
                  >
                    <AttachmentPreview />
                  </Attachment>
                ))}
              </Attachments>
            )}
            <Streamdown
              plugins={STREAMDOWN_PLUGINS}
              isAnimating={status === "streaming"}
              animated
            >
              {messageText}
            </Streamdown>
          </div>
        )}
      </MessageContent>
    </Message>
  )
})

interface AssistantMessageBodyProps {
  message: UIMessage
  messageFiles: ReturnType<typeof parseMessageParts>["files"]
  toolCalls: ToolCall[]
  hasReasoning: boolean
  reasoningText: string | null
  preferences: PreferencesLike | undefined
  status: string
  isStreamingMessage: boolean
  plainMessageText: string
  progressParts: ToolProgressPart[]
  onRegenerate: (assistantMessageId: string) => void
  onCopy: (messageText: string) => void
  onOpenDetails: (messageId: string) => void
}

function ToolProgressList({ parts }: { parts: ToolProgressPart[] }) {
  if (parts.length === 0) return null

  return (
    <div className="space-y-2">
      {parts.map((part) => (
        <div
          key={part.id ?? part.data.toolCallId}
          className="flex items-center gap-2 rounded-full border border-border/60 bg-muted/20 px-3 py-1.5 text-sm"
        >
          {part.data.status === "running" ? (
            <ActivityIcon className="size-3.5 animate-pulse text-muted-foreground" />
          ) : part.data.status === "done" ? (
            <CheckCircle2Icon className="size-3.5 text-muted-foreground" />
          ) : (
            <AlertCircleIcon className="size-3.5 text-destructive" />
          )}
          <span className="font-medium text-foreground/85">
            {formatToolKeyLabel(part.data.toolKey)}
          </span>
          <span className="min-w-0 truncate text-muted-foreground">
            {part.data.text}
          </span>
        </div>
      ))}
    </div>
  )
}

function AssistantMessageBody({
  message,
  messageFiles,
  toolCalls,
  hasReasoning,
  reasoningText,
  preferences,
  status,
  isStreamingMessage,
  plainMessageText,
  progressParts,
  onRegenerate,
  onCopy,
  onOpenDetails,
}: AssistantMessageBodyProps) {
  const { spec, text: renderedText, hasSpec } = useJsonRenderMessage(
    message.parts as Parameters<typeof useJsonRenderMessage>[0],
  )

  return (
    <div className="flex flex-col gap-4">
      {messageFiles.length > 0 && (
        <Attachments variant="inline" className="mr-auto">
          {messageFiles.map((file, fileIndex) => (
            <Attachment
              key={`${message.id}-${file.filename ?? "file"}-${fileIndex}`}
              data={{ ...file, id: `${message.id}-${fileIndex}` }}
            >
              <AttachmentPreview />
            </Attachment>
          ))}
        </Attachments>
      )}

      <ToolProgressList parts={progressParts} />

      {toolCalls.length > 0 && (
        <ToolPanels toolCalls={toolCalls} preferences={preferences} />
      )}

      {hasReasoning && preferences?.aiChatShowReasoning !== false && reasoningText && (
        <Reasoning isStreaming={status === "streaming"} defaultOpen={false}>
          <ReasoningTrigger />
          <ReasoningContent>{reasoningText}</ReasoningContent>
        </Reasoning>
      )}

      {hasSpec && spec && <MessageGenUIPanel spec={spec} />}

      {isStreamingMessage && !renderedText?.trim() ? (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Skeleton className="h-4 w-full max-w-[85%] rounded" />
            <Skeleton className="h-4 w-8 shrink-0 rounded" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-4 w-full max-w-[70%] rounded" />
            <Skeleton className="h-4 w-12 shrink-0 rounded" />
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="animate-pulse">Thinking...</span>
            <span className="sr-only">Streaming response</span>
          </div>
        </div>
      ) : (
        renderedText && (
          <div>
            <Streamdown
              plugins={STREAMDOWN_PLUGINS}
              isAnimating={status === "streaming"}
              animated
            >
              {renderedText}
            </Streamdown>
          </div>
        )
      )}

      {isStreamingMessage && renderedText?.trim() && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ActivityIcon className="size-3.5 animate-pulse" />
          <span>Streaming...</span>
        </div>
      )}

      <MessageActions className="opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100">
        <MessageAction
          tooltip="Regenerate"
          label="Regenerate"
          onClick={() => onRegenerate(message.id)}
        >
          <RefreshCwIcon className="size-3.5" />
        </MessageAction>
        <MessageAction
          tooltip="Copy"
          label="Copy"
          onClick={() => onCopy(plainMessageText)}
        >
          <CopyIcon className="size-3.5" />
        </MessageAction>
        <MessageAction
          tooltip="Details"
          label="Details"
          onClick={() => onOpenDetails(message.id)}
        >
          <EllipsisIcon className="size-3.5" />
        </MessageAction>
      </MessageActions>
    </div>
  )
}
