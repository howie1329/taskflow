import { conversationService } from "../services/conversations.js";
import {
  AIActivatedServices,
  aiChatService,
  suggestedMessageService,
} from "../services/ai.js";
import { convertToModelMessages, pruneMessages } from "ai";

export const fetchConversations = async (req, res) => {
  try {
    const userId = req.userId;
    const conversations = await conversationService.fetchConversations(userId);

    return res.status(200).json({
      success: true,
      message: "Conversations fetched successfully",
      data: conversations,
    });
  } catch (error) {
    console.error("Fetch conversations error:", error);
    console.log("Error message:", error.message);
    return res.status(500).json({ error: "Failed to fetch conversations" });
  }
};

export const fetchConversationMessagesById = async (req, res) => {
  try {
    const userId = req.userId;
    const { id: conversationId } = req.params;
    const messages = await conversationService.fetchConversationMessagesById(
      userId,
      conversationId
    );

    return res.status(200).json({
      success: true,
      message: "Conversation messages fetched successfully",
      data: messages,
    });
  } catch (error) {
    console.error("Fetch conversation messages error:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch conversation messages" });
  }
};

export const fetchConversation = async (req, res) => {
  try {
    const userId = req.userId;
    const { id: conversationId } = req.params;
    const conversation = await conversationService.fetchConversation(
      userId,
      conversationId
    );

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Conversation fetched successfully",
      data: conversation,
    });
  } catch (error) {
    console.error("Fetch conversation error:", error);
    return res.status(500).json({ error: "Failed to fetch conversation" });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const userId = req.userId;
    const { id: conversationId } = req.params;
    const conversation = await conversationService.deleteConversation(
      userId,
      conversationId
    );

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Conversation deleted successfully",
      data: conversation,
    });
  } catch (error) {
    console.error("Delete conversation error:", error);
    return res.status(500).json({ error: "Failed to delete conversation" });
  }
};

export const fetchModels = async (req, res) => {
  try {
    const models = await aiChatService.fetchModels();

    return res.status(200).json({
      success: true,
      message: "Models fetched successfully",
      data: models,
    });
  } catch (error) {
    console.error("Fetch models error:", error);
    return res.status(500).json({ error: "Failed to fetch models" });
  }
};

export const createNote = async (req, res) => {
  try {
    const userId = req.userId;
    const { message, model } = req.body;
    const note = await AIActivatedServices.createNote(userId, message, model);
    return res.status(200).json({
      success: true,
      message: "Note created successfully",
      data: note,
    });
  } catch (error) {
    console.error("Create note error:", error);
    return res.status(500).json({ error: "Failed to create note" });
  }
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
