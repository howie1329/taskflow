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

type CerebrasModel = {
  id: string;
  object: string;
  created: number;
  owned_by: string;
};

type CerebrasModelsResponse = {
  data: CerebrasModel[];
};

type GroqModel = {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  active: boolean;
  context_window: number;
  public_apps?: string;
  max_completion_tokens: number;
};

type VercelAIGatewayModelsResponse = {
  object: string
  data: VercelAIGatewayModel[]
}

type VercelAIGatewayModel = {
  id: string;
  object: string;
  name: string;
  description: string;
  created: number;
  released: number;
  owned_by: string;
  type: string;
  context_window: number;
  max_tokens: number;
  tags: string[];
  pricing: {
    input: string;
    output: string;
  };
}

type OpenRouterModelsResponse = {
  data: OpenRouterModel[];
};

type GroqResponse = {
  data: GroqModel[];
};

type ModelInfo = {
  id: string;
  canonicalSlug: string;
  provider: string;
  interface: string;
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

type BaseModel = {
  modelId: string;
  interface: string;
};

// PUBLIC QUERIES

// Get all available models (for UI display)
export const getAvailableModels = query({
  handler: async (ctx) => {
    return await ctx.db.query("availableModels").collect();
  },
});

// Get model by ID (for provider routing)
export const getModelById = query({
  args: { modelId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("availableModels")
      .withIndex("by_modelId", (q) => q.eq("modelId", args.modelId))
      .first();
  },
});

// Get all base models (allowlist)
export const getBaseModels = query({
  handler: async (ctx) => {
    const models = await ctx.db.query("baseModels").collect();
    return models.map((model) => ({
      modelId: model.modelId,
      interface: model.interface ?? "openrouter",
    }));
  },
});

// INTERNAL FUNCTIONS FOR BASE MODELS (ALLOWLIST) MANAGEMENT

// Add a model to the allowlist (internal only)
export const addBaseModel = internalMutation({
  args: {
    modelId: v.string(),
    interface: v.string(),
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
      interface: args.interface,
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
      interface: "openrouter",
      name: model.name,
      description: model.description ?? "",
      pricing: {
        prompt: model.pricing?.prompt ?? "0",
        completion: model.pricing?.completion ?? "0",
      },
      contextLength: model.context_length ?? 0,
      maxCompletionTokens:
        model.top_provider?.max_completion_tokens ?? undefined,
      modality: model.architecture?.modality,
      inputModalities: model.architecture?.input_modalities,
      outputModalities: model.architecture?.output_modalities,
      supportedParameters: model.supported_parameters,
    }));

    return { models };
  },
});

// Fetch Models from groq API (internal action)
export const fetchGroqModels = internalAction({
  handler: async (): Promise<{ models: ModelInfo[] }> => {
    const key = process.env.GROQ_API_KEY!;

    if (!key) {
      throw new Error("GROQ_API_KEY environment variable not set");
    }

    let response: Response;

    try {
      response = await fetch("https://api.groq.com/openai/v1/models", {
        headers: {
          Authorization: `Bearer ${key}`,
        },
      });
    } catch (error) {
      throw new Error(`Failed to fetch models: ${error}`);
    }

    let data: GroqResponse;
    try {
      data = await response.json();
    } catch (error) {
      throw new Error(`Failed to parse response: ${error}`);
    }

    const models: ModelInfo[] = data.data.map((model) => ({
      id: model.id,
      canonicalSlug: model.id,
      name: model.id,
      interface: "groq",
      provider: model.owned_by,
      description: model.id,
      pricing: {
        prompt: "0",
        completion: "0",
      },
      contextLength: model.context_window,
      maxCompletionTokens: model.max_completion_tokens,
    }));

    return { models };
  },
});

// Fetch all models from Cerebras
export const fetchCerebrasModels = internalAction({
  handler: async (): Promise<{ models: ModelInfo[] }> => {
    const key = process.env.CEREBRAS_API_KEY;
    if (!key) {
      throw new Error("CEREBRAS_API_KEY not set");
    }

    const response = await fetch("https://api.cerebras.ai/v1/models", {
      headers: {
        Authorization: `Bearer ${key}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    let data: CerebrasModelsResponse;
    try {
      data = await response.json();
    } catch {
      throw new Error("Failed to parse models response");
    }
    const models: ModelInfo[] = data.data.map((model) => ({
      id: model.id,
      canonicalSlug: model.id,
      name: model.id,
      interface: "cerebras",
      provider: "cerebras",
      description: model.owned_by,
      pricing: {
        prompt: "0",
        completion: "0",
      },
      contextLength: 0,
      maxCompletionTokens: 0,
      modality: "",
      inputModalities: [],
      outputModalities: [],
      supportedParameters: [],
    }));

    return { models };
  },
});

// Fetch all models from Vercel AI Gateway
export const fetchVercelAIGatewayModels = internalAction({
  handler: async (): Promise<{ models: ModelInfo[] }> => {
    const key = process.env.AI_GATEWAY_API_KEY;
    if (!key) {
      throw new Error("AI_GATEWAY_API_KEY not set");
    }

    const response = await fetch("https://ai-gateway.vercel.sh/v1/models");

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    let data: VercelAIGatewayModelsResponse;
    try {
      data = await response.json();
    } catch {
      throw new Error("Failed to parse models response");
    }

    const models: ModelInfo[] = data.data.map((model) => ({
      id: model.id,
      canonicalSlug: model.id,
      name: model.name,
      interface: "vercel",
      provider: model.owned_by,
      description: model.description,
      pricing: {
        prompt: model.pricing.input,
        completion: model.pricing.output,
      },
      contextLength: model.context_window,
      maxCompletionTokens: model.max_tokens,
      modality: model.type,
      inputModalities: model.tags,
      outputModalities: model.tags,
      supportedParameters: model.tags,
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
        interface: v.string(),
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
        interface: model.interface,
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

    // Fetch from GroqModel
    let groqModels: ModelInfo[];
    try {
      const result = await ctx.runAction(internal.models.fetchGroqModels);
      groqModels = result.models;
    } catch (error) {
      console.error("Failed to fetch from Groq - keeping existing models");
      return {
        success: false,
        message: "Failed to fetch from Groq - keeping existing models",
        keptExisting: true,
      };
    }

    // Fetch from CerebrasModel
    let cerebrasModels: ModelInfo[];
    try {
      const result = await ctx.runAction(internal.models.fetchCerebrasModels);
      cerebrasModels = result.models;
    } catch (error) {
      console.error("Failed to fetch from Cerebras - keeping existing models");
      return {
        success: false,
        message: "Failed to fetch from Cerebras - keeping existing models",
        keptExisting: true,
      };
    }

    // Fetch from Vercel AI Gateway
    let vercelAIGatewayModels: ModelInfo[];
    try {
      const result = await ctx.runAction(internal.models.fetchVercelAIGatewayModels);
      vercelAIGatewayModels = result.models;
    } catch (error) {
      console.error("Failed to fetch from Vercel AI Gateway - keeping existing models");
      return {
        success: false,
        message: "Failed to fetch from Vercel AI Gateway - keeping existing models",
        keptExisting: true,
      };
    }

    // Get allowlist
    const baseModels: BaseModel[] = await ctx.runQuery(api.models.getBaseModels);

    // If allowlist is empty, don't clear anything (avoid wiping data accidentally)
    if (baseModels.length === 0) {
      console.log("Allowlist is empty - keeping existing available models");
      return {
        success: true,
        message: "Allowlist is empty - no changes made",
        keptExisting: true,
      };
    }

    // Filter to only allowlisted models
    // First filter by base model IDs, then by interface (OpenRouter only)
    const allowedOpenRouterModels: ModelInfo[] = openRouterModels
      .filter((m: ModelInfo) => baseModels.some((bm: BaseModel) => bm.modelId === m.id && bm.interface === "openrouter"))

    // Groq models are filtered separately
    const allowedGroqModels: ModelInfo[] = groqModels
      .filter((m: ModelInfo) => baseModels.some((bm: BaseModel) => bm.modelId === m.id && bm.interface === "qroq"))

    // Cerebras models are filtered separately
    const allowedCerebrasModels: ModelInfo[] = cerebrasModels
      .filter((m: ModelInfo) => baseModels.some((bm: BaseModel) => bm.modelId === m.id && bm.interface === "cerebras"))

    // Vercel AI Gateway models are filtered separately
    const allowedVercelAIGatewayModels: ModelInfo[] = vercelAIGatewayModels
      .filter((m: ModelInfo) => baseModels.some((bm: BaseModel) => bm.modelId === m.id && bm.interface === "vercel"))

    // If no allowlisted matches found, keep existing (don't wipe on partial failure)
    if (
      allowedOpenRouterModels.length === 0 &&
      allowedGroqModels.length === 0 &&
      allowedCerebrasModels.length === 0 &&
      allowedVercelAIGatewayModels.length === 0
    ) {
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
        models: [
          ...allowedOpenRouterModels,
          ...allowedGroqModels,
          ...allowedCerebrasModels,
          ...allowedVercelAIGatewayModels,
        ],
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
