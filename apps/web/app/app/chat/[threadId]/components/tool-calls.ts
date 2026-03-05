import type { DynamicToolUIPart, ToolUIPart, UIMessage } from "ai"
import type { ToolCall } from "./tool-types"

export function getToolCalls(message: UIMessage): ToolCall[] {
  return message.parts
    .filter((part): part is ToolUIPart | DynamicToolUIPart => {
      if (typeof part.type !== "string") return false
      return part.type.startsWith("tool-") || part.type === "dynamic-tool"
    })
    .map((part, index) => {
      const rawToolName =
        part.type === "dynamic-tool" && "toolName" in part
          ? part.toolName
          : part.type
      const toolKey = rawToolName.replace(/^tool-/, "")

      return {
        id: part.toolCallId ?? `${message.id}:${toolKey}:${index}`,
        toolKey,
        state: part.state,
        input: "input" in part ? part.input : undefined,
        output: "output" in part ? part.output : undefined,
        errorText: "errorText" in part ? part.errorText : undefined,
      }
    })
}
