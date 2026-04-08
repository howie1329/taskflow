import type { DynamicToolUIPart, ToolUIPart, UIMessage } from "ai";

export type ToolCall = {
  id: string;
  toolKey: string;
  state: ToolUIPart["state"];
  preliminary?: boolean;
  input?: unknown;
  output?: unknown;
  errorText?: string;
};

export type ToolStateInfo = {
  badgeLabel: string;
  stepStatus: "pending" | "active" | "complete";
  isError: boolean;
};

export function getToolCalls(message: UIMessage): ToolCall[] {
  return message.parts
    .filter((part): part is ToolUIPart | DynamicToolUIPart => {
      if (typeof part.type !== "string") return false;
      return part.type.startsWith("tool-") || part.type === "dynamic-tool";
    })
    .map((part, index) => {
      const rawToolName =
        part.type === "dynamic-tool" && "toolName" in part
          ? part.toolName
          : part.type;
      const toolKey = rawToolName.replace(/^tool-/, "");

      return {
        id: part.toolCallId ?? `${message.id}:${toolKey}:${index}`,
        toolKey,
        state: part.state,
        preliminary: "preliminary" in part ? part.preliminary : undefined,
        input: "input" in part ? part.input : undefined,
        output: "output" in part ? part.output : undefined,
        errorText: "errorText" in part ? part.errorText : undefined,
      };
    });
}
