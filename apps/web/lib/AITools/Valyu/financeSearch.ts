// For finance specific information
import { Valyu } from "valyu-js";
import { z } from "zod";
import { tool } from "ai";
import { emitToolProgress } from "@/lib/AITools/progress";
import { valyuSearchResponseSchema } from "./zod";

export const ValyuFinanceSearch = tool({
    description: "A tool that can be used to for finance information",
    inputSchema: z.object({
        query: z.string().describe("The query to search for finance information"),
    }),
    outputSchema: valyuSearchResponseSchema,
    execute: async ({ query }: { query: string }, { toolCallId, experimental_context }) => {
        const valyu = new Valyu(process.env.VALYU_API_KEY!);
        if (!valyu) {
            throw new Error("Valyu API key is not set");
        }
        emitToolProgress({
            experimental_context,
            toolKey: "valyuFinanceSearch",
            toolCallId,
            status: "running",
            text: `Searching finance info for "${query}"...`,
        })
        try {
            const results = await valyu.search(query, { "maxNumResults": 5, "isToolCall": true, searchType: "all", category: "financial information", relevanceThreshold: 0.70 });
            console.log("Valyu Finance Search results:", results);
            const response = valyuSearchResponseSchema.parse(results);
            emitToolProgress({
                experimental_context,
                toolKey: "valyuFinanceSearch",
                toolCallId,
                status: "done",
                text: `Found ${response.results.length} results for "${query}".`,
            })
            return response;
        } catch (error) {
            emitToolProgress({
                experimental_context,
                toolKey: "valyuFinanceSearch",
                toolCallId,
                status: "error",
                text: `Failed to search finance info for "${query}".`,
            })
            console.error(error);
            throw error;
        }
    },
})
