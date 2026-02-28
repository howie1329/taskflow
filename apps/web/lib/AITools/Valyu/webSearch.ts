import { Valyu } from "valyu-js";
import { z } from "zod";
import { tool } from "ai";
import { emitToolProgress } from "@/lib/AITools/progress";
import { valyuSearchResponseSchema } from "./zod";

export const ValyuWebSearch = tool({
    description: "A tool that can be used to search the web",
    inputSchema: z.object({
        query: z.string().describe("The query to search the web for"),
        category: z.enum(["company", "research paper", "news", "pdf", "tweet", "personal site", "financial report", "people"]).optional().describe("The category of the search"),
    }),
    outputSchema: valyuSearchResponseSchema,
    execute: async (
        { query, category }: { query: string, category?: string },
        { toolCallId, experimental_context },
    ) => {
        const valyu = new Valyu(process.env.VALYU_API_KEY!);
        if (!valyu) {
            throw new Error("Valyu API key is not set");
        }
        emitToolProgress({
            experimental_context,
            toolKey: "valyuWebSearch",
            toolCallId,
            status: "running",
            text: `Searching the web for "${query}"...`,
        })
        try {
            const results = await valyu.search(query, { "maxNumResults": 5, "isToolCall": true, searchType: "all", category: category || "all", relevanceThreshold: 0.60 });
            console.log("Valyu Web Search results:", results);
            const response = valyuSearchResponseSchema.parse(results);
            emitToolProgress({
                experimental_context,
                toolKey: "valyuWebSearch",
                toolCallId,
                status: "done",
                text: `Found ${response.results.length} results for "${query}".`,
            })
            return response;
        } catch (error) {
            emitToolProgress({
                experimental_context,
                toolKey: "valyuWebSearch",
                toolCallId,
                status: "error",
                text: `Failed to search the web for "${query}".`,
            })
            console.error(error);
            throw error;
        }
    },
})
