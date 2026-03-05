export const CHAT_SUGGESTIONS = [
  { title: "Plan my day", value: "Plan my day" },
  { title: "Break this into tasks", value: "Break this into tasks" },
  { title: "Prioritize my backlog", value: "Prioritize my backlog" },
  { title: "Create a project plan", value: "Create a project plan" },
  {
    title: "Generate UI summary card",
    value:
      "Create a compact UI summary card for my request using json-render components, with a title, short summary, and a small table if helpful.",
  },
] as const

export const EMPTY_STATE_SUGGESTIONS = [
  { title: "Plan my day", value: "Plan my day" },
  { title: "What's overdue?", value: "What's overdue?" },
  { title: "Summarize this project", value: "Summarize this project" },
] as const

export const THREAD_COMPOSER_SUGGESTIONS = CHAT_SUGGESTIONS
