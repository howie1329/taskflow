import Parallel from "parallel-web"
import { tool } from "ai"
import { z } from "zod"
import { emitToolProgress } from "@/lib/AITools/progress"
import { parallelSearchResponseSchema } from "./types"

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
  }, { toolCallId, experimental_context }) => {
    const apiKey = process.env.PARALLEL_API_KEY
    if (!apiKey) {
      throw new Error("PARALLEL_API_KEY is not set")
    }

    emitToolProgress({
      experimental_context,
      toolKey: "parallelWebSearch",
      toolCallId,
      status: "running",
      text: `Searching the web for "${objective}"...`,
    })

    const client = new Parallel({ apiKey })
    try {
      const result = await client.beta.search({
        objective,
        search_queries: searchQueries,
        max_results: maxResults || 3,
      })

      const response = parallelSearchResponseSchema.parse(result)
      emitToolProgress({
        experimental_context,
        toolKey: "parallelWebSearch",
        toolCallId,
        status: "done",
        text: `Found ${response.results?.length ?? 0} results.`,
      })

      return response
    } catch (error) {
      emitToolProgress({
        experimental_context,
        toolKey: "parallelWebSearch",
        toolCallId,
        status: "error",
        text: `Failed to search the web for "${objective}".`,
      })
      throw error
    }
  },
})
