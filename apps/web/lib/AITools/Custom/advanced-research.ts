import Exa from "exa-js"
import Parallel from "parallel-web"
import Firecrawl from "@mendable/firecrawl-js"
import { generateText, tool } from "ai"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { z } from "zod"

const advancedSourceSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  snippet: z.string().optional(),
  provider: z.enum(["exa", "parallel", "firecrawl"]),
})

const scrapedSourceSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  excerpt: z.string().optional(),
  markdown: z.string().optional(),
  text: z.string().optional(),
})

export const advancedResearchResponseSchema = z.object({
  query: z.string(),
  summary: z.string(),
  totalSources: z.number(),
  sources: z.array(advancedSourceSchema),
  scrapedSources: z.array(scrapedSourceSchema),
})

const normalizeTitle = (value: unknown, fallback: string) => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim()
  }
  return fallback
}

export const AdvancedResearchTool = tool({
  description:
    "Run a combined advanced research workflow using Exa, Parallel.ai, and Firecrawl. It also scrapes selected sources and returns an agent summary.",
  inputSchema: z.object({
    query: z.string().min(2).describe("Research query to investigate"),
    maxSourcesPerProvider: z
      .number()
      .int()
      .min(1)
      .max(5)
      .optional()
      .describe("Maximum sources to keep from each provider"),
    scrapeTopSources: z
      .number()
      .int()
      .min(1)
      .max(6)
      .optional()
      .describe("How many top sources should be scraped with Firecrawl"),
  }),
  outputSchema: advancedResearchResponseSchema,
  execute: async ({ query, maxSourcesPerProvider, scrapeTopSources }) => {
    const exaKey = process.env.EXA_API_KEY
    const parallelKey = process.env.PARALLEL_API_KEY
    const firecrawlKey = process.env.FIRECRAWL_API_KEY
    const openRouterKey = process.env.OPENROUTER_AI_KEY

    if (!exaKey || !parallelKey || !firecrawlKey || !openRouterKey) {
      throw new Error(
        "Missing one or more required API keys: EXA_API_KEY, PARALLEL_API_KEY, FIRECRAWL_API_KEY, OPENROUTER_AI_KEY",
      )
    }

    const sourceLimit = maxSourcesPerProvider ?? 3
    const scrapeLimit = scrapeTopSources ?? 3

    const exa = new Exa(exaKey)
    const parallel = new Parallel({ apiKey: parallelKey })
    const firecrawl = new Firecrawl({ apiKey: firecrawlKey })

    const [exaResult, parallelResult, firecrawlResult] = await Promise.all([
      exa.search(query, {
        type: "auto",
        numResults: sourceLimit,
        contents: { text: true, summary: true },
      }),
      parallel.beta.search({
        objective: `Research and summarize reliable findings for: ${query}`,
        search_queries: [query],
        max_results: sourceLimit,
      }),
      firecrawl.search(query, {
        limit: sourceLimit,
      }),
    ])

    const exaSources = (exaResult.results ?? []).slice(0, sourceLimit).map((result, index) => ({
      title: normalizeTitle(result.title, `Exa result ${index + 1}`),
      url: result.url,
      snippet: result.summary ?? result.text?.slice(0, 300),
      provider: "exa" as const,
    }))

    const parallelSources = (parallelResult.results ?? [])
      .filter((result): result is { title?: string; url?: string; excerpt?: string } =>
        typeof result?.url === "string" && result.url.length > 0,
      )
      .slice(0, sourceLimit)
      .map((result, index) => ({
        title: normalizeTitle(result.title, `Parallel result ${index + 1}`),
        url: result.url,
        snippet: result.excerpt,
        provider: "parallel" as const,
      }))

    const firecrawlSources = (firecrawlResult.data ?? [])
      .filter((result): result is { title?: string; url?: string; description?: string | null; content?: string } =>
        typeof result?.url === "string" && result.url.length > 0,
      )
      .slice(0, sourceLimit)
      .map((result, index) => ({
        title: normalizeTitle(result.title, `Firecrawl result ${index + 1}`),
        url: result.url,
        snippet: result.description ?? result.content?.slice(0, 300),
        provider: "firecrawl" as const,
      }))

    const combinedSources = [...exaSources, ...parallelSources, ...firecrawlSources]
    const dedupedSources = Array.from(new Map(combinedSources.map((source) => [source.url, source])).values())

    const scrapeTargets = dedupedSources.slice(0, scrapeLimit)
    const scrapedSourceResults = await Promise.all(
      scrapeTargets.map(async (source) => {
        try {
          const scraped = await firecrawl.scrape(source.url, {
            formats: ["markdown", "text"],
            onlyMainContent: true,
          })

          return {
            url: source.url,
            title: normalizeTitle(scraped.data?.metadata?.title, source.title),
            excerpt: source.snippet,
            markdown: scraped.data?.markdown,
            text: scraped.data?.text,
          }
        } catch {
          return {
            url: source.url,
            title: source.title,
            excerpt: source.snippet,
          }
        }
      }),
    )

    const openRouter = createOpenRouter({ apiKey: openRouterKey })
    const summaryInput = dedupedSources
      .map((source, index) => `${index + 1}. ${source.title}\nURL: ${source.url}\nSnippet: ${source.snippet ?? "N/A"}`)
      .join("\n\n")

    const scrapeInput = scrapedSourceResults
      .map((source, index) => `${index + 1}. ${source.title ?? source.url}\nURL: ${source.url}\nText: ${(source.text ?? source.markdown ?? source.excerpt ?? "N/A").slice(0, 600)}`)
      .join("\n\n")

    const { text: summary } = await generateText({
      model: openRouter("openai/gpt-4o-mini"),
      prompt: `You are a research synthesis agent. Summarize the findings in a concise but useful way for another agent.

Query: ${query}

Search Results:\n${summaryInput}

Scraped Source Details:\n${scrapeInput}

Return:
1. Key findings (bullet list)
2. Conflicts or uncertainty
3. Recommended next actions`,
    })

    return {
      query,
      summary,
      totalSources: dedupedSources.length,
      sources: dedupedSources,
      scrapedSources: scrapedSourceResults,
    }
  },
})
