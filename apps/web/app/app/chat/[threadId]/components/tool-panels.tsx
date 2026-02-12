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
import { renderToolContent } from "./tool-render-content"

interface PreferencesLike {
  aiChatShowActions?: boolean
  aiChatShowToolDetails?: boolean
}

interface ToolPanelsProps {
  toolCalls: ToolCall[]
  preferences: PreferencesLike | undefined
}

export function ToolPanels({ toolCalls, preferences }: ToolPanelsProps) {
  if (toolCalls.length === 0) return null

  const renderToolCard = (toolCall: ToolCall) => (
    <Tool key={toolCall.id}>
      <EnhancedToolHeader
        toolName={toolCall.toolKey}
        state={toolCall.state}
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
    <>
      {preferences?.aiChatShowActions !== false && (
        <>
          <ChainOfThought defaultOpen={false}>
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
              Actions ({toolCalls.length})
            </EnhancedChainOfThoughtHeader>
            <ChainOfThoughtContent>
              {toolCalls.map((toolCall) => {
                const stateInfo = getToolStateInfo(toolCall.state)
                const summary = getToolInputSummary(toolCall.input)
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
            </ChainOfThoughtContent>
          </ChainOfThought>

          {preferences?.aiChatShowToolDetails !== false && (
            <>
              {toolCalls.length > 2 ? (
                <Collapsible defaultOpen={false}>
                  <CollapsibleTrigger className="flex w-full items-center gap-2 rounded-lg border p-2 text-sm text-muted-foreground hover:text-foreground">
                    <ChevronDownIcon className="size-4 transition-transform group-data-[state=open]:rotate-180" />
                    <span>{toolCalls.length} tool calls</span>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    {toolCalls.map((toolCall) => renderToolCard(toolCall))}
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                toolCalls.map((toolCall) => renderToolCard(toolCall))
              )}
            </>
          )}
        </>
      )}
    </>
  )
}
