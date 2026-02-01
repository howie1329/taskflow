import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";

// Type definitions for OpenRouter API response
type OpenRouterPricing = {
    prompt: string;
    completion: string;
    request: string;
    image: string;
};

type OpenRouterArchitecture = {
    modality: string;
    input_modalities: string[];
    output_modalities: string[];
    tokenizer: string;
    instruct_type: string;
};

type OpenRouterTopProvider = {
    is_moderated: boolean;
    context_length: number;
    max_completion_tokens: number;
};

type OpenRouterModel = {
    id: string;
    canonical_slug: string;
    name: string;
    created: number;
    pricing: OpenRouterPricing;
    context_length: number;
    architecture: OpenRouterArchitecture;
    top_provider: OpenRouterTopProvider;
    per_request_limits: unknown | null;
    supported_parameters: string[];
    default_parameters: unknown | null;
    description: string;
    expiration_date: number | null;
};

type OpenRouterModelsResponse = {
    data: OpenRouterModel[];
};

export const fetchOpenRouterModels = action({
    args: {},
    returns: v.object({
        models: v.array(v.object({
            id: v.string(),
            name: v.string(),
            description: v.string(),
            pricing: v.object({
                prompt: v.string(),
                completion: v.string(),
            }),
        })),
    }),
    async handler(ctx, args_0) {
        const key = process.env.OPENROUTER_API_KEY;
        let data: OpenRouterModelsResponse;
        if (!key) {
            throw new Error("OPENROUTER_API_KEY is not set");
        }
        try {
            const response = await fetch("https://openrouter.ai/api/v1/models", {
                headers: {
                    Authorization: `Bearer ${key}`,
                },
            });
            data = await response.json();
        } catch (error) {
            console.error("Failed to fetch models:", error);
            throw new Error("Failed to fetch models");
        }

        // Map to only the fields validated in the return type
        return {
            models: data.data.map((model) => ({
                id: model.id,
                name: model.name,
                description: model.description,
                pricing: {
                    prompt: model.pricing.prompt,
                    completion: model.pricing.completion,
                },
            })),
        };
    },
})


export const fetchBaseModels = query({
    args: {},
    returns: v.array(v.string()),
    async handler(ctx, args_0) {
        const models = await ctx.db.query("baseModels").collect();
        return models.map((model) => model.modelId);
    },
})

export const clearAvailableModels = mutation({
    args: {},
    returns: v.object({
        success: v.boolean(),
        message: v.string(),
    }),
    async handler(ctx, args_0) {
        const models = await ctx.db.query("availableModels").collect();
        for (const model of models) {
            await ctx.db.delete(model._id);
        }
        return { success: true, message: "Available models cleared successfully" };
    },
})

export const insertAvailableModels = mutation({
    args: {
        models: v.array(v.object({
            id: v.string(),
            name: v.string(),
            description: v.string(),
            pricing: v.object({
                prompt: v.string(),
                completion: v.string(),
            }),
        })),
    },
    async handler(ctx, args_0) {
        for (const model of args_0.models) {
            await ctx.db.insert("availableModels", {
                modelId: model.id,
                name: model.name,
                description: model.description,
                pricing: model.pricing,
            });
        }
    },
})



export const updateAvailableModels = action({
    args: {},
    returns: v.object({
        success: v.boolean(),
        message: v.string(),
    }),
    async handler(ctx, args_0) {
        const models = await ctx.runAction(api.models.fetchOpenRouterModels);
        const baseModels = await ctx.runQuery(api.models.fetchBaseModels);
        const availableModels = models.models.filter((m) => baseModels.includes(m.id))
        await ctx.runMutation(api.models.clearAvailableModels);
        await ctx.runMutation(api.models.insertAvailableModels, {
            models: availableModels,
        });
        return { success: true, message: "Models updated successfully" };
    },
})