import type { UIMessage } from "ai"
import { Message, MessageContent } from "@/components/ai-elements/message"
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-elements/reasoning"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Streamdown } from "streamdown"
import { code } from "@streamdown/code"
import { mermaid } from "@streamdown/mermaid"
import { math } from "@streamdown/math"
import { cjk } from "@streamdown/cjk"
import { ActivityIcon, CopyIcon, RefreshCwIcon } from "lucide-react"
import { getMessageReasoning, getMessageText } from "./message-parts"
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
                "text-sm leading-6",
                message.role === "assistant" &&
                  "w-full border-l border-border/50 pl-6",
                message.role === "user" &&
                  "max-w-[32rem] rounded-md border border-border/60 bg-muted/40 px-2 py-2",
              )}
            >
              {message.role === "assistant" ? (
                <div className="flex flex-col gap-4">
                  {hasToolCalls && (
                    <ToolPanels toolCalls={toolCalls} preferences={preferences} />
                  )}
                  {hasReasoning && preferences?.aiChatShowReasoning !== false && (
                    <Reasoning isStreaming={status === "streaming"} defaultOpen={false}>
                      <ReasoningTrigger />
                      <ReasoningContent>{reasoningText}</ReasoningContent>
                    </Reasoning>
                  )}
                  <Streamdown
                    plugins={{ code, mermaid, math, cjk }}
                    isAnimating={status === "streaming"}
                    animated
                  >
                    {messageText}
                  </Streamdown>

                  {isStreamingMessage && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ActivityIcon className="size-3.5 animate-pulse" />
                      Streaming response...
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => onRegenerate(message.id)}
                    >
                      <RefreshCwIcon className="mr-1 size-3.5" />
                      Regenerate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => onCopy(messageText)}
                    >
                      <CopyIcon className="mr-1 size-3.5" />
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => onOpenDetails(message.id)}
                    >
                      Details
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="whitespace-pre-wrap text-sm">
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
