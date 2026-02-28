import type { ModeName } from "./ModePrompts"

export type ToolKey =
  | "listTasks"
  | "getTask"
  | "createTask"
  | "updateTask"
  | "deleteTask"
  | "listNotes"
  | "getNote"
  | "createNote"
  | "updateNote"
  | "deleteNote"
  | "listProjects"
  | "getProject"
  | "createProject"
  | "updateProject"
  | "deleteProject"
  | "listInboxItems"
  | "getInboxItem"
  | "createInboxItem"
  | "updateInboxItem"
  | "deleteInboxItem"
  | "tavilyWebSearch"
  | "exaWebSearch"
  | "exaAnswer"
  | "parallelWebSearch"
  | "firecrawlSearch"
  | "advancedResearch"
  | "valyuWebSearch"
  | "valyuFinanceSearch"
  | "firecrawlScrape"

export type ToolLockCommand = {
  command: string
  label: string
  description: string
  toolKey: ToolKey | null
  allowedModes: ModeName[]
}

const ALL_MODES: ModeName[] = ["Basic", "Advanced", "Finance", "Research", "Social"]

const TASKFLOW_COMMANDS: ToolLockCommand[] = [
  {
    command: "/tasks.list",
    label: "Tasks: List",
    description: "List tasks for the current user",
    toolKey: "listTasks",
    allowedModes: ALL_MODES,
  },
  {
    command: "/tasks.get",
    label: "Tasks: Get",
    description: "Get a single task by ID",
    toolKey: "getTask",
    allowedModes: ALL_MODES,
  },
  {
    command: "/tasks.create",
    label: "Tasks: Create",
    description: "Create a new task",
    toolKey: "createTask",
    allowedModes: ALL_MODES,
  },
  {
    command: "/tasks.update",
    label: "Tasks: Update",
    description: "Update an existing task",
    toolKey: "updateTask",
    allowedModes: ALL_MODES,
  },
  {
    command: "/tasks.delete",
    label: "Tasks: Delete",
    description: "Delete a task",
    toolKey: "deleteTask",
    allowedModes: ALL_MODES,
  },
  {
    command: "/projects.list",
    label: "Projects: List",
    description: "List projects for the current user",
    toolKey: "listProjects",
    allowedModes: ALL_MODES,
  },
  {
    command: "/projects.get",
    label: "Projects: Get",
    description: "Get a single project by ID",
    toolKey: "getProject",
    allowedModes: ALL_MODES,
  },
  {
    command: "/projects.create",
    label: "Projects: Create",
    description: "Create a new project",
    toolKey: "createProject",
    allowedModes: ALL_MODES,
  },
  {
    command: "/projects.update",
    label: "Projects: Update",
    description: "Update an existing project",
    toolKey: "updateProject",
    allowedModes: ALL_MODES,
  },
  {
    command: "/projects.delete",
    label: "Projects: Delete",
    description: "Delete a project",
    toolKey: "deleteProject",
    allowedModes: ALL_MODES,
  },
  {
    command: "/inbox.list",
    label: "Inbox: List",
    description: "List inbox items",
    toolKey: "listInboxItems",
    allowedModes: ALL_MODES,
  },
  {
    command: "/inbox.get",
    label: "Inbox: Get",
    description: "Get a single inbox item by ID",
    toolKey: "getInboxItem",
    allowedModes: ALL_MODES,
  },
  {
    command: "/inbox.create",
    label: "Inbox: Create",
    description: "Create a new inbox item",
    toolKey: "createInboxItem",
    allowedModes: ALL_MODES,
  },
  {
    command: "/inbox.update",
    label: "Inbox: Update",
    description: "Update an existing inbox item",
    toolKey: "updateInboxItem",
    allowedModes: ALL_MODES,
  },
  {
    command: "/inbox.delete",
    label: "Inbox: Delete",
    description: "Delete an inbox item",
    toolKey: "deleteInboxItem",
    allowedModes: ALL_MODES,
  },
  {
    command: "/notes.list",
    label: "Notes: List",
    description: "List notes for the current user",
    toolKey: "listNotes",
    allowedModes: ALL_MODES,
  },
  {
    command: "/notes.get",
    label: "Notes: Get",
    description: "Get a single note by ID",
    toolKey: "getNote",
    allowedModes: ALL_MODES,
  },
  {
    command: "/notes.create",
    label: "Notes: Create",
    description: "Create a new note",
    toolKey: "createNote",
    allowedModes: ALL_MODES,
  },
  {
    command: "/notes.update",
    label: "Notes: Update",
    description: "Update an existing note",
    toolKey: "updateNote",
    allowedModes: ALL_MODES,
  },
  {
    command: "/notes.delete",
    label: "Notes: Delete",
    description: "Delete a note",
    toolKey: "deleteNote",
    allowedModes: ALL_MODES,
  },
]

const MODE_SPECIFIC_COMMANDS: ToolLockCommand[] = [
  {
    command: "/tavily.search",
    label: "Tavily Search",
    description: "Search the web with Tavily",
    toolKey: "tavilyWebSearch",
    allowedModes: ["Basic"],
  },
  {
    command: "/exa.search",
    label: "Exa Search",
    description: "Run semantic web search with Exa",
    toolKey: "exaWebSearch",
    allowedModes: ["Advanced", "Research"],
  },
  {
    command: "/exa.answer",
    label: "Exa Answer",
    description: "Get a synthesized Exa answer",
    toolKey: "exaAnswer",
    allowedModes: ["Advanced", "Research"],
  },
  {
    command: "/parallel.search",
    label: "Parallel Search",
    description: "Run multi-source parallel search",
    toolKey: "parallelWebSearch",
    allowedModes: ["Advanced", "Finance", "Research", "Social"],
  },
  {
    command: "/firecrawl.search",
    label: "Firecrawl Search",
    description: "Discover URLs with Firecrawl search",
    toolKey: "firecrawlSearch",
    allowedModes: ["Advanced"],
  },
  {
    command: "/research.advanced",
    label: "Advanced Research",
    description: "Run the combined advanced research workflow",
    toolKey: "advancedResearch",
    allowedModes: ["Advanced"],
  },
  {
    command: "/valyu.search",
    label: "Valyu Search",
    description: "Search news and web content with Valyu",
    toolKey: "valyuWebSearch",
    allowedModes: ["Finance", "Research", "Social"],
  },
  {
    command: "/valyu.finance",
    label: "Valyu Finance",
    description: "Get financial market and company data",
    toolKey: "valyuFinanceSearch",
    allowedModes: ["Finance"],
  },
  {
    command: "/scrape",
    label: "Scrape URL",
    description: "Scrape a single URL with Firecrawl",
    toolKey: "firecrawlScrape",
    allowedModes: ALL_MODES,
  },
]

const CONTROL_COMMANDS: ToolLockCommand[] = [
  {
    command: "/tool.off",
    label: "Disable Tool Lock",
    description: "Clear the current tool lock and allow normal tool selection",
    toolKey: null,
    allowedModes: ALL_MODES,
  },
]

export const TOOL_LOCK_COMMANDS: ToolLockCommand[] = [
  ...TASKFLOW_COMMANDS,
  ...MODE_SPECIFIC_COMMANDS,
  ...CONTROL_COMMANDS,
]

export const getToolLockCommandsForMode = (mode: ModeName): ToolLockCommand[] => {
  return TOOL_LOCK_COMMANDS.filter((commandDef) => {
    return commandDef.allowedModes.includes(mode)
  })
}

export const findToolLockCommand = (
  command: string,
  mode: ModeName,
): ToolLockCommand | undefined => {
  const normalized = command.trim().toLowerCase()
  return getToolLockCommandsForMode(mode).find(
    (commandDef) => commandDef.command.toLowerCase() === normalized,
  )
}

export const findToolLockCommandByToolKey = (
  toolKey: ToolKey,
): ToolLockCommand | undefined => {
  return TOOL_LOCK_COMMANDS.find((commandDef) => commandDef.toolKey === toolKey)
}
