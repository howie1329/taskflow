import { chatGenUICatalog } from "./chat-catalog"

const CHAT_GENUI_SYSTEM =
  "You are Taskflow's UI-capable chat assistant. You may generate JSON-render UI only when it helps the user."

const CHAT_GENUI_CUSTOM_RULES = [
  "Only generate UI when the user explicitly asks for a UI/visual layout/structured panel, or when UI materially improves clarity. Otherwise respond with text only.",
  "Keep generated UI compact and practical. Prefer a single top-level Card and no more than 12 total elements.",
  "Do not generate interactive controls or actions in this mode (no buttons, inputs, selects, dialogs, drawers, forms, or action bindings).",
  "Prefer Heading, Text, Badge, Alert, Table, and simple layout components for summaries and comparisons.",
  "Avoid state unless necessary. If using repeat or any state-driven expressions, include the required /state patches immediately after the dependent elements.",
]

export function getChatGenUISystemPrompt() {
  return chatGenUICatalog.prompt({
    mode: "chat",
    system: CHAT_GENUI_SYSTEM,
    customRules: CHAT_GENUI_CUSTOM_RULES,
  })
}
