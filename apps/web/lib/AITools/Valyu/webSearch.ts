import { Valyu } from "valyu-js";
import { z } from "zod";
import { tool } from "ai";
import { valyuSearchResponseSchema } from "./zod";
import { toolProgress, withToolProgressSchema } from "@/lib/AITools/tool-progress"

export const ValyuWebSearch = tool({
    description: "A tool that can be used to search the web",
    inputSchema: z.object({
        query: z.string().describe("The query to search the web for"),
        category: z.enum(["company", "research paper", "news", "pdf", "tweet", "personal site", "financial report", "people"]).optional().describe("The category of the search"),
    }),
    outputSchema: withToolProgressSchema(valyuSearchResponseSchema),
    execute: async function* ({ query, category }: { query: string, category?: string }) {
        yield toolProgress(`Searching the web for "${query}"`)
        const valyu = new Valyu(process.env.VALYU_API_KEY!);
        if (!valyu) {
            throw new Error("Valyu API key is not set");
        }
        try {
            const results = await valyu.search(query, { "maxNumResults": 5, "isToolCall": true, searchType: "all", category: category || "all", relevanceThreshold: 0.60 });
            console.log("Valyu Web Search results:", results);
            return valyuSearchResponseSchema.parse(results);
        } catch (error) {
            console.error(error);
            throw error;
        }
    },
})
