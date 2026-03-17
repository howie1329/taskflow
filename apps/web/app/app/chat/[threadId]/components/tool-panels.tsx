import type { ReactNode } from "react";
import {
  ChainOfThought,
  EnhancedChainOfThoughtHeader,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought";
import {
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
  getToolInputQuery,
  getToolStateInfo,
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

  const showToolDetails = preferences?.aiChatShowToolDetails !== false;

  const renderActionStep = (
    toolCall: ToolCall,
    includeDescription: boolean,
  ) => {
    const stateInfo = getToolStateInfo(toolCall.state);
    const summary = getToolInputSummary(toolCall.input);
    const displayName = getToolDisplayNameFromKey(toolCall.toolKey);

    return (
      <Collapsible key={toolCall.id} className="group">
        <ChainOfThoughtStep
          label={displayName}
          description={includeDescription ? summary ?? stateInfo.badgeLabel : undefined}
          status={stateInfo.stepStatus}
          toolName={toolCall.toolKey}
          trailing={
            showToolDetails ? (
              <CollapsibleTrigger
                className="rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Toggle tool details"
              >
                <ChevronDownIcon className="size-3.5 transition-transform group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
            ) : null
          }
        >
          {showToolDetails ? (
            <CollapsibleContent className="pt-2">
              <div className="space-y-3 rounded-md border border-border/35 bg-muted/15 p-3">
                <ToolSummaryBar
                  label="Query"
                  summary={getToolInputQuery(toolCall.input)}
                />
                <div className="border-t border-border/35 pt-3">
                  {renderToolContent(toolCall)}
                </div>
                {toolCall.output !== undefined && (
                  <ToolRawPayload output={toolCall.output} />
                )}
              </div>
            </CollapsibleContent>
          ) : null}
        </ChainOfThoughtStep>
      </Collapsible>
    );
  }

  return (
    <>
      {preferences?.aiChatShowActions !== false &&
        (toolCalls.length <= INLINE_ACTIONS_MAX ? (
          <div className="space-y-2">
            {toolCalls.map((toolCall) => renderActionStep(toolCall, false))}
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
              {toolCalls.map((toolCall) => renderActionStep(toolCall, true))}
            </ChainOfThoughtContent>
          </ChainOfThought>
        ))}
    </>
  );
}
