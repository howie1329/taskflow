import { conversationService } from "../services/conversations.js";
import {
  AIActivatedServices,
  aiChatService,
  suggestedMessageService,
} from "../services/ai.js";
import { convertToModelMessages, pruneMessages } from "ai";
import { BaseOperationHandler } from "./base.js";

export const fetchConversations = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const userId = req.userId;
    const conversations = await conversationService.fetchConversations(userId);
    return conversations;
  });
};

export const fetchConversationMessagesById = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const userId = req.userId;
    const { id: conversationId } = req.params;
    const messages = await conversationService.fetchConversationMessagesById(
      userId,
      conversationId
    );
    return messages;
  });
};

export const fetchConversation = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const userId = req.userId;
    const { id: conversationId } = req.params;
    return await conversationService.fetchConversation(userId, conversationId);
  });
};

export const deleteConversation = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const userId = req.userId;
    const { id: conversationId } = req.params;
    const conversation = await conversationService.deleteConversation(
      userId,
      conversationId
    );
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    return conversation;
  });
};

export const fetchModels = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const models = await aiChatService.fetchModels();
    return models;
  });
};

export const createNote = async (req, res) => {
  return await BaseOperationHandler(req, res, async (req) => {
    const userId = req.userId;
    const { message, model } = req.body;
    const note = AIActivatedServices.createNote(userId, message, model);
    return note;
  });
};
export const generateSuggestedMessages = async (req, res) => {
  try {
    const userId = req.userId;
    const { conversationId, model } = req.body;
    let context = {
      isContext: false,
    };
    if (conversationId) {
      const conversation = await conversationService.fetchConversation(
        userId,
        conversationId
      );
      const messages = await conversationService.getConversationHistory(
        userId,
        conversationId
      );
      const formattedMessages = convertToModelMessages(messages);
      const prunedFormattedMessages = pruneMessages({
        messages: formattedMessages,
        reasoning: "before-last-message",
        toolCalls: "all",
        emptyMessages: "remove",
      });
      context = {
        isContext: true,
        summary: conversation.summary,
        tags: conversation.tags,
        intent: conversation.intent,
        recentMessages: prunedFormattedMessages.slice(-6), // Last 6 Messages
      };
    }

    const suggestedMessages =
      await suggestedMessageService.generateSuggestedMessages(context, model);
    return res.status(200).json({
      success: true,
      message: "Suggested messages generated successfully",
      data: suggestedMessages,
    });
  } catch (error) {
    console.error("Generate suggested messages error:", error);
    return res
      .status(500)
      .json({ error: "Failed to generate suggested messages" });
  }
};
