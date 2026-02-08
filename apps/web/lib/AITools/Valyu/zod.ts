import { z } from "zod";

const valyuFlexibleContentSchema = z.union([
  z.string(),
  z.record(z.unknown()),
  z.array(z.unknown()),
  z.null(),
]);

export const valyuSearchResultSchema = z
  .object({
    title: z.string().optional(),
    url: z.string().optional(),
    content: valyuFlexibleContentSchema.optional(),
    description: valyuFlexibleContentSchema.optional(),
    source: z.string().optional(),
    price: z.coerce.number().optional(),
    length: z.coerce.number().optional(),
    relevance_score: z.coerce.number().optional(),
    data_type: z.enum(["structured", "unstructured"]).optional(),
    publication_date: z.string().optional(),
    authors: z.array(z.string()).optional(),
    citation: z.string().optional(),
    doi: z.string().optional(),
  })
  .passthrough();

export const valyuSearchResponseSchema = z
  .object({
    success: z.boolean().optional(),
    error: z.string().optional(),
    tx_id: z.union([z.string(), z.null()]).optional(),
    query: z.string().optional(),
    results: z.array(valyuSearchResultSchema).default([]),
    results_by_source: z.record(z.coerce.number()).optional(),
    total_deduction_pcm: z.coerce.number().optional(),
    total_deduction_dollars: z.coerce.number().optional(),
    total_characters: z.coerce.number().optional(),
  })
  .passthrough();

export type ValyuSearchResponse = z.infer<typeof valyuSearchResponseSchema>;
