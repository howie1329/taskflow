import {
  countTokens,
  encode,
  encodeChat,
  isWithinTokenLimit,
} from "gpt-tokenizer";

import type { ChatMessage,PrunedMessage,MessageSummary, TokenEstimate, EstimateTokensFromPrunedMessagesResult, SummarizeConversationResult, TokenService, ChatMessageFromDB, GetMessagesToSummarizeResult } from "../types.js";
/**
 * Token Service
 * Estimates tokens for content and messages
 */

/**
 * Token Estimator
 * Estimates tokens for content
 * @param {string} content - The content to estimate tokens for
 * @param {number} tokenLimit - The token limit to check against
 * @returns {Object} - The token estimate and whether it is within the limit
 */
export const estimateTokens = (content: string, tokenLimit = 8000): TokenEstimate => {
  try {
    const tokens = encode(content);
    const tokenCount = countTokens(content);
    const isWithinLimit = isWithinTokenLimit(content, tokenLimit);
    return {
      tokenCount,
      tokens,
      isWithinLimit,
    };
  } catch (error) {
    console.error("Error estimating tokens:", error);
    return {
      tokenCount: 0,
      tokens: [],
      isWithinLimit: false,
    };
  }
};

/**
 * Token Estimator from Messages
 * Estimates tokens for messages
 * @param {Array} messages - The messages to estimate tokens for
 * @param {number} tokenLimit - The token limit to check against
 * @returns {Object} - The token estimate and whether it is within the limit
 */
export const estimateTokensFromMessages = (messages: ChatMessage[], tokenLimit = 8000): TokenEstimate => {
  try {
    const messagesTokens = encodeChat(messages);
    // const messageTokenCount = countChatCompletionTokens(messages); // This is the correct way to count tokens for chat completions
    const messageTokenCount = countTokens(messages);
    const isWithinLimit = isWithinTokenLimit(messages, tokenLimit);
    return {
      tokenCount: messageTokenCount,
      tokens: messagesTokens,
      isWithinLimit,
    };
  } catch (error) {
    console.error("Error estimating tokens from messages:", error);
    return {
      tokenCount: 0,
      tokens: [],
      isWithinLimit: false,
    };
  }
};

/**
 * Estimate Tokens from Pruned Messages
 * Estimates tokens for pruned messages including reasoning, tool calls, and tool results
 * @param {Array} prunedMessages - The pruned messages to estimate tokens for
 * @param {number} tokenLimit - The token limit to check against
 * @returns {Object} - The total tokens and whether it is within the limit
 */
export const estimateTokensFromPrunedMessages = (
  prunedMessages: PrunedMessage[],
  tokenLimit = 8000
): EstimateTokensFromPrunedMessagesResult => {
  let totalTokens = 0;
  // Iterate through each message in the pruned messages
  for (const message of prunedMessages) {
    // Initialize the message tokens to 0
    let messageTokens = 0;
    message.content.forEach((content) => {
      if (content.type === "text") {
        messageTokens += estimateTokens(content.text).tokenCount;
      } else if (content.type === "reasoning") {
        messageTokens += estimateTokens(content.text).tokenCount;
      } else if (content.type === "tool-call") {
        messageTokens += estimateTokens(content.input.query).tokenCount;
      } else if (content.type === "tool-result") {
        messageTokens += estimateTokens(content.output.value).tokenCount;
      }
    });
    // Add the message tokens to the total tokens
    totalTokens += messageTokens;
  }
  // Check if the total tokens are within the token limit
  const isWithinLimit = totalTokens <= tokenLimit;
  // Return the total tokens and whether it is within the limit
  return {
    totalTokens,
    isWithinLimit,
  };
};

export const tokenService: TokenService = {
  estimateTokens,
  estimateTokensFromMessages,
  estimateTokensFromPrunedMessages,
};

/**
 * Should Summarize
 * Checks if the messages should be summarized
 * @param {Array} messages - The messages to check
 * @param {number} tokenLimit - The token limit to check against
 * @returns {Object} - The estimated tokens and whether the messages should be summarized
 */
export const summarizeConversation = (messages: ChatMessage[], tokenLimit: number = 2000): SummarizeConversationResult=> {
  try {
    const estimatedTokens = countTokens(messages);
    const shouldSummarize = isWithinTokenLimit(messages, tokenLimit);
    return {
      estimatedTokens,
      shouldSummarize,
    };
  } catch (error) {
    console.error("Error should summarize:", error);
    return {
      estimatedTokens: 0,
      shouldSummarize: false,
    };
  }
};

/**
 * Message Context Slicer
 * Slices the current message history to the last 6 messages
 * @param {Array} messageSummaries - The message summaries to check
 * @param {Array} currentMessages - The current messages to slice
 * @param {number} sliceIndex - The index to slice the current messages
 * @returns {Array} - The sliced current messages
 */
export const MessageContextSlicer = (messageSummaries: MessageSummary[], currentMessages: ChatMessageFromDB[],sliceIndex: number) => {
  try {
    if (messageSummaries.length > 0 && messageSummaries[messageSummaries.length - 1].messageIndex > 6) {
      const lastSummary = messageSummaries[messageSummaries.length - 1];
      return currentMessages.slice(lastSummary.messageIndex - sliceIndex);
    }
    // Add fallback return when condition isn't met
    return currentMessages;
  } catch (error) {
    console.error("Error slicing message context:", error);
    return currentMessages;
  }
}

/**
 * Format Summarized Message History
 * Formats the summarized message history into a string
 * @param {Array} messageSummaries - The message summaries to format
 * @returns {Object} - The formatted message history and the conversation summary tokens
 */
export const formatSummarizedMessageHistory = (messageSummaries: MessageSummary[]): { formattedMessageHistory: string, conversationSummaryTokens: number } => { 
  try {
    let formattedMessageHistory = "";
    let conversationSummaryTokens = 0;
    if (messageSummaries.length > 0) {
      for (const messageSummary of messageSummaries) {
        conversationSummaryTokens += messageSummary.messageEndTokens;
      }
      formattedMessageHistory = messageSummaries.map((messageSummary) => {
        return `Conversation ID: ${messageSummary.conversationId}\nSummary: ${messageSummary.summary}\nTags: ${messageSummary.tags}\nIntent: ${messageSummary.intent}`;
      }).join("\n");
    }
    return {
      formattedMessageHistory,
      conversationSummaryTokens,
    };
  } catch (error) {
    console.warn("Error formatting summarized message history:", error);
    return {
      formattedMessageHistory: "",
      conversationSummaryTokens: 0,
    };
  }
}

/**
 * Get Messages To Summarize
 * Determines which messages need to be summarized based on existing summaries
 * @param {Array} messageSummaries - The existing message summaries
 * @param {Array} currentMessageHistory - The current full message history
 * @returns {Object} - The messages to summarize and the last summary index
 */
export const getMessagesToSummarize = (
  messageSummaries: MessageSummary[],
  currentMessageHistory: ChatMessageFromDB[]
): GetMessagesToSummarizeResult => {
  try {
    const lastSummaryIndex =
      messageSummaries.length > 0
        ? messageSummaries[messageSummaries.length - 1].messageIndex
        : 0;
    
    const messagesToSummarize = currentMessageHistory.slice(lastSummaryIndex);
    
    return {
      messagesToSummarize,
      lastSummaryIndex,
    };
  } catch (error) {
    console.warn("Error getting messages to summarize:", error);
    return {
      messagesToSummarize: currentMessageHistory,
      lastSummaryIndex: 0,
    };
  }
}

