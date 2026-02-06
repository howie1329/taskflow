import { z } from "zod"

export const exaSearchResultSchema = z
  .object({
    id: z.string().optional(),
    url: z.string().url(),
    title: z.string().optional(),
    score: z.number().optional(),
    publishedDate: z.string().optional(),
    author: z.string().optional(),
    text: z.string().optional(),
    highlights: z.array(z.string()).optional(),
    summary: z.string().optional(),
    image: z.string().optional(),
    favicon: z.string().optional(),
  })
  .passthrough()

const exaStatusSchema = z.object({
  id: z.string(),
  status: z.string(),
  source: z.string(),
})

export const exaSearchResponseSchema = z
  .object({
    results: z.array(exaSearchResultSchema),
    context: z.string().optional(),
    autoDate: z.string().optional(),
    requestId: z.string(),
    statuses: z.array(exaStatusSchema).optional(),
    costDollars: z.unknown().optional(),
    resolvedSearchType: z.string().optional(),
    searchTime: z.number().optional(),
  })
  .passthrough()

export const exaAnswerResponseSchema = z
  .object({
    answer: z.union([z.string(), z.record(z.unknown())]),
    citations: z.array(exaSearchResultSchema).optional(),
    costDollars: z.unknown().optional(),
    requestId: z.string().optional(),
  })
  .passthrough()
