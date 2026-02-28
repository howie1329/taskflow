import Exa from "exa-js"
import { tool } from "ai"
import { z } from "zod"
import { emitToolProgress } from "@/lib/AITools/progress"
import { exaAnswerResponseSchema } from "./types"

const createExaClient = () => {
  const apiKey = process.env.EXA_API_KEY
  if (!apiKey) {
    throw new Error("Missing EXA_API_KEY")
  }

  return new Exa(apiKey)
}

export const ExaAnswer = tool({
  description: "Answer questions with citations using Exa",
  inputSchema: z.object({
    question: z.string().describe("The question to answer"),
    includeText: z
      .boolean()
      .optional()
      .describe("Include source text in citations"),
  }),
  outputSchema: exaAnswerResponseSchema,
  execute: async ({ question, includeText }, { toolCallId, experimental_context }) => {
    const exa = createExaClient()
    emitToolProgress({
      experimental_context,
      toolKey: "exaAnswer",
      toolCallId,
      status: "running",
      text: `Answering "${question}"...`,
    })

    try {
      const response = await exa.answer(question, {
        text: includeText ?? true,
      })

      const parsedResponse = exaAnswerResponseSchema.parse(response)
      const citationCount = parsedResponse.citations?.length ?? 0

      emitToolProgress({
        experimental_context,
        toolKey: "exaAnswer",
        toolCallId,
        status: "done",
        text:
          citationCount > 0
            ? `Generated answer with ${citationCount} citations.`
            : "Generated answer.",
      })

      return parsedResponse
    } catch (error) {
      emitToolProgress({
        experimental_context,
        toolKey: "exaAnswer",
        toolCallId,
        status: "error",
        text: `Failed to answer "${question}".`,
      })
      console.error(error)
      throw error
    }
  },
})
