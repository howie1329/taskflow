import Parallel from "parallel-web"
import { tool } from "ai"
import { z } from "zod"

const parallelSearchResultSchema = z.object({
  title: z.string().optional(),
  url: z.string().url().optional(),
  excerpt: z.string().optional(),
  source: z.string().optional(),
})

export const parallelSearchResponseSchema = z.object({
  results: z.array(parallelSearchResultSchema).optional(),
})

export const ParallelWebSearch = tool({
  description: "Search the web using Parallel.ai",
  inputSchema: z.object({
    objective: z.string().describe("The research objective for the search"),
    searchQueries: z
      .array(z.string())
      .min(1)
      .describe("Search queries to run against Parallel.ai"),
    maxResults: z.number().int().min(1).max(3).optional(),
  }),
  outputSchema: parallelSearchResponseSchema,
  execute: async ({
    objective,
    searchQueries,
    maxResults,
  }) => {
    const apiKey = process.env.PARALLEL_API_KEY
    if (!apiKey) {
      throw new Error("PARALLEL_API_KEY is not set")
    }

    const client = new Parallel({ apiKey })
    const result = await client.beta.search({
      objective,
      search_queries: searchQueries,
      max_results: maxResults || 3,
    })

    return parallelSearchResponseSchema.parse(result)
  },
})
