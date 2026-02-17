import { z } from "zod";

export const firecrawlSearchResultSchema = z.object({
  url: z.string().url().optional(),
  title: z.string().optional(),
  description: z.string().nullable().optional(),
  content: z.string().optional(),
  markdown: z.string().optional(),
  html: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const firecrawlSearchResponseSchema = z.object({
  success: z.boolean().optional(),
  data: z.array(firecrawlSearchResultSchema).optional(),
  error: z.string().optional(),
  warning: z.string().optional(),
  creditsUsed: z.number().optional(),
});

const firecrawlScrapeDataSchema = z.object({
  url: z.string().url().optional(),
  markdown: z.string().optional(),
  html: z.string().optional(),
  text: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const firecrawlScrapeResponseSchema = z.object({
  success: z.boolean().optional(),
  data: firecrawlScrapeDataSchema.optional(),
  error: z.string().optional(),
  warning: z.string().optional(),
  creditsUsed: z.number().optional(),
});

export type FirecrawlSearchResult = z.infer<typeof firecrawlSearchResultSchema>;
export type FirecrawlSearchResponse = z.infer<
  typeof firecrawlSearchResponseSchema
>;
export type FirecrawlScrapeResponse = z.infer<
  typeof firecrawlScrapeResponseSchema
>;
