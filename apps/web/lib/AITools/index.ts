import { TavilyTools } from "./Tavily/index"
import { taskflowTools } from "./Taskflow/Taskflow"
import { ValyuTools } from "./Valyu/index"

export const Tools = {
  ...TavilyTools,
  ...taskflowTools,
  ...ValyuTools,
} as const
