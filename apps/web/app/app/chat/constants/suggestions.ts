export const CHAT_SUGGESTIONS = [
  { title: "Plan my day", value: "Plan my day" },
  { title: "Break this into tasks", value: "Break this into tasks" },
  { title: "Prioritize my backlog", value: "Prioritize my backlog" },
  { title: "Create a project plan", value: "Create a project plan" },
  { title: "What's on my plate today?", value: "What's on my plate today?" },
] as const;

export const EMPTY_STATE_SUGGESTIONS = [
  { title: "Plan my day", value: "Plan my day" },
  { title: "What's overdue?", value: "What's overdue?" },
  { title: "Summarize this project", value: "Summarize this project" },
] as const;

export const THREAD_COMPOSER_SUGGESTIONS = CHAT_SUGGESTIONS;
