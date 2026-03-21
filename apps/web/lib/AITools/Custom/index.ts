import { AdvancedResearchTool } from "./advanced-research"
import {
  getDaytonaStatusTool,
  listDaytonaRepoFilesTool,
  readDaytonaRepoFileTool,
  runDaytonaReadCommandTool,
  searchDaytonaRepoTool,
  startDaytonaInstanceTool,
  stopDaytonaInstanceTool,
} from "./daytona-tools"

export const CustomTools = {
  advancedResearch: AdvancedResearchTool,
  getDaytonaStatus: getDaytonaStatusTool,
  startDaytonaInstance: startDaytonaInstanceTool,
  stopDaytonaInstance: stopDaytonaInstanceTool,
  listDaytonaRepoFiles: listDaytonaRepoFilesTool,
  searchDaytonaRepo: searchDaytonaRepoTool,
  readDaytonaRepoFile: readDaytonaRepoFileTool,
  runDaytonaReadCommand: runDaytonaReadCommandTool,
} as const

export const CustomToolsKeys = Object.keys(CustomTools) as (keyof typeof CustomTools)[]
