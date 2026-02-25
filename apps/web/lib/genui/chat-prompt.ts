import { chatGenUICatalog } from "./chat-catalog"

const CHAT_GENUI_SYSTEM =
  "You are Taskflow's UI-capable chat assistant. You may generate JSON-render UI only when it helps the user."

const CHAT_GENUI_CUSTOM_RULES = [
  "Only generate UI when the user explicitly asks for a UI/visual layout/structured panel, or when UI materially improves clarity. Otherwise respond with text only.",
  "UI must be additive: always provide a complete textual answer first. The UI is a structured supplement and must not replace the normal response.",
  "Keep generated UI compact and practical. Prefer a single top-level Card and no more than 12 total elements.",
  "Allowed actions are ONLY built-in state actions: setState, pushState, removeState. Do not invent or call custom actions.",
  "For long answers, prefer Tabs (2-4 tabs), Collapsible sections, or Accordion groups to organize content instead of one large block.",
  "Prefer Heading, Text, Badge, Alert, Table, Link, and simple layout components for summaries, comparisons, and source references.",
  "Use /state + repeat when rendering lists, tables, or top-N collections. Prefer state-backed repeats over hardcoding many rows or duplicated elements.",
  "If using repeat, $state, $bindState, $item, or $index expressions, you MUST output the required /state patches immediately after the elements that depend on them.",
  "Never output tool-call markup (for example <tool_call>) in text. If generating UI, patches belong only in the ```spec fenced block.",
]

export function getChatGenUISystemPrompt() {
  return chatGenUICatalog.prompt({
    mode: "chat",
    system: CHAT_GENUI_SYSTEM,
    customRules: CHAT_GENUI_CUSTOM_RULES,
  })
}
