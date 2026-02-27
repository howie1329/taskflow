import Firecrawl from "@mendable/firecrawl-js"
import { tool } from "ai"
import { z } from "zod"
import { firecrawlScrapeResponseSchema } from "./types"
import { toolProgress, withToolProgressSchema } from "@/lib/AITools/tool-progress"

export const FirecrawlScrape = tool({
  description: "Scrape a web page using Firecrawl",
  inputSchema: z.object({
    url: z.string().url().describe("The URL to scrape"),
    formats: z.array(z.enum(["markdown", "html", "text"]).describe("Content format")).optional(),
    onlyMainContent: z.boolean().optional(),
  }),
  outputSchema: withToolProgressSchema(firecrawlScrapeResponseSchema),
  execute: async function* ({ url, formats, onlyMainContent }) {
    yield toolProgress(`Scraping "${url}"`)
    const apiKey = process.env.FIRECRAWL_API_KEY
    if (!apiKey) {
      throw new Error("FIRECRAWL_API_KEY is not set")
    }

    const client = new Firecrawl({ apiKey })
    const result = await client.scrape(url, {
      formats,
      onlyMainContent,
    })

    return firecrawlScrapeResponseSchema.parse(result)
  },
})
