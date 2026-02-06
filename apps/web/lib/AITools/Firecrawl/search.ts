import Firecrawl from "@mendable/firecrawl-js"
import { tool } from "ai"
import { z } from "zod"

const firecrawlSearchResultSchema = z.object({
  url: z.string().url().optional(),
  title: z.string().optional(),
  description: z.string().nullable().optional(),
  content: z.string().optional(),
  markdown: z.string().optional(),
  html: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

export const firecrawlSearchResponseSchema = z.object({
  success: z.boolean().optional(),
  data: z.array(firecrawlSearchResultSchema).optional(),
  error: z.string().optional(),
  warning: z.string().optional(),
  creditsUsed: z.number().optional(),
})

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
