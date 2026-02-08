import { Valyu } from "valyu-js";
import { z } from "zod";
import { SearchResponse } from "./types";
import { tool } from "ai";

export const ValyuWebSearch = tool({
    description: "A tool that can be used to search the web",
    inputSchema: z.object({
        query: z.string().describe("The query to search the web for"),
        category: z.enum(["company", "research paper", "news", "pdf", "tweet", "personal site", "financial report", "people"]).optional().describe("The category of the search"),
    }),
    outputSchema: z.object<SearchResponse>(),
    execute: async ({ query, category }: { query: string, category?: string }) => {
        const valyu = new Valyu(process.env.VALYU_API_KEY!);
        if (!valyu) {
            throw new Error("Valyu API key is not set");
        }
        try {
            const results = await valyu.search(query, { "maxNumResults": 5, "isToolCall": true, searchType: "all", category: category || "all", includedSources: ["valyu/valyu-arxiv", "valyu/valyu-medrxiv", "wiley/wiley-finance-papers", "wiley/wiley-finance-books", "valyu/valyu-biorxiv", "valyu/valyu-pubmed", "valyu/valyu-who-health-data", "valyu/valyu-nih-grants", "valyu/valyu-who-icd", "valyu/valyu-npi-registry", "valyu/valyu-drugbank", "valyu/valyu-clinical-trials"] });
            console.log("Valyu Web Search results:", results);
            return results;
        } catch (error) {
            console.error(error);
            throw error;
        }
    },
})