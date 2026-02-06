import { TavilyWebSearch } from "./Tavily"
import { taskflowTools } from "./Taskflow"

export const Tools = {
  webSearch: TavilyWebSearch,
  ...taskflowTools,
} as const
