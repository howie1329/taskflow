import { taskflowToolsKeys } from "./Taskflow/Taskflow"
import { ValyuToolsKeys } from "./Valyu/index"

type Mode = {
    name: string
    activeTools: string[]
}


export const ModeMapping: Record<string, Mode> = {
    "default": {
        name: "Default",
        activeTools: [...taskflowToolsKeys, "webSearch"]
    },
    "Web": {
        name: "Web Search",
        activeTools: [...taskflowToolsKeys, "webSearch"]
    },
    "Advanced": {
        name: "Advanced",
        activeTools: [...taskflowToolsKeys, ...ValyuToolsKeys]
    },
    "Finance": {
        name: "Finance",
        activeTools: ["webSearch"]
    },
    "Health": {
        name: "Health",
        activeTools: ["webSearch"]
    },
    "Travel": {
        name: "Travel",
        activeTools: ["webSearch"]
    }
}