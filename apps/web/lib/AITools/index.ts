import { ExaTools } from "./Exa"
import { TavilyTools } from "./Tavily/index"
import { taskflowTools } from "./Taskflow/Taskflow"
import { ValyuTools } from "./Valyu/index"
import { ParallelTools } from "./ParallelAi/index"
import { FirecrawlTools } from "./Firecrawl/index"

export const Tools = {
  ...ExaTools,
  ...TavilyTools,
  ...taskflowTools,
  ...ValyuTools,
  ...ParallelTools,
  ...FirecrawlTools,
} as const
