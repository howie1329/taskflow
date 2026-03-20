export type TaskPriority = "low" | "medium" | "high"

/** Semantic chart/destructive tokens for priority dots (design system: no raw palette in feature UI). */
const PRIORITY_DOT_BG: Record<TaskPriority, string> = {
  low: "bg-chart-3",
  medium: "bg-chart-1",
  high: "bg-destructive",
}

export function priorityDotClassName(priority: TaskPriority): string {
  return PRIORITY_DOT_BG[priority]
}
