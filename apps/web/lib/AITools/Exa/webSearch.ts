import Exa from "exa-js"
import { tool } from "ai"
import { z } from "zod"
import { emitToolProgress } from "@/lib/AITools/progress"
import { exaSearchResponseSchema } from "./types"

const createExaClient = () => {
  const apiKey = process.env.EXA_API_KEY
  if (!apiKey) {
    throw new Error("Missing EXA_API_KEY")
  }

  return new Exa(apiKey)
}

export const ExaWebSearch = tool({
  description: "Search the web using Exa for up-to-date information",
  inputSchema: z.object({
    query: z.string().describe("The query to search the web for"),
    numResults: z
      .number()
      .int()
      .min(1)
      .max(5)
      .optional()
      .describe("Number of results to return"),
    category: z.enum(["company", "research paper", "news", "pdf", "tweet", "personal site", "financial report", "people"]).optional().describe("The category of the search"),
    includeDomains: z
      .array(z.string())
      .optional()
      .describe("Only include results from these domains"),
    startPublishedDate: z
      .string()
      .optional()
      .describe("Start date filter in YYYY-MM-DD format"),
    endPublishedDate: z
      .string()
      .optional()
      .describe("End date filter in YYYY-MM-DD format"),
  }),
  outputSchema: exaSearchResponseSchema,
  execute: async ({
    query,
    numResults,
    category,
    includeDomains,
    startPublishedDate,
    endPublishedDate,
  }, { toolCallId, experimental_context }) => {
    const exa = createExaClient()
    emitToolProgress({
      experimental_context,
      toolKey: "exaWebSearch",
      toolCallId,
      status: "running",
      text: `Searching the web for "${query}"...`,
    })

    try {
      const results = await exa.search(query, {
        type: "auto",
        numResults: numResults || 5,
        category,
        includeDomains,
        startPublishedDate,
        endPublishedDate,
        contents: {
          text: true,
          highlights: true,
          summary: true,
        },
      })

      const response = exaSearchResponseSchema.parse(results)
      emitToolProgress({
        experimental_context,
        toolKey: "exaWebSearch",
        toolCallId,
        status: "done",
        text: `Found ${response.results.length} results for "${query}".`,
      })

      return response
    } catch (error) {
      emitToolProgress({
        experimental_context,
        toolKey: "exaWebSearch",
        toolCallId,
        status: "error",
        text: `Failed to search the web for "${query}".`,
      })
      console.error(error)
      throw error
    }
  },
})
