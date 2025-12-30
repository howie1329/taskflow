/**
 * REFACTORED CONTEXT MANAGER SERVICE
 * 
 * This is an example implementation showing how to improve the current
 * chat history and context management approach.
 * 
 * Key improvements:
 * 1. Unified context building logic
 * 2. Token caching
 * 3. Better message selection
 * 4. Race condition prevention
 * 5. Model-aware limits
 */

import { conversationService } from "./services/conversations.js";
import { messageHistorySummaryOps } from "./db/operations/message_summaries.js";
import { convertToModelMessages, pruneMessages } from "ai";
import {
  estimateTokensFromPrunedMessages,
  estimateTokens,
  formatSummarizedMessageHistory,
  getMessagesToSummarize,
} from "@taskflow/rag";
import { addMessageSummarizationJob } from "./services/bullmq/queues.js";
import { redis } from "./services/redis.js"; // Assuming Redis client

// Model-specific context windows
const MODEL_CONTEXT_WINDOWS = {
  "openai/gpt-4o-mini": 128000,
  "openai/gpt-4o": 128000,
  "openai/gpt-3.5-turbo": 16385,
  "openai/gpt-4-turbo": 128000,
  "anthropic/claude-3-opus": 200000,
  "anthropic/claude-3-sonnet": 200000,
  default: 8000,
};

// Configuration with sensible defaults
const DEFAULT_CONFIG = {
  recentMessageWindow: 6,
  tokenLimitRatio: 0.25, // Use 25% of context window for recent messages
  safetyMargin: 500, // Safety margin for token estimation errors
  summarizationThreshold: {
    messageCount: 10,
    tokenCount: 1500,
  },
};

export class ContextManagerService {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Main entry point: Build context for a conversation
   * Handles all the complexity of message selection, token management, etc.
   */
  async buildContext({
    conversationId,
    userId,
    systemPrompt,
    model = "openai/gpt-4o-mini",
  }) {
    // Use Redis lock to prevent race conditions
    const lockKey = `context:${conversationId}`;
    const lock = await this.acquireLock(lockKey);

    try {
      // Fetch data atomically
      const [messages, summaries] = await Promise.all([
        conversationService.getConversationHistory(userId, conversationId),
        messageHistorySummaryOps.findByConversationId(conversationId, userId),
      ]);

      // Get model-specific limits
      const modelContextWindow = this.getModelContextWindow(model);
      const systemTokens = estimateTokens(systemPrompt).tokenCount;
      const availableTokens =
        modelContextWindow - systemTokens - this.config.safetyMargin;

      // Build optimized context
      const context = await this.selectOptimalMessages({
        messages,
        summaries,
        availableTokens,
        modelContextWindow,
      });

      // Check if summarization is needed (async, non-blocking)
      this.checkAndQueueSummarization({
        messages,
        summaries,
        conversationId,
        userId,
      }).catch((err) =>
        console.error("Summarization check failed:", err)
      );

      return {
        recentMessages: context.recentMessages,
        conversationSummary: context.summary,
        tokensAmountObject: {
          SystemPromptTokens: systemTokens,
          CurrentChatTokens: context.recentTokens,
          SummaryTokens: context.summaryTokens,
          TotalTokens: systemTokens + context.recentTokens + context.summaryTokens,
          AvailableTokens: availableTokens,
          UtilizationPercent: (
            ((systemTokens + context.recentTokens + context.summaryTokens) /
              modelContextWindow) *
            100
          ).toFixed(2),
        },
      };
    } finally {
      await this.releaseLock(lock);
    }
  }

  /**
   * Intelligently select messages based on token budget and importance
   */
  async selectOptimalMessages({
    messages,
    summaries,
    availableTokens,
    modelContextWindow,
  }) {
    // Get recent messages (prioritizing recent ones)
    const recentMessages = this.getRecentMessages(messages, summaries);

    // Convert and prune messages
    const convertedMessages = convertToModelMessages(recentMessages);
    const prunedMessages = pruneMessages({
      messages: convertedMessages,
      reasoning: "before-last-message",
      toolCalls: "all", // Keep all tool calls - they're important!
      emptyMessages: "remove",
    });

    // Estimate tokens (using cached values when available)
    const { totalTokens: recentTokens } =
      estimateTokensFromPrunedMessages(prunedMessages);

    // Format summaries
    const { formattedMessageHistory: summary, conversationSummaryTokens } =
      formatSummarizedMessageHistory(summaries);

    // Check if we're within budget
    const totalTokens = recentTokens + conversationSummaryTokens;
    const targetTokens = availableTokens * this.config.tokenLimitRatio;

    if (totalTokens <= targetTokens) {
      // We have room, return everything
      return {
        recentMessages: prunedMessages,
        summary,
        recentTokens,
        summaryTokens: conversationSummaryTokens,
      };
    }

    // We're over budget, need to trim
    if (recentTokens > targetTokens) {
      // Recent messages alone exceed budget, trim them
      const trimmedMessages = await this.trimMessagesToFit(
        prunedMessages,
        targetTokens
      );
      return {
        recentMessages: trimmedMessages,
        summary: "", // Can't fit summaries
        recentTokens: estimateTokensFromPrunedMessages(trimmedMessages)
          .totalTokens,
        summaryTokens: 0,
      };
    }

    // Recent messages fit, but summaries don't
    // Trim summaries or use most recent ones only
    const trimmedSummary = this.trimSummaries(
      summaries,
      availableTokens - recentTokens
    );

    return {
      recentMessages: prunedMessages,
      summary: trimmedSummary.formatted,
      recentTokens,
      summaryTokens: trimmedSummary.tokens,
    };
  }

  /**
   * Get recent messages intelligently based on summaries
   */
  getRecentMessages(messages, summaries) {
    if (summaries.length === 0) {
      // No summaries, return last N messages
      return messages.slice(-this.config.recentMessageWindow);
    }

    const lastSummary = summaries[summaries.length - 1];
    const startIndex = Math.max(
      0,
      lastSummary.messageIndex - this.config.recentMessageWindow
    );

    return messages.slice(startIndex);
  }

  /**
   * Trim messages to fit within token budget
   * Prioritizes keeping tool calls and recent messages
   */
  async trimMessagesToFit(messages, targetTokens) {
    // Start from the end (most recent) and work backwards
    const trimmed = [];
    let currentTokens = 0;

    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      const msgTokens = this.estimateMessageTokens(msg);

      if (currentTokens + msgTokens <= targetTokens) {
        trimmed.unshift(msg);
        currentTokens += msgTokens;
      } else {
        // Can't fit this message, but check if it has tool calls
        // Tool calls are important, try to keep them
        if (this.hasToolCalls(msg)) {
          // Try to fit just the tool call parts
          const toolCallOnly = this.extractToolCalls(msg);
          const toolCallTokens = this.estimateMessageTokens(toolCallOnly);
          if (currentTokens + toolCallTokens <= targetTokens) {
            trimmed.unshift(toolCallOnly);
            currentTokens += toolCallTokens;
          }
        }
        break;
      }
    }

    return trimmed.length > 0 ? trimmed : messages.slice(-1); // At least keep last message
  }

  /**
   * Trim summaries to fit within token budget
   */
  trimSummaries(summaries, availableTokens) {
    if (summaries.length === 0) {
      return { formatted: "", tokens: 0 };
    }

    // Start with most recent summaries
    let formatted = "";
    let tokens = 0;

    for (let i = summaries.length - 1; i >= 0; i--) {
      const summary = summaries[i];
      const summaryText = this.formatSingleSummary(summary);
      const summaryTokens = estimateTokens(summaryText).tokenCount;

      if (tokens + summaryTokens <= availableTokens) {
        formatted = summaryText + (formatted ? "\n\n" + formatted : "");
        tokens += summaryTokens;
      } else {
        break;
      }
    }

    return { formatted, tokens };
  }

  /**
   * Format a single summary entry
   */
  formatSingleSummary(summary) {
    const toolCallsInfo =
      summary.toolCalls && summary.toolCalls.length > 0
        ? `\nTool Calls: ${summary.toolCalls.map((tc) => tc.toolName).join(", ")}`
        : "";

    return `[Summary]
Conversation ID: ${summary.conversationId}
Summary: ${summary.summary}
Tags: ${summary.tags.join(", ")}
Intent: ${summary.intent}
Messages: ${summary.messageCount}${toolCallsInfo}`;
  }

  /**
   * Check if summarization is needed and queue it
   */
  async checkAndQueueSummarization({
    messages,
    summaries,
    conversationId,
    userId,
  }) {
    const { messagesToSummarize, lastSummaryIndex } = getMessagesToSummarize(
      summaries,
      messages
    );

    if (messagesToSummarize.length === 0) {
      return;
    }

    // Use cached token counts if available
    const totalTokens = messagesToSummarize.reduce(
      (sum, msg) => sum + (msg.tokens || 0),
      0
    );

    const shouldSummarize =
      messagesToSummarize.length >=
        this.config.summarizationThreshold.messageCount ||
      totalTokens >= this.config.summarizationThreshold.tokenCount;

    if (shouldSummarize) {
      await addMessageSummarizationJob({
        conversationHistory: messagesToSummarize,
        userId,
        conversationId,
        lastSummaryIndex,
      });
    }
  }

  /**
   * Estimate tokens for a message (use cache if available)
   */
  estimateMessageTokens(message) {
    // If message has cached tokens, use them
    if (message.tokens) {
      return message.tokens;
    }

    // Otherwise estimate (and ideally cache for next time)
    return estimateTokensFromPrunedMessages([message]).totalTokens;
  }

  /**
   * Check if message has tool calls
   */
  hasToolCalls(message) {
    return message.content?.some(
      (content) => content.type === "tool-call" || content.type === "tool-result"
    );
  }

  /**
   * Extract only tool call related content from message
   */
  extractToolCalls(message) {
    return {
      ...message,
      content: message.content?.filter(
        (content) =>
          content.type === "tool-call" || content.type === "tool-result"
      ) || [],
    };
  }

  /**
   * Get model-specific context window
   */
  getModelContextWindow(model) {
    return MODEL_CONTEXT_WINDOWS[model] || MODEL_CONTEXT_WINDOWS.default;
  }

  /**
   * Acquire Redis lock to prevent race conditions
   */
  async acquireLock(key, timeout = 5000) {
    const lockValue = Date.now().toString();
    const acquired = await redis.set(key, lockValue, "PX", timeout, "NX");

    if (!acquired) {
      throw new Error(`Failed to acquire lock for ${key}`);
    }

    return { key, value: lockValue };
  }

  /**
   * Release Redis lock
   */
  async releaseLock(lock) {
    const currentValue = await redis.get(lock.key);
    if (currentValue === lock.value) {
      await redis.del(lock.key);
    }
  }
}

// Usage example in controller:
export const sendMessageRefactored = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { messages } = req.body;
    const message = messages[messages.length - 1];

    // Ensure conversation exists
    const conversation = await conversationService.ensureConversationExists(
      userId,
      id,
      message
    );

    if (!conversation) {
      return res
        .status(400)
        .json({ error: "Conversation Not Found Or Created" });
    }

    // Add user message
    await conversationService.addUserMessageToConversation(userId, message);

    // Build context using new service
    const contextManager = new ContextManagerService({
      recentMessageWindow: 6,
      tokenLimitRatio: 0.25,
    });

    const systemPrompt = VercelMainAgentPrompt({
      userContext: "No related context provided",
      userId,
      userQuestion: message.parts[0].text,
      conversationSummary: "", // Will be filled by context manager
    });

    const context = await contextManager.buildContext({
      conversationId: conversation.id,
      userId,
      systemPrompt,
      model: message.metadata.model,
    });

    // Use the context to chat
    await vercelChatService.chatAgent({
      userId,
      userQuestion: message.parts[0].text,
      conversationSummary: context.conversationSummary,
      model: message.metadata.model,
      recentMessages: context.recentMessages,
      conversationId: conversation.id,
      tokensAmountObject: context.tokensAmountObject,
      res,
    });
  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({ error: "Failed to send message" });
  }
};
