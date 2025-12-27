import crypto from "crypto";
import { conversationOps } from "../db/operations/conversations.js";
import { messageOps } from "../db/operations/messages.js";
import { aiChatService } from "./ai.js";
import { estimateTokensFromPrunedMessages } from "@taskflow/rag";
import { convertToModelMessages, pruneMessages } from "ai";
import { emitToRoom } from "../sockets/index.js";

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
      const title =
        await aiChatService.createTitleFromInitalMessage(initialMessage);
      const newConversation = await conversationOps.create({
        id: conversationId,
        userId,
        title,
      });

      emitToRoom(userId, "conversation-title-updated", {
        conversationId: conversationId,
        title: title,
      });
      return newConversation;
    }

    return conversation;
  },

  async updateConversationTitleFromSummary(userId, conversationId, summary) {
    try {
      // Generate a new title from the summary using AI
      const newTitle = await aiChatService.titleConversation(summary);

      // Update the conversation with the new title
      const updatedConversation = await conversationOps.update(
        conversationId,
        userId,
        {
          title: newTitle,
        }
      );

      // Emit socket event to notify clients about the title update
      emitToRoom(userId, "conversation-title-updated", {
        conversationId: conversationId,
        title: newTitle,
      });
      return updatedConversation;
    } catch (error) {
      console.error("Error updating conversation title from summary:", error);
      return null;
    }
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
};
