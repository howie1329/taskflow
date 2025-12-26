import { aiChatService } from "../services/ai.js";
import { smartContextService } from "../services/chat/SmartContextService.js";
import { conversationService } from "../services/conversations.js";
import { vercelChatService } from "../services/ai.js";
import { convertToModelMessages, pruneMessages } from "ai";
import {
  estimateTokensFromPrunedMessages,
  estimateTokens,
} from "@taskflow/rag";
import { VercelMainAgentPrompt } from "../utils/AIPrompts/VercelMainAgentPrompt.js";
import { addMessageSummarizationJob } from "../services/bullmq/queues.js";
import { messageHistorySummaryOps } from "../db/operations/message_summaries.js";
import { emitToRoom } from "../sockets/index.js";

// Create Conversation is Deprecated
export const createConversation = async (req, res) => {
  try {
    const userId = req.userId;
    const { id, message } = req.body;
    console.log("Inside Create Conversation Message: ", message);
    const title = await aiChatService.createTitle(message);
    console.log("Inside Create Conversation Title: ", title);
    emitToRoom(userId, "conversation-title-updated", {
      conversationId: id,
      title: title,
    });
    const created_conversation = await conversationService.createConversation(
      userId,
      title,
      id
    );
    return res.status(201).json({
      success: true,
      message: "Conversation created successfully",
      data: created_conversation,
    });
  } catch (error) {
    console.error("Create conversation error:", error);
    return res.status(500).json({ error: "Failed to create conversation" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { messages } = req.body;
    const message = messages[messages.length - 1];

    // Deprecated
    //const settings = messages[messages.length - 1].metadata;

    // Ensuring Conversation Exists or Creating a New One
    const conversation = await conversationService.ensureConversationExists(
      userId,
      id,
      message
    );

    // If Conversation Not Found Or Created, Return Error
    if (!conversation) {
      return res
        .status(400)
        .json({ error: "Conversation Not Found Or Created" });
    }

    // Adding User Message to Conversation
    await conversationService.addUserMessageToConversation(userId, message);

    // Getting Related Context if Smart Context is Enabled
    // Deprecated
    // let relatedContext = null;
    // if (settings?.isSmartContext) {
    //   relatedContext = await smartContextService.smartContext(message, userId);
    // }
    // Getting Current Message History
    const currentMessageHistory =
      await conversationService.getConversationHistory(userId, conversation.id);

    const messageHistorySummaries =
      await messageHistorySummaryOps.findByConversationId(
        conversation.id,
        userId
      );

    console.log(
      "Current Message History Length: ",
      currentMessageHistory.length
    );

    let slicedCurrentMessageHistory = currentMessageHistory;
    if (
      messageHistorySummaries.length > 0 &&
      messageHistorySummaries[messageHistorySummaries.length - 1].messageIndex >
        6
    ) {
      const lastMessageSummary =
        messageHistorySummaries[messageHistorySummaries.length - 1];
      slicedCurrentMessageHistory = currentMessageHistory.slice(
        lastMessageSummary.messageIndex - 2
      );
    }

    // Converting Messages to Model Messages
    const convertedMessages = convertToModelMessages(
      slicedCurrentMessageHistory
    );
    const prunedCurrentMessageHistory = pruneMessages({
      messages: convertedMessages,
      reasoning: "before-last-message",
      toolCalls: "before-last-message",
      emptyMessages: "remove",
    });

    // Estimating Tokens for Current Message History and checking if it is within the limit
    const {
      totalTokens: currentMessageHistoryTokens,
      isWithinLimit: isCurrentMessageHistoryWithinLimit,
    } = estimateTokensFromPrunedMessages(prunedCurrentMessageHistory, 2000);

    console.log(
      "Current Message History Tokens: ",
      currentMessageHistoryTokens,
      "Is Within Limit: ",
      isCurrentMessageHistoryWithinLimit
    );

    // Estimating Tokens for conversation summary
    let conversationSummaryTokens = 0;
    let formattedMessageHistory = "";
    if (messageHistorySummaries.length > 0) {
      for (const messageHistorySummary of messageHistorySummaries) {
        console.log("Message History Summary: ", messageHistorySummary);
        conversationSummaryTokens += messageHistorySummary.messageEndTokens;
      }
      formattedMessageHistory = messageHistorySummaries
        .map((messageHistorySummary) => {
          return `Conversation ID: ${messageHistorySummary.conversationId}\nSummary: ${messageHistorySummary.summary}\nTags: ${messageHistorySummary.tags}\nIntent: ${messageHistorySummary.intent}`;
        })
        .join("\n");
    }

    console.log("Conversation Summary Tokens: ", conversationSummaryTokens);

    // Checking If Summary is Needed
    if (!isCurrentMessageHistoryWithinLimit) {
      console.log("Summarizing Conversation");
      const lastSummaryIndex =
        messageHistorySummaries.length > 0
          ? messageHistorySummaries[messageHistorySummaries.length - 1]
              .messageIndex
          : 0;
      const messagesToSummarize = currentMessageHistory.slice(lastSummaryIndex);

      // Adding Message Summarization Job
      await addMessageSummarizationJob({
        conversationHistory: messagesToSummarize,
        userId,
        conversationId: conversation.id,
        lastSummaryIndex: lastSummaryIndex,
      });
      console.log("Message Summarization Job Added");
    }

    // Getting Tokens Amount for system prompt
    const { tokenCount: systemPromptTokens } = estimateTokens(
      VercelMainAgentPrompt()
    );

    console.log("System Prompt Tokens: ", systemPromptTokens);

    // Tokens Amount Object
    const tokensAmountObject = {
      SystemPromptTokens: systemPromptTokens,
      CurrentChatTokens: currentMessageHistoryTokens,
      SummaryTokens: conversationSummaryTokens,
    };

    console.log("Tokens Amount Object: ", tokensAmountObject);

    // AI Response
    await vercelChatService.chatAgent({
      userId,
      userQuestion: message.parts[0].text,
      conversationSummary: formattedMessageHistory,
      model: message.metadata.model,
      recentMessages: prunedCurrentMessageHistory,
      conversationId: conversation.id,
      tokensAmountObject,
      res,
    });
  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({ error: "Failed to send message" });
  }
};
