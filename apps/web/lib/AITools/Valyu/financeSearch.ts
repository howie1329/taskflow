// For finance specific information
import { Valyu } from "valyu-js";
import { z } from "zod";
import { tool } from "ai";
import { valyuSearchResponseSchema } from "./zod";

export const ValyuFinanceSearch = tool({
    description: "A tool that can be used to for finance information",
    inputSchema: z.object({
        query: z.string().describe("The query to search for finance information"),
    }),
    outputSchema: valyuSearchResponseSchema,
    execute: async ({ query }: { query: string }) => {
        const valyu = new Valyu(process.env.VALYU_API_KEY!);
        if (!valyu) {
            throw new Error("Valyu API key is not set");
        }
        try {
            const results = await valyu.search(query, { "maxNumResults": 5, "isToolCall": true, searchType: "all", category: "financial information" });
            console.log("Valyu Finance Search results:", results);
            return valyuSearchResponseSchema.parse(results);
        } catch (error) {
            console.error(error);
            throw error;
        }
    },
})
