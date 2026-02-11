import { v } from "convex/values";
import { query, internalMutation, internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";

// Type definitions for OpenRouter API response
type OpenRouterPricing = {
  prompt: string;
  completion: string;
  request: string;
  image: string;
};

type OpenRouterArchitecture = {
  modality?: string;
  input_modalities?: string[];
  output_modalities?: string[];
};

type OpenRouterTopProvider = {
  max_completion_tokens?: number;
};

type OpenRouterModel = {
  id: string;
  canonical_slug: string;
  name: string;
  created: number;
  pricing: OpenRouterPricing;
  context_length: number;
  architecture?: OpenRouterArchitecture;
  top_provider?: OpenRouterTopProvider;
  supported_parameters?: string[];
  description: string;
  expiration_date: number | null;
};

type OpenRouterModelsResponse = {
  data: OpenRouterModel[];
};

type ModelInfo = {
  id: string;
  canonicalSlug: string;
  provider: string;
  name: string;
  description: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  contextLength: number;
  maxCompletionTokens?: number;
  modality?: string;
  inputModalities?: string[];
  outputModalities?: string[];
  supportedParameters?: string[];
};

// PUBLIC QUERIES

// Get all available models (for UI display)
export const getAvailableModels = query({
  handler: async (ctx) => {
    return await ctx.db.query("availableModels").collect();
  },
});

// Get all base models (allowlist)
export const getBaseModels = query({
  handler: async (ctx) => {
    const models = await ctx.db.query("baseModels").collect();
    return models.map((model) => model.modelId);
  },
});

// INTERNAL FUNCTIONS FOR BASE MODELS (ALLOWLIST) MANAGEMENT

// Add a model to the allowlist (internal only)
export const addBaseModel = internalMutation({
  args: {
    modelId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if already exists
    const existing = await ctx.db
      .query("baseModels")
      .withIndex("by_modelId", (q) => q.eq("modelId", args.modelId))
      .first();

    if (existing) {
      return { success: false, message: "Model already in allowlist" };
    }

    await ctx.db.insert("baseModels", {
      modelId: args.modelId,
    });

    return { success: true, message: "Model added to allowlist" };
  },
});

// Remove a model from the allowlist (internal only)
export const removeBaseModel = internalMutation({
  args: {
    modelId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("baseModels")
      .withIndex("by_modelId", (q) => q.eq("modelId", args.modelId))
      .first();

    if (!existing) {
      return { success: false, message: "Model not found in allowlist" };
    }

    await ctx.db.delete(existing._id);
    return { success: true, message: "Model removed from allowlist" };
  },
});

// INTERNAL FUNCTIONS FOR AVAILABLE MODELS SYNC

// Fetch models from OpenRouter API (internal action)
export const fetchOpenRouterModels = internalAction({
  handler: async (): Promise<{ models: ModelInfo[] }> => {
    const key = process.env.OPENROUTER_AI_KEY;
    if (!key) {
      throw new Error("OPENROUTER_API_KEY is not set");
    }

    let response: Response;
    try {
      response = await fetch("https://openrouter.ai/api/v1/models", {
        headers: {
          Authorization: `Bearer ${key}`,
        },
      });
    } catch (error) {
      console.error("Failed to fetch models from OpenRouter:", error);
      throw new Error("Network error while fetching models");
    }

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`OpenRouter API error: ${response.status}`, errorBody);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    let data: OpenRouterModelsResponse;
    try {
      data = await response.json();
    } catch (error) {
      console.error("Failed to parse OpenRouter response:", error);
      throw new Error("Invalid response from OpenRouter");
    }

    // Map with safe defaults
    const models: ModelInfo[] = data.data.map((model) => ({
      id: model.id,
      canonicalSlug: model.canonical_slug ?? model.id,
      provider: model.id.split("/")[0] ?? "unknown",
      name: model.name,
      description: model.description ?? "",
      pricing: {
        prompt: model.pricing?.prompt ?? "0",
        completion: model.pricing?.completion ?? "0",
      },
      contextLength: model.context_length ?? 0,
      maxCompletionTokens: model.top_provider?.max_completion_tokens,
      modality: model.architecture?.modality,
      inputModalities: model.architecture?.input_modalities,
      outputModalities: model.architecture?.output_modalities,
      supportedParameters: model.supported_parameters,
    }));

    return { models };
  },
});

// Replace all available models atomically (internal only)
export const replaceAvailableModels = internalMutation({
  args: {
    models: v.array(
      v.object({
        id: v.string(),
        canonicalSlug: v.string(),
        provider: v.string(),
        name: v.string(),
        description: v.string(),
        pricing: v.object({
          prompt: v.string(),
          completion: v.string(),
        }),
        contextLength: v.number(),
        maxCompletionTokens: v.optional(v.number()),
        modality: v.optional(v.string()),
        inputModalities: v.optional(v.array(v.string())),
        outputModalities: v.optional(v.array(v.string())),
        supportedParameters: v.optional(v.array(v.string())),
      }),
    ),
    syncedAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Delete all existing models
    const existingModels = await ctx.db.query("availableModels").collect();
    for (const model of existingModels) {
      await ctx.db.delete(model._id);
    }

    // Insert all new models with syncedAt
    for (const model of args.models) {
      await ctx.db.insert("availableModels", {
        modelId: model.id,
        canonicalSlug: model.canonicalSlug,
        provider: model.provider,
        name: model.name,
        description: model.description,
        pricing: model.pricing,
        contextLength: model.contextLength,
        maxCompletionTokens: model.maxCompletionTokens,
        modality: model.modality,
        inputModalities: model.inputModalities,
        outputModalities: model.outputModalities,
        supportedParameters: model.supportedParameters,
        syncedAt: args.syncedAt,
      });
    }

    return {
      success: true,
      message: `Updated ${args.models.length} models`,
      count: args.models.length,
    };
  },
});

// Main sync action - called by cron (internal only)
export const syncModels = internalAction({
  handler: async (
    ctx,
  ): Promise<{
    success: boolean;
    message: string;
    keptExisting?: boolean;
    count?: number;
    syncedAt?: number;
  }> => {
    // Fetch from OpenRouter
    let openRouterModels: ModelInfo[];
    try {
      const result = await ctx.runAction(internal.models.fetchOpenRouterModels);
      openRouterModels = result.models;
    } catch (error) {
      console.error("Failed to fetch from OpenRouter:", error);
      return {
        success: false,
        message: "Failed to fetch from OpenRouter - keeping existing models",
        keptExisting: true,
      };
    }

    // Get allowlist
    const baseModelIds: string[] = await ctx.runQuery(api.models.getBaseModels);

    // If allowlist is empty, don't clear anything (avoid wiping data accidentally)
    if (baseModelIds.length === 0) {
      console.log("Allowlist is empty - keeping existing available models");
      return {
        success: true,
        message: "Allowlist is empty - no changes made",
        keptExisting: true,
      };
    }

    // Filter to only allowlisted models
    const allowlistedModels: ModelInfo[] = openRouterModels.filter(
      (m: ModelInfo) => baseModelIds.includes(m.id),
    );

    // If no allowlisted matches found, keep existing (don't wipe on partial failure)
    if (allowlistedModels.length === 0) {
      console.warn("No allowlisted models found in OpenRouter response");
      return {
        success: false,
        message: "No allowlisted models found - keeping existing models",
        keptExisting: true,
      };
    }

    // Atomically replace available models
    const syncedAt = Date.now();
    const result: { success: boolean; message: string; count: number } =
      await ctx.runMutation(internal.models.replaceAvailableModels, {
        models: allowlistedModels,
        syncedAt,
      });

    return {
      success: true,
      message: result.message,
      count: result.count,
      syncedAt,
    };
  },
});

