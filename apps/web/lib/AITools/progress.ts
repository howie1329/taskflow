type ToolProgressStatus = "running" | "done" | "error"

type ToolProgressData = {
  toolKey: string
  toolCallId: string
  status: ToolProgressStatus
  text: string
}

type ToolProgressChunk = {
  type: "data-toolProgress"
  id: string
  data: ToolProgressData
}

type ToolProgressWriter = {
  write: (part: ToolProgressChunk) => void
}

type ToolExecutionContext = {
  uiWriter?: ToolProgressWriter
}

const MAX_PROGRESS_TEXT_LENGTH = 160

const truncateProgressText = (text: string) => {
  if (text.length <= MAX_PROGRESS_TEXT_LENGTH) {
    return text
  }

  return `${text.slice(0, MAX_PROGRESS_TEXT_LENGTH - 1)}...`
}

export const getUIWriter = (experimental_context: unknown) => {
  if (!experimental_context || typeof experimental_context !== "object") {
    return null
  }

  const { uiWriter } = experimental_context as ToolExecutionContext
  if (!uiWriter || typeof uiWriter.write !== "function") {
    return null
  }

  return uiWriter
}

export const emitToolProgress = ({
  experimental_context,
  toolKey,
  toolCallId,
  status,
  text,
}: {
  experimental_context: unknown
  toolKey: string
  toolCallId: string
  status: ToolProgressStatus
  text: string
}) => {
  const uiWriter = getUIWriter(experimental_context)
  if (!uiWriter) {
    return
  }

  uiWriter.write({
    type: "data-toolProgress",
    id: toolCallId,
    data: {
      toolKey,
      toolCallId,
      status,
      text: truncateProgressText(text),
    },
  })
}
