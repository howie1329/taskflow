import type { UIMessage } from "ai"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDownIcon, CopyIcon } from "lucide-react"
import { getMessageReasoning, getMessageText } from "./message-parts"
import { getToolCalls } from "./tool-calls"
import {
  getToolDisplayNameFromKey,
  getToolStateInfo,
} from "./tool-meta"
import { cn } from "@/lib/utils"

interface MessageDetailsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  message: UIMessage | null
  onCopy?: (text: string) => void
}

type PersistedMessageMetadata = {
  usage?: {
    inputTokens: number
    outputTokens: number
    totalTokens?: number
  }
  costUsdMicros?: number
}

function estimateTokens(text: string) {
  return Math.max(1, Math.ceil(text.length / 4))
}

function getMessageLengthLabel(text: string) {
  const wordCount = text.trim().length ? text.trim().split(/\s+/).length : 0
  return `${wordCount} words · ${text.length} chars`
}

const blockClassName =
  "rounded-lg border border-border/40 bg-muted/30 p-4"
const labelClassName = "text-sm text-muted-foreground"
const valueClassName = "text-[15px] leading-6"

export function MessageDetailsSheet({
  open,
  onOpenChange,
  message,
  onCopy,
}: MessageDetailsSheetProps) {
  const messageText = message ? getMessageText(message) : ""
  const metadata = message?.metadata as PersistedMessageMetadata | undefined
  const persistedUsage = metadata?.usage
  const persistedCostUsdMicros = metadata?.costUsdMicros
  const reasoningText =
    message?.role === "assistant" ? getMessageReasoning(message) : null
  const toolCalls =
    message?.role === "assistant" ? getToolCalls(message) : []
  const hasReasoning = !!reasoningText?.trim()
  const hasToolCalls = toolCalls.length > 0
  const canCopy = !!message && !!onCopy
  const totalTokens =
    persistedUsage?.totalTokens ??
    (persistedUsage
      ? persistedUsage.inputTokens + persistedUsage.outputTokens
      : undefined)
  const formattedCost =
    persistedCostUsdMicros === undefined
      ? null
      : new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(persistedCostUsdMicros / 1_000_000)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader className="pb-5">
          <SheetTitle className="text-base font-medium">
            Assistant message details
          </SheetTitle>
          <SheetDescription className="text-sm mb-1">
            Token and size metrics for this response.
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-5 py-5">
          {!message ? (
            <p className={cn(labelClassName, "py-4")}>
              No message selected.
            </p>
          ) : (
            <>
              {canCopy && (
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onCopy(messageText)}
                  >
                    <CopyIcon className="size-3.5 mr-2" />
                    Copy message
                  </Button>
                </div>
              )}

              {persistedUsage ? (
                <>
                  <div className={blockClassName}>
                    <p className={labelClassName}>Input tokens</p>
                    <p className={cn(valueClassName, "font-semibold mt-0.5")}>
                      {persistedUsage.inputTokens}
                    </p>
                  </div>
                  <div className={blockClassName}>
                    <p className={labelClassName}>Output tokens</p>
                    <p className={cn(valueClassName, "font-semibold mt-0.5")}>
                      {persistedUsage.outputTokens}
                    </p>
                  </div>
                  {totalTokens !== undefined && (
                    <div className={blockClassName}>
                      <p className={labelClassName}>Total tokens</p>
                      <p className={cn(valueClassName, "font-semibold mt-0.5")}>
                        {totalTokens}
                      </p>
                    </div>
                  )}
                  {formattedCost && (
                    <div className={blockClassName}>
                      <p className={labelClassName}>Estimated cost</p>
                      <p className={cn(valueClassName, "font-semibold mt-0.5")}>
                        {formattedCost}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className={blockClassName}>
                  <p className={labelClassName}>Estimated tokens</p>
                  <p className={cn(valueClassName, "font-semibold mt-0.5")}>
                    {estimateTokens(messageText)}
                  </p>
                </div>
              )}

              <div className={blockClassName}>
                <p className={labelClassName}>Length</p>
                <p className={cn(valueClassName, "mt-0.5 font-medium")}>
                  {getMessageLengthLabel(messageText)}
                </p>
              </div>

              {message.role === "assistant" && hasReasoning && (
                <div className={blockClassName}>
                  <p className={labelClassName}>Reasoning</p>
                  <p className={cn(valueClassName, "mt-0.5 text-muted-foreground")}>
                    {reasoningText!.trim().split(/\s+/).length} words
                  </p>
                  <Collapsible defaultOpen={false} className="group mt-3">
                    <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-md py-1.5 text-sm text-muted-foreground hover:text-foreground">
                      <ChevronDownIcon className="size-4 transition-transform group-data-[state=open]:rotate-180" />
                      Show full reasoning
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <p className={cn(valueClassName, "mt-2 whitespace-pre-wrap text-muted-foreground")}>
                        {reasoningText}
                      </p>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )}

              {message.role === "assistant" && hasToolCalls && (
                <div className={blockClassName}>
                  <p className={labelClassName}>Tools used</p>
                  <ul className={cn("mt-2 space-y-2", valueClassName)}>
                    {toolCalls.map((tool) => {
                      const stateInfo = getToolStateInfo(tool.state)
                      return (
                        <li
                          key={tool.id}
                          className="flex items-center justify-between gap-2"
                        >
                          <span className="font-medium">
                            {getToolDisplayNameFromKey(tool.toolKey)}
                          </span>
                          <Badge
                            variant={stateInfo.isError ? "destructive" : "secondary"}
                            className="text-xs font-normal"
                          >
                            {stateInfo.badgeLabel}
                          </Badge>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              <div className={blockClassName}>
                <Collapsible defaultOpen={false} className="group">
                  <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 rounded-md py-1.5 text-left">
                    <span className={labelClassName}>Preview</span>
                    <span className="text-sm text-muted-foreground">
                      {messageText.length} characters
                    </span>
                    <ChevronDownIcon className="size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <p className={cn(valueClassName, "mt-3 whitespace-pre-wrap")}>
                      {messageText || "No text in this message."}
                    </p>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
