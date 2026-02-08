import { ExaToolsKeys } from "./Exa"
import { FirecrawlToolsKeys } from "./Firecrawl"
import { taskflowToolsKeys } from "./Taskflow/Taskflow"
import { TavilyToolsKeys } from "./Tavily"
import { ValyuToolsKeys } from "./Valyu/index"
import { ParallelToolsKeys } from "./ParallelAi"
type Mode = {
    name: string
    activeTools: string[]
}


export const ModeMapping: Record<string, Mode> = {
    "Basic": {
        name: "Basic",
        activeTools: [...taskflowToolsKeys, ...TavilyToolsKeys, "firecrawlScrape"]
    },
    "Advanced": {
        name: "Advanced",
        activeTools: [...taskflowToolsKeys, ...FirecrawlToolsKeys, ...ExaToolsKeys, ...ParallelToolsKeys, "firecrawlScrape"]
    },
    "Finance": {
        name: "Finance",
        activeTools: [...taskflowToolsKeys, ...ValyuToolsKeys, ...ParallelToolsKeys, "firecrawlScrape"]
    },
    "Research": {
        name: "Research",
        activeTools: [...taskflowToolsKeys, ...ValyuToolsKeys, ...ParallelToolsKeys, ...ExaToolsKeys, "firecrawlScrape"]
    },
    "Social": {
        name: "Social",
        activeTools: [...taskflowToolsKeys, ...ValyuToolsKeys, ...ParallelToolsKeys, "firecrawlScrape"]
    }
}