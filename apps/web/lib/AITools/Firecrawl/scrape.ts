import Firecrawl from "@mendable/firecrawl-js"
import { tool } from "ai"
import { z } from "zod"
import { emitToolProgress } from "@/lib/AITools/progress"
import { firecrawlScrapeResponseSchema } from "./types"

export const FirecrawlScrape = tool({
  description: "Scrape a web page using Firecrawl",
  inputSchema: z.object({
    url: z.string().url().describe("The URL to scrape"),
    formats: z.array(z.enum(["markdown", "html", "text"]).describe("Content format")).optional(),
    onlyMainContent: z.boolean().optional(),
  }),
  outputSchema: firecrawlScrapeResponseSchema,
  execute: async ({ url, formats, onlyMainContent }, { toolCallId, experimental_context }) => {
    const apiKey = process.env.FIRECRAWL_API_KEY
    if (!apiKey) {
      throw new Error("FIRECRAWL_API_KEY is not set")
    }

    emitToolProgress({
      experimental_context,
      toolKey: "firecrawlScrape",
      toolCallId,
      status: "running",
      text: `Scraping ${url}...`,
    })

    const client = new Firecrawl({ apiKey })
    try {
      const result = await client.scrape(url, {
        formats,
        onlyMainContent,
      } as unknown as Parameters<Firecrawl["scrape"]>[1])

      const response = firecrawlScrapeResponseSchema.parse(result)
      emitToolProgress({
        experimental_context,
        toolKey: "firecrawlScrape",
        toolCallId,
        status: "done",
        text: `Scraped content from ${url}.`,
      })

      return response
    } catch (error) {
      emitToolProgress({
        experimental_context,
        toolKey: "firecrawlScrape",
        toolCallId,
        status: "error",
        text: `Failed to scrape ${url}.`,
      })
      throw error
    }
  },
})
