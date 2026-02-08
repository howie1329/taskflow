import Firecrawl from "@mendable/firecrawl-js"
import { tool } from "ai"
import { z } from "zod"
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
  execute: async ({ query, limit, includeDomains, excludeDomains }) => {
    const apiKey = process.env.FIRECRAWL_API_KEY
    if (!apiKey) {
      throw new Error("FIRECRAWL_API_KEY is not set")
    }

    const client = new Firecrawl({ apiKey })
    const result = await client.search(query, {
      limit,
      includeDomains,
      excludeDomains,
    })

    return firecrawlSearchResponseSchema.parse(result)
  },
})
