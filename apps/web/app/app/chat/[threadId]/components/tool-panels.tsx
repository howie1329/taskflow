import {
  ChainOfThought,
  EnhancedChainOfThoughtHeader,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought"
import {
  Tool,
  EnhancedToolHeader,
  ToolContent,
  ToolSummaryBar,
  ToolRawPayload,
} from "@/components/ai-elements/tool"
import {
  detectProvider,
} from "@/components/ai-elements/provider-badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronDownIcon } from "lucide-react"
import type { ToolCall } from "./tool-types"
import {
  getToolDisplayNameFromKey,
  getToolInputSummary,
  getToolStateInfo,
  getToolSummary,
} from "./tool-meta"
import { ToolProgressBanner } from "./tool-progress-banner"
import { renderToolContent } from "./tool-render-content"

interface PreferencesLike {
  aiChatShowActions?: boolean
  aiChatShowToolDetails?: boolean
}

interface ToolPanelsProps {
  toolCalls: ToolCall[]
  preferences: PreferencesLike | undefined
  isStreaming: boolean
}

export function ToolPanels({ toolCalls, preferences, isStreaming }: ToolPanelsProps) {
  if (toolCalls.length === 0) return null

  const renderToolCard = (toolCall: ToolCall) => (
    <Tool key={toolCall.id}>
      <EnhancedToolHeader
        toolName={toolCall.toolKey}
        state={toolCall.state}
        preliminary={toolCall.preliminary}
      />
      <ToolContent>
        <div className="space-y-3 pt-2">
          <ToolSummaryBar summary={getToolSummary(toolCall)} />
          {renderToolContent(toolCall)}
          {(toolCall.input !== undefined || toolCall.output !== undefined) && (
            <ToolRawPayload input={toolCall.input} output={toolCall.output} />
          )}
        </div>
      </ToolContent>
    </Tool>
  )

  return (
    <div className="space-y-2">
      {(isStreaming || preferences?.aiChatShowActions !== false) && (
        <ChainOfThought defaultOpen={isStreaming}>
          <EnhancedChainOfThoughtHeader
            totalSteps={toolCalls.length}
            providers={toolCalls
              .filter(
                (toolCall) =>
                  toolCall.state === "output-available" ||
                  toolCall.state === "output-error",
              )
              .map((toolCall) => detectProvider(toolCall.toolKey))}
          >
            Actions
          </EnhancedChainOfThoughtHeader>
          <ChainOfThoughtContent className="mt-2 space-y-2">
            {toolCalls.map((toolCall) => {
              const stateInfo = getToolStateInfo(toolCall.state, toolCall.preliminary)
              const summary =
                getToolSummary(toolCall) ?? getToolInputSummary(toolCall.input)
              const displayName = getToolDisplayNameFromKey(toolCall.toolKey)
              return (
                <ChainOfThoughtStep
                  key={toolCall.id}
                  label={displayName}
                  description={summary ?? stateInfo.badgeLabel}
                  status={stateInfo.stepStatus}
                  toolName={toolCall.toolKey}
                />
              )
            })}

            {preferences?.aiChatShowToolDetails !== false && (
              <Collapsible defaultOpen={false}>
                <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-md py-1 text-xs text-muted-foreground hover:text-foreground">
                  <ChevronDownIcon className="size-3.5 transition-transform group-data-[state=open]:rotate-180" />
                  <span>View tool details</span>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 pt-2">
                  {toolCalls.map((toolCall) => renderToolCard(toolCall))}
                </CollapsibleContent>
              </Collapsible>
            )}
          </ChainOfThoughtContent>
        </ChainOfThought>
      )}

      <ToolProgressBanner toolCalls={toolCalls} isStreaming={isStreaming} />
    </div>
  )
}
