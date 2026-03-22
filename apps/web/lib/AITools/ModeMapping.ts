import { ExaToolsKeys } from "./Exa"
import { FirecrawlToolsKeys } from "./Firecrawl"
import { taskflowToolsKeys } from "./Taskflow/Taskflow"
import { TavilyToolsKeys } from "./Tavily"
import { ValyuToolsKeys } from "./Valyu/index"
import { ParallelToolsKeys } from "./ParallelAi"
import { Tools } from "./index"
import { CustomToolsKeys, DaytonaToolKeys } from "./Custom"

type ToolKey = keyof typeof Tools

type Mode = {
    name: string
    activeTools: ToolKey[]
}


export const ModeMapping: Record<string, Mode> = {
    "Basic": {
        name: "Basic",
        activeTools: [...taskflowToolsKeys, ...TavilyToolsKeys, "firecrawlScrape"] as ToolKey[]
    },
    "Advanced": {
        name: "Advanced",
        activeTools: [...taskflowToolsKeys, ...FirecrawlToolsKeys, ...ExaToolsKeys, ...ParallelToolsKeys, ...CustomToolsKeys, "firecrawlScrape"] as ToolKey[]
    },
    "Finance": {
        name: "Finance",
        activeTools: [...taskflowToolsKeys, ...ValyuToolsKeys, ...ParallelToolsKeys, "firecrawlScrape"] as ToolKey[]
    },
    "Research": {
        name: "Research",
        activeTools: [...taskflowToolsKeys, ...ValyuToolsKeys, ...ParallelToolsKeys, ...ExaToolsKeys, "firecrawlScrape"] as ToolKey[]
    },
    "Social": {
        name: "Social",
        activeTools: [...taskflowToolsKeys, ...ValyuToolsKeys, ...ParallelToolsKeys, "firecrawlScrape"] as ToolKey[]
    }
}

export function getActiveToolsForMode(
  modeName: string,
  options?: {
    includeDaytonaTools?: boolean
  },
): ToolKey[] {
  const selectedMode = ModeMapping[modeName] ? modeName : "Basic"
  const activeTools = [...ModeMapping[selectedMode].activeTools]

  if (options?.includeDaytonaTools) {
    for (const toolKey of DaytonaToolKeys) {
      if (!activeTools.includes(toolKey as ToolKey)) {
        activeTools.push(toolKey as ToolKey)
      }
    }
  }

  return activeTools
}
