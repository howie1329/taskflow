import crypto from "crypto";
import { conversationOps } from "../db/operations/conversations.js";
import { messageOps } from "../db/operations/messages.js";
import { aiChatService } from "./ai.js";
import { estimateTokensFromPrunedMessages } from "@taskflow/rag";
import { convertToModelMessages, pruneMessages } from "ai";

export const conversationService = {
  async createConversation(userId, title, id) {
    const created_conversation = await conversationOps.create({
      userId,
      title,
      id,
    });
    return created_conversation;
  },
  async ensureConversationExists(userId, conversationId, initialMessage) {
    conversationId = conversationId || crypto.randomUUID().toString();

    const conversation = await conversationOps.checkExists(
      conversationId,
      userId
    );

    if (!conversation) {
      const title = await aiChatService.createTitle(initialMessage);
      const newConversation = await conversationOps.create({
        id: conversationId,
        userId,
        title,
      });
      console.log(
        "Inside ensureConversationExists Creating New Conversation",
        newConversation
      );
      return newConversation;
    }

    return conversation;
  },

  async addUserMessageToConversation(userId, message) {
    const properMessages = convertToModelMessages([message]);
    const prunedMessage = pruneMessages({ messages: properMessages });
    const { totalTokens } = estimateTokensFromPrunedMessages(prunedMessage);
    const messageData = {
      conversationId: message.metadata.conversationId,
      role: "user",
      parts: message.parts,
      userId,
      tokens: totalTokens,
    };
    return await messageOps.create(messageData);
  },

  async getConversationHistory(userId, conversationId) {
    return await messageOps.findByConversationId(conversationId, userId);
  },

  async formatConversationHistory(conversationHistory) {
    return conversationHistory.map((message) => ({
      role: message.role,
      content: message.content,
      ui: message.ui || {},
      metadata: message.metadata || {},
    }));
  },

  async formattedConversationHistory(userId, conversationId) {
    const conversationHistory = await this.getConversationHistory(
      userId,
      conversationId
    );
    return conversationHistory;
  },

  async formatAiResponse(aiResponse) {
    return {
      role: "assistant",
      content: aiResponse.response.message,
      ui: aiResponse.response.data,
      metadata: aiResponse.response.metadata || {},
      provider_metadata: aiResponse.provider_metadata,
      total_tokens: aiResponse.total_tokens,
      input_tokens: aiResponse.input_tokens,
      output_tokens: aiResponse.output_tokens,
    };
  },

  async addAiResponseToConversation(userId, conversationId, message) {
    const messageData = {
      metadata: message.metadata,
      role: "assistant",
      parts: message.parts,
      conversationId: conversationId,
      userId: userId,
      tokens: message.metadata.tokens,
    };
    return await messageOps.create(messageData);
  },

  async fetchConversations(userId) {
    return await conversationOps.findByUserId(userId);
  },

  async fetchConversationMessagesById(userId, conversationId) {
    return await messageOps.findByConversationId(conversationId, userId);
  },

  async fetchConversation(userId, conversationId) {
    return await conversationOps.findById(conversationId, userId);
  },

  async deleteConversation(userId, conversationId) {
    return await conversationOps.delete(conversationId, userId);
  },

  async updateConversation(userId, conversationId, updateData) {
    return await conversationOps.update(conversationId, userId, updateData);
  },

  estimateTokens(messages) {
    try {
      return Math.ceil(
        messages
          .map((message) => message.content)
          .join(" ")
          .split(/\s+/).length * 1.3
      );
    } catch (error) {
      console.error("Error estimating tokens:", error);
      return 0;
    }
  },

  shouldSummarize(
    totalMessages,
    lastSummarizedIndex,
    estimatedTokensSince,
    threshold = { K: 14, T: 2500, COOLDOWN: 6 }
  ) {
    const messageSince = totalMessages - (lastSummarizedIndex || 0);
    const passedThreshold =
      messageSince >= threshold.K || estimatedTokensSince >= threshold.T;
    const passedCooldown = messageSince >= threshold.COOLDOWN;
    return passedThreshold && passedCooldown;
  },
};
