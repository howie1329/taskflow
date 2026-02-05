import { tool } from "ai";
import { z } from "zod";
import { tavily } from "@tavily/core";

const tavilyResultItemSchema = z.object({
    title: z.string(),
    url: z.string().url(),
    content: z.string(),
    score: z.number(),
    raw_content: z.string().nullable(),
    favicon: z.string().url().nullable().optional(),
});

export const tavilySearchResponseSchema = z.object({
    query: z.string(),
    answer: z.string(),
    images: z.array(z.string().url()),
    results: z.array(tavilyResultItemSchema),
    response_time: z.string(), // or z.number() if you prefer numeric
    auto_parameters: z.object({
        topic: z.string(),
        search_depth: z.string(),
    }),
    usage: z.object({
        credits: z.number(),
    }),
    request_id: z.string(),
});


export const TavilyWebSearch = tool({
    description: "A tool that can be used to search the web",
    inputSchema: z.object({
        query: z.string().describe("The query to search the web for"),
    }),
    outputSchema: z.object({
        query: z.string(),
        answer: z.string(),
        images: z.array(z.string().url()),
        results: z.array(tavilyResultItemSchema),
        response_time: z.string(), // or z.number() if you prefer numeric
        auto_parameters: z.object({
            topic: z.string(),
            search_depth: z.string(),
        }),
    }),
    execute: async ({ query }: { query: string }) => {
        const client = tavily({ apiKey: process.env.TAVILY_API_KEY });
        const results = await client.search(query);

        const response = tavilySearchResponseSchema.parse(results);
        return response;
    },
}) 