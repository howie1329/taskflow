import { z } from "zod";

export const parallelSearchResultSchema = z.object({
  title: z.string().optional(),
  url: z.string().url().optional(),
  excerpt: z.string().optional(),
  source: z.string().optional(),
});

export const parallelSearchResponseSchema = z.object({
  results: z.array(parallelSearchResultSchema).optional(),
});

export type ParallelSearchResult = z.infer<typeof parallelSearchResultSchema>;
export type ParallelSearchResponse = z.infer<typeof parallelSearchResponseSchema>;
