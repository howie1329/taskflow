import { AdvancedResearchTool } from "./advanced-research"

export const CustomTools = {
  advancedResearch: AdvancedResearchTool,
} as const

export const CustomToolsKeys = Object.keys(CustomTools) as (keyof typeof CustomTools)[]
