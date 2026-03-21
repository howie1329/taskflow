import { ExaToolsKeys } from "./Exa"
import { FirecrawlToolsKeys } from "./Firecrawl"
import { taskflowToolsKeys } from "./Taskflow/Taskflow"
import { TavilyToolsKeys } from "./Tavily"
import { ValyuToolsKeys } from "./Valyu/index"
import { ParallelToolsKeys } from "./ParallelAi"
import { Tools } from "./index"
import { CustomToolsKeys } from "./Custom"

type ToolKey = keyof typeof Tools

type Mode = {
    name: string
    activeTools: ToolKey[]
}


export const ModeMapping: Record<string, Mode> = {
    "Basic": {
        name: "Basic",
        activeTools: [...taskflowToolsKeys, ...TavilyToolsKeys, "firecrawlScrape", "getDaytonaStatus"] as ToolKey[]
    },
    "Advanced": {
        name: "Advanced",
        activeTools: [...taskflowToolsKeys, ...FirecrawlToolsKeys, ...ExaToolsKeys, ...ParallelToolsKeys, ...CustomToolsKeys, "firecrawlScrape"] as ToolKey[]
    },
    "Finance": {
        name: "Finance",
        activeTools: [...taskflowToolsKeys, ...ValyuToolsKeys, ...ParallelToolsKeys, "firecrawlScrape", "getDaytonaStatus"] as ToolKey[]
    },
    "Research": {
        name: "Research",
        activeTools: [...taskflowToolsKeys, ...ValyuToolsKeys, ...ParallelToolsKeys, ...ExaToolsKeys, "firecrawlScrape", "getDaytonaStatus"] as ToolKey[]
    },
    "Social": {
        name: "Social",
        activeTools: [...taskflowToolsKeys, ...ValyuToolsKeys, ...ParallelToolsKeys, "firecrawlScrape", "getDaytonaStatus"] as ToolKey[]
    }
}
