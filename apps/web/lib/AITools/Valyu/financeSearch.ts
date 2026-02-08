// For finance specific information
import { Valyu } from "valyu-js";
import { z } from "zod";
import { SearchResponse } from "./types";
import { tool } from "ai";

export const ValyuFinanceSearch = tool({
    description: "A tool that can be used to for finance information",
    inputSchema: z.object({
        query: z.string().describe("The query to search for finance information"),
    }),
    outputSchema: z.object<SearchResponse>(),
    execute: async ({ query }: { query: string }) => {
        const valyu = new Valyu(process.env.VALYU_API_KEY!);
        if (!valyu) {
            throw new Error("Valyu API key is not set");
        }
        try {
            const results = await valyu.search(query, { "maxNumResults": 3, "isToolCall": true, searchType: "all", category: "financial information", includedSources: ["valyu/valyu-stocks", "valyu/valyu-statistics-US", "valyu/valyu-earnings-US", "valyu/valyu-insider-transactions-US"] });
            return results;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },
})