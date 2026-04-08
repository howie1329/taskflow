import { AdvancedResearchTool } from "./advanced-research"
import {
  deleteDaytonaInstanceTool,
  getDaytonaStatusTool,
  listDaytonaRepoFilesTool,
  researchDaytonaRepoTool,
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
  deleteDaytonaInstance: deleteDaytonaInstanceTool,
  researchDaytonaRepo: researchDaytonaRepoTool,
  listDaytonaRepoFiles: listDaytonaRepoFilesTool,
  searchDaytonaRepo: searchDaytonaRepoTool,
  readDaytonaRepoFile: readDaytonaRepoFileTool,
  runDaytonaReadCommand: runDaytonaReadCommandTool,
} as const

export const CustomToolsKeys = Object.keys(CustomTools) as (keyof typeof CustomTools)[]

export const DaytonaToolKeys = [
  "getDaytonaStatus",
  "startDaytonaInstance",
  "stopDaytonaInstance",
  "deleteDaytonaInstance",
  "researchDaytonaRepo",
  "listDaytonaRepoFiles",
  "searchDaytonaRepo",
  "readDaytonaRepoFile",
  "runDaytonaReadCommand",
] as const
