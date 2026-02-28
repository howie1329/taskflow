import Firecrawl from "@mendable/firecrawl-js"
import { tool } from "ai"
import { z } from "zod"
import { emitToolProgress } from "@/lib/AITools/progress"
import { firecrawlSearchResponseSchema } from "./types"

export const FirecrawlSearch = tool({
  description: "Search the web using Firecrawl",
  inputSchema: z.object({
    query: z.string().describe("The search query"),
    limit: z.number().int().min(1).max(20).optional(),
    includeDomains: z.array(z.string()).optional(),
    excludeDomains: z.array(z.string()).optional(),
  }),
  outputSchema: firecrawlSearchResponseSchema,
  execute: async ({ query, limit, includeDomains, excludeDomains }, { toolCallId, experimental_context }) => {
    const apiKey = process.env.FIRECRAWL_API_KEY
    if (!apiKey) {
      throw new Error("FIRECRAWL_API_KEY is not set")
    }

    emitToolProgress({
      experimental_context,
      toolKey: "firecrawlSearch",
      toolCallId,
      status: "running",
      text: `Searching the web for "${query}"...`,
    })

    const client = new Firecrawl({ apiKey })
    try {
      const result = await client.search(query, {
        limit,
        includeDomains,
        excludeDomains,
      } as unknown as Parameters<Firecrawl["search"]>[1])

      const response = firecrawlSearchResponseSchema.parse(result)
      emitToolProgress({
        experimental_context,
        toolKey: "firecrawlSearch",
        toolCallId,
        status: "done",
        text: `Found ${response.data?.length ?? 0} pages for "${query}".`,
      })

      return response
    } catch (error) {
      emitToolProgress({
        experimental_context,
        toolKey: "firecrawlSearch",
        toolCallId,
        status: "error",
        text: `Failed to search the web for "${query}".`,
      })
      throw error
    }
  },
})
