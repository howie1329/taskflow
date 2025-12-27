import { embeddingService } from "../ai.js";
import { aiChatService } from "../ai.js";

export const smartContextService = {
  async smartContext(message, userId) {
    try {
      const promptEmbedding = await embeddingService.embeddingPrompt(message);
      const searchEmbedding = await embeddingService.searchEmbedding(
        promptEmbedding,
        userId
      );
      const formattedSearchEmbedding =
        await embeddingService.formattingSearchResults(searchEmbedding);
      const decidingModel = await aiChatService.decidingModel(
        formattedSearchEmbedding,
        message
      );
      return decidingModel.relatedContext;
    } catch (error) {
      console.error("Smart context error:", error);
      throw error;
    }
  },
};
