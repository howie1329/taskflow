import Exa from "exa-js"
import { tool } from "ai"
import { z } from "zod"
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
      .max(10)
      .optional()
      .describe("Number of results to return"),
    includeDomains: z
      .array(z.string())
      .optional()
      .describe("Only include results from these domains"),
    excludeDomains: z
      .array(z.string())
      .optional()
      .describe("Exclude results from these domains"),
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
    includeDomains,
    excludeDomains,
    startPublishedDate,
    endPublishedDate,
  }) => {
    const exa = createExaClient()
    try {
      const results = await exa.search(query, {
        type: "auto",
        numResults,
        includeDomains,
        excludeDomains,
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
