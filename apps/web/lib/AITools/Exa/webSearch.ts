import Exa from "exa-js"
import { tool } from "ai"
import { z } from "zod"
import { exaSearchResponseSchema } from "./types"
import { toolProgress, withToolProgressSchema } from "@/lib/AITools/tool-progress"

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
  outputSchema: withToolProgressSchema(exaSearchResponseSchema),
  execute: async function* ({
    query,
    numResults,
    category,
    includeDomains,
    startPublishedDate,
    endPublishedDate,
  }) {
    yield toolProgress(`Searching the web for "${query}"`)
    const exa = createExaClient()
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

      return exaSearchResponseSchema.parse(results)
    } catch (error) {
      console.error(error)
      throw error
    }
  },
})
