import { tool } from "ai";
import { z } from "zod";
import { tavily } from "@tavily/core";

// ... existing imports ...

const tavilyResultItemSchema = z.object({
    title: z.string(),
    url: z.string().url(),
    content: z.string(),
    score: z.number().optional(),           // score can safely be optional
    rawContent: z.string().nullable().optional(), // matches API key + can be null/undefined
    publishedDate: z.string().nullable().optional(), // often present, but optional
    favicon: z.string().url().nullable().optional(),
})

export const tavilySearchResponseSchema = z.object({
    query: z.string(),
    answer: z.string().nullable().optional(),     // API may return null
    images: z.array(z.string().url()).optional(), // allow empty/missing images
    results: z.array(tavilyResultItemSchema),
    responseTime: z.number(),                     // matches API key + type
    requestId: z.string(),                        // matches API key
})

// Optionally, reuse the same schema (or a subset) for the tool's output:
export const TavilyWebSearch = tool({
    description: "A tool that can be used to search the web",
    inputSchema: z.object({
        query: z.string().describe("The query to search the web for"),
    }),
    outputSchema: tavilySearchResponseSchema,     // <-- use the same schema
    execute: async ({ query }: { query: string }) => {
        try {
            const client = tavily({ apiKey: process.env.TAVILY_API_KEY! })
            const results = await client.search(query)
            console.log("results", results)

            const response = tavilySearchResponseSchema.parse(results)
            return response
        } catch (error) {
            console.error(error)
            throw error
        }
    },
})