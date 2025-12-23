import { conversationService } from "../conversations.js";
import { createAiSummarizationJob } from "../jobs.js";
import { aiChatService } from "../ai.js";

// Old Summary Service that is no longer used
// This Can be removed after testing is complete
export const SummaryService = {
  async summaryConversation(
    formattedConversationHistory,
    userId,
    conversationId,
    conversationSummary
  ) {
    try {
      const threshold = { K: 1, T: 300, COOLDOWN: 5 };
      console.log("Inside Summary Conversation");
      const lastSummarizedIndex = Number(
        formattedConversationHistory.count || 0
      );
      const totalMessages = formattedConversationHistory.length || 1;
      const deltaMessages =
        lastSummarizedIndex > 0
          ? formattedConversationHistory.slice(lastSummarizedIndex)
          : formattedConversationHistory;
      const estimatedTokensSince =
        conversationService.estimateTokens(deltaMessages);
      const shouldSummarize = conversationService.shouldSummarize(
        totalMessages,
        lastSummarizedIndex,
        estimatedTokensSince,
        threshold
      );

      console.log("Should Summarize", shouldSummarize);
      if (shouldSummarize && deltaMessages.length > 0) {
        console.log("Creating AI Summarization Job");

        await createAiSummarizationJob({
          deltaMessages,
          pastSummaries: conversationSummary || "",
          totalMessages,
          conversationId,
          userId,
        });
      }
      return conversationSummary;
    } catch (error) {
      console.error("Summary conversation error:", error);
      throw error;
    }
  },

  async newSummaryConversation(messages, userId, conversationId) {
    const summaryObject = await aiChatService.newSummarization(messages);
    await conversationService.updateConversation(userId, conversationId, {
      summary: summaryObject.summary,
      tags: summaryObject.tags,
      intent: summaryObject.intent,
    });
    return summaryObject;
  },
};
