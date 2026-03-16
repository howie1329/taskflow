import type { ReactNode } from "react";
import {
  ChainOfThought,
  EnhancedChainOfThoughtHeader,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought";
import {
  Tool,
  EnhancedToolHeader,
  ToolContent,
  ToolSummaryBar,
  ToolRawPayload,
} from "@/components/ai-elements/tool";
import { detectProvider } from "@/components/ai-elements/provider-badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDownIcon } from "lucide-react";
import type { ToolCall } from "./tool-calls";
import {
  getToolDisplayNameFromKey,
  getToolInputSummary,
  getToolStateInfo,
  getToolSummary,
  summarizeToolOutput,
} from "./tool-meta";
import { getToolDefinition } from "./tool-definitions";

const INLINE_ACTIONS_MAX = 4;

interface PreferencesLike {
  aiChatShowActions?: boolean;
  aiChatShowToolDetails?: boolean;
}

interface ToolPanelsProps {
  toolCalls: ToolCall[];
  preferences: PreferencesLike | undefined;
}

function renderToolContent(toolCall: ToolCall): ReactNode {
  if (
    toolCall.state !== "output-available" &&
    toolCall.state !== "output-error"
  ) {
    return (
      <p className="text-sm text-muted-foreground">
        {getToolStateInfo(toolCall.state).badgeLabel}
      </p>
    );
  }

  if (toolCall.errorText) {
    return <p className="text-sm text-destructive">{toolCall.errorText}</p>;
  }

  const renderedContent = getToolDefinition(toolCall.toolKey)?.render?.(
    toolCall,
  );
  if (renderedContent) {
    return renderedContent;
  }

  const summary = summarizeToolOutput(toolCall.output);
  if (summary) {
    return <p className="text-sm">{summary}</p>;
  }

  return <p className="text-sm text-muted-foreground">Completed</p>;
}

export function ToolPanels({ toolCalls, preferences }: ToolPanelsProps) {
  if (toolCalls.length === 0) return null;

  const actionSteps = toolCalls.map((toolCall) => {
    const stateInfo = getToolStateInfo(toolCall.state);
    const summary = getToolInputSummary(toolCall.input);
    const displayName = getToolDisplayNameFromKey(toolCall.toolKey);

    return (
      <ChainOfThoughtStep
        key={toolCall.id}
        label={displayName}
        description={summary ?? stateInfo.badgeLabel}
        status={stateInfo.stepStatus}
        toolName={toolCall.toolKey}
      />
    );
  });

  const renderToolCard = (toolCall: ToolCall) => (
    <Tool key={toolCall.id}>
      <EnhancedToolHeader toolName={toolCall.toolKey} state={toolCall.state} />
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
  );

  const detailsSection =
    preferences?.aiChatShowToolDetails !== false ? (
      <Collapsible defaultOpen={false}>
        <CollapsibleTrigger className="group flex w-full items-center gap-2 rounded-md py-1 text-xs text-muted-foreground hover:text-foreground">
          <ChevronDownIcon className="size-3.5 transition-transform group-data-[state=open]:rotate-180" />
          <span>View tool details</span>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-2 pt-2">
          {toolCalls.map((toolCall) => renderToolCard(toolCall))}
        </CollapsibleContent>
      </Collapsible>
    ) : null;

  return (
    <>
      {preferences?.aiChatShowActions !== false &&
        (toolCalls.length <= INLINE_ACTIONS_MAX ? (
          <div className="space-y-2">
            {actionSteps}
            {detailsSection}
          </div>
        ) : (
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
              {actionSteps}
              {detailsSection}
            </ChainOfThoughtContent>
          </ChainOfThought>
        ))}
    </>
  );
}
