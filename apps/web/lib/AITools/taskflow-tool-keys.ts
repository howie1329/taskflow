import { taskflowTools } from "./Taskflow/Taskflow"

export const TASKFLOW_TOOL_KEYS = Object.keys(taskflowTools) as ReadonlyArray<
  keyof typeof taskflowTools
>
