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

  const compactToolSummary = toolCalls.map((toolCall) => {
    const stateInfo = getToolStateInfo(toolCall.state)
    return {
      id: toolCall.id,
      label: getToolDisplayNameFromKey(toolCall.toolKey),
      stateLabel: stateInfo.badgeLabel,
    }
  })

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
      <div className="-mb-1 overflow-x-auto pb-1">
        <div className="flex min-w-max items-center gap-1 whitespace-nowrap">
          {compactToolSummary.map((summary) => (
            <span
              key={summary.id}
              className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-muted/35 px-2 py-0.5 text-[10px] text-muted-foreground"
            >
              <span className="font-medium text-foreground">{summary.label}</span>
              <span className="text-muted-foreground/90">{summary.stateLabel}</span>
            </span>
          ))}
        </div>
      </div>

      {preferences?.aiChatShowActions !== false && (
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
            Actions
          </EnhancedChainOfThoughtHeader>
          <ChainOfThoughtContent className="mt-2 space-y-2">
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
    </>
  )
}
