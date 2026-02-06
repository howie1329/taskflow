import { Valyu } from "valyu-js";
import { z } from "zod";
import { SearchResponse } from "./types";
import { tool } from "ai";

export const ValyuWebSearch = tool({
    description: "A tool that can be used to search the web",
    inputSchema: z.object({
        query: z.string().describe("The query to search the web for"),
    }),
    outputSchema: z.object<SearchResponse>(),
    execute: async ({ query }: { query: string }) => {
        const valyu = new Valyu(process.env.VALYU_API_KEY!);
        if (!valyu) {
            throw new Error("Valyu API key is not set");
        }
        try {
            const results = await valyu.search(query, { "maxNumResults": 5, "isToolCall": true });
            return results;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },
})