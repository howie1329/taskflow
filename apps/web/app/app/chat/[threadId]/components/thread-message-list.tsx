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
import { getMessageFiles, getMessageReasoning, getMessageText } from "./message-parts"
import { MessageGenUIPanel } from "./message-genui-panel"
import { getToolCalls } from "./tool-calls"
import { ToolPanels } from "./tool-panels"

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
        const reasoningText = getMessageReasoning(message)
        const hasReasoning = !!reasoningText
        const toolCalls = message.role === "assistant" ? getToolCalls(message) : []
        const hasToolCalls = toolCalls.length > 0
        const messageText = getMessageText(message)
        const messageFiles = getMessageFiles(message)
        const hasFiles = messageFiles.length > 0
        const isStreamingMessage =
          message.role === "assistant" &&
          status === "streaming" &&
          index === uiMessages.length - 1

        return (
          <Message
            key={message.id}
            from={message.role}
            className={cn(
              "max-w-none gap-1.5",
              message.role === "user" && "justify-end",
            )}
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
                  messageFiles={messageFiles}
                  toolCalls={toolCalls}
                  hasToolCalls={hasToolCalls}
                  hasReasoning={hasReasoning}
                  reasoningText={reasoningText}
                  preferences={preferences}
                  status={status}
                  isStreamingMessage={isStreamingMessage}
                  plainMessageText={messageText}
                  onRegenerate={onRegenerate}
                  onCopy={onCopy}
                  onOpenDetails={onOpenDetails}
                />
              ) : (
                <div className="whitespace-pre-wrap text-[15px] leading-7">
                  {hasFiles && (
                    <Attachments variant="inline" className="mb-2">
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
                  <Streamdown
                    plugins={{ code, mermaid, math, cjk }}
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
      })}
    </>
  )
}

interface AssistantMessageBodyProps {
  message: UIMessage
  messageFiles: ReturnType<typeof getMessageFiles>
  toolCalls: ReturnType<typeof getToolCalls>
  hasToolCalls: boolean
  hasReasoning: boolean
  reasoningText: string | null
  preferences: PreferencesLike | undefined
  status: string
  isStreamingMessage: boolean
  plainMessageText: string
  onRegenerate: (assistantMessageId: string) => void
  onCopy: (messageText: string) => void
  onOpenDetails: (messageId: string) => void
}

type ToolProgressPart = {
  type: "data-toolProgress"
  id?: string
  data: {
    toolKey: string
    toolCallId: string
    status: "running" | "done" | "error"
    text: string
  }
}

function getMessageToolProgress(message: UIMessage): ToolProgressPart[] {
  return message.parts.filter(
    (part): part is ToolProgressPart => part.type === "data-toolProgress",
  )
}

function formatToolProgressLabel(toolKey: string) {
  return toolKey
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (value) => value.toUpperCase())
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
            {formatToolProgressLabel(part.data.toolKey)}
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
  hasToolCalls,
  hasReasoning,
  reasoningText,
  preferences,
  status,
  isStreamingMessage,
  plainMessageText,
  onRegenerate,
  onCopy,
  onOpenDetails,
}: AssistantMessageBodyProps) {
  const { spec, text: renderedText, hasSpec } = useJsonRenderMessage(
    message.parts as Parameters<typeof useJsonRenderMessage>[0],
  )
  const progressParts = getMessageToolProgress(message)

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

      {hasToolCalls && (
        <ToolPanels toolCalls={toolCalls} preferences={preferences} />
      )}

      {hasReasoning && preferences?.aiChatShowReasoning !== false && reasoningText && (
        <Reasoning isStreaming={status === "streaming"} defaultOpen={false}>
          <ReasoningTrigger />
          <ReasoningContent>{reasoningText}</ReasoningContent>
        </Reasoning>
      )}

      {hasSpec && spec && <MessageGenUIPanel spec={spec} />}

      {renderedText && (
        <Streamdown
          plugins={{ code, mermaid, math, cjk }}
          isAnimating={status === "streaming"}
          animated
        >
          {renderedText}
        </Streamdown>
      )}

      {isStreamingMessage && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ActivityIcon className="size-3.5 animate-pulse" />
          Streaming response...
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
