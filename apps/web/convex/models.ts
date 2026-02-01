import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Sync models from OpenRouter API
export const syncModels = mutation({
  handler: async (ctx) => {
    // Get active allowlist
    const allowlist = await ctx.db
      .query("modelAllowlist")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    const allowedModelIds = new Set(allowlist.map((item) => item.modelId));

    try {
      // Fetch from OpenRouter API
      const response = await fetch("https://openrouter.ai/api/v1/models");
      const allModels = await response.json();

      // Filter through allowlist
      const filteredModels = allModels.data.filter((model: { id: string }) =>
        allowedModelIds.has(model.id),
      );

      // Clear existing cache
      const existingCache = await ctx.db.query("modelCache").collect();
      for (const cachedModel of existingCache) {
        await ctx.db.delete(cachedModel._id);
      }

      // Update cache with fresh data
      const now = Date.now();
      for (const model of filteredModels) {
        const allowlistItem = allowlist.find(
          (item) => item.modelId === model.id,
        );

        await ctx.db.insert("modelCache", {
          modelId: model.id,
          name: model.name,
          provider: allowlistItem?.category || "general",
          description: model.description || "",
          contextLength: model.context_length || 0,
          pricing: {
            prompt: model.pricing?.prompt || "0",
            completion: model.pricing?.completion || "0",
          },
          category: allowlistItem?.category || "general",
          customDescription:
            allowlistItem?.customDescription || model.description || "",
          recommended: allowlistItem?.recommended || false,
          lastUpdated: now,
        });
      }

      return { success: true, count: filteredModels.length };
    } catch (error) {
      console.error("Failed to sync models:", error);
      return { success: false, error: "Failed to sync models" };
    }
  },
});

// Get available models (query with cache freshness check)
export const getAvailableModels = query({
  handler: async (ctx) => {
    // Check cache freshness (24 hours)
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;

    const latestCache = await ctx.db.query("modelCache").order("desc").first();

    // If cache is stale or empty, return empty (frontend can trigger sync)
    if (!latestCache || latestCache.lastUpdated < twentyFourHoursAgo) {
      return [];
    }

    // Return cached models
    return await ctx.db.query("modelCache").collect();
  },
});

// Get models by category
export const getModelsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("modelCache")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

// Get recommended models
export const getRecommendedModels = query({
  handler: async (ctx) => {
    return await ctx.db
      .query("modelCache")
      .withIndex("by_recommended", (q) => q.eq("recommended", true))
      .collect();
  },
});

// Seed initial allowlist (run once)
export const seedAllowlist = mutation({
  handler: async (ctx) => {
    const initialModels = [
      {
        modelId: "openai/gpt-4",
        category: "general",
        customDescription: "Most capable model for complex tasks",
        recommended: true,
        isActive: true,
      },
      {
        modelId: "anthropic/claude-3.5-sonnet",
        category: "general",
        customDescription: "Excellent for writing and analysis",
        recommended: true,
        isActive: true,
      },
      {
        modelId: "google/gemini-pro",
        category: "general",
        customDescription: "Google's flagship model",
        recommended: false,
        isActive: true,
      },
    ];

    for (const model of initialModels) {
      await ctx.db.insert("modelAllowlist", model);
    }

    return { success: true, count: initialModels.length };
  },
});
