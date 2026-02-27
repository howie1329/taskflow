import Exa from "exa-js"
import { tool } from "ai"
import { z } from "zod"
import { exaAnswerResponseSchema } from "./types"
import { toolProgress, withToolProgressSchema } from "@/lib/AITools/tool-progress"

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
  outputSchema: withToolProgressSchema(exaAnswerResponseSchema),
  execute: async function* ({ question, includeText }) {
    yield toolProgress(`Answering "${question}"`)
    const exa = createExaClient()
    try {
      const response = await exa.answer(question, {
        text: includeText ?? true,
      })

      return exaAnswerResponseSchema.parse(response)
    } catch (error) {
      console.error(error)
      throw error
    }
  },
})
