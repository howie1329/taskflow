import Firecrawl from "@mendable/firecrawl-js"
import { tool } from "ai"
import { z } from "zod"

const firecrawlScrapeDataSchema = z.object({
  url: z.string().url().optional(),
  markdown: z.string().optional(),
  html: z.string().optional(),
  text: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

export const firecrawlScrapeResponseSchema = z.object({
  success: z.boolean().optional(),
  data: firecrawlScrapeDataSchema.optional(),
  error: z.string().optional(),
  warning: z.string().optional(),
  creditsUsed: z.number().optional(),
})

export const FirecrawlScrape = tool({
  description: "Scrape a web page using Firecrawl",
  inputSchema: z.object({
    url: z.string().url().describe("The URL to scrape"),
    formats: z.array(z.enum(["markdown", "html", "text"]).describe("Content format")).optional(),
    onlyMainContent: z.boolean().optional(),
  }),
  outputSchema: firecrawlScrapeResponseSchema,
  execute: async ({ url, formats, onlyMainContent }) => {
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
