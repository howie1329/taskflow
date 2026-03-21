import { AdvancedResearchTool } from "./advanced-research"
import { getDaytonaStatusTool } from "./daytona-status"

export const CustomTools = {
  advancedResearch: AdvancedResearchTool,
  getDaytonaStatus: getDaytonaStatusTool,
} as const

export const CustomToolsKeys = Object.keys(CustomTools) as (keyof typeof CustomTools)[]
